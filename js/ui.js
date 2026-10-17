(() => {
  const game = window.Jojo;

  const hairShapes = {
    waves: [[5, 6], [3, 10], [2, 12], [2, 12], [3, 10]],
    swept: [[5, 6], [3, 10], [2, 12], [3, 10]],
    cap: [[3, 10], [2, 12], [2, 12], [3, 10]],
    pompadour: [[5, 6], [4, 8], [2, 12], [3, 10], [4, 8]],
    curls: [[5, 6], [3, 10], [4, 8], [2, 12], [3, 10]],
    braids: [[5, 6], [3, 10], [2, 12], [2, 12], [3, 10]],
    hat: [[3, 10], [2, 12], [2, 12], [3, 10]]
  };

  function drawSprite(canvas, character) {
    const context = canvas.getContext("2d");
    const size = 6;
    const color = character.palette;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;

    context.fillStyle = "#00000066";
    context.fillRect(3 * size, 14 * size, 10 * size, size);
    context.fillStyle = color.outline;
    context.fillRect(2 * size, 10 * size, 12 * size, 5 * size);
    context.fillRect(4 * size, 3 * size, 8 * size, 8 * size);
    context.fillStyle = color.coat;
    context.fillRect(3 * size, 11 * size, 10 * size, 3 * size);
    context.fillRect(4 * size, 9 * size, 8 * size, 3 * size);
    context.fillStyle = color.accent;
    context.fillRect(7 * size, 10 * size, 2 * size, 5 * size);
    context.fillRect(2 * size, 12 * size, 2 * size, 2 * size);
    context.fillStyle = color.skin;
    context.fillRect(5 * size, 5 * size, 6 * size, 5 * size);
    context.fillRect(4 * size, 6 * size, size, 3 * size);
    context.fillRect(11 * size, 6 * size, size, 3 * size);

    for (const [row, [start, width]] of hairShapes[character.hair].entries()) {
      context.fillStyle = color.hair;
      context.fillRect(start * size, row * size, width * size, size);
    }
    if (character.hair === "hat") {
      context.fillStyle = color.accent;
      context.fillRect(2 * size, 3 * size, 12 * size, size);
    }
    if (character.hair === "cap") {
      context.fillStyle = color.accent;
      context.fillRect(3 * size, 5 * size, 10 * size, size);
    }

    context.fillStyle = color.outline;
    context.fillRect(6 * size, 7 * size, size, size);
    context.fillRect(9 * size, 7 * size, size, size);
    context.fillRect(7 * size, 9 * size, 2 * size, size);
    context.fillStyle = color.accent;
    context.fillRect(7 * size, 11 * size, 2 * size, size);
  }

  function renderSelection(characters, profiles = { byCharacter: {} }) {
    const grid = document.getElementById("characterGrid");
    grid.innerHTML = characters.map((character) => {
      const exclusiveCards = character.startingDeck.filter((id) => game.cards[id].owner === character.id).map((id) => game.cards[id].name).join(" · ");
      const profile = profiles.byCharacter[character.id];
      const resumable = Boolean(profile?.run);
      return `
        <article class="character-card" role="listitem" aria-label="${character.name}, ${character.part}">
          <canvas class="portrait" width="96" height="96" data-sprite-id="${character.id}" aria-hidden="true"></canvas>
          <span class="character-part">${character.part}</span>
          <span class="character-name">${character.name}</span>
          <span class="character-description">${character.description}</span>
          <span class="character-deck"><i class="ui-icon icon-card" aria-hidden="true"></i>시작 10장 · ${exclusiveCards}</span>
          <span class="character-passive"><b>${character.passive.name}</b><br>${character.passive.description}</span>
          <span class="character-save">${resumable ? `저장된 여정 · ${profile.run.chapterIndex + 1}장 · ${profile.run.deck.length}장 덱 · 총 ${profile.statistics?.runs || 0}회 / 승리 ${profile.statistics?.victories || 0}회` : "저장된 여정 없음"}</span>
          <span class="character-card-actions">
            <button class="button button-primary" type="button" data-run-action="new" data-character-id="${character.id}">새 여정</button>
            <button class="button button-quiet" type="button" data-run-action="continue" data-character-id="${character.id}" ${resumable ? "" : "disabled"}>이어하기</button>
          </span>
        </article>`;
    }).join("");

    for (const character of characters) {
      const canvas = grid.querySelector(`[data-sprite-id="${character.id}"]`);
      drawSprite(canvas, character);
    }
  }

  function setHealth(bar, text, entity) {
    const percent = Math.max(0, (entity.hp / entity.maxHp) * 100);
    bar.style.width = `${percent}%`;
    text.textContent = `${entity.hp} / ${entity.maxHp}`;
  }

  function renderBattle(state) {
    const player = state.player;
    const enemy = state.enemy;
    const intent = game.Combat.getIntent(state);
    const theme = state.theme || { name: "팬텀 블러드", setting: "석가면의 방", className: "theme-phantom" };
    const battleScreen = document.getElementById("battleScreen");
    battleScreen.className = `screen battle-screen ${theme.className}`;
    document.getElementById("battleAct").textContent = `CHAPTER ${(state.chapterIndex || 0) + 1} · ${theme.name}`;
    document.getElementById("battleTitle").textContent = `${theme.name} 전투`;
    document.getElementById("battleLocation").textContent = theme.setting;
    document.getElementById("battleGold").innerHTML = `<i class="ui-icon icon-coin" aria-hidden="true"></i>${state.gold || 0} G`;
    game.JourneyUI.renderRelicInventory(state);
    document.getElementById("turnNumber").textContent = state.turn;
    document.getElementById("battleMessage").textContent = state.message;
    document.getElementById("playerName").textContent = state.character.name;
    document.getElementById("playerPart").textContent = state.character.part;
    document.getElementById("playerPassive").innerHTML = `${state.character.passive.name}${state.player.weakTurns > 0 ? ` <span class="status-token status-weaken" title="공격 피해 감소"><i class="ui-icon icon-status-weaken" aria-hidden="true"></i>약화 ${state.player.weakTurns}</span>` : ""}${state.player.skillLockTurns > 0 ? ` <span class="status-token status-weaken" title="기술 카드 사용 불가"><i class="ui-icon icon-status-weaken" aria-hidden="true"></i>기술 봉쇄</span>` : ""}`;
    document.getElementById("playerBlock").textContent = player.block;
    setHealth(document.getElementById("playerHealthBar"), document.getElementById("playerHealthText"), player);
    drawSprite(document.getElementById("playerSprite"), state.character);

    document.getElementById("enemyName").textContent = enemy.name;
    const enemyRank = state.encounterType === "boss" ? "" : state.encounterType === "elite" ? "정예 적 · " : "일반 적 · ";
    document.getElementById("enemyCaption").textContent = `${enemyRank}${enemy.caption}${enemy.special ? ` · 특성: ${enemy.special}` : ""}`;
    document.getElementById("enemyBlock").textContent = enemy.block;
    const intentIcon = { attack: "⚔", heavy: "‼", multi: "✹", drain: "♥", explode: "✹", defend: "▰", prepare: "⌛", weaken: "↓", buff: "↑", timeStop: "◷", regenerate: "✚", mark: "◎", dodge: "◇", seal: "⊘", counter: "↯" }[intent.type] || "◆";
    const totalDamage = ["attack", "heavy", "multi", "drain", "explode"].includes(intent.type) ? intent.amount * (intent.type === "multi" ? intent.hits : 1) : 0;
    const statusIntent = intent.type === "weaken" ? `플레이어 약화 ${intent.turns || 1}턴` : "";
    const intentExtra = totalDamage > 0 ? `${totalDamage} 피해${intent.type === "multi" ? ` · ${intent.hits}회` : ""}`
      : intent.type === "mark" ? (enemy.intents.some((entry) => entry.type === "explode") ? "표식 후 다음 턴 폭발" : "표식 후 다음 공격 피해 +3")
      : intent.type === "defend" ? `방어도 +${intent.amount}`
        : intent.type === "prepare" ? `다음 강타 +${intent.amount} 예고`
          : intent.type === "buff" ? `공격력 +${intent.amount}`
            : intent.type === "seal" ? "다음 플레이어 턴 기술 카드 사용 불가"
              : intent.type === "counter" ? "공격 카드가 명중하면 반격 피해"
                : statusIntent;
    document.getElementById("enemyIntent").innerHTML = `<span class="intent-icon" aria-hidden="true">${intentIcon}</span><span><b>다음 행동</b> · ${intent.label}<small>${intentExtra || enemy.special || "특수 행동"}</small></span>`;
    const enemyStatuses = [];
    if (enemy.weakTurns > 0) enemyStatuses.push(["status-weaken", "icon-status-weaken", `약화 ${enemy.weakTurns}`, "공격 피해 감소"]);
    if (enemy.marked) enemyStatuses.push(["status-mark", "icon-status-mark", "표식", "다음 공격에 표식 효과"]);
    if (enemy.dodgeNext) enemyStatuses.push(["status-dodge", "icon-status-dodge", "회피", "다음 공격 회피 준비"]);
    if (enemy.preparedAttack > 0) enemyStatuses.push(["status-prepare", "icon-status-prepare", `강타 +${enemy.preparedAttack}`, "다음 강타 피해 증가"]);
    if (enemy.damageBonus > 0) enemyStatuses.push(["status-buff", "icon-status-buff", `강화 +${enemy.damageBonus}`, "공격력 증가"]);
    document.getElementById("enemyStatus").innerHTML = enemyStatuses.map(([status, icon, label, title]) => `<span class="status-token ${status}" title="${title}"><i class="ui-icon ${icon}" aria-hidden="true"></i>${label}</span>`).join("");
    setHealth(document.getElementById("enemyHealthBar"), document.getElementById("enemyHealthText"), enemy);
    drawSprite(document.getElementById("enemySprite"), enemy);

    const energyPips = document.getElementById("energyPips");
    const pipCount = Math.max(player.maxEnergy, player.energy);
    energyPips.innerHTML = Array.from({ length: pipCount }, (_, index) => `<span class="energy-pip${index < player.energy ? " filled" : ""}"></span>`).join("");
    document.getElementById("energyText").textContent = `${player.energy} / ${player.maxEnergy}`;
    const drawRule = document.getElementById("drawRuleValue");
    const drawHelp = document.getElementById("drawRuleHelp");
    const baseDraw = state.lastDraw?.base ?? (state.turn <= 1 ? 5 : 3);
    const bonusDraw = state.lastDraw?.bonus || 0;
    drawRule.textContent = bonusDraw ? `${baseDraw}+${bonusDraw}` : String(baseDraw);
    drawHelp.textContent = `이번 턴: 기본 ${baseDraw}장${bonusDraw ? ` + 효과 ${bonusDraw}장 = 총 ${state.lastDraw.total}장` : ""}. 첫 턴 기본 5장, 이후 턴 기본 3장입니다. 턴 종료 시 손패 3장 초과분만 버립니다.`;
    const resourceLabels = { hamon: ["파문", "icon-hamon"], spin: ["회전", "icon-spin"], thread: ["실", "icon-thread"], life: ["생명", "icon-life"] };
    const resources = document.getElementById("characterResources");
    resources.innerHTML = Object.entries(player.resources || {}).filter(([, amount]) => amount > 0).map(([key, amount]) => {
      const [label, icon] = resourceLabels[key] || [key, "icon-resource"];
      return `<span class="resource-token" title="${label} 자원 ${amount}"><i class="ui-icon ${icon}" aria-hidden="true"></i>${label} <b>${amount}</b></span>`;
    }).join("");
    resources.hidden = resources.childElementCount === 0;
    const hand = document.getElementById("hand");
    if (state.hand.length === 0) {
      hand.innerHTML = `<div class="card empty">손패가 비었습니다.<br>턴을 종료하세요.</div>`;
    } else {
      hand.innerHTML = state.hand.map((cardId, index) => {
        const card = game.cards[cardId];
        const cost = game.Combat.getCardCost(state, card);
        const unavailable = !game.Combat.canPlayCard(state, card);
        const unavailableReason = card.type === "skill" && player.skillLockTurns > 0 ? "기술 카드 봉쇄 중" : "에너지 부족 또는 현재 사용 불가";
        return `<button class="card card-${card.type}" type="button" data-card-index="${index}" ${unavailable ? "disabled" : ""} title="${unavailable ? unavailableReason : ""}" aria-label="${card.name}, 비용 ${cost}, ${card.description}${unavailable ? `, ${unavailableReason}` : ""}">
          <span class="card-cost">${cost}</span>
          <span class="card-type">${card.label} · ${card.rarity}</span>
          <span class="card-symbol" aria-hidden="true">${card.symbol}</span>
          <span class="card-title">${card.name}</span>
          <span class="card-description">${card.description}</span>
        </button>`;
      }).join("");
    }

    const notice = document.getElementById("relicNotice");
    if (state.relicNotice) {
      notice.textContent = state.relicNotice;
      notice.hidden = false;
      window.clearTimeout(notice.hideTimer);
      notice.hideTimer = window.setTimeout(() => { notice.hidden = true; }, 2300);
      state.relicNotice = "";
    }
    document.getElementById("endTurn").disabled = Boolean(state.result);
    const overlay = document.getElementById("resultOverlay");
    overlay.hidden = !state.result;
    overlay.classList.toggle("defeat", state.result === "loss");
    if (state.result) {
      document.getElementById("resultEyebrow").textContent = state.result === "win" ? "BATTLE CLEAR" : "BATTLE OVER";
      document.getElementById("resultTitle").textContent = state.result === "win" ? "승리!" : "패배...";
      document.getElementById("resultText").textContent = state.result === "win"
        ? `${state.character.name}의 승리입니다. 다음 개발 단계에서 탐험을 이어갑니다.`
        : "체력을 회복하고 다시 도전하거나 다른 주인공을 선택하세요.";
    }
  }

  function showScreen(screen) {
    document.getElementById("titleScreen").hidden = screen !== "title";
    document.getElementById("battleScreen").hidden = screen !== "battle";
    window.scrollTo(0, 0);
  }

  game.UI = { renderSelection, renderBattle, showScreen };
})();