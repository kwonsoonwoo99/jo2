(() => {
  const game = window.Jojo;
  const storageKey = "jojo-pixel-roguelike-save";
  const profilesKey = "jojo-pixel-roguelike-profiles";
  const version = 4;
  let lastError = "";

  function clear() {
    try {
      const profiles = readProfiles();
      profiles.activeCharacterId = null;
      localStorage.setItem(profilesKey, JSON.stringify(profiles));
      lastError = "";
      document.dispatchEvent(new CustomEvent("jojo:save-status", { detail: { message: "" } }));
      return true;
    } catch {
      lastError = "현재 이어하기 상태를 정리하지 못했습니다.";
      document.dispatchEvent(new CustomEvent("jojo:save-status", { detail: { message: lastError } }));
      return false;
    }
  }

  function save(run, battle) {
    if (!run) return clear();
    try {
      const profiles = readProfiles();
      const character = game.characters.find((entry) => entry.id === run.characterId);
      const previousStats = profiles.byCharacter[run.characterId]?.statistics || {};
      const previousRun = profiles.byCharacter[run.characterId]?.run;
      const previousDiscoveries = profiles.byCharacter[run.characterId]?.discoveries || {};
      run.discoveredCards ||= [];
      for (const id of run.deck || []) {
        const baseId = game.cards[id]?.baseId || id;
        if (baseId && !run.discoveredCards.includes(baseId)) run.discoveredCards.push(baseId);
      }
      run.discoveredEnemies ||= [];
      profiles.byCharacter[run.characterId] = {
        characterId: run.characterId,
        updatedAt: Date.now(),
        run,
        battle: battle || null,
        statistics: {
          ...(previousStats || {}),
          runs: Math.max(previousStats.runs || 0, run.history?.runs || 0),
          goldEarned: run.totalGoldEarned || 0,
          enemiesDefeated: run.totalEnemiesDefeated || 0,
          cardsAdded: run.totalCardsAdded || 0,
          relicsFound: run.totalRelicsFound || 0,
          victories: (previousStats.victories || 0) + (run.phase === "victory" && !run.statisticsRecorded ? 1 : 0)
        },
        characterName: character?.name || run.characterId
      };
      const profileRun = profiles.byCharacter[run.characterId];
      profileRun.discoveries = {
        cards: [...new Set([...(previousDiscoveries.cards || []), ...(previousRun?.discoveredCards || []), ...(run.discoveredCards || [])])],
        enemies: [...new Set([...(previousDiscoveries.enemies || []), ...(previousRun?.discoveredEnemies || []), ...(run.discoveredEnemies || [])])]
      };
      run.discoveredCards = profileRun.discoveries.cards;
      run.discoveredEnemies = profileRun.discoveries.enemies;
      run.statisticsRecorded ||= run.phase === "victory";
      profileRun.run = run;
      profiles.activeCharacterId = run.characterId;
      localStorage.setItem(profilesKey, JSON.stringify(profiles));
      localStorage.setItem(storageKey, JSON.stringify({ version, run, battle }));
      lastError = "";
      document.dispatchEvent(new CustomEvent("jojo:save-status", { detail: { message: "" } }));
      return true;
    } catch {
      lastError = "저장 공간이 부족하거나 브라우저 저장소를 사용할 수 없습니다.";
      document.dispatchEvent(new CustomEvent("jojo:save-status", { detail: { message: lastError } }));
      return false;
    }
  }

  function readProfiles() {
    const raw = localStorage.getItem(profilesKey);
    if (!raw) {
      lastError = "";
      return { version, activeCharacterId: null, byCharacter: {} };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.byCharacter || typeof parsed.byCharacter !== "object") {
      throw new Error("Invalid character profile data");
    }
    return { ...parsed, version, byCharacter: parsed.byCharacter };
  }

  function getProfiles() {
    try {
      const profiles = readProfiles();
      lastError = "";
      return profiles;
    } catch {
      lastError = "캐릭터별 저장 목록을 읽지 못했습니다. 기존 저장 원본은 유지했습니다.";
      return { version, activeCharacterId: null, byCharacter: {} };
    }
  }

  function loadCharacter(characterId) {
    try {
      const profile = readProfiles().byCharacter[characterId];
      if (!profile?.run) return null;
      if (!isValidRun(profile.run) || (profile.run.phase === "battle" && !isValidBattle(profile.battle))) {
        lastError = "선택한 주인공의 진행 데이터가 올바르지 않아 덮어쓰지 않았습니다.";
        return null;
      }
      lastError = "";
      profile.run.eventHistory ||= [];
      if (profile.battle) {
        profile.battle.player.skillLockTurns ||= 0;
        profile.battle.enemy.counterDamage ||= 0;
        profile.battle.lastDraw ||= { base: profile.battle.turn <= 1 ? 5 : 3, bonus: 0, total: 0 };
      }
      return { run: profile.run, battle: profile.battle || null };
    } catch {
      lastError = "선택한 주인공의 저장 데이터를 읽지 못했습니다.";
      return null;
    }
  }

  function isValidRun(run) {
    return game.characters.some((character) => character.id === run?.characterId) &&
      Array.isArray(run.chapters) && run.chapters.length === 3 &&
      Array.isArray(run.deck) && run.deck.every((cardId) => Boolean(game.cards[cardId])) &&
      ["map", "battle", "reward", "shop", "rest", "event", "chapter-clear", "victory", "game-over"].includes(run.phase);
  }

  function isValidBattle(battle) {
    return Boolean(battle && game.characters.some((character) => character.id === battle.character?.id) &&
      battle.player && Number.isFinite(battle.player.hp) && Number.isFinite(battle.player.maxHp) &&
      battle.enemy && Number.isFinite(battle.enemy.hp) && Array.isArray(battle.enemy.intents) &&
      ["hand", "drawPile", "discardPile"].every((key) => Array.isArray(battle[key]) && battle[key].every((cardId) => Boolean(game.cards[cardId]))));
  }

  function ensureRestBeforeBoss(run, chapter, map) {
    const boss = map.nodes[map.bossId];
    if (!boss || boss.completed) return;
    const activeBoss = chapter.index === run.chapterIndex && run.activeNodeId === boss.id && ["battle", "reward"].includes(run.phase);
    if (activeBoss) return;

    const incoming = Object.values(map.nodes).filter((node) => node.connections.includes(boss.id));
    let rest = incoming.find((node) => node.type === "rest");
    if (!rest) {
      const restId = `c${chapter.index + 1}-legacy-boss-rest`;
      rest = {
        id: restId, type: "rest", layer: map.layerCount, x: 50, y: 8,
        connections: [boss.id], visited: false, completed: false
      };
      map.nodes[rest.id] = rest;
      map.restId = rest.id;
      map.layerCount += 1;
    }

    for (const node of incoming) {
      node.connections = node.connections.filter((id) => id !== boss.id);
      if (node.id !== rest.id && !node.connections.includes(rest.id)) node.connections.push(rest.id);
    }
    if (incoming.length === 0) {
      const parents = Object.values(map.nodes).filter((node) => node.id !== boss.id && node.id !== rest.id)
        .sort((left, right) => (right.layer || 0) - (left.layer || 0));
      if (parents.length) parents[0].connections.push(rest.id);
    }
    if (!rest.connections.includes(boss.id)) rest.connections.push(boss.id);
  }

  function load() {
    try {
      const serialized = localStorage.getItem(storageKey);
      let saved = serialized ? JSON.parse(serialized) : null;
      try {
        const profiles = readProfiles();
        const activeProfile = profiles.byCharacter[profiles.activeCharacterId];
        if (activeProfile?.run) saved = { version, run: activeProfile.run, battle: activeProfile.battle || null };
        else if (localStorage.getItem(profilesKey)) return null;
      } catch {
        lastError = "캐릭터별 저장 데이터에 문제가 있어 기존 저장을 확인합니다.";
      }
      if (!saved) return null;
      const validVersion = [1, 2, 3, version].includes(saved.version);
      const validRun = validVersion && isValidRun(saved.run) &&
        (saved.run.phase !== "battle" || isValidBattle(saved.battle)) &&
        (!saved.battle || isValidBattle(saved.battle));
      if (!validRun) {
        lastError = "저장 데이터가 올바르지 않아 이어하기를 건너뛰었습니다. 원본 데이터는 보존했습니다.";
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
      run.eventHistory ||= [];
      run.cardOrigins ||= [];
      run.totalGoldEarned ||= 0;
      run.totalEnemiesDefeated ||= 0;
      run.totalCardsAdded ||= 0;
      run.totalRelicsFound ??= run.relics.length;
      run.discoveredCards ||= [];
      run.discoveredEnemies ||= [];
      run.history ||= {};
      run.history.runs ||= 1;
      run.history.victories ||= 0;
      if (saved.battle) {
        saved.battle.player.skillLockTurns ||= 0;
        saved.battle.enemy.counterDamage ||= 0;
        saved.battle.lastDraw ||= { base: saved.battle.turn <= 1 ? 5 : 3, bonus: 0, total: 0 };
      }
      const character = game.characters.find((entry) => entry.id === run.characterId);
      for (const [index, chapter] of run.chapters.entries()) {
        chapter.index = index;
        chapter.part = character.originPart;
        chapter.theme = game.themes[character.originPart];
        chapter.setting = chapter.theme.chapterSettings?.[index] || chapter.theme.setting;
        const map = chapter.map;
        if (!map?.nodes || !Number.isFinite(map.layerCount)) continue;
        for (const node of Object.values(map.nodes)) {
          if (node.id === map.startId || node.type === "start") node.y = 98;
          else if (node.id === map.bossId || node.type === "boss") node.y = 3;
          else if (Number.isInteger(node.layer) && node.layer >= 0) node.y = 88 - (node.layer / Math.max(1, map.layerCount - 1)) * 75;
          if (["combat", "elite"].includes(node.type) && !node.visited) {
            const enemy = game.enemyBook[node.enemyId];
            if (!enemy || enemy.part !== chapter.part) node.enemyId = null;
          }
          run.discoveredCards ||= [];
          run.discoveredEnemies ||= [];
          run.history ||= { victories: 0, runs: 0 };
          for (const cardId of run.deck) {
            const baseId = game.cards[cardId]?.baseId || cardId;
            if (!run.discoveredCards.includes(baseId)) run.discoveredCards.push(baseId);
          }
        }
        const boss = map.nodes[map.bossId];
        const bossFightActive = run.activeNodeId === map.bossId && ["battle", "reward"].includes(run.phase);
        const stagedBoss = chapter.theme.chapterBosses?.[index];
        if (boss && !boss.completed && !bossFightActive && stagedBoss) boss.enemyId = stagedBoss;
        ensureRestBeforeBoss(run, chapter, map);
      }
      for (const reward of Object.values(run.rewards)) {
        reward.offers = (Array.isArray(reward.offers) ? reward.offers : []).filter((id) => {
          const card = game.cards[id];
          return card && (card.owner === "shared" || card.owner === character.id) && !card.upgraded;
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
            return card && card.owner === character.id && !card.upgraded;
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
        const activeChapter = run.chapters[run.chapterIndex];
        if (activeChapter) {
          battle.theme = { ...activeChapter.theme, setting: activeChapter.setting };
          battle.chapterIndex = run.chapterIndex;
        }
        battle.player ||= { hp: run.hp, maxHp: run.maxHp, energy: 3, maxEnergy: 3 };
        battle.player.resources ||= { hamon: 0, spin: 0, thread: 0, life: 0 };
        battle.player.counterDamage ||= 0;
        battle.player.timeStopUsed ||= false;
        battle.player.skipEnemyTurn ||= false;
        battle.player.battleStartEnergy ||= 0;
        battle.player.battleStartDraw ||= 0;
        battle.player.energyPenalty ||= 0;
        battle.enemy ||= {};
        battle.enemy.damageBonus ||= 0;
        battle.enemy.preparedAttack ||= 0;
        battle.enemy.marked ||= false;
        battle.enemy.dodgeNext ||= false;
        battle.enemy.phaseTriggered ||= false;
        battle.exhaustPile ||= [];
        battle.turnActive ??= true;
      }
      saved.version = version;
      const migrated = { version, run, battle };
      localStorage.setItem(storageKey, JSON.stringify(migrated));
      let profiles;
      try {
        profiles = readProfiles();
      } catch {
        lastError = "기존 캐릭터 프로필을 보존했습니다. 복구 전까지 레거시 진행 데이터로 실행합니다.";
        return { run, battle };
      }
      const existingProfile = profiles.byCharacter[run.characterId] || {};
      profiles.byCharacter[run.characterId] = {
        ...existingProfile,
        characterId: run.characterId, updatedAt: Date.now(), run, battle,
        statistics: { ...(existingProfile.statistics || {}), runs: Math.max(existingProfile.statistics?.runs || 0, run.history.runs || 1), victories: existingProfile.statistics?.victories || run.history.victories || 0, goldEarned: run.totalGoldEarned || 0, enemiesDefeated: run.totalEnemiesDefeated || 0, cardsAdded: run.totalCardsAdded || 0, relicsFound: run.totalRelicsFound || 0 },
        discoveries: {
          cards: [...new Set([...(existingProfile.discoveries?.cards || []), ...(run.discoveredCards || [])])],
          enemies: [...new Set([...(existingProfile.discoveries?.enemies || []), ...(run.discoveredEnemies || [])])]
        },
        characterName: character.name
      };
      profiles.activeCharacterId = run.characterId;
      localStorage.setItem(profilesKey, JSON.stringify(profiles));
      lastError = "";
      return { run, battle };
    } catch (error) {
      lastError = `저장 데이터를 복구하지 못했습니다. 손상된 원본을 그대로 보존했습니다. (${error.message})`;
      return null;
    }
  }

  game.Save = {
    save, load, clear, getProfiles, loadCharacter,
    get lastError() { return lastError; },
    get profilesKey() { return profilesKey; }
  };
})();