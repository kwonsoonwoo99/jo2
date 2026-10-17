(() => {
  const game = window.Jojo;

  function shuffle(cards) {
    const shuffled = [...cards];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled;
  }

  function log(state, message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 5);
    state.message = message;
  }

  function heal(state, amount) {
    const restored = Math.min(amount, state.player.maxHp - state.player.hp);
    state.player.hp += restored;
    return restored;
  }

  function drawCards(state, amount) {
    for (let count = 0; count < amount; count += 1) {
      if (state.drawPile.length === 0 && state.discardPile.length > 0) {
        state.drawPile = shuffle(state.discardPile);
        state.discardPile = [];
        log(state, "버린 카드 더미를 섞어 뽑기 더미로 돌렸습니다.");
      }
      if (state.drawPile.length === 0) return;
      state.hand.push(state.drawPile.pop());
    }
  }

  function beginTurn(state, firstTurn = false) {
    const hero = state.character;
    state.turn += 1;
    state.player.energy = state.player.maxEnergy + (firstTurn && hero.passive.id === "time" ? 1 : 0) + (firstTurn ? state.player.battleStartEnergy || 0 : 0);
    state.player.block = 0;
    state.freeAttackUsed = false;
    state.relicTurnFlags = {};

    const healing = hero.passive.id === "ripple" ? 2 : 0;
    if (healing > 0) {
      const restored = heal(state, healing);
      if (restored > 0) log(state, `턴 시작 효과로 체력 ${restored} 회복.`);
    }

    drawCards(state, 5 + (firstTurn ? state.player.battleStartDraw || 0 : 0));
    game.Relics.dispatch(state, "playerTurnStart");
    if (hero.passive.id === "life" && state.player.resources.life > 0) state.player.block += state.player.resources.life * 3;
    log(state, `${state.turn}턴 시작. 에너지 ${state.player.energy}.`);
  }

  function createBattle(characterId, options = {}) {
    const character = game.characters.find((entry) => entry.id === characterId);
    if (!character) throw new Error(`Unknown character: ${characterId}`);

    const startingDeck = options.deck ? [...options.deck] : [...character.startingDeck];
    const enemyTemplate = options.enemy || game.enemy;
    const state = {
      character,
      player: {
        hp: options.playerHp ?? character.maxHp, maxHp: options.playerMaxHp ?? character.maxHp,
        block: 0, energy: 3, maxEnergy: 3, weakTurns: 0,
        resources: { hamon: 0, spin: 0, thread: 0, life: 0 },
        counterDamage: 0, timeStopUsed: false, skipEnemyTurn: false,
        battleStartEnergy: 0, battleStartDraw: 0
      },
      enemy: {
        ...enemyTemplate,
        intents: enemyTemplate.intents.map((intent) => ({ ...intent })),
        hp: enemyTemplate.maxHp, block: 0, weakTurns: 0, damageBonus: 0,
        preparedAttack: 0, marked: false, dodgeNext: false
      },
      relics: [...(options.relics || [])],
      encounterType: options.nodeType || "combat",
      theme: options.theme || null,
      chapterIndex: options.chapterIndex || 0,
      gold: options.gold || 0,
      drawPile: shuffle(startingDeck),
      discardPile: [],
      hand: [],
      turn: 0,
      intentIndex: 0,
      freeAttackUsed: false,
      result: null,
      log: [],
      message: "전투가 시작됩니다."
    };

    game.Relics.dispatch(state, "battleStart");
    beginTurn(state, true);
    return state;
  }

  function getCardCost(state, card) {
    if (state.character.passive.id === "spin" && card.type === "attack" && !state.freeAttackUsed) return 0;
    return card.cost;
  }

  function canPlayCard(state, card) {
    if (!state || !card || state.result || state.player.energy < getCardCost(state, card)) return false;
    if (card.oncePerBattle && state.player.timeStopUsed) return false;
    return card.effects.every((effect) => effect.type !== "consumeLifeHeal" || state.player.resources.life > 0);
  }

  function getIntent(state) {
    const intent = state.enemy.intents[state.intentIndex % state.enemy.intents.length];
    const healthRatio = state.enemy.hp / state.enemy.maxHp;
    const bossPhase = state.enemy.type === "boss" ? healthRatio <= 0.33 ? "3단계" : healthRatio <= 0.66 ? "2단계" : "1단계" : "";
    const phasePrefix = bossPhase ? `${bossPhase} · ` : "";
    const phaseBonus = bossPhase === "3단계" ? 5 : bossPhase === "2단계" ? 2 : 0;
    if (intent.type === "defend") return { ...intent, label: `${phasePrefix}방어 ${intent.amount}` };
    if (intent.type === "prepare") return { ...intent, label: `${phasePrefix}강타 준비 ${intent.amount}` };
    if (intent.type === "mark") return { ...intent, label: `${phasePrefix}표식 · 다음 턴 폭발` };
    if (intent.type === "dodge") return { ...intent, label: `${phasePrefix}차원 회피 준비` };
    if (intent.type === "weaken") return { ...intent, label: `${phasePrefix}플레이어 약화` };
    if (intent.type === "buff") return { ...intent, label: `${phasePrefix}공격 강화 +${intent.amount}` };

    let amount = intent.amount;
    if (intent.type === "heavy") amount += state.enemy.preparedAttack;
    amount += state.enemy.damageBonus;
    amount += phaseBonus;
    if (state.enemy.weakTurns > 0) amount = Math.floor(amount * 0.75);
    if (state.character.passive.id === "trick") amount = Math.max(0, amount - 2);
    const label = intent.type === "drain" ? `흡혈 ${amount}`
      : intent.type === "explode" ? `폭발 ${amount}`
        : intent.type === "multi" ? `연속 공격 ${amount} × ${intent.hits}`
          : intent.type === "heavy" ? `강타 ${amount}`
            : `공격 ${amount}`;
    return { ...intent, amount, label: `${phasePrefix}${label}` };
  }

  function playCard(state, handIndex) {
    if (state.result || handIndex < 0 || handIndex >= state.hand.length) return false;
    const card = game.cards[state.hand[handIndex]];
    const cost = getCardCost(state, card);
    if (!canPlayCard(state, card)) return false;

    state.player.energy -= cost;
    state.hand.splice(handIndex, 1);
    state.discardPile.push(card.id);
    if (card.type === "attack" && state.character.passive.id === "spin") state.freeAttackUsed = true;

    log(state, `${card.name} 사용.`);
    for (const effect of card.effects) {
      if (effect.type === "damage") {
        dealCardDamage(state, card, effect);
      } else if (effect.type === "multiDamage") {
        dealCardDamage(state, card, effect);
      } else if (effect.type === "intentDamage") {
        const intent = getIntent(state);
        const hostile = ["attack", "heavy", "multi", "drain", "explode"].includes(intent.type);
        dealCardDamage(state, card, { amount: hostile ? effect.attack : effect.other, hits: 1 });
      } else if (effect.type === "block") {
        const bonus = state.character.passive.id === "thread" ? 2 : 0;
        state.player.block += effect.amount + bonus;
        log(state, `방어도 ${effect.amount + bonus} 획득.`);
      } else if (effect.type === "heal") {
        const restored = heal(state, effect.amount);
        log(state, `체력 ${restored} 회복.`);
      } else if (effect.type === "draw") {
        drawCards(state, effect.amount);
        log(state, `카드 ${effect.amount}장 뽑기.`);
      } else if (effect.type === "weaken") {
        state.enemy.weakTurns = Math.max(state.enemy.weakTurns, effect.turns);
        log(state, "적의 다음 공격이 약화됩니다.");
      } else if (effect.type === "gainResource") {
        const current = state.player.resources[effect.resource] || 0;
        const cap = effect.max || game.balance.resourceCaps[effect.resource] || 5;
        state.player.resources[effect.resource] = Math.min(cap, current + effect.amount);
        log(state, `${effect.resource} ${effect.amount} 축적.`);
      } else if (effect.type === "armCounter") {
        state.player.counterDamage += effect.amount;
        log(state, `반격 ${effect.amount} 준비.`);
      } else if (effect.type === "timeStop") {
        if (state.player.timeStopUsed) continue;
        state.player.timeStopUsed = true;
        state.player.skipEnemyTurn = true;
        log(state, "시간을 멈췄습니다. 적은 이번 턴 행동하지 않습니다.");
      } else if (effect.type === "summonLife") {
        state.player.resources.life = (state.player.resources.life || 0) + effect.amount;
        log(state, `생명 ${effect.amount} 창조.`);
      } else if (effect.type === "consumeLifeHeal") {
        if (state.player.resources.life > 0) {
          state.player.resources.life -= 1;
          const restored = heal(state, effect.amount);
          log(state, `생명을 소모해 체력 ${restored} 회복.`);
        }
      }
    }

    if (state.character.passive.id === "repair") {
      const restored = heal(state, 1);
      if (restored > 0) log(state, `치유의 손길: 체력 ${restored} 회복.`);
    }
    game.Relics.dispatch(state, "cardPlayed", { card });

    if (state.enemy.hp === 0) {
      if (state.character.passive.id === "life") {
        const restored = heal(state, 6);
        if (restored > 0) log(state, `황금의 생명: 체력 ${restored} 회복.`);
      }
      state.result = "win";
      log(state, `${state.enemy.name} 격파!`);
    }
    return true;
  }

  function dealCardDamage(state, card, effect) {
    if (state.enemy.dodgeNext) {
      state.enemy.dodgeNext = false;
      log(state, `${state.enemy.name}이(가) 공격을 회피했습니다.`);
      return 0;
    }

    let bonusDamage = 0;
    if (effect.consumeResource) {
      const available = state.player.resources[effect.consumeResource] || 0;
      const consumed = Math.min(available, effect.consumeMax || available);
      state.player.resources[effect.consumeResource] -= consumed;
      bonusDamage += consumed * (effect.damagePerResource || 0);
    }

    let totalDamage = 0;
    const hits = effect.hits || 1;
    for (let hit = 0; hit < hits; hit += 1) {
      let damage = effect.amount + bonusDamage;
      if (card.type === "attack" && state.player.weakTurns > 0) damage = Math.floor(damage * 0.75);
      const damageEvent = { damage, card, hit };
      game.Relics.dispatch(state, "attackDamage", damageEvent);
      damage = Math.max(0, damageEvent.damage);
      const blocked = Math.min(state.enemy.block, damage);
      state.enemy.block -= blocked;
      const dealt = Math.min(state.enemy.hp, Math.max(0, damage - blocked));
      state.enemy.hp = Math.max(0, state.enemy.hp - dealt);
      totalDamage += dealt;
    }
    if (effect.healPercent) {
      const restored = heal(state, Math.floor(totalDamage * effect.healPercent));
      if (restored > 0) log(state, `준 피해에 비례해 체력 ${restored} 회복.`);
    }
    const label = hits > 1 ? `${hits}회 연속 피해` : `피해 ${totalDamage}`;
    log(state, `${card.name}: ${label} ${totalDamage}${bonusDamage > 0 ? ` (자원 피해 +${bonusDamage})` : ""}.`);
    return totalDamage;
  }

  function endTurn(state) {
    if (state.result) return;
    state.discardPile.push(...state.hand);
    state.hand = [];
    if (state.player.weakTurns > 0) state.player.weakTurns -= 1;
    let enemyAttacked = false;

    if (state.player.skipEnemyTurn) {
      state.player.skipEnemyTurn = false;
      log(state, "시간 정지로 적의 행동을 건너뜁니다.");
    } else {
      const intent = getIntent(state);
      if (["attack", "heavy", "multi", "drain", "explode"].includes(intent.type)) {
        enemyAttacked = true;
        const hits = intent.type === "multi" ? intent.hits : 1;
        let totalDamage = 0;
        for (let hit = 0; hit < hits; hit += 1) {
          const blocked = Math.min(state.player.block, intent.amount);
          state.player.block -= blocked;
          const damageEvent = { damage: Math.max(0, intent.amount - blocked), hit, intent };
          if (damageEvent.damage > 0) game.Relics.dispatch(state, "playerDamaged", damageEvent);
          const damage = Math.max(0, damageEvent.damage);
          state.player.hp = Math.max(0, state.player.hp - damage);
          totalDamage += damage;
          if (damageEvent.retaliation) state.enemy.hp = Math.max(0, state.enemy.hp - damageEvent.retaliation);
        }
        log(state, `${state.enemy.name}의 ${intent.type === "explode" ? "폭발" : "공격"}. 방어 후 피해 ${totalDamage}.`);
        if (intent.type === "drain") {
          const restored = Math.min(intent.heal || 0, state.enemy.maxHp - state.enemy.hp);
          state.enemy.hp += restored;
          if (restored > 0) log(state, `적이 체력 ${restored} 회복.`);
        }
        if (intent.type === "explode") state.enemy.marked = false;
        if (intent.type === "heavy") state.enemy.preparedAttack = 0;
      } else if (intent.type === "defend") {
        state.enemy.block += intent.amount;
        log(state, `적이 방어도 ${intent.amount} 획득.`);
      } else if (intent.type === "prepare") {
        state.enemy.preparedAttack = intent.amount;
        log(state, `${state.enemy.name}이(가) 강타를 준비합니다.`);
      } else if (intent.type === "mark") {
        state.enemy.marked = true;
        log(state, `${state.enemy.name}이(가) 폭발 표식을 남겼습니다.`);
      } else if (intent.type === "dodge") {
        state.enemy.dodgeNext = true;
        log(state, `${state.enemy.name}이(가) 다음 공격을 회피할 준비를 합니다.`);
      } else if (intent.type === "weaken") {
        state.player.weakTurns = Math.max(state.player.weakTurns, intent.turns || 1);
        log(state, "적의 능력으로 플레이어가 약화되었습니다.");
      } else if (intent.type === "buff") {
        state.enemy.damageBonus += intent.amount;
        log(state, `적의 공격력이 ${intent.amount} 증가했습니다.`);
      }
    }

    if (enemyAttacked && state.enemy.weakTurns > 0) state.enemy.weakTurns -= 1;
    if (enemyAttacked && state.player.counterDamage > 0) {
      state.enemy.hp = Math.max(0, state.enemy.hp - state.player.counterDamage);
      log(state, `함정 반격: 피해 ${state.player.counterDamage}.`);
      state.player.counterDamage = 0;
    }

    state.player.block = 0;
    if (state.enemy.hp <= 0) {
      state.result = "win";
      log(state, `${state.enemy.name} 격파!`);
      return;
    }
    state.intentIndex += 1;
    if (state.player.hp <= 0) {
      state.result = "loss";
      log(state, "체력이 모두 소진되었습니다. 전투에서 패배했습니다.");
      return;
    }

    beginTurn(state);
  }

  game.Combat = { createBattle, getCardCost, canPlayCard, getIntent, playCard, endTurn, drawCards };
})();