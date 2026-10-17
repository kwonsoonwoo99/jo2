(() => {
  const game = window.Jojo;
  const balance = game.balance;

  function random(run) {
    run.rngState = (Math.imul(run.rngState, 1664525) + 1013904223) >>> 0;
    return run.rngState / 4294967296;
  }

  function integer(run, min, max) {
    return min + Math.floor(random(run) * (max - min + 1));
  }

  function pick(run, items) {
    return items[Math.floor(random(run) * items.length)];
  }

  function createMap(run, chapterIndex, theme, retry = 0) {
    const layerCount = integer(run, balance.mapLayers.min, balance.mapLayers.max);
    const nodes = {};
    const start = { id: `c${chapterIndex + 1}-start`, type: "start", layer: -1, x: 50, y: 98, connections: [], visited: true, completed: true };
    nodes[start.id] = start;
    let previous = [start];
    const specialLayers = new Map();
    const reservedLayers = new Set();

    function reserveLayers(type, count) {
      for (let index = 0; index < count; index += 1) {
        const playableLayers = layerCount - 1;
        const desired = Math.floor(((index + 1) * playableLayers) / (count + 1));
        let selected = -1;
        for (let offset = 0; offset < playableLayers; offset += 1) {
          const forward = (desired + offset) % playableLayers;
          const backward = (desired - offset + playableLayers) % playableLayers;
          if (!reservedLayers.has(forward)) { selected = forward; break; }
          if (!reservedLayers.has(backward)) { selected = backward; break; }
        }
        if (selected >= 0) {
          reservedLayers.add(selected);
          specialLayers.set(selected, type);
        }
      }
    }
    reserveLayers("elite", balance.mapSpecials.elites);
    reserveLayers("shop", balance.mapSpecials.shops);
    reserveLayers("event", balance.mapSpecials.events);
    reserveLayers("rest", balance.mapSpecials.rests);

    function connect(parent, child) {
      if (!parent.connections.includes(child.id)) parent.connections.push(child.id);
    }

    for (let layer = 0; layer < layerCount - 1; layer += 1) {
      const count = integer(run, 2, 4);
      const slots = count === 2 ? [28, 72] : count === 3 ? [18, 50, 82] : [12, 37, 63, 88];
      const current = [];
      for (let index = 0; index < count; index += 1) {
        current.push({
          id: `c${chapterIndex + 1}-l${layer}-n${index}`,
          type: "combat", layer, x: slots[index],
          y: 88 - ((layer / Math.max(1, layerCount - 1)) * 75),
          connections: [], visited: false, completed: false, enemyId: null
        });
      }

      const specialType = specialLayers.get(layer);
      if (specialType) current[Math.floor(random(run) * current.length)].type = specialType;

      for (const node of current) nodes[node.id] = node;

      for (let index = 0; index < previous.length; index += 1) {
        const normalized = previous.length === 1 ? 0 : index / (previous.length - 1);
        const targetIndex = Math.round(normalized * (current.length - 1));
        connect(previous[index], current[targetIndex]);
      }

      for (let index = 0; index < current.length; index += 1) {
        const hasParent = previous.some((node) => node.connections.includes(current[index].id));
        if (!hasParent) {
          const normalized = current.length === 1 ? 0 : index / (current.length - 1);
          const parentIndex = Math.round(normalized * (previous.length - 1));
          connect(previous[parentIndex], current[index]);
        }
      }
      previous = current;
    }

    const rest = {
      id: `c${chapterIndex + 1}-rest`,
      type: "rest",
      layer: layerCount - 1,
      x: 50,
      y: 88 - (((layerCount - 1) / Math.max(1, layerCount - 1)) * 75),
      connections: [],
      visited: false,
      completed: false
    };
    nodes[rest.id] = rest;
    for (const node of previous) connect(node, rest);

    const bossPool = theme.chapterBosses || theme.bosses;
    const boss = { id: `c${chapterIndex + 1}-boss`, type: "boss", layer: layerCount, x: 50, y: 3, connections: [], visited: false, completed: false, enemyId: bossPool[chapterIndex] || pick(run, bossPool) };
    nodes[boss.id] = boss;
    connect(rest, boss);

    const allNodes = Object.values(nodes);
    const reachable = new Set([start.id]);
    const queue = [start.id];
    while (queue.length) {
      const current = nodes[queue.shift()];
      for (const nextId of current.connections) {
        if (!reachable.has(nextId)) {
          reachable.add(nextId);
          queue.push(nextId);
        }
      }
    }
    const hasDeadEnd = allNodes.some((node) => node.id !== boss.id && node.connections.length === 0);
    const overlaps = allNodes.some((node, index) => allNodes.slice(index + 1).some((other) =>
      node.layer === other.layer && node.x === other.x
    ));
    if (reachable.size !== allNodes.length || !rest.connections.includes(boss.id) || boss.connections.length !== 0 || hasDeadEnd || overlaps) {
      if (retry >= 5) throw new Error(`Unable to generate a valid chapter map: ${chapterIndex + 1}`);
      return createMap(run, chapterIndex, theme, retry + 1);
    }
    return { seed: run.seed, generationState: run.rngState, layerCount, startId: start.id, restId: rest.id, bossId: boss.id, nodes };
  }

  function createRun(characterId, seed = Math.floor(Math.random() * 2147483647)) {
    const character = game.characters.find((entry) => entry.id === characterId);
    if (!character) throw new Error("선택한 캐릭터를 찾을 수 없습니다.");
    const run = {
      characterId, seed: seed >>> 0, rngState: seed >>> 0,
      chapterIndex: 0, chapters: [], currentNodeId: null, activeNodeId: null,
      phase: "map", hp: character.maxHp, maxHp: character.maxHp, gold: 0,
      deck: [...character.startingDeck],
      relics: [], shops: {}, rewards: {}, events: {}, eventHistory: [], cardOrigins: [],
      totalGoldEarned: 0, totalEnemiesDefeated: 0, totalCardsAdded: 0, totalRelicsFound: 0,
      pendingRemoval: null, result: null
    };

    const chapterParts = game.chapterParts[character.originPart] || [character.originPart, character.originPart, character.originPart];
    for (const [index, part] of chapterParts.entries()) {
      const theme = game.themes[part];
      const chapterIndex = run.chapters.length;
      run.chapters.push({
        index: chapterIndex,
        part,
        theme,
        setting: theme.chapterSettings?.[chapterIndex] || theme.setting,
        map: createMap(run, chapterIndex, theme),
        cleared: false
      });
    }
    run.currentNodeId = run.chapters[0].map.startId;
    return run;
  }

  function currentChapter(run) {
    return run.chapters[run.chapterIndex];
  }

  function currentTheme(run) {
    return currentChapter(run).theme;
  }

  function getCurrentNode(run) {
    return currentChapter(run).map.nodes[run.activeNodeId || run.currentNodeId];
  }

  function getAvailableNodes(run) {
    if (run.phase !== "map") return [];
    const map = currentChapter(run).map;
    const current = map.nodes[run.currentNodeId];
    if (!current || !current.completed) return [];
    return current.connections.map((id) => map.nodes[id]).filter((node) => node && !node.completed);
  }

  function getAllNodes(run) {
    return Object.values(currentChapter(run).map.nodes);
  }

  function cardTier(card) {
    if (card.rarity === "희귀" || card.rarity === "전용") return "rare";
    if (card.rarity === "고급") return "uncommon";
    if (card.rarity === "일반") return "common";
    return null;
  }

  function eligibleCards(run) {
    const character = game.characters.find((entry) => entry.id === run.characterId);
    if (!character) return [];
    const allowedOwners = new Set(["shared", character.id]);
    const counts = new Map();
    for (const id of run.deck) {
      const card = game.cards[id];
      const baseId = card?.baseId || id;
      counts.set(baseId, (counts.get(baseId) || 0) + 1);
    }
    return Object.values(game.cards).filter((card) => {
      const tier = cardTier(card);
      if (!tier || card.upgraded || card.rewardEligible === false || !allowedOwners.has(card.owner)) return false;
      return (counts.get(card.id) || 0) < balance.cardReward.maxCopies;
    });
  }

  function drawCardOffers(run, rewardType) {
    let pool = eligibleCards(run);
    const offers = [];
    const character = game.characters.find((entry) => entry.id === run.characterId);
    const baseWeights = balance.cardReward.rarityWeights[rewardType] || balance.cardReward.rarityWeights.combat;
    const rareBonus = balance.cardReward.chapterRareBonus[run.chapterIndex] || 0;
    const weights = [Math.max(0, baseWeights[0] - rareBonus), baseWeights[1], baseWeights[2] + rareBonus];
    while (offers.length < balance.cardReward.count && pool.length > 0) {
      const exclusive = pool.filter((card) => card.owner === character.id);
      const shared = pool.filter((card) => card.owner === "shared");
      const preferExclusive = random(run) < balance.cardReward.characterExclusiveShare;
      const sourcePool = preferExclusive && exclusive.length ? exclusive : shared.length ? shared : exclusive;
      const tiers = ["common", "uncommon", "rare"];
      const availableTiers = tiers.filter((tier) => sourcePool.some((card) => cardTier(card) === tier));
      const availableWeight = availableTiers.reduce((total, tier) => total + weights[tiers.indexOf(tier)], 0);
      let roll = random(run) * availableWeight;
      let chosenTier = availableTiers[0];
      for (const tier of availableTiers) {
        roll -= weights[tiers.indexOf(tier)];
        if (roll <= 0) { chosenTier = tier; break; }
      }
      const candidates = sourcePool.filter((card) => cardTier(card) === chosenTier);
      const card = pick(run, candidates.length ? candidates : sourcePool);
      offers.push(card.id);
      pool = pool.filter((entry) => entry.id !== card.id);
    }

    if (offers.length < balance.cardReward.count && balance.cardReward.allowDuplicates) {
      const fallback = eligibleCards(run);
      while (offers.length < balance.cardReward.count && fallback.length) offers.push(pick(run, fallback).id);
    }
    return offers;
  }

  function drawRelic(run, rarity) {
    const part = currentChapter(run).part;
    const pool = Object.values(game.relics).filter((relic) =>
      relic.rarity === rarity && !run.relics.includes(relic.id) && (!relic.parts || relic.parts.includes(part))
    );
    if (pool.length) return pick(run, pool).id;
    const repeatable = Object.values(game.relics).filter((relic) =>
      relic.rarity === rarity && relic.allowDuplicate && (!relic.parts || relic.parts.includes(part))
    );
    return repeatable.length ? pick(run, repeatable).id : null;
  }

  function enterNode(run, nodeId) {
    const available = getAvailableNodes(run);
    const node = available.find((entry) => entry.id === nodeId);
    if (!node || node.completed) return null;
    node.visited = true;
    run.currentNodeId = node.id;
    run.activeNodeId = node.id;

    if (["combat", "elite", "boss"].includes(node.type)) {
      run.phase = "battle";
      const chapter = currentChapter(run);
      const theme = { ...chapter.theme, setting: chapter.setting };
      if (node.type === "boss") node.enemyId = (theme.chapterBosses || theme.bosses)[run.chapterIndex] || node.enemyId;
      if (!node.enemyId) {
        const chapterPool = node.type === "elite" ? theme.chapterElites : theme.chapterRegulars;
        const pool = chapterPool?.[run.chapterIndex] || (node.type === "elite" ? theme.elites : theme.regulars);
        node.enemyId = pick(run, pool);
      }
      const enemyTemplate = game.enemyBook[node.enemyId];
      const enemy = node.type === "boss" ? {
        ...enemyTemplate,
        type: "boss",
        maxHp: Math.round(enemyTemplate.maxHp * balance.chapterBossHealthScale[run.chapterIndex]),
        bossStage: run.chapterIndex + 1,
        caption: `${run.chapterIndex === 2 ? "최종 보스" : `챕터 ${run.chapterIndex + 1} 중간 보스`} · ${enemyTemplate.caption}`
      } : enemyTemplate;
      return { type: "battle", node, enemy, theme };
    }
    if (node.type === "shop") {
      run.phase = "shop";
      createShop(run, node);
      return { type: "shop", node };
    }
    if (node.type === "rest") { run.phase = "rest"; return { type: "rest", node }; }
    if (node.type === "event") {
      run.phase = "event";
      if (!run.events[node.id]) {
        const part = currentChapter(run).part;
        const history = new Set([
          ...(run.eventHistory || []),
          ...Object.values(run.events || {}).map((entry) => entry.eventId).filter(Boolean)
        ]);
        const matching = game.eventBook.filter((event) => (!event.parts || event.parts.includes(part)) && !history.has(event.id));
        const pool = matching.length ? matching : game.eventBook.filter((event) => !event.parts || event.parts.includes(part));
        run.events[node.id] = { choice: null, eventId: pick(run, pool).id, foreignCardId: null };
      }
      return { type: "event", node };
    }
    return null;
  }

  function ensureVictoryReward(run, battle) {
    const node = currentChapter(run).map.nodes[run.activeNodeId];
    if (!node || !battle || battle.result !== "win") return null;
    if (run.rewards[node.id]) {
      const existing = run.rewards[node.id];
      if (!existing.completed && !existing.relicId && node.type === "elite") existing.relicId = drawRelic(run, "elite");
      if (!existing.completed && !existing.relicId && node.type === "boss") existing.relicId = drawRelic(run, "boss");
      return existing;
    }
    const type = node.type === "boss" ? "boss" : node.type === "elite" ? "elite" : "combat";
    const range = balance.rewardGold[type];
    const goldBonus = balance.chapterGoldBonus[run.chapterIndex] || 0;
    const gold = integer(run, range[0] + goldBonus, range[1] + goldBonus);
    run.gold += gold;
    run.totalGoldEarned += gold;
    run.totalEnemiesDefeated += 1;
    if (battle) game.Relics.dispatch(run, "combatVictory", { battle });
    const relicRarity = type === "elite" ? "elite" : type === "boss" ? "boss" : null;
    const reward = {
      nodeId: node.id, type, gold, offers: drawCardOffers(run, type),
      relicId: relicRarity ? drawRelic(run, relicRarity) : null, relicGranted: false,
      selectedIndex: null, skipped: false, completed: false,
      chapterIndex: run.chapterIndex, enemyName: battle.enemy.name
    };
    run.rewards[node.id] = reward;
    run.phase = "reward";
    return reward;
  }

  function selectRewardCard(run, index) {
    const reward = run.rewards[run.activeNodeId];
    if (!reward || reward.completed || !Number.isInteger(index) || index < 0 || index >= reward.offers.length) return false;
    reward.selectedIndex = index;
    reward.skipped = false;
    return true;
  }

  function skipReward(run) {
    const reward = run.rewards[run.activeNodeId];
    if (!reward || reward.completed) return false;
    reward.selectedIndex = null;
    reward.skipped = true;
    return true;
  }

  function confirmReward(run) {
    const reward = run.rewards[run.activeNodeId];
    const node = getCurrentNode(run);
    if (!reward || !node || reward.completed || (!reward.skipped && reward.selectedIndex === null)) return false;
    const selectedCard = !reward.skipped ? game.cards[reward.offers[reward.selectedIndex]] : null;
    if (!reward.skipped && !selectedCard) return false;
    const rewardRelic = reward.relicId ? game.relics[reward.relicId] : null;
    if (reward.relicId && !reward.relicGranted && (!rewardRelic || (run.relics.includes(reward.relicId) && !rewardRelic.allowDuplicate))) return false;

    if (!reward.skipped) {
      run.deck.push(selectedCard.id);
      run.totalCardsAdded += 1;
      reward.addedCardId = selectedCard.id;
    }
    if (reward.relicId && !reward.relicGranted) {
      run.relics.push(reward.relicId);
      reward.relicGranted = true;
      run.totalRelicsFound += 1;
    }
    reward.completed = true;
    node.completed = true;
    run.currentNodeId = node.id;
    if (node.type === "boss") {
      currentChapter(run).cleared = true;
      run.phase = run.chapterIndex === 2 ? "victory" : "chapter-clear";
      if (run.phase === "victory") run.result = { won: true, characterId: run.characterId, chapters: run.chapters.map((chapter) => chapter.part), cardsAdded: run.totalCardsAdded, enemiesDefeated: run.totalEnemiesDefeated, relics: [...run.relics], goldEarned: run.totalGoldEarned };
    } else {
      run.phase = "map";
    }
    return true;
  }

  function nextChapter(run) {
    if (run.phase !== "chapter-clear" || run.chapterIndex >= 2) return false;
    run.chapterIndex += 1;
    run.hp = Math.min(run.maxHp, run.hp + 8);
    run.currentNodeId = currentChapter(run).map.startId;
    run.activeNodeId = null;
    run.phase = "map";
    return true;
  }

  function shopCardPool(run) {
    const character = game.characters.find((entry) => entry.id === run.characterId);
    return eligibleCards(run).filter((card) => card.owner === character.id && cardTier(card));
  }

  function createShop(run, node) {
    if (run.shops[node.id]) return run.shops[node.id];
    const cardPool = shopCardPool(run);
    const ownedCards = Object.values(game.cards).filter((card) =>
      card.owner === run.characterId && cardTier(card) && !card.upgraded
    );
    const stock = [];
    for (let index = 0; index < 3 && ownedCards.length; index += 1) {
      const sourcePool = cardPool.length ? cardPool : ownedCards;
      const card = pick(run, sourcePool);
      const tier = cardTier(card);
      stock.push({ id: `${node.id}-card-${index}`, kind: "card", itemId: card.id, price: balance.shopPrices[tier], sold: false });
      if (cardPool.includes(card)) cardPool.splice(cardPool.indexOf(card), 1);
    }
    const part = currentChapter(run).part;
    const relicPool = Object.values(game.relics).filter((relic) =>
      relic.rarity === "common" && !run.relics.includes(relic.id) && (!relic.parts || relic.parts.includes(part))
    );
    for (let index = 0; index < 2 && relicPool.length; index += 1) {
      const relic = pick(run, relicPool);
      stock.push({ id: `${node.id}-relic-${index}`, kind: "relic", itemId: relic.id, price: relic.price, sold: false });
      relicPool.splice(relicPool.indexOf(relic), 1);
    }
    stock.push({ id: `${node.id}-heal`, kind: "heal", itemId: "heal", price: balance.shopPrices.heal, sold: false });
    stock.push({ id: `${node.id}-remove`, kind: "remove", itemId: "remove", price: balance.shopPrices.remove, sold: false });
    run.shops[node.id] = { nodeId: node.id, stock, created: true };
    return run.shops[node.id];
  }

  function getShop(run) {
    const node = getCurrentNode(run);
    return run.phase === "shop" && node && node.type === "shop" ? createShop(run, node) : null;
  }

  function purchase(run, stockId) {
    const shop = getShop(run);
    const item = shop && shop.stock.find((entry) => entry.id === stockId);
    if (!item || item.sold || run.gold < item.price) return { ok: false, reason: "unavailable" };
    if (item.kind === "heal" && run.hp >= run.maxHp) return { ok: false, reason: "full-health" };
    if (item.kind === "remove") {
      if (run.deck.length <= 1 || run.pendingRemoval) return { ok: false, reason: "no-removal" };
      run.pendingRemoval = item.id;
      return { ok: true, requiresCard: true };
    }
    if (item.kind === "relic" && run.relics.includes(item.itemId)) return { ok: false, reason: "owned" };

    run.gold -= item.price;
    item.sold = true;
    if (item.kind === "card") run.deck.push(item.itemId);
    if (item.kind === "relic") run.relics.push(item.itemId);
    if (item.kind === "heal") run.hp = Math.min(run.maxHp, run.hp + 20);
    return { ok: true, requiresCard: false };
  }

  function removeCard(run, stockId, deckIndex) {
    const shop = getShop(run);
    const item = shop && shop.stock.find((entry) => entry.id === stockId && entry.kind === "remove");
    if (!item || item.sold || run.pendingRemoval !== item.id || run.gold < item.price || run.deck.length <= 1 || !Number.isInteger(deckIndex) || deckIndex < 0 || deckIndex >= run.deck.length) return false;
    run.gold -= item.price;
    run.deck.splice(deckIndex, 1);
    item.sold = true;
    run.pendingRemoval = null;
    return true;
  }

  function cancelRemoval(run) {
    run.pendingRemoval = null;
  }

  function finishRest(run, node) {
    node.visited = true;
    node.completed = true;
    run.currentNodeId = node.id;
    run.activeNodeId = null;
    run.phase = "map";
  }

  function leaveShop(run) {
    const node = getCurrentNode(run);
    if (run.phase !== "shop" || !node || node.type !== "shop") return false;
    node.completed = true;
    run.phase = "map";
    run.pendingRemoval = null;
    return true;
  }

  function completeRest(run, choice) {
    const node = getCurrentNode(run);
    if (run.phase !== "rest" || !node || node.type !== "rest" || node.completed) return false;
    if (choice === "heal") run.hp = Math.min(run.maxHp, run.hp + Math.ceil(run.maxHp * 0.3));
    else if (choice === "gold") {
      run.gold += 20;
      run.totalGoldEarned += 20;
    }
    else return false;
    finishRest(run, node);
    return true;
  }

  function upgradeRestCard(run, deckIndex) {
    const node = getCurrentNode(run);
    if (run.phase !== "rest" || !node || node.type !== "rest" || node.completed || !Number.isInteger(deckIndex)) return false;
    const cardId = run.deck[deckIndex];
    const card = game.cards[cardId];
    if (!card || card.upgraded) return false;
    const upgradedId = `upgraded-${card.baseId || card.id}`;
    if (!game.cards[upgradedId]) return false;
    run.deck[deckIndex] = upgradedId;
    finishRest(run, node);
    return true;
  }
  function completeEvent(run, choice) {
    const node = getCurrentNode(run);
    if (!node || node.type !== "event" || node.completed || run.events[node.id]?.choice) return false;
    const instance = run.events[node.id];
    const event = game.eventBook.find((entry) => entry.id === instance.eventId);
    const option = getEventChoices(run).find((entry) => entry.id === choice);
    if (!event || !option) return false;
    const effect = option.effect;
    if (effect.type === "heal") run.hp = Math.min(run.maxHp, run.hp + effect.amount);
    else if (effect.type === "bloodGold") {
      run.hp = Math.max(1, run.hp - effect.health);
      run.gold += effect.gold;
      run.totalGoldEarned += effect.gold;
    } else if (effect.type === "payHeal") {
      if (run.gold < effect.gold) return false;
      run.gold -= effect.gold;
      run.hp = Math.min(run.maxHp, run.hp + effect.heal);
    } else if (effect.type === "gold") {
      run.gold += effect.amount;
      run.totalGoldEarned += effect.amount;
    } else if (effect.type === "gamble") {
      if (random(run) < effect.chance) {
        run.gold += effect.gold;
        run.totalGoldEarned += effect.gold;
      } else run.hp = Math.max(1, run.hp - effect.health);
    } else if (effect.type === "card") {
      const pool = eligibleCards(run);
      if (!pool.length) return false;
      const card = pick(run, pool);
      run.deck.push(card.id);
      run.totalCardsAdded += 1;
      run.cardOrigins.push({ cardId: card.id, source: event.id, nodeId: node.id });
    } else if (effect.type === "relic") {
      if (run.gold < effect.cost) return false;
      const part = currentChapter(run).part;
      const relicPool = Object.values(game.relics).filter((relic) =>
        relic.rarity === "common" && !run.relics.includes(relic.id) && (!relic.parts || relic.parts.includes(part))
      );
      if (!relicPool.length) return false;
      run.gold -= effect.cost;
      const relic = pick(run, relicPool);
      run.relics.push(relic.id);
      run.totalRelicsFound += 1;
    } else if (effect.type === "upgrade") {
      const choices = run.deck.map((id, index) => {
        const card = game.cards[id];
        return card && !card.upgraded && game.cards[`upgraded-${card.baseId || card.id}`] ? index : -1;
      }).filter((index) => index >= 0);
      if (!choices.length) return false;
      const index = pick(run, choices);
      run.deck[index] = `upgraded-${game.cards[run.deck[index]].baseId || run.deck[index]}`;
    } else if (effect.type === "foreignCard") {
      const card = game.cards[instance.foreignCardId];
      if (!event.allowForeignCard || !card || card.owner === "shared" || card.owner === run.characterId || !isSafeEventCard(card)) return false;
      run.deck.push(card.id);
      run.totalCardsAdded += 1;
      run.cardOrigins.push({ cardId: card.id, source: event.id, nodeId: node.id });
    } else return false;
    run.events[node.id] = { ...instance, choice };
    run.eventHistory ||= [];
    run.eventHistory.push(event.id);
    node.completed = true;
    run.phase = "map";
    return true;
  }

  function getEventChoices(run) {
    const event = getEvent(run);
    if (!event) return [];
    const options = event.options || [
      { id: "shrine", label: event.shrine || "숨을 고른다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } },
      { id: "bargain", label: event.bargain || "표식과 거래한다", description: "체력 6을 잃고 골드 30 획득", effect: { type: "bloodGold", health: 6, gold: 30 } }
    ];
    const available = options.filter((option) => {
      const effect = option.effect;
      if (effect.type === "card") return eligibleCards(run).length > 0;
      if (effect.type === "upgrade") return run.deck.some((id) => {
        const card = game.cards[id];
        return card && !card.upgraded && Boolean(game.cards[`upgraded-${card.baseId || card.id}`]);
      });
      if (effect.type === "relic") {
        const part = currentChapter(run).part;
        return run.gold >= effect.cost && Object.values(game.relics).some((relic) =>
          relic.rarity === "common" && !run.relics.includes(relic.id) && (!relic.parts || relic.parts.includes(part))
        );
      }
      if (effect.type === "payHeal") return run.gold >= effect.gold;
      if (effect.type === "foreignCard") return Boolean(getEventOffer(run));
      return true;
    });
    return available.length ? available : [
      { id: "shrine", label: "숨을 고른다", description: "체력 10 회복", effect: { type: "heal", amount: 10 } }
    ];
  }

  function isSafeEventCard(card) {
    const supportedEffects = new Set([
      "damage", "block", "heal", "draw", "weaken", "gainResource", "consumeResource",
      "multiDamage", "intentDamage", "armCounter", "timeStop", "summonLife", "consumeLifeHeal"
    ]);
    return card.effects.every((effect) => supportedEffects.has(effect.type));
  }

  function getEventOffer(run) {
    const node = getCurrentNode(run);
    const instance = node && run.events[node.id];
    const event = instance && game.eventBook.find((entry) => entry.id === instance.eventId);
    if (!event?.allowForeignCard) return null;
    if (!instance.foreignCardId) {
      const counts = new Map();
      for (const id of run.deck) counts.set(id, (counts.get(id) || 0) + 1);
      const pool = Object.values(game.cards).filter((card) => card.owner !== "shared" && card.owner !== run.characterId && cardTier(card) && (counts.get(card.id) || 0) < balance.cardReward.maxCopies && isSafeEventCard(card));
      if (!pool.length) return null;
      instance.foreignCardId = pick(run, pool).id;
    }
    return game.cards[instance.foreignCardId] || null;
  }

  function getEvent(run) {
    const node = getCurrentNode(run);
    const instance = node && run.events[node.id];
    return instance ? game.eventBook.find((event) => event.id === instance.eventId) : null;
  }

  function completeBattleLoss(run) {
    run.phase = "game-over";
    run.result = { won: false, characterId: run.characterId, chapters: run.chapters.slice(0, run.chapterIndex + 1).map((chapter) => chapter.part), cardsAdded: run.totalCardsAdded, enemiesDefeated: run.totalEnemiesDefeated, relics: [...run.relics], goldEarned: run.totalGoldEarned };
  }

  game.Progression = {
    createRun, currentChapter, currentTheme, getCurrentNode, getAvailableNodes, getAllNodes,
    enterNode, ensureVictoryReward, selectRewardCard, skipReward, confirmReward, nextChapter,
    getShop, purchase, removeCard, cancelRemoval, leaveShop, completeRest, upgradeRestCard, completeEvent,
    getEvent, getEventOffer, getEventChoices, completeBattleLoss, eligibleCards, cardTier
  };
})();