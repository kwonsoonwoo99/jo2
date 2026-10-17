(() => {
  const game = window.Jojo;
  let selectedDeckIndex = null;

  const nodeInfo = {
    start: { icon: "◆", label: "출발", description: "탐험을 시작합니다." },
    combat: { icon: "⚔", label: "전투", description: "일반 적과 전투합니다." },
    elite: { icon: "✦", label: "정예", description: "위험하지만 정예 유물이 기다립니다." },
    shop: { icon: "G", label: "상점", description: "골드로 카드·유물·회복을 구입합니다." },
    rest: { icon: "+", label: "휴식", description: "체력을 회복하거나 보급 골드를 얻습니다." },
    event: { icon: "?", label: "이벤트", description: "선택에 따라 보상과 대가가 달라집니다." },
    boss: { icon: "★", label: "보스", description: "챕터 보스전입니다." }
  };

  function applyTheme(screenId, run) {
    const screen = document.getElementById(screenId);
    for (const theme of Object.values(game.themes)) screen.classList.remove(theme.className);
    screen.classList.add(game.Progression.currentTheme(run).className);
  }

  function renderStats(run, targetId) {
    const character = game.characters.find((entry) => entry.id === run.characterId);
    const target = document.getElementById(targetId);
    target.innerHTML = [
      ["person", "주인공", character.name],
      ["heart", "체력", `${run.hp} / ${run.maxHp}`],
      ["coin", "골드", `${run.gold} G`],
      ["card", "덱", `${run.deck.length}장`],
      ["relic", "유물", `${run.relics.length}개`]
    ].map(([icon, label, value]) => `<div class="run-stat"><span><i class="ui-icon icon-${icon}" aria-hidden="true"></i>${label}</span><b>${value}</b></div>`).join("");
  }

  function renderMap(run) {
    const chapter = game.Progression.currentChapter(run);
    const theme = chapter.theme;
    const screen = document.getElementById("mapScreen");
    screen.className = `screen journey-screen map-screen ${theme.className}`;
    document.getElementById("mapChapterLabel").textContent = `CHAPTER ${run.chapterIndex + 1} / 3 · PART ${chapter.part}`;
    document.getElementById("mapTitle").textContent = theme.name;
    document.getElementById("mapSetting").textContent = theme.setting;
    document.getElementById("mapSeed").textContent = `RUN SEED ${run.seed} · MAP ${run.chapterIndex + 1}`;
    document.getElementById("mapCanvas").style.height = `${Math.max(980, (chapter.map.layerCount + 2) * 74)}px`;
    renderStats(run, "mapStats");

    const nodes = game.Progression.getAllNodes(run);
    const availableIds = new Set(game.Progression.getAvailableNodes(run).map((node) => node.id));
    const map = chapter.map;
    const lines = [];
    for (const node of nodes) {
      for (const nextId of node.connections) {
        const next = map.nodes[nextId];
        if (!next) continue;
        const stateClass = node.id === run.currentNodeId ? "path-available" : node.completed && next.visited ? "path-cleared" : "";
        lines.push(`<line class="${stateClass}" x1="${node.x * 10}" y1="${node.y * 10}" x2="${next.x * 10}" y2="${next.y * 10}"></line>`);
      }
    }
    document.getElementById("mapLines").innerHTML = lines.join("");

    document.getElementById("mapNodes").innerHTML = nodes.map((node) => {
      const { icon, label, description } = nodeInfo[node.type];
      const available = availableIds.has(node.id);
      const current = node.id === run.currentNodeId;
      const classes = ["map-node", `node-${node.type}`, node.completed ? "completed" : "", available ? "available" : "", current ? "current" : ""].filter(Boolean).join(" ");
      const part = node.enemyId ? ` · ${game.enemyBook[node.enemyId].name}` : "";
      const tooltip = node.enemyId ? `${game.enemyBook[node.enemyId].name}: ${game.enemyBook[node.enemyId].caption}` : description;
      return `<button class="${classes}" type="button" data-node-id="${node.id}" style="left:${node.x}%;top:${node.y}%" title="${label} · ${tooltip}" ${available ? "" : "disabled"} aria-label="${label}${part}${available ? ", 이동 가능" : ""}. ${tooltip}"><span><span class="node-icon">${icon}</span>${label}</span></button>`;
    }).join("");
  }

  function renderReward(run, reward) {
    applyTheme("rewardScreen", run);
    renderStats(run, "rewardStats");
    document.getElementById("rewardEnemy").textContent = `${game.Progression.currentTheme(run).name} · ${reward.enemyName} 격파`;
    document.getElementById("rewardGold").textContent = `+${reward.gold} G`;
    const relicPanel = document.getElementById("rewardRelic");
    const rewardRelic = reward.relicId && game.relics[reward.relicId];
    relicPanel.hidden = !rewardRelic;
    if (rewardRelic) {
      relicPanel.className = `reward-relic rarity-${rewardRelic.rarity}`;
      relicPanel.innerHTML = `<span class="relic-icon" aria-hidden="true">${rewardRelic.icon}</span><div><span class="relic-rarity">${rewardRelic.rarity === "boss" ? "보스 유물" : "정예 유물"}</span><h2>${rewardRelic.name}</h2><p>${rewardRelic.description}</p></div><span class="relic-status">확정 시 획득</span>`;
    }
    document.getElementById("rewardDeckCount").textContent = `현재 덱 ${run.deck.length}장`;
    document.getElementById("rewardOffers").innerHTML = reward.offers.map((cardId, index) => {
      const card = game.cards[cardId];
      const tier = game.Progression.cardTier(card) || "common";
      const selected = reward.selectedIndex === index;
      return `<button class="card reward-card rarity-${tier}${selected ? " selected" : ""}" type="button" data-reward-index="${index}" aria-pressed="${selected}" aria-label="${card.name}, ${card.rarity}, 비용 ${card.cost}, ${card.description}">
        <span class="card-cost">${card.cost}</span>
        <span class="card-type">${card.label} · ${card.rarity}</span>
        <span class="card-symbol" aria-hidden="true">${card.symbol}</span>
        <span class="card-title">${card.name}</span>
        <span class="card-description">${card.description}</span>
      </button>`;
    }).join("");
    const message = reward.skipped ? "카드 없이 골드만 가져갑니다." : reward.selectedIndex === null ? "보상 카드 하나를 선택하거나 건너뛰세요." : `${game.cards[reward.offers[reward.selectedIndex]].name} 선택됨. 확정하면 덱에 추가됩니다.`;
    document.getElementById("rewardMessage").textContent = message;
    document.getElementById("confirmReward").disabled = !reward.skipped && reward.selectedIndex === null;
    document.getElementById("confirmReward").textContent = reward.completed ? "보상 완료" : "보상 확정";
  }

  function shopItemDetails(item) {
    if (item.kind === "card") {
      const card = game.cards[item.itemId];
      const tier = game.Progression.cardTier(card);
      return { name: card.name, description: `${card.rarity} · 비용 ${card.cost}. ${card.description}`, kind: "카드" };
    }
    if (item.kind === "relic") {
      const relic = game.relics[item.itemId];
      return { name: relic.name, description: relic.description, kind: "유물", icon: relic.icon };
    }
    if (item.kind === "heal") return { name: "응급 치료", description: "체력 20을 회복합니다. 최대 체력을 넘지 않습니다.", kind: "회복", icon: "+" };
    return { name: "카드 제거", description: "덱에서 카드 한 장을 골라 제거합니다.", kind: "정비", icon: "−" };
  }

  function renderDeck(run) {
    if (run.pendingRemoval) {
      document.getElementById("shopDeck").innerHTML = run.deck.map((id, index) => {
        const card = game.cards[id];
        const selected = selectedDeckIndex === index;
        return `<button class="deck-row remove-select${selected ? " selected" : ""}" type="button" data-deck-index="${index}" aria-pressed="${selected}"><span>${card.name}</span><span>제거</span></button>`;
      }).join("");
      return;
    }

    const counts = new Map();
    for (const id of run.deck) counts.set(id, (counts.get(id) || 0) + 1);
    const sorted = [...counts.entries()].sort((left, right) => game.cards[left[0]].name.localeCompare(game.cards[right[0]].name, "ko"));
    document.getElementById("shopDeckCount").textContent = `· ${run.deck.length}장`;
    document.getElementById("shopDeck").innerHTML = sorted.map(([id, count]) => {
      const card = game.cards[id];
      return `<div class="deck-row"><span>${card.name}</span><span>× ${count}</span></div>`;
    }).join("");
  }

  function renderShop(run) {
    if (!run.pendingRemoval) selectedDeckIndex = null;
    applyTheme("shopScreen", run);
    renderStats(run, "shopStats");
    const shop = game.Progression.getShop(run);
    document.getElementById("shopStock").innerHTML = shop.stock.map((item) => {
      const details = shopItemDetails(item);
      const fullHealth = item.kind === "heal" && run.hp >= run.maxHp;
      const noCards = item.kind === "remove" && run.deck.length <= 1;
      const disabled = item.sold || run.gold < item.price || fullHealth || noCards;
      const status = item.sold ? "품절" : fullHealth ? "체력 가득 참" : noCards ? "제거 불가" : run.gold < item.price ? "골드 부족" : "구매";
      return `<article class="shop-item${item.sold ? " sold" : ""}">
        <div><span class="shop-kind">${details.kind}${details.icon ? ` · ${details.icon}` : ""}</span><h3>${details.name}</h3><p>${details.description}</p></div>
        <div><span class="shop-price"><i class="ui-icon icon-coin" aria-hidden="true"></i>${item.price} G</span><button class="button button-primary shop-buy" type="button" data-shop-id="${item.id}" ${disabled ? "disabled" : ""}>${status}</button></div>
      </article>`;
    }).join("");
    const removePanel = document.getElementById("removePanel");
    removePanel.hidden = !run.pendingRemoval;
    document.getElementById("confirmRemove").disabled = selectedDeckIndex === null;
    renderDeck(run);
  }

  function renderChoiceStats(run, targetId) {
    applyTheme(targetId, run);
    renderStats(run, targetId);
  }

  function renderEvent(run) {
    renderChoiceStats(run, "eventStats");
    const event = game.Progression.getEvent(run);
    if (!event) return;
    document.getElementById("eventTitle").textContent = event.title;
    document.getElementById("eventDescription").textContent = event.description;
    document.getElementById("eventShrineTitle").textContent = event.shrine;
    document.getElementById("eventBargainTitle").textContent = event.bargain;
    const foreignCard = game.Progression.getEventOffer(run);
    const foreignChoice = document.getElementById("eventBorrowCard");
    foreignChoice.hidden = !foreignCard;
    if (foreignCard) {
      document.getElementById("eventBorrowTitle").textContent = `${foreignCard.name} 획득`;
      document.getElementById("eventBorrowDescription").textContent = `${game.characters.find((character) => character.id === foreignCard.owner).name} 전용 · ${foreignCard.description}`;
    }
  }

  function renderChapterClear(run) {
    applyTheme("chapterScreen", run);
    const chapter = game.Progression.currentChapter(run);
    document.getElementById("chapterClearTitle").textContent = `${chapter.theme.name} 돌파`;
    document.getElementById("chapterClearText").textContent = `보스를 물리쳤습니다. 다음 여정에서도 ${run.gold}골드와 덱 ${run.deck.length}장, 유물 ${run.relics.length}개를 이어갑니다.`;
    renderStats(run, "chapterStats");
  }

  function renderEndStats(run, targetId) {
    const character = game.characters.find((entry) => entry.id === run.characterId);
    const relicNames = run.relics.map((id) => game.relics[id].name).join(", ") || "없음";
    document.getElementById(targetId).innerHTML = [
      ["주인공", character.name], ["클리어 챕터", `${run.chapters.filter((chapter) => chapter.cleared).length} / 3`],
      ["추가한 카드", `${run.totalCardsAdded}장`], ["획득 유물", `${run.totalRelicsFound || run.relics.length}개 · ${relicNames}`],
      ["처치한 적", `${run.totalEnemiesDefeated}명`], ["획득 골드", `${run.totalGoldEarned} G`]
    ].map(([label, value]) => `<div class="final-stat"><span>${label}</span><b>${value}</b></div>`).join("");
  }

  function renderRelicInventory(state) {
    const target = document.getElementById("battleRelics");
    target.innerHTML = (state.relics || []).map((id) => {
      const relic = game.relics[id];
      if (!relic) return "";
      return `<span class="relic-token rarity-${relic.rarity}" tabindex="0" title="${relic.name}: ${relic.description}" aria-label="${relic.rarity} 유물 ${relic.name}. ${relic.description}"><span>${relic.icon}</span></span>`;
    }).join("");
    target.hidden = target.childElementCount === 0;
  }

  function renderVictory(run) {
    applyTheme("victoryScreen", run);
    document.getElementById("victoryText").textContent = `${game.characters.find((entry) => entry.id === run.characterId).name}의 여정이 세 챕터의 운명을 모두 넘어섰습니다.`;
    renderEndStats(run, "finalStats");
  }

  function renderGameOver(run) {
    applyTheme("gameOverScreen", run);
    document.getElementById("gameOverText").textContent = `${game.characters.find((entry) => entry.id === run.characterId).name}의 여정이 ${run.chapterIndex + 1}챕터에서 끝났습니다.`;
    renderEndStats(run, "gameOverStats");
  }

  function show(screenId) {
    for (const screen of document.querySelectorAll(".screen")) screen.hidden = screen.id !== screenId;
    selectedDeckIndex = null;
    window.scrollTo(0, 0);
  }

  game.JourneyUI = {
    renderStats, renderMap, renderReward, renderShop, renderChoiceStats, renderEvent,
    renderChapterClear, renderVictory, renderGameOver, renderDeck, renderRelicInventory, show,
    get selectedDeckIndex() { return selectedDeckIndex; },
    set selectedDeckIndex(value) { selectedDeckIndex = value; }
  };
})();