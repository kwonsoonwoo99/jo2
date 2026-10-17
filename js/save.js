(() => {
  const game = window.Jojo;
  const storageKey = "jojo-pixel-roguelike-save";
  const version = 2;

  function clear() {
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch {
      return false;
    }
  }

  function save(run, battle) {
    if (!run) return clear();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version, run, battle }));
      return true;
    } catch {
      return false;
    }
  }

  function load() {
    try {
      const serialized = localStorage.getItem(storageKey);
      if (!serialized) return null;
      const saved = JSON.parse(serialized);
      const validCharacter = game.characters.some((character) => character.id === saved.run?.characterId);
      const validVersion = saved.version === 1 || saved.version === version;
      const validRun = validVersion && validCharacter && Array.isArray(saved.run.chapters) && saved.run.chapters.length === 3 && Array.isArray(saved.run.deck) && saved.run.deck.every((cardId) => Boolean(game.cards[cardId]));
      if (!validRun) {
        clear();
        return null;
      }

      const run = saved.run;
      const seenRelics = new Set();
      run.relics = (Array.isArray(run.relics) ? run.relics : []).filter((id) => {
        const relic = game.relics[id];
        if (!relic || (seenRelics.has(id) && !relic.allowDuplicate)) return false;
        seenRelics.add(id);
        return true;
      });
      run.shops ||= {};
      run.rewards ||= {};
      run.events ||= {};
      run.cardOrigins ||= [];
      run.totalGoldEarned ||= 0;
      run.totalEnemiesDefeated ||= 0;
      run.totalCardsAdded ||= 0;
      run.totalRelicsFound ??= run.relics.length;
      const character = game.characters.find((entry) => entry.id === run.characterId);
      for (const chapter of run.chapters) {
        const map = chapter.map;
        if (!map?.nodes || !Number.isFinite(map.layerCount)) continue;
        for (const node of Object.values(map.nodes)) {
          if (node.id === map.startId || node.type === "start") node.y = 98;
          else if (node.id === map.bossId || node.type === "boss") node.y = 3;
          else if (Number.isInteger(node.layer) && node.layer >= 0) node.y = 88 - (node.layer / Math.max(1, map.layerCount - 1)) * 75;
        }
        const boss = map.nodes[map.bossId];
        const bossFightActive = run.activeNodeId === map.bossId && ["battle", "reward"].includes(run.phase);
        const stagedBoss = chapter.theme?.chapterBosses?.[chapter.index];
        if (boss && !boss.completed && !bossFightActive && stagedBoss) boss.enemyId = stagedBoss;
      }
      for (const reward of Object.values(run.rewards)) {
        reward.offers = (Array.isArray(reward.offers) ? reward.offers : []).filter((id) => {
          const card = game.cards[id];
          return card && (card.owner === "shared" || card.owner === character.id);
        });
        if (reward.selectedIndex !== null && !reward.offers[reward.selectedIndex]) reward.selectedIndex = null;
        if (reward.relicId && !game.relics[reward.relicId]) reward.relicId = null;
        reward.relicId ??= null;
        reward.relicGranted ??= false;
      }
      for (const event of Object.values(run.events)) {
        if (!game.eventBook.some((entry) => entry.id === event.eventId)) event.eventId = game.eventBook[0].id;
        if (event.foreignCardId && !game.cards[event.foreignCardId]) event.foreignCardId = null;
      }
      for (const shop of Object.values(run.shops)) {
        shop.stock = (Array.isArray(shop.stock) ? shop.stock : []).filter((item) => {
          if (item.kind === "card") {
            const card = game.cards[item.itemId];
            return card && (card.owner === "shared" || card.owner === character.id);
          }
          if (item.kind === "relic") return Boolean(game.relics[item.itemId]) && game.relics[item.itemId].rarity === "common";
          return ["heal", "remove"].includes(item.kind);
        });
      }
      const pendingShop = Object.values(run.shops).find((shop) => shop.stock.some((item) => item.id === run.pendingRemoval));
      if (!pendingShop) run.pendingRemoval = null;

      const battle = saved.battle || null;
      if (battle) {
        battle.relics ||= [...run.relics];
        battle.player ||= { hp: run.hp, maxHp: run.maxHp, energy: 3, maxEnergy: 3 };
        battle.player.resources ||= { hamon: 0, spin: 0, thread: 0, life: 0 };
        battle.player.counterDamage ||= 0;
        battle.player.timeStopUsed ||= false;
        battle.player.skipEnemyTurn ||= false;
        battle.player.battleStartEnergy ||= 0;
        battle.player.battleStartDraw ||= 0;
        battle.enemy ||= {};
        battle.enemy.damageBonus ||= 0;
        battle.enemy.preparedAttack ||= 0;
        battle.enemy.marked ||= false;
        battle.enemy.dodgeNext ||= false;
      }
      saved.version = version;
      localStorage.setItem(storageKey, JSON.stringify({ version, run, battle }));
      return { run, battle };
    } catch {
      clear();
      return null;
    }
  }

  game.Save = { save, load, clear };
})();