(() => {
  const game = window.Jojo;
  let run = null;
  let battle = null;

  function showTitle() {
    run = null;
    battle = null;
    game.Save.clear();
    game.UI.renderSelection(game.characters, game.Save.getProfiles());
    game.JourneyUI.show("titleScreen");
    syncTools();
  }

  function syncTools() {
    const active = Boolean(run);
    document.querySelectorAll("[data-panel='deck'], [data-panel='relics']").forEach((button) => { button.hidden = !active; });
  }

  function showMap() {
    if (!run) return showTitle();
    game.JourneyUI.renderMap(run);
    game.JourneyUI.show("mapScreen");
    game.Save.save(run, battle);
    syncTools();
  }

  function returnToTitle() {
    if (run && !game.Save.save(run, battle)) return;
    showTitle();
  }

  function startRun(characterId) {
    const profiles = game.Save.getProfiles();
    const profile = profiles.byCharacter[characterId];
    const existing = game.Save.loadCharacter(characterId);
    if (game.Save.lastError && (!existing || profile)) {
      const notice = document.getElementById("saveNotice");
      notice.textContent = `${game.Save.lastError} 기존 저장을 보존하기 위해 새 여정을 시작하지 않았습니다.`;
      notice.hidden = false;
      return;
    }
    if (existing && !window.confirm(`${game.characters.find((entry) => entry.id === characterId).name}의 기존 여정을 새 여정으로 덮어쓸까요?`)) return;
    run = game.Progression.createRun(characterId);
    const discoveries = profile?.discoveries || {};
    run.discoveredCards = [...new Set([...(discoveries.cards || []), ...run.deck.map((id) => game.cards[id].baseId || id)])];
    run.discoveredEnemies = [...(discoveries.enemies || [])];
    run.history = { runs: (profile?.statistics?.runs || 0) + 1, victories: profile?.statistics?.victories || 0 };
    battle = null;
    showMap();
  }

  function continueRun(characterId) {
    const saved = game.Save.loadCharacter(characterId);
    if (!saved) {
      if (game.Save.lastError) {
        const notice = document.getElementById("saveNotice");
        notice.textContent = game.Save.lastError;
        notice.hidden = false;
      }
      return;
    }
    run = saved.run;
    battle = saved.battle;
    game.Save.save(run, battle);
    restoreScreen();
    syncTools();
  }

  function restoreScreen() {
    if (!run) return game.JourneyUI.show("titleScreen");
    if (run.phase === "battle" && battle) {
      game.UI.renderBattle(battle);
      game.JourneyUI.show("battleScreen");
    } else if (run.phase === "reward") {
      const reward = battle?.result === "win" ? game.Progression.ensureVictoryReward(run, battle) : run.rewards[run.activeNodeId];
      if (!reward) return showMap();
      game.JourneyUI.renderReward(run, reward);
      game.JourneyUI.show("rewardScreen");
    } else if (run.phase === "shop") {
      game.JourneyUI.renderShop(run);
      game.JourneyUI.show("shopScreen");
    } else if (run.phase === "rest") {
      game.JourneyUI.renderRest(run);
      game.JourneyUI.show("restScreen");
    } else if (run.phase === "event") {
      game.JourneyUI.renderEvent(run);
      game.JourneyUI.show("eventScreen");
    } else if (run.phase === "chapter-clear") {
      game.JourneyUI.renderChapterClear(run);
      game.JourneyUI.show("chapterScreen");
    } else if (run.phase === "victory") {
      game.JourneyUI.renderVictory(run);
      game.JourneyUI.show("victoryScreen");
    } else if (run.phase === "game-over") {
      game.JourneyUI.renderGameOver(run);
      game.JourneyUI.show("gameOverScreen");
    } else showMap();
  }

  function renderAfterBattleAction() {
    if (!battle || !run) return;
    run.hp = battle.player.hp;
    battle.gold = run.gold;
    game.UI.renderBattle(battle);
    if (battle.result === "win") {
      const reward = game.Progression.ensureVictoryReward(run, battle);
      game.JourneyUI.renderReward(run, reward);
      game.JourneyUI.show("rewardScreen");
    } else if (battle.result === "loss") {
      game.Progression.completeBattleLoss(run);
      game.JourneyUI.renderGameOver(run);
      game.JourneyUI.show("gameOverScreen");
    }
    game.Save.save(run, battle);
    syncTools();
  }

  function startNode(nodeId) {
    const encounter = game.Progression.enterNode(run, nodeId);
    if (!encounter) return;

    if (encounter.type === "battle") {
      run.discoveredEnemies ||= [];
      if (!run.discoveredEnemies.includes(encounter.enemy.id)) run.discoveredEnemies.push(encounter.enemy.id);
      battle = game.Combat.createBattle(run.characterId, {
        enemy: encounter.enemy,
        deck: run.deck,
        playerHp: run.hp,
        playerMaxHp: run.maxHp,
        relics: run.relics,
        nodeType: encounter.node.type,
        theme: encounter.theme,
        chapterIndex: run.chapterIndex,
        gold: run.gold
      });
      game.UI.renderBattle(battle);
      game.JourneyUI.show("battleScreen");
      game.Save.save(run, battle);
      syncTools();
    } else if (encounter.type === "shop") {
      game.JourneyUI.renderShop(run);
      game.JourneyUI.show("shopScreen");
      game.Save.save(run, battle);
    } else if (encounter.type === "rest") {
      game.JourneyUI.renderRest(run);
      game.JourneyUI.show("restScreen");
      game.Save.save(run, battle);
    } else if (encounter.type === "event") {
      game.JourneyUI.renderEvent(run);
      game.JourneyUI.show("eventScreen");
      game.Save.save(run, battle);
    }
  }

  function finishReward() {
    if (!game.Progression.confirmReward(run)) return;
    if (run.phase === "chapter-clear") {
      game.JourneyUI.renderChapterClear(run);
      game.JourneyUI.show("chapterScreen");
      game.Save.save(run, battle);
    } else if (run.phase === "victory") {
      game.JourneyUI.renderVictory(run);
      game.JourneyUI.show("victoryScreen");
      game.Save.save(run, battle);
    } else {
      showMap();
    }
  }

  document.getElementById("characterGrid").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-run-action][data-character-id]");
    if (!selection) return;
    if (selection.dataset.runAction === "continue") continueRun(selection.dataset.characterId);
    else startRun(selection.dataset.characterId);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel]");
    if (!button || button.disabled || !game.Panels) return;
    game.Panels.open(button.dataset.panel, run, battle);
  });

  document.getElementById("mapNodes").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-node-id]");
    if (selection && !selection.disabled) startNode(selection.dataset.nodeId);
  });
  document.getElementById("mapToTitle").addEventListener("click", returnToTitle);
  document.getElementById("returnToMain").addEventListener("click", returnToTitle);

  document.getElementById("hand").addEventListener("click", (event) => {
    const card = event.target.closest("[data-card-index]");
    if (!battle || !card) return;
    if (game.Combat.playCard(battle, Number(card.dataset.cardIndex))) renderAfterBattleAction();
  });

  document.getElementById("endTurn").addEventListener("click", () => {
    if (!battle || battle.result) return;
    endTurn();
  });

  function endTurn() {
    if (!battle || battle.result) return;
    const result = game.Combat.endTurn(battle);
    if (result && typeof result === "object" && result.requiresDiscard && game.Panels) {
      game.Panels.openDiscard(battle, result.requiresDiscard, (indices) => {
        game.Combat.endTurn(battle, indices);
        renderAfterBattleAction();
      });
      return;
    }
    renderAfterBattleAction();
  }

  document.getElementById("backToSelect").addEventListener("click", returnToTitle);
  document.getElementById("resultBack").addEventListener("click", returnToTitle);

  document.getElementById("skipReward").addEventListener("click", () => {
    if (!run || !game.Progression.skipReward(run)) return;
    finishReward();
  });

  document.getElementById("rewardOffers").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-reward-index]");
    if (!run || !selection) return;
    if (!game.Progression.selectRewardCard(run, Number(selection.dataset.rewardIndex))) return;
    game.JourneyUI.renderReward(run, run.rewards[run.activeNodeId]);
    game.Save.save(run, battle);
  });

  document.getElementById("confirmReward").addEventListener("click", finishReward);

  document.getElementById("shopStock").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-shop-id]");
    if (!run || !selection) return;
    const result = game.Progression.purchase(run, selection.dataset.shopId);
    if (result.ok && result.requiresCard) game.JourneyUI.selectedDeckIndex = null;
    game.JourneyUI.renderShop(run);
    game.Save.save(run, battle);
  });

  document.getElementById("shopDeck").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-deck-index]");
    if (!run || !selection || !run.pendingRemoval) return;
    game.JourneyUI.selectedDeckIndex = Number(selection.dataset.deckIndex);
    game.JourneyUI.renderShop(run);
  });

  document.getElementById("confirmRemove").addEventListener("click", () => {
    if (!run || game.JourneyUI.selectedDeckIndex === null) return;
    const removed = game.Progression.removeCard(run, run.pendingRemoval, game.JourneyUI.selectedDeckIndex);
    if (removed) game.JourneyUI.selectedDeckIndex = null;
    game.JourneyUI.renderShop(run);
    game.Save.save(run, battle);
  });

  document.getElementById("cancelRemove").addEventListener("click", () => {
    if (!run) return;
    game.Progression.cancelRemoval(run);
    game.JourneyUI.selectedDeckIndex = null;
    game.JourneyUI.renderShop(run);
    game.Save.save(run, battle);
  });

  document.getElementById("leaveShop").addEventListener("click", () => {
    if (run && game.Progression.leaveShop(run)) showMap();
  });

  document.getElementById("restHeal").addEventListener("click", () => {
    if (run && game.Progression.completeRest(run, "heal")) showMap();
  });
  document.getElementById("restUpgrade").addEventListener("click", () => {
    const choices = document.getElementById("restUpgradeChoices");
    choices.hidden = false;
    choices.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  document.getElementById("restUpgradeChoices").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-upgrade-index]");
    if (!run || !selection) return;
    game.JourneyUI.selectRestUpgrade(run, Number(selection.dataset.upgradeIndex));
  });
  document.getElementById("confirmRestUpgrade").addEventListener("click", () => {
    if (!run || game.JourneyUI.selectedUpgradeIndex === null) return;
    if (game.Progression.upgradeRestCard(run, game.JourneyUI.selectedUpgradeIndex)) showMap();
  });
  document.getElementById("cancelRestUpgrade").addEventListener("click", () => {
    game.JourneyUI.cancelRestUpgrade();
  });
  document.getElementById("eventChoices").addEventListener("click", (event) => {
    const choice = event.target.closest("[data-event-choice]");
    if (run && choice && game.Progression.completeEvent(run, choice.dataset.eventChoice)) showMap();
  });

  document.getElementById("nextChapter").addEventListener("click", () => {
    if (run && game.Progression.nextChapter(run)) showMap();
  });
  document.getElementById("victoryHome").addEventListener("click", showTitle);
  document.getElementById("gameOverHome").addEventListener("click", showTitle);

  document.addEventListener("keydown", (event) => {
    if (!battle || document.getElementById("battleScreen").hidden || !document.getElementById("panelLayer").hidden || event.repeat) return;
    if (/^[1-5]$/.test(event.key)) {
      if (game.Combat.playCard(battle, Number(event.key) - 1)) renderAfterBattleAction();
    } else if (event.key.toLowerCase() === "e" && !battle.result) {
      endTurn();
    }
  });

  function restoreRun() {
    const saved = game.Save.load();
    if (!saved) {
      game.JourneyUI.show("titleScreen");
      syncTools();
      const notice = document.getElementById("saveNotice");
      if (game.Save.lastError) {
        notice.textContent = game.Save.lastError;
        notice.hidden = false;
      }
      return;
    }
    run = saved.run;
    battle = saved.battle;
    restoreScreen();
    syncTools();
    if (game.Save.lastError) {
      const notice = document.getElementById("saveNotice");
      notice.textContent = game.Save.lastError;
      notice.hidden = false;
    }
  }

  document.addEventListener("jojo:save-status", (event) => {
    const notice = document.getElementById("saveNotice");
    notice.textContent = event.detail.message;
    notice.hidden = !event.detail.message;
  });
  game.UI.renderSelection(game.characters, game.Save.getProfiles());
  if (game.Save.lastError) {
    document.getElementById("saveNotice").textContent = game.Save.lastError;
    document.getElementById("saveNotice").hidden = false;
  }
  restoreRun();
})();