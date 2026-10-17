(() => {
  const game = window.Jojo;
  let run = null;
  let battle = null;

  function showTitle() {
    run = null;
    battle = null;
    game.Save.clear();
    game.JourneyUI.show("titleScreen");
  }

  function showMap() {
    if (!run) return showTitle();
    game.JourneyUI.renderMap(run);
    game.JourneyUI.show("mapScreen");
    game.Save.save(run, battle);
  }

  function startRun(characterId) {
    run = game.Progression.createRun(characterId);
    battle = null;
    showMap();
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
  }

  function startNode(nodeId) {
    const encounter = game.Progression.enterNode(run, nodeId);
    if (!encounter) return;

    if (encounter.type === "battle") {
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
    } else if (encounter.type === "shop") {
      game.JourneyUI.renderShop(run);
      game.JourneyUI.show("shopScreen");
      game.Save.save(run, battle);
    } else if (encounter.type === "rest") {
      game.JourneyUI.renderChoiceStats(run, "restStats");
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
    const selection = event.target.closest("[data-character-id]");
    if (selection) startRun(selection.dataset.characterId);
  });

  document.getElementById("mapNodes").addEventListener("click", (event) => {
    const selection = event.target.closest("[data-node-id]");
    if (selection && !selection.disabled) startNode(selection.dataset.nodeId);
  });

  document.getElementById("hand").addEventListener("click", (event) => {
    const card = event.target.closest("[data-card-index]");
    if (!battle || !card) return;
    if (game.Combat.playCard(battle, Number(card.dataset.cardIndex))) renderAfterBattleAction();
  });

  document.getElementById("endTurn").addEventListener("click", () => {
    if (!battle || battle.result) return;
    game.Combat.endTurn(battle);
    renderAfterBattleAction();
  });

  document.getElementById("backToSelect").addEventListener("click", showTitle);

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
  document.getElementById("restGold").addEventListener("click", () => {
    if (run && game.Progression.completeRest(run, "gold")) showMap();
  });
  document.getElementById("eventShrine").addEventListener("click", () => {
    if (run && game.Progression.completeEvent(run, "shrine")) showMap();
  });
  document.getElementById("eventBargain").addEventListener("click", () => {
    if (run && game.Progression.completeEvent(run, "bargain")) showMap();
  });
  document.getElementById("eventBorrowCard").addEventListener("click", () => {
    if (run && game.Progression.completeEvent(run, "foreign-card")) showMap();
  });

  document.getElementById("nextChapter").addEventListener("click", () => {
    if (run && game.Progression.nextChapter(run)) showMap();
  });
  document.getElementById("victoryHome").addEventListener("click", showTitle);
  document.getElementById("gameOverHome").addEventListener("click", showTitle);

  document.addEventListener("keydown", (event) => {
    if (!battle || document.getElementById("battleScreen").hidden || event.repeat) return;
    if (/^[1-5]$/.test(event.key)) {
      if (game.Combat.playCard(battle, Number(event.key) - 1)) renderAfterBattleAction();
    } else if (event.key.toLowerCase() === "e" && !battle.result) {
      game.Combat.endTurn(battle);
      renderAfterBattleAction();
    }
  });

  function restoreRun() {
    const saved = game.Save.load();
    if (!saved) return game.JourneyUI.show("titleScreen");
    run = saved.run;
    battle = saved.battle;

    if (run.phase === "battle" && battle) {
      game.UI.renderBattle(battle);
      game.JourneyUI.show("battleScreen");
    } else if (run.phase === "reward") {
      let reward = run.rewards[run.activeNodeId];
      if (battle?.result === "win") reward = game.Progression.ensureVictoryReward(run, battle);
      if (!reward) return showMap();
      game.JourneyUI.renderReward(run, reward);
      game.JourneyUI.show("rewardScreen");
    } else if (run.phase === "shop") {
      game.JourneyUI.renderShop(run);
      game.JourneyUI.show("shopScreen");
    } else if (run.phase === "rest") {
      game.JourneyUI.renderChoiceStats(run, "restStats");
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
    } else {
      showMap();
    }
  }

  game.UI.renderSelection(game.characters);
  restoreRun();
})();