(() => {
  const game = window.Jojo;

  function effectsFor(relic) {
    return Array.isArray(relic.effect) ? relic.effect : [relic.effect];
  }

  function heal(state, amount) {
    if (state.player) {
      const restored = Math.min(amount, state.player.maxHp - state.player.hp);
      state.player.hp += restored;
      return restored;
    }
    const restored = Math.min(amount, state.maxHp - state.hp);
    state.hp += restored;
    return restored;
  }

  function dispatch(state, trigger, payload = {}) {
    const triggered = [];
    for (const relicId of state.relics || []) {
      const relic = game.relics[relicId];
      if (!relic) continue;
      for (const effect of effectsFor(relic)) {
        if (!effect || effect.trigger !== trigger) continue;
        if (effect.cardLabel && payload.card?.label !== effect.cardLabel) continue;
        if (effect.cardType && payload.card?.type !== effect.cardType) continue;
        if (effect.oncePerTurn) {
          state.relicTurnFlags ||= {};
          if (state.relicTurnFlags[relicId]) continue;
          state.relicTurnFlags[relicId] = true;
        }

        if (effect.type === "energy") {
          if (trigger === "battleStart") state.player.battleStartEnergy = (state.player.battleStartEnergy || 0) + effect.amount;
          else state.player.energy += effect.amount;
        } else if (effect.type === "draw") {
          if (trigger === "battleStart") state.player.battleStartDraw = (state.player.battleStartDraw || 0) + effect.amount;
          else game.Combat.drawCards(state, effect.amount);
        } else if (effect.type === "heal") {
          heal(state, effect.amount);
        } else if (effect.type === "block") {
          state.player.block += effect.amount;
        } else if (effect.type === "damageBonus") {
          payload.damage += effect.amount;
        } else if (effect.type === "retaliate") {
          payload.damage = Math.max(0, payload.damage - effect.amount);
          payload.retaliation = (payload.retaliation || 0) + effect.amount;
        }
        triggered.push(relicId);
      }
    }
    return triggered;
  }

  game.Relics = { dispatch };
})();