(() => {
  const game = window.Jojo;
  let currentRun = null;
  let currentBattle = null;
  let selectedCardId = null;
  let pendingDiscard = null;

  const layer = () => document.getElementById("panelLayer");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function open(type, run, battle) {
    currentRun = run;
    currentBattle = battle;
    selectedCardId = null;
    pendingDiscard = null;
    layer().hidden = false;
    document.body.classList.add("panel-open");
    render(type);
  }

  function close() {
    layer().hidden = true;
    document.body.classList.remove("panel-open");
    pendingDiscard = null;
  }

  function render(type) {
    const title = { cards: "카드 도감", enemies: "적 도감", deck: "덱 확인", relics: "유물 목록", discard: "턴 종료 카드 정리" }[type];
    const content = layer().querySelector(".panel-content");
    layer().setAttribute("aria-label", title);
    layer().querySelector(".panel-title").textContent = title;
    if (type === "cards") content.innerHTML = renderCardBook();
    else if (type === "enemies") content.innerHTML = renderEnemyBook();
    else if (type === "deck") content.innerHTML = renderDeck();
    else if (type === "relics") content.innerHTML = renderRelics();
    else if (type === "discard") content.innerHTML = renderDiscard();
  }

  function renderCardBook() {
    const query = layer().querySelector("#cardBookSearch")?.value || "";
    const owner = layer().querySelector("#cardBookOwner")?.value || "all";
    const kind = layer().querySelector("#cardBookType")?.value || "all";
    const cards = Object.values(game.cards).filter((card) => !card.upgraded &&
      (owner === "all" || (owner === "shared" ? card.owner === "shared" : card.owner === "shared" || card.owner === owner)) &&
      (kind === "all" || card.type === kind) && `${card.name} ${card.description} ${card.label}`.toLocaleLowerCase("ko").includes(query.toLocaleLowerCase("ko")));
    const selected = selectedCardId && game.cards[selectedCardId];
    return `<div class="collection-filters">
      <label>검색 <input id="cardBookSearch" type="search" value="${escapeHtml(query)}" placeholder="카드 이름 또는 효과"></label>
      <label>소속 <select id="cardBookOwner"><option value="all">모든 캐릭터</option><option value="shared">공용 카드</option>${game.characters.map((character) => `<option value="${character.id}" ${owner === character.id ? "selected" : ""}>${character.name}</option>`).join("")}</select></label>
      <label>유형 <select id="cardBookType"><option value="all">전체</option><option value="attack" ${kind === "attack" ? "selected" : ""}>공격</option><option value="skill" ${kind === "skill" ? "selected" : ""}>스킬·방어</option></select></label>
    </div>
    <div class="collection-layout"><div class="collection-list">${cards.map((card) => `<button class="collection-row${selectedCardId === card.id ? " selected" : ""}" type="button" data-detail-card="${card.id}"><span class="collection-icon">${escapeHtml(card.icon)}</span><span><b>${escapeHtml(card.name)}</b><small>${escapeHtml(card.rarity)} · ${escapeHtml(card.label)} · 비용 ${card.cost}</small></span></button>`).join("") || "<p>조건에 맞는 카드가 없습니다.</p>"}</div>
    <aside class="collection-detail">${selected ? cardDetails(selected) : "<p>카드를 선택해 자세한 정보와 강화 전후 효과를 확인하세요.</p>"}</aside></div>`;
  }

  function cardDetails(card) {
    const base = card.baseId ? game.cards[card.baseId] : card;
    const upgraded = game.cards[`upgraded-${base.id}`];
    const owner = base.owner === "shared" ? "공용 카드" : game.characters.find((character) => character.id === base.owner)?.name || "미분류";
    const character = game.characters.find((entry) => entry.id === base.owner);
    const obtainability = !currentRun
      ? base.owner === "shared" ? "공용 카드 · 모든 여정에서 획득 가능" : `${character?.name || "해당 주인공"} 선택 시 획득 가능`
      : base.owner === "shared" || base.owner === currentRun.characterId ? "현재 주인공으로 획득 가능" : "현재 주인공 획득 불가";
    const ownedCount = currentRun ? currentRun.deck.filter((id) => id === base.id || game.cards[id]?.baseId === base.id).length : 0;
    return `<span class="collection-kicker">${escapeHtml(card.rarity)} · ${escapeHtml(card.type === "attack" ? "공격" : "스킬")} · ${escapeHtml(owner)}</span>
      <h3><span class="collection-icon">${escapeHtml(card.icon)}</span>${escapeHtml(card.name)}</h3>
      <p><b>비용 ${card.cost}</b> · ${escapeHtml(card.description)}</p>
      <p>현재 덱 보유: ${ownedCount}장 · ${escapeHtml(obtainability)}</p>
      ${upgraded ? `<div class="upgrade-compare"><h4>${card.upgraded ? "강화 효과 비교" : "강화 비교"}</h4><p><b>강화 전</b> · 비용 ${base.cost} · ${escapeHtml(base.description)}</p><p><b>강화 후</b> · 비용 ${upgraded.cost} · ${escapeHtml(upgraded.description)}</p></div>` : "<p>강화 데이터가 등록되지 않은 카드입니다.</p>"}`;
  }

  function discoveredEnemies() {
    const profiles = game.Save.getProfiles().byCharacter || {};
    return new Set(Object.values(profiles).flatMap((profile) => profile.discoveries?.enemies || profile.run?.discoveredEnemies || []));
  }

  function enemyStory(enemy) {
    const theme = game.themes[enemy.part];
    const chapterIndex = (theme.chapterRegulars || []).findIndex((ids, index) =>
      ids.includes(enemy.id) || theme.chapterElites?.[index]?.includes(enemy.id) || theme.chapterBosses?.[index] === enemy.id);
    if (chapterIndex < 0) return `${theme.name} · 관련 전투`;
    return `${theme.chapterSettings[chapterIndex]} · 제${chapterIndex + 1}장`;
  }

  function enemyStage(enemy) {
    const theme = game.themes[enemy.part];
    const chapterIndex = (theme.chapterRegulars || []).findIndex((ids, index) =>
      ids.includes(enemy.id) || theme.chapterElites?.[index]?.includes(enemy.id) || theme.chapterBosses?.[index] === enemy.id);
    return chapterIndex < 0 ? Number.MAX_SAFE_INTEGER : chapterIndex;
  }

  function enemyRank(enemy) {
    return enemy.rank || enemy.type;
  }

  function renderEnemyBook() {
    const query = layer().querySelector("#enemyBookSearch")?.value || "";
    const part = layer().querySelector("#enemyBookPart")?.value || "all";
    const rank = layer().querySelector("#enemyBookRank")?.value || "all";
    const discovered = discoveredEnemies();
    const enemies = Object.values(game.enemyBook).filter((enemy) => (part === "all" || Number(part) === enemy.part) &&
      (rank === "all" || rank === enemyRank(enemy)) && `${enemy.name} ${enemy.special} ${enemy.caption}`.toLocaleLowerCase("ko").includes(query.toLocaleLowerCase("ko")))
      .sort((left, right) => left.part - right.part || enemyStage(left) - enemyStage(right) ||
        ({ normal: 0, elite: 1, midboss: 2, finalBoss: 3 })[enemyRank(left)] - ({ normal: 0, elite: 1, midboss: 2, finalBoss: 3 })[enemyRank(right)] ||
        left.name.localeCompare(right.name, "ko"));
    const selected = selectedCardId && game.enemyBook[selectedCardId];
    return `<div class="collection-filters">
      <label>검색 <input id="enemyBookSearch" type="search" value="${escapeHtml(query)}" placeholder="적 이름 또는 능력"></label>
      <label>부 <select id="enemyBookPart"><option value="all">모든 부</option>${Object.entries(game.themes).map(([id, theme]) => `<option value="${id}" ${part === id ? "selected" : ""}>${theme.name}</option>`).join("")}</select></label>
      <label>등급 <select id="enemyBookRank"><option value="all">전체</option><option value="normal" ${rank === "normal" ? "selected" : ""}>일반</option><option value="elite" ${rank === "elite" ? "selected" : ""}>정예</option><option value="midboss" ${rank === "midboss" ? "selected" : ""}>중간 보스</option><option value="finalBoss" ${rank === "finalBoss" ? "selected" : ""}>최종 보스</option></select></label>
    </div><div class="collection-layout"><div class="collection-list">${enemies.map((enemy) => {
      const found = discovered.has(enemy.id);
      const category = enemyRank(enemy);
      const categoryLabel = category === "finalBoss" ? "최종 보스" : category === "midboss" ? "중간 보스" : category === "elite" ? "정예" : "일반";
      return `<button class="collection-row${selectedCardId === enemy.id ? " selected" : ""}${category === "finalBoss" || category === "midboss" ? " boss-row" : ""}" type="button" data-detail-enemy="${enemy.id}"><span class="collection-icon">${category === "finalBoss" || category === "midboss" ? "★" : category === "elite" ? "✦" : "⚔"}</span><span><b>${found ? escapeHtml(enemy.name) : "미발견 적"}</b><small>${categoryLabel} · 제${enemy.part}부 ${found ? "" : "· 잠김"}</small></span></button>`;
    }).join("") || "<p>조건에 맞는 적이 없습니다.</p>"}</div><aside class="collection-detail">${selected ? enemyDetails(selected, discovered.has(selected.id)) : "<p>적을 선택해 정보와 행동 패턴을 확인하세요.</p>"}</aside></div>`;
  }

  function enemyDetails(enemy, found) {
    const category = enemyRank(enemy);
    const rank = category === "finalBoss" ? "최종 보스" : category === "midboss" ? "중간 보스" : category === "elite" ? "정예 적" : "일반 적";
    if (!found) return `<span class="collection-kicker">기록 잠김 · ${escapeHtml(rank)}</span><h3>미발견 적</h3><p>이 적과 전투하면 도감의 상세 정보가 기록됩니다.</p><p>${escapeHtml(game.themes[enemy.part].name)} · ${escapeHtml(enemyStory(enemy))}</p>`;
    const pattern = enemy.intents.map((intent) => {
      const name = { attack: `공격 ${intent.amount}`, heavy: `강타 ${intent.amount}`, prepare: `강타 준비 +${intent.amount}`, defend: `방어도 +${intent.amount}`, multi: `연속 공격 ${intent.amount} × ${intent.hits}`, weaken: `플레이어 약화 ${intent.turns || 1}턴`, mark: enemy.intents.some((entry) => entry.type === "explode") ? "폭발 표식" : "표식 후 공격 강화", explode: `표식 폭발 ${intent.amount}`, drain: `흡혈 공격 ${intent.amount}`, buff: `공격 강화 +${intent.amount}`, dodge: "회피 준비", timeStop: "시간 정지", regenerate: `재생 ${intent.amount}`, seal: "다음 턴 기술 카드 봉쇄", counter: `공격 반격 ${intent.amount}` }[intent.type] || intent.type;
      return `<li>${escapeHtml(name)}</li>`;
    }).join("");
    return `<span class="collection-kicker">${escapeHtml(rank)} · ${escapeHtml(game.themes[enemy.part].name)}</span><h3>${escapeHtml(enemy.name)}</h3>
      <p>${escapeHtml(enemyStory(enemy))}</p><p><b>기본 체력 ${enemy.maxHp}</b> · ${escapeHtml(enemy.caption)}</p>
      <p><b>특수 능력</b> · ${escapeHtml(enemy.special || "기본 공격 패턴")}</p><b>주요 행동 주기</b><ul>${pattern}</ul>
      <p>공략: 의도를 확인하고 준비 동작이나 강한 공격에 맞춰 방어·약화를 사용하세요.</p>`;
  }

  function renderDeck() {
    const deck = currentRun?.deck || currentBattle?.drawPile || [];
    const counts = new Map();
    deck.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
    const entries = [...counts.entries()].sort((left, right) => game.cards[left[0]].name.localeCompare(game.cards[right[0]].name, "ko"));
    const zones = currentBattle ? [
      ["손패", currentBattle.hand], ["뽑기 더미", currentBattle.drawPile], ["버림 더미", currentBattle.discardPile], ["소멸", currentBattle.exhaustPile || []]
    ] : [];
    return `<p class="panel-summary">덱 전체 ${currentRun?.deck.length ?? deck.length}장${currentBattle ? ` · 전투 ${currentBattle.turn}턴` : ""}</p>
      ${zones.length ? `<div class="deck-zones">${zones.map(([name, ids]) => `<details><summary>${name} · ${ids.length}장</summary>${ids.map((id) => deckRow(id)).join("") || "<p>카드 없음</p>"}</details>`).join("")}</div>` : ""}
      <div class="deck-list">${entries.map(([id, count]) => `${deckRow(id, count)}`).join("")}</div>
      <aside class="collection-detail" id="deckCardDetail"><p>카드를 눌러 효과와 강화 여부를 확인하세요.</p></aside>`;
  }

  function deckRow(id, count = 1) {
    const card = game.cards[id];
    if (!card) return "";
    return `<button class="collection-row" type="button" data-detail-card="${id}"><span class="collection-icon">${escapeHtml(card.icon)}</span><span><b>${escapeHtml(card.name)}${card.upgraded ? " ★" : ""}</b><small>${escapeHtml(card.type === "attack" ? "공격" : "스킬")} · 비용 ${card.cost} · ${count}장</small></span></button>`;
  }

  function renderRelics() {
    const relicIds = currentRun?.relics || currentBattle?.relics || [];
    const counts = new Map();
    relicIds.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
    return `<p class="panel-summary">보유 유물 ${relicIds.length}개</p><div class="relic-list">${[...counts.entries()].map(([id, count]) => {
      const relic = game.relics[id];
      if (!relic) return "";
      const trigger = (Array.isArray(relic.effect) ? relic.effect : [relic.effect]).map((effect) => {
        const when = ({
          battleStart: "전투 시작 시", playerTurnStart: "매 턴 시작 시", cardPlayed: "카드 사용 시",
          attackDamage: "공격 피해 계산 시", playerDamaged: "피해를 받을 때", combatVictory: "전투 승리 시"
        })[effect.trigger] || effect.trigger;
        const filter = effect.cardLabel ? ` · ${effect.cardLabel} 카드` : effect.cardType === "skill" ? " · 스킬 카드" : effect.cardType === "attack" ? " · 공격 카드" : "";
        return `${when}${filter}${effect.oncePerTurn ? " · 턴당 1회" : ""}`;
      }).join(" · ");
      const turnUsed = (Array.isArray(relic.effect) ? relic.effect : [relic.effect]).some((effect) => effect.oncePerTurn && currentBattle?.relicTurnFlags?.[id]);
      const activeStatus = turnUsed ? "이번 턴 발동 완료" : currentBattle ? "전투 중 · 조건 충족 시 자동 발동" : "보유 중 · 전투 조건에서 발동";
      return `<article class="relic-detail rarity-${relic.rarity}"><span class="collection-icon">${escapeHtml(relic.icon)}</span><div><b>${escapeHtml(relic.name)}${count > 1 ? ` × ${count}` : ""}</b><small>${escapeHtml(trigger)}</small><p>${escapeHtml(relic.description)}</p><small>효과 상태: ${activeStatus} · ${relic.allowDuplicate ? `중첩 ${count}개` : "중복 불가"}</small></div></article>`;
    }).join("") || "<p>아직 보유한 유물이 없습니다.</p>"}</div>`;
  }

  function renderDiscard() {
    const needed = pendingDiscard?.needed || 0;
    return `<p class="panel-summary">손패 ${currentBattle.hand.length}장 · ${needed}장을 골라 버리세요. 남은 카드는 보존됩니다.</p>
      <div class="discard-cards">${currentBattle.hand.map((id, index) => {
        const card = game.cards[id];
        return `<button class="discard-card" type="button" data-discard-index="${index}" aria-pressed="false"><b>${escapeHtml(card.name)}</b><small>${escapeHtml(card.type === "attack" ? "공격" : "스킬")} · 비용 ${card.cost}</small><span>${escapeHtml(card.description)}</span></button>`;
      }).join("")}</div><div class="panel-actions"><span id="discardSelectionCount">0 / ${needed}장 선택</span><button class="button button-primary" id="confirmDiscard" type="button" disabled>버리고 턴 종료</button></div>`;
  }

  function openDiscard(battle, needed, onConfirm) {
    currentBattle = battle;
    pendingDiscard = { needed, onConfirm, selected: new Set() };
    layer().hidden = false;
    document.body.classList.add("panel-open");
    render("discard");
  }

  layer().addEventListener("click", (event) => {
    if (event.target === layer() || event.target.closest("[data-panel-close]")) return close();
    const cardButton = event.target.closest("[data-detail-card]");
    if (cardButton) {
      selectedCardId = cardButton.dataset.detailCard;
      if (layer().getAttribute("aria-label") === "카드 도감") render("cards");
      else {
        const card = game.cards[selectedCardId];
        const detail = layer().querySelector("#deckCardDetail");
        if (detail && card) detail.innerHTML = cardDetails(card);
        const row = cardButton.closest(".collection-row");
        layer().querySelectorAll(".collection-row.selected").forEach((entry) => entry.classList.remove("selected"));
        row?.classList.add("selected");
      }
      return;
    }
    const enemyButton = event.target.closest("[data-detail-enemy]");
    if (enemyButton) {
      selectedCardId = enemyButton.dataset.detailEnemy;
      render("enemies");
      return;
    }
    const discardButton = event.target.closest("[data-discard-index]");
    if (discardButton && pendingDiscard) {
      const index = Number(discardButton.dataset.discardIndex);
      if (pendingDiscard.selected.has(index)) pendingDiscard.selected.delete(index);
      else if (pendingDiscard.selected.size < pendingDiscard.needed) pendingDiscard.selected.add(index);
      discardButton.setAttribute("aria-pressed", String(pendingDiscard.selected.has(index)));
      discardButton.classList.toggle("selected", pendingDiscard.selected.has(index));
      const count = layer().querySelector("#discardSelectionCount");
      const confirm = layer().querySelector("#confirmDiscard");
      count.textContent = `${pendingDiscard.selected.size} / ${pendingDiscard.needed}장 선택`;
      confirm.disabled = pendingDiscard.selected.size !== pendingDiscard.needed;
      return;
    }
    if (event.target.closest("#confirmDiscard") && pendingDiscard?.selected.size === pendingDiscard.needed) {
      const { onConfirm, selected } = pendingDiscard;
      const indices = [...selected];
      close();
      onConfirm(indices);
    }
  });

  layer().addEventListener("input", (event) => {
    if (event.target.id === "cardBookSearch") {
      const value = event.target.value;
      render("cards");
      const input = layer().querySelector("#cardBookSearch");
      input.value = value;
      input.focus();
      input.setSelectionRange(value.length, value.length);
    } else if (event.target.id === "enemyBookSearch") {
      const value = event.target.value;
      render("enemies");
      const input = layer().querySelector("#enemyBookSearch");
      input.value = value;
      input.focus();
      input.setSelectionRange(value.length, value.length);
    }
  });
  layer().addEventListener("change", (event) => {
    if (event.target.id === "cardBookOwner" || event.target.id === "cardBookType") render("cards");
    if (event.target.id === "enemyBookPart" || event.target.id === "enemyBookRank") render("enemies");
  });
  document.getElementById("panelClose").addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !layer().hidden) close();
  });

  game.Panels = { open, openDiscard, close };
})();
