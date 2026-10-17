(() => {
  const game = window.Jojo = window.Jojo || {};

  game.characters = [
    {
      id: "jonathan", name: "죠나단 죠스타", originPart: 1, part: "제1부 · 팬텀 블러드",
      description: "파문 호흡으로 버티며 정직하고 강한 일격을 쌓습니다.",
      passive: { id: "ripple", name: "파문 호흡", description: "턴 시작 시 체력 2 회복." },
      maxHp: 76, signature: "ripple-palm", hair: "waves",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "ripple-palm", "ripple-breath", "sunlight-overdrive"],
      palette: { hair: "#43333c", skin: "#f2be91", coat: "#417f78", accent: "#e0bd5c", outline: "#181923" }
    },
    {
      id: "joseph", name: "죠셉 죠스타", originPart: 2, part: "제2부 · 전투조류",
      description: "상대의 공격을 읽고 약화시켜 흐름을 빼앗습니다.",
      passive: { id: "trick", name: "임기응변", description: "적의 공격 피해를 2 줄입니다." },
      maxHp: 72, signature: "tactical-feint", hair: "swept",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "tactical-feint", "trap-wire", "counter-shot"],
      palette: { hair: "#82613c", skin: "#edb68b", coat: "#95623e", accent: "#63b9bd", outline: "#181923" }
    },
    {
      id: "jotaro", name: "쿠죠 죠타로", originPart: 3, part: "제3부 · 스타더스트 크루세이더즈",
      description: "첫 턴의 여분 에너지로 강력한 카드를 먼저 밀어붙입니다.",
      passive: { id: "time", name: "시간 정지", description: "전투 첫 턴에 에너지 1 추가." },
      maxHp: 78, signature: "meteor-punch", hair: "cap",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "meteor-punch", "ora-rush", "time-stop"],
      palette: { hair: "#273140", skin: "#e6ae88", coat: "#344a68", accent: "#d9b34e", outline: "#181923" }
    },
    {
      id: "josuke", name: "히가시카타 죠스케", originPart: 4, part: "제4부 · 다이아몬드는 부서지지 않는다",
      description: "공격과 회복을 엮어 체력을 꾸준히 되찾습니다.",
      passive: { id: "repair", name: "치유의 손길", description: "카드를 사용할 때마다 체력 1 회복." },
      maxHp: 74, signature: "restorative-blow", hair: "pompadour",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "restorative-blow", "crazy-diamond-repair", "dora-rush"],
      palette: { hair: "#161922", skin: "#edbb96", coat: "#4d769c", accent: "#e5c356", outline: "#181923" }
    },
    {
      id: "giorno", name: "죠르노 죠바나", originPart: 5, part: "제5부 · 황금의 바람",
      description: "생명을 다루는 힘으로 전투를 끝내고 다시 일어섭니다.",
      passive: { id: "life", name: "황금의 생명", description: "적을 쓰러뜨리면 체력 6 회복." },
      maxHp: 70, signature: "life-spark", hair: "curls",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "life-spark", "golden-experience", "life-transfer"],
      palette: { hair: "#e8bd58", skin: "#efbd98", coat: "#76558e", accent: "#dfc34d", outline: "#181923" }
    },
    {
      id: "jolyne", name: "쿠죠 죠린", originPart: 6, part: "제6부 · 스톤 오션",
      description: "실을 엮은 방어로 적의 압박을 받아냅니다.",
      passive: { id: "thread", name: "실의 방어선", description: "방어 카드의 방어도 2 증가." },
      maxHp: 72, signature: "thread-snare", hair: "braids",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "thread-snare", "string-bind", "stone-free-rush"],
      palette: { hair: "#28796f", skin: "#efb897", coat: "#438e83", accent: "#db77a0", outline: "#181923" }
    },
    {
      id: "johnny", name: "죠니 죠스타", originPart: 7, part: "제7부 · 스틸 볼 런",
      description: "회전을 모아 매 턴 첫 공격을 빈틈없이 꽂습니다.",
      passive: { id: "spin", name: "회전의 집중", description: "매 턴 첫 공격 카드 비용 0." },
      maxHp: 68, signature: "spin-shot", hair: "hat",
      startingDeck: ["strike", "strike", "strike", "strike", "guard", "guard", "guard", "spin-shot", "steel-ball", "golden-rotation"],
      palette: { hair: "#4a789c", skin: "#efbd98", coat: "#4f8d9c", accent: "#d6c861", outline: "#181923" }
    }
  ];

  game.cards = {
    strike: {
      id: "strike", name: "기본 공격", type: "attack", label: "공격", cost: 1,
      symbol: "✦", rarity: "기본", description: "적에게 피해 6을 줍니다.",
      effects: [{ type: "damage", amount: 6 }]
    },
    guard: {
      id: "guard", name: "기본 방어", type: "skill", label: "방어", cost: 1,
      symbol: "▰", rarity: "기본", description: "이번 턴 방어도 5를 얻습니다.",
      effects: [{ type: "block", amount: 5 }]
    },
    "ripple-palm": {
      id: "ripple-palm", name: "파문 장타", type: "attack", label: "파문", cost: 1, owner: "jonathan",
      symbol: "☼", rarity: "전용", description: "피해 7. 체력을 2 회복합니다.",
      effects: [{ type: "damage", amount: 7 }, { type: "heal", amount: 2 }]
    },
    "tactical-feint": {
      id: "tactical-feint", name: "유인 작전", type: "attack", label: "전술", cost: 1, owner: "joseph",
      symbol: "↯", rarity: "전용", description: "피해 4. 적의 다음 공격을 약화합니다.",
      effects: [{ type: "damage", amount: 4 }, { type: "weaken", turns: 1 }]
    },
    "meteor-punch": {
      id: "meteor-punch", name: "유성의 주먹", type: "attack", label: "연타", cost: 2, owner: "jotaro",
      symbol: "✹", rarity: "전용", description: "적에게 피해 12를 줍니다.",
      effects: [{ type: "damage", amount: 12 }]
    },
    "restorative-blow": {
      id: "restorative-blow", name: "수복 타격", type: "attack", label: "수복", cost: 1, owner: "josuke",
      symbol: "✚", rarity: "전용", description: "피해 5. 체력을 4 회복합니다.",
      effects: [{ type: "damage", amount: 5 }, { type: "heal", amount: 4 }]
    },
    "life-spark": {
      id: "life-spark", name: "생명의 불씨", type: "attack", label: "창조", cost: 1, owner: "giorno",
      symbol: "❋", rarity: "전용", description: "피해 5. 카드 1장을 뽑습니다.",
      effects: [{ type: "damage", amount: 5 }, { type: "draw", amount: 1 }]
    },
    "thread-snare": {
      id: "thread-snare", name: "실의 올가미", type: "attack", label: "구속", cost: 1, owner: "jolyne",
      symbol: "⌘", rarity: "전용", description: "피해 4. 방어도 4를 얻습니다.",
      effects: [{ type: "damage", amount: 4 }, { type: "block", amount: 4 }]
    },
    "spin-shot": {
      id: "spin-shot", name: "회전 사격", type: "attack", label: "회전", cost: 1, owner: "johnny",
      symbol: "◎", rarity: "전용", description: "적에게 피해 8을 줍니다.",
      effects: [{ type: "damage", amount: 8 }]
    },
    "quick-jab": {
      id: "quick-jab", name: "빈틈 찌르기", type: "attack", label: "공격", cost: 0,
      symbol: "➤", rarity: "일반", description: "적에게 피해 4를 줍니다.",
      effects: [{ type: "damage", amount: 4 }]
    },
    "iron-wall": {
      id: "iron-wall", name: "철벽 태세", type: "skill", label: "방어", cost: 1,
      symbol: "▥", rarity: "일반", description: "방어도 8을 얻습니다.",
      effects: [{ type: "block", amount: 8 }]
    },
    "study-the-foe": {
      id: "study-the-foe", name: "적의 수를 읽다", type: "skill", label: "전술", cost: 1,
      symbol: "⌕", rarity: "일반", description: "방어도 4를 얻고 카드 1장을 뽑습니다.",
      effects: [{ type: "block", amount: 4 }, { type: "draw", amount: 1 }]
    },
    "hamon-surge": {
      id: "hamon-surge", name: "파문 연격", type: "attack", label: "연격", cost: 1,
      symbol: "ϟ", rarity: "고급", description: "피해 7. 적의 다음 공격을 약화합니다.",
      effects: [{ type: "damage", amount: 7 }, { type: "weaken", turns: 1 }]
    },
    "field-medic": {
      id: "field-medic", name: "전장의 응급처치", type: "skill", label: "회복", cost: 1,
      symbol: "✚", rarity: "고급", description: "체력 6과 방어도 3을 얻습니다.",
      effects: [{ type: "heal", amount: 6 }, { type: "block", amount: 3 }]
    },
    "life-seed": {
      id: "life-seed", name: "생명의 씨앗", type: "skill", label: "생명", cost: 1,
      symbol: "❋", rarity: "고급", description: "카드 1장을 뽑고 체력 3을 회복합니다.",
      effects: [{ type: "draw", amount: 1 }, { type: "heal", amount: 3 }]
    },
    "finishing-blow": {
      id: "finishing-blow", name: "결정타", type: "attack", label: "필살", cost: 2,
      symbol: "✹", rarity: "희귀", description: "적에게 피해 15를 줍니다.",
      effects: [{ type: "damage", amount: 15 }]
    },
    "spin-breaker": {
      id: "spin-breaker", name: "황금 회전", type: "attack", label: "필살", cost: 2,
      symbol: "◎", rarity: "희귀", description: "피해 10. 방어도 5를 얻습니다.",
      effects: [{ type: "damage", amount: 10 }, { type: "block", amount: 5 }]
    },
    "ripple-breath": {
      id: "ripple-breath", name: "파문 호흡", type: "skill", label: "파문", cost: 1, rarity: "전용", owner: "jonathan", symbol: "☼",
      description: "파문 2를 쌓고 방어도 3을 얻습니다.", effects: [{ type: "gainResource", resource: "hamon", amount: 2 }, { type: "block", amount: 3 }]
    },
    "sunlight-overdrive": {
      id: "sunlight-overdrive", name: "선라이트 옐로 오버드라이브", type: "attack", label: "파문", cost: 2, rarity: "전용", owner: "jonathan", symbol: "ϟ",
      description: "피해 8. 파문을 최대 3 소모해 각각 피해 4를 더합니다.", effects: [{ type: "damage", amount: 8, consumeResource: "hamon", consumeMax: 3, damagePerResource: 4 }]
    },
    "trap-wire": {
      id: "trap-wire", name: "허밋 퍼플 함정", type: "skill", label: "함정", cost: 1, rarity: "전용", owner: "joseph", symbol: "⌁",
      description: "방어도 4를 얻고, 다음 적 공격 뒤 반격 피해 6을 줍니다.", effects: [{ type: "block", amount: 4 }, { type: "armCounter", amount: 6 }]
    },
    "counter-shot": {
      id: "counter-shot", name: "예측 사격", type: "attack", label: "예측", cost: 1, rarity: "전용", owner: "joseph", symbol: "⌖",
      description: "적이 공격 의도라면 피해 9, 아니면 피해 5를 줍니다.", effects: [{ type: "intentDamage", attack: 9, other: 5 }]
    },
    "ora-rush": {
      id: "ora-rush", name: "오라오라 연타", type: "attack", label: "연타", cost: 2, rarity: "전용", owner: "jotaro", symbol: "✹",
      description: "적에게 피해 5를 세 번 줍니다.", effects: [{ type: "multiDamage", amount: 5, hits: 3 }]
    },
    "time-stop": {
      id: "time-stop", name: "시간 정지", type: "skill", label: "시간", cost: 2, rarity: "전용", owner: "jotaro", symbol: "◷",
      description: "전투당 한 번, 이번 턴 적의 행동을 멈춥니다.", effects: [{ type: "timeStop" }], oncePerBattle: true
    },
    "crazy-diamond-repair": {
      id: "crazy-diamond-repair", name: "크레이지 다이아몬드 수복", type: "skill", label: "수복", cost: 1, rarity: "전용", owner: "josuke", symbol: "✚",
      description: "체력 6과 방어도 5를 얻습니다.", effects: [{ type: "heal", amount: 6 }, { type: "block", amount: 5 }]
    },
    "dora-rush": {
      id: "dora-rush", name: "도라라라 러시", type: "attack", label: "연타", cost: 2, rarity: "전용", owner: "josuke", symbol: "✹",
      description: "피해 4를 세 번 줍니다. 실제 준 피해의 25%를 회복합니다.", effects: [{ type: "multiDamage", amount: 4, hits: 3, healPercent: 0.25 }]
    },
    "golden-experience": {
      id: "golden-experience", name: "골드 익스피리언스", type: "skill", label: "생명", cost: 1, rarity: "전용", owner: "giorno", symbol: "❋",
      description: "생명 1을 창조합니다. 매 턴 시작 시 방어도 3을 얻습니다.", effects: [{ type: "summonLife", amount: 1 }]
    },
    "life-transfer": {
      id: "life-transfer", name: "생명의 반동", type: "skill", label: "생명", cost: 1, rarity: "전용", owner: "giorno", symbol: "❋",
      description: "생명 1을 소모해 체력 7을 회복합니다.", effects: [{ type: "consumeLifeHeal", amount: 7 }]
    },
    "string-bind": {
      id: "string-bind", name: "스톤 프리 실 묶기", type: "skill", label: "실", cost: 1, rarity: "전용", owner: "jolyne", symbol: "⌘",
      description: "실 2를 만들고 방어도 3을 얻습니다.", effects: [{ type: "gainResource", resource: "thread", amount: 2 }, { type: "block", amount: 3 }]
    },
    "stone-free-rush": {
      id: "stone-free-rush", name: "스톤 프리 러시", type: "attack", label: "연타", cost: 2, rarity: "전용", owner: "jolyne", symbol: "✹",
      description: "피해 3을 세 번 줍니다. 실 1마다 피해가 2 증가합니다.", effects: [{ type: "multiDamage", amount: 3, hits: 3, consumeResource: "thread", consumeMax: 2, damagePerResource: 2 }]
    },
    "steel-ball": {
      id: "steel-ball", name: "강철 볼 회전", type: "skill", label: "회전", cost: 1, rarity: "전용", owner: "johnny", symbol: "◎",
      description: "회전 2를 축적하고 방어도 2를 얻습니다.", effects: [{ type: "gainResource", resource: "spin", amount: 2 }, { type: "block", amount: 2 }]
    },
    "golden-rotation": {
      id: "golden-rotation", name: "황금장방형 회전", type: "attack", label: "회전", cost: 2, rarity: "전용", owner: "johnny", symbol: "◎",
      description: "기본 피해 5. 회전을 최대 3 소모해 각각 피해 4를 더합니다.", effects: [{ type: "damage", amount: 5, consumeResource: "spin", consumeMax: 3, damagePerResource: 4 }]
    },
    "ripple-counter": {
      id: "ripple-counter", name: "파문 반격", type: "skill", label: "파문", cost: 1, rarity: "고급", owner: "jonathan", symbol: "ϟ",
      description: "방어도 5를 얻고 적을 1턴 약화합니다.", effects: [{ type: "block", amount: 5 }, { type: "weaken", turns: 1 }]
    },
    "overdrive-flurry": {
      id: "overdrive-flurry", name: "오버드라이브 연격", type: "attack", label: "파문", cost: 2, rarity: "고급", owner: "jonathan", symbol: "☼",
      description: "피해 5를 두 번 줍니다.", effects: [{ type: "multiDamage", amount: 5, hits: 2 }]
    },
    "clacker-volley": {
      id: "clacker-volley", name: "클래커 연사", type: "attack", label: "전술", cost: 1, rarity: "고급", owner: "joseph", symbol: "◉",
      description: "피해 4를 세 번 줍니다.", effects: [{ type: "multiDamage", amount: 4, hits: 3 }]
    },
    "battle-forecast": {
      id: "battle-forecast", name: "전투의 예감", type: "skill", label: "전술", cost: 1, rarity: "고급", owner: "joseph", symbol: "⌕",
      description: "방어도 4를 얻고 카드 2장을 뽑습니다.", effects: [{ type: "block", amount: 4 }, { type: "draw", amount: 2 }]
    },
    "star-finger": {
      id: "star-finger", name: "스타 핑거", type: "attack", label: "정밀", cost: 2, rarity: "고급", owner: "jotaro", symbol: "➤",
      description: "적에게 피해 11을 줍니다.", effects: [{ type: "damage", amount: 11 }]
    },
    "ora-counter": {
      id: "ora-counter", name: "오라 반격 자세", type: "skill", label: "반격", cost: 1, rarity: "고급", owner: "jotaro", symbol: "↯",
      description: "방어도 5를 얻고 다음 적 공격 뒤 반격 피해 7을 줍니다.", effects: [{ type: "block", amount: 5 }, { type: "armCounter", amount: 7 }]
    },
    "crazy-diamond-guard": {
      id: "crazy-diamond-guard", name: "크레이지 다이아몬드 수복벽", type: "skill", label: "수복", cost: 1, rarity: "고급", owner: "josuke", symbol: "✚",
      description: "방어도 6과 체력 3을 얻습니다.", effects: [{ type: "block", amount: 6 }, { type: "heal", amount: 3 }]
    },
    "dora-counter": {
      id: "dora-counter", name: "도라라라 대응타", type: "attack", label: "연타", cost: 1, rarity: "고급", owner: "josuke", symbol: "✹",
      description: "적의 공격 의도라면 피해 8, 다른 의도라면 피해 4를 줍니다.", effects: [{ type: "intentDamage", attack: 8, other: 4 }]
    },
    "golden-scorpion": {
      id: "golden-scorpion", name: "생명의 전갈", type: "attack", label: "생명", cost: 1, rarity: "고급", owner: "giorno", symbol: "❋",
      description: "적에게 피해 9를 줍니다.", effects: [{ type: "damage", amount: 9 }]
    },
    "life-vine": {
      id: "life-vine", name: "생명의 덩굴", type: "skill", label: "생명", cost: 1, rarity: "고급", owner: "giorno", symbol: "❋",
      description: "체력 4를 회복하고 생명 1을 창조합니다.", effects: [{ type: "heal", amount: 4 }, { type: "summonLife", amount: 1 }]
    },
    "thread-wall": {
      id: "thread-wall", name: "실의 방벽", type: "skill", label: "실", cost: 1, rarity: "고급", owner: "jolyne", symbol: "⌘",
      description: "실 1을 만들고 방어도 7을 얻습니다.", effects: [{ type: "gainResource", resource: "thread", amount: 1 }, { type: "block", amount: 7 }]
    },
    "string-strike": {
      id: "string-strike", name: "실의 연속 타격", type: "attack", label: "연타", cost: 1, rarity: "고급", owner: "jolyne", symbol: "✹",
      description: "피해 4를 두 번 줍니다.", effects: [{ type: "multiDamage", amount: 4, hits: 2 }]
    },
    "rolling-shot": {
      id: "rolling-shot", name: "회전 강철탄", type: "attack", label: "회전", cost: 2, rarity: "고급", owner: "johnny", symbol: "◎",
      description: "적에게 피해 10을 줍니다.", effects: [{ type: "damage", amount: 10 }]
    },
    "spin-shield": {
      id: "spin-shield", name: "회전 방패", type: "skill", label: "회전", cost: 1, rarity: "고급", owner: "johnny", symbol: "◎",
      description: "회전 1을 축적하고 방어도 6을 얻습니다.", effects: [{ type: "gainResource", resource: "spin", amount: 1 }, { type: "block", amount: 6 }]
    }
  };

  for (const card of Object.values(game.cards)) {
    if (!card.owner) card.owner = "shared";
    if (!card.icon) card.icon = card.symbol;
    if (!card.effects.every((effect) => effect.type)) throw new Error(`Card effect missing type: ${card.id}`);
  }

  const cardUpgradeData = {
    strike: { 0: { amount: 3 } }, guard: { 0: { amount: 3 } },
    "ripple-palm": { 0: { amount: 2 }, 1: { amount: 1 } },
    "tactical-feint": { 0: { amount: 2 }, 1: { turns: 1 } },
    "meteor-punch": { 0: { amount: 3 } }, "restorative-blow": { 0: { amount: 2 }, 1: { amount: 2 } },
    "life-spark": { 0: { amount: 2 }, 1: { amount: 1 } }, "thread-snare": { 0: { amount: 2 }, 1: { amount: 1 } },
    "spin-shot": { 0: { amount: 2 } }, "quick-jab": { 0: { amount: 2 } },
    "iron-wall": { 0: { amount: 3 } }, "study-the-foe": { 0: { amount: 2 } },
    "hamon-surge": { 0: { amount: 2 }, 1: { turns: 1 } }, "field-medic": { 0: { amount: 3 }, 1: { amount: 2 } },
    "life-seed": { 0: { amount: 1 }, 1: { amount: 1 } }, "finishing-blow": { 0: { amount: 3 } },
    "spin-breaker": { 0: { amount: 2 }, 1: { amount: 2 } },
    "ripple-breath": { 0: { amount: 1 }, 1: { amount: 2 } },
    "sunlight-overdrive": { 0: { amount: 2, damagePerResource: 1 } },
    "trap-wire": { 0: { amount: 2 }, 1: { amount: 2 } },
    "counter-shot": { 0: { attack: 2, other: 2 } }, "ora-rush": { 0: { amount: 1 } },
    "time-stop": { cost: -1 }, "crazy-diamond-repair": { 0: { amount: 2 }, 1: { amount: 2 } },
    "dora-rush": { 0: { amount: 1, healPercent: 0.05 } },
    "golden-experience": { 0: { amount: 1 } }, "life-transfer": { 0: { amount: 2 } },
    "string-bind": { 0: { amount: 1 }, 1: { amount: 2 } },
    "stone-free-rush": { 0: { amount: 1, damagePerResource: 1 } },
    "steel-ball": { 0: { amount: 1 }, 1: { amount: 2 } },
    "golden-rotation": { 0: { amount: 2, damagePerResource: 1 } },
    "ripple-counter": { 0: { amount: 2 }, 1: { turns: 1 } },
    "overdrive-flurry": { 0: { amount: 1 } }, "clacker-volley": { 0: { amount: 1 } },
    "battle-forecast": { 0: { amount: 2 } }, "star-finger": { 0: { amount: 2 } },
    "ora-counter": { 0: { amount: 2 }, 1: { amount: 2 } },
    "crazy-diamond-guard": { 0: { amount: 2 }, 1: { amount: 2 } },
    "dora-counter": { 0: { attack: 2, other: 2 } }, "golden-scorpion": { 0: { amount: 2 } },
    "life-vine": { 0: { amount: 2 }, 1: { amount: 1 } },
    "thread-wall": { 0: { amount: 1 }, 1: { amount: 2 } },
    "string-strike": { 0: { amount: 1 } }, "rolling-shot": { 0: { amount: 2 } },
    "spin-shield": { 0: { amount: 1 }, 1: { amount: 2 } }
  };
  game.cardUpgradeData = cardUpgradeData;

  for (const card of [...Object.values(game.cards)]) {
    const definition = cardUpgradeData[card.id];
    if (!definition) continue;
    const improvements = [];
    const effectLabels = {
      damage: "피해", multiDamage: "타격당 피해", block: "방어도", heal: "회복", draw: "드로우",
      weaken: "약화 지속", gainResource: "자원 획득", armCounter: "반격 피해", summonLife: "생명",
      consumeLifeHeal: "회복", intentDamage: "조건부 피해"
    };
    const propertyLabels = { turns: "지속 턴", attack: "공격 의도 피해", other: "기타 의도 피해", damagePerResource: "자원당 피해", healPercent: "회복 비율" };
    const effects = card.effects.map((effect, index) => {
      const upgraded = { ...effect };
      for (const [property, increase] of Object.entries(definition[index] || {})) {
        upgraded[property] = (upgraded[property] || 0) + increase;
        const label = property === "amount" ? effectLabels[effect.type] || "효과 수치" : propertyLabels[property] || property;
        improvements.push(`${label} +${increase}`);
      }
      return upgraded;
    });
    const cost = Math.max(0, card.cost + (definition.cost || 0));
    if (definition.cost) improvements.push(`비용 ${definition.cost > 0 ? "+" : ""}${definition.cost}`);
    game.cards[`upgraded-${card.id}`] = {
      ...card,
      id: `upgraded-${card.id}`,
      baseId: card.id,
      name: `${card.name} 강화`,
      cost,
      description: `${card.description} 강화 효과: ${improvements.join(", ")}.`,
      effects,
      upgraded: true
    };
  }

  game.enemy = {
    name: "디오 브란도",
    caption: "석가면의 힘을 손에 넣으려는 적",
    maxHp: 54,
    palette: { hair: "#a6a6af", skin: "#c8a7a4", coat: "#802f51", accent: "#d95471", outline: "#17151d" },
    hair: "swept",
    intents: [
      { type: "attack", amount: 8 },
      { type: "defend", amount: 6 },
      { type: "attack", amount: 11 }
    ]
  };
})();