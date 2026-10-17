(() => {
  const game = window.Jojo;
  const palette = (hair, skin, coat, accent) => ({ hair, skin, coat, accent, outline: "#17151d" });
  const makeEnemy = (id, name, part, type, maxHp, caption, hair, colors, intents, special = "") => ({
    id, name, part, type, maxHp, caption, hair,
    palette: palette(...colors),
    intents,
    special
  });

  game.chapterParts = [[1, 2, 3], [4, 5], [6, 7]];
  game.themes = {
    1: { id: "phantom-blood", name: "팬텀 블러드", setting: "저택의 석가면", className: "theme-phantom", regulars: ["bruford"], elites: ["tarkus"], bosses: ["dio-part1"], chapterBosses: ["bruford", "tarkus", "dio-part1"] },
    2: { id: "battle-tendency", name: "전투조류", setting: "기둥 속 사내의 유적", className: "theme-tendency", regulars: ["straizo"], elites: ["wamuu", "esidisi"], bosses: ["kars"], chapterBosses: ["santana", "wamuu", "kars"] },
    3: { id: "stardust-crusaders", name: "스타더스트 크루세이더즈", setting: "이집트의 어둠", className: "theme-stardust", regulars: ["hol-horse"], elites: ["vanilla-ice"], bosses: ["dio-part3"], chapterBosses: ["ndoul", "vanilla-ice", "dio-part3"] },
    4: { id: "diamond-is-unbreakable", name: "다이아몬드는 부서지지 않는다", setting: "모리오초의 골목", className: "theme-diamond", regulars: ["akira"], elites: ["kira-elite"], bosses: ["kira-boss"], chapterBosses: ["akira", "kira-elite", "kira-boss"] },
    5: { id: "golden-wind", name: "황금의 바람", setting: "베네치아의 밤", className: "theme-golden", regulars: ["pesci"], elites: ["prosciutto"], bosses: ["diavolo"], chapterBosses: ["pesci", "prosciutto", "diavolo"] },
    6: { id: "stone-ocean", name: "스톤 오션", setting: "그린 돌핀 스트리트", className: "theme-stone", regulars: ["rikiel"], elites: ["pucci-elite"], bosses: ["pucci-boss"], chapterBosses: ["rikiel", "pucci-elite", "pucci-boss"] },
    7: { id: "steel-ball-run", name: "스틸 볼 런", setting: "황야의 결승선", className: "theme-steel", regulars: ["blackmore"], elites: ["valentine-elite"], bosses: ["valentine-boss"], chapterBosses: ["blackmore", "valentine-elite", "valentine-boss"] }
  };

  game.enemyBook = {
    bruford: makeEnemy("bruford", "브루포드", 1, "normal", 36, "검은 기사의 검이 길을 막는다.", "waves", ["#202331", "#d0a087", "#456276", "#a8c8bb"], [{ type: "attack", amount: 6 }, { type: "defend", amount: 5 }]),
    tarkus: makeEnemy("tarkus", "타커스", 1, "elite", 58, "거대한 도끼를 들어 올린다.", "swept", ["#34252d", "#bd8f79", "#783e4b", "#d6aa59"], [{ type: "prepare", amount: 13 }, { type: "heavy", amount: 8 }], "강타 준비 후 큰 피해"),
    "dio-part1": makeEnemy("dio-part1", "디오 브란도", 1, "boss", 82, "흡혈귀의 힘으로 상처를 되돌린다.", "swept", ["#a6a6af", "#c8a7a4", "#802f51", "#d95471"], [{ type: "drain", amount: 7, heal: 5 }, { type: "attack", amount: 10 }, { type: "heavy", amount: 13 }], "흡혈과 강한 일격"),
    straizo: makeEnemy("straizo", "스트레이초", 2, "normal", 40, "파문을 버린 흡혈귀가 달려든다.", "swept", ["#ddd5c6", "#d6a38a", "#776b7a", "#91d6d0"], [{ type: "attack", amount: 7 }, { type: "drain", amount: 5, heal: 3 }]),
    santana: makeEnemy("santana", "산타나", 2, "elite", 58, "기둥 속 사내의 몸이 벽을 타고 다가온다.", "swept", ["#9c7d56", "#c99e7a", "#675647", "#d4b76a"], [{ type: "prepare", amount: 12 }, { type: "heavy", amount: 8 }, { type: "drain", amount: 6, heal: 4 }], "벽 타기 기습과 흡혈 회복"),
    wamuu: makeEnemy("wamuu", "와무우", 2, "elite", 64, "바람의 흐름을 모아 전투를 준비한다.", "waves", ["#514237", "#d2a981", "#547a6b", "#e1c77a"], [{ type: "prepare", amount: 16 }, { type: "heavy", amount: 9 }, { type: "defend", amount: 7 }], "준비 후 폭풍 공격"),
    esidisi: makeEnemy("esidisi", "에시디시", 2, "elite", 60, "열기를 끌어올려 다음 공격을 강화한다.", "swept", ["#572f3b", "#d6a186", "#9c4552", "#ed9c63"], [{ type: "buff", amount: 3 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 9 }], "강화되는 연속 공격"),
    kars: makeEnemy("kars", "카즈", 2, "boss", 88, "완전생물의 힘이 점차 깨어난다.", "waves", ["#b6b0a3", "#e0b99d", "#624c72", "#e8d579"], [{ type: "attack", amount: 9 }, { type: "buff", amount: 2 }, { type: "heavy", amount: 14 }], "체력이 낮아지면 공격 강화"),
    "hol-horse": makeEnemy("hol-horse", "홀 호스", 3, "normal", 43, "총구를 겨누며 연속 사격한다.", "hat", ["#bf9d68", "#d1a180", "#776445", "#d6bd72"], [{ type: "multi", amount: 4, hits: 2 }, { type: "attack", amount: 7 }]),
    ndoul: makeEnemy("ndoul", "은두르", 3, "elite", 62, "게브의 물줄기가 사각에서 휘감아 온다.", "swept", ["#40384b", "#c99e83", "#445a74", "#70c4cf"], [{ type: "mark", amount: 0 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 10 }], "물의 표식과 원거리 연속 공격"),
    "vanilla-ice": makeEnemy("vanilla-ice", "바닐라 아이스", 3, "elite", 68, "어둠 속으로 모습을 감춘다.", "swept", ["#302c42", "#c69891", "#424056", "#b88ac0"], [{ type: "defend", amount: 9 }, { type: "heavy", amount: 14 }, { type: "attack", amount: 10 }], "높은 방어와 기습"),
    "dio-part3": makeEnemy("dio-part3", "DIO", 3, "boss", 92, "시간을 멈추고 흡혈의 힘을 드러낸다.", "swept", ["#d3c69a", "#d8aa91", "#a4435a", "#f0d36d"], [{ type: "attack", amount: 10 }, { type: "weaken", turns: 1 }, { type: "drain", amount: 9, heal: 6 }], "약화와 흡혈, 시간 정지의 압박"),
    akira: makeEnemy("akira", "오토이시 아키라", 4, "normal", 45, "전류를 모아 공격을 준비한다.", "swept", ["#392b42", "#d3a287", "#694765", "#d6bf62"], [{ type: "prepare", amount: 10 }, { type: "attack", amount: 7 }]),
    "kira-elite": makeEnemy("kira-elite", "키라 요시카게", 4, "elite", 68, "폭발 표식이 남았다. 다음 턴을 조심하라.", "swept", ["#e0d4bc", "#d7a88d", "#536477", "#c47e8d"], [{ type: "mark", amount: 0 }, { type: "explode", amount: 15 }, { type: "attack", amount: 9 }], "표식 후 지연 폭발"),
    "kira-boss": makeEnemy("kira-boss", "키라 요시카게", 4, "boss", 94, "시어 하트 어택이 표적을 추적한다.", "swept", ["#ded7c4", "#d7a88d", "#604a67", "#e38488"], [{ type: "mark", amount: 0 }, { type: "explode", amount: 19 }, { type: "defend", amount: 9 }, { type: "attack", amount: 12 }], "폭발 표식과 지연 피해"),
    pesci: makeEnemy("pesci", "페시", 5, "normal", 48, "낚싯줄이 손패의 흐름을 흔든다.", "swept", ["#54775a", "#ddb198", "#51785d", "#d8c75e"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 8 }]),
    prosciutto: makeEnemy("prosciutto", "프로슈토", 5, "elite", 72, "노화의 압박으로 공격을 둔화한다.", "swept", ["#d0c5aa", "#d7a68b", "#7b6855", "#d3bd72"], [{ type: "weaken", turns: 1 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 11 }], "약화와 연속 공격"),
    diavolo: makeEnemy("diavolo", "디아볼로", 5, "boss", 98, "시간의 일부를 지워 공격을 비껴간다.", "swept", ["#d78486", "#d2a188", "#804c60", "#d4d27a"], [{ type: "attack", amount: 11 }, { type: "dodge", amount: 0 }, { type: "heavy", amount: 16 }], "회피와 강한 반격"),
    rikiel: makeEnemy("rikiel", "리키엘", 6, "normal", 52, "스카이 하이의 공격이 체온을 빼앗는다.", "swept", ["#796ca0", "#d9aa92", "#645d83", "#c1aadc"], [{ type: "attack", amount: 8 }, { type: "weaken", turns: 1 }]),
    "pucci-elite": makeEnemy("pucci-elite", "엔리코 푸치", 6, "elite", 78, "가속하는 시간에 맞춰 공격이 빨라진다.", "swept", ["#d7d2bd", "#d6a98e", "#687c83", "#e4cf76"], [{ type: "buff", amount: 2 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 12 }], "턴이 지날수록 강해짐"),
    "pucci-boss": makeEnemy("pucci-boss", "엔리코 푸치", 6, "boss", 104, "천국에 도달하려는 의지가 전투를 가속한다.", "swept", ["#e3dcc8", "#d6a98e", "#697f8d", "#f0d97c"], [{ type: "buff", amount: 3 }, { type: "multi", amount: 6, hits: 2 }, { type: "heavy", amount: 16 }], "가속과 연속 공격"),
    blackmore: makeEnemy("blackmore", "블랙모어", 7, "normal", 58, "빗물 표식이 남았다. 폭우가 뒤따른다.", "swept", ["#2a3446", "#c9a28e", "#3d536b", "#86b4c4"], [{ type: "mark", amount: 0 }, { type: "explode", amount: 12 }, { type: "attack", amount: 8 }], "빗물 표식과 지연 공격"),
    "valentine-elite": makeEnemy("valentine-elite", "퍼니 밸런타인", 7, "elite", 82, "차원을 비틀어 다음 공격을 회피한다.", "swept", ["#b789a0", "#d5a58e", "#765d83", "#c6d071"], [{ type: "defend", amount: 10 }, { type: "dodge", amount: 0 }, { type: "attack", amount: 12 }], "방어 후 일시 회피"),
    "valentine-boss": makeEnemy("valentine-boss", "퍼니 밸런타인", 7, "boss", 112, "D4C의 차원 이동으로 공격을 비껴낸다.", "swept", ["#d2a0a9", "#d9a88f", "#82617f", "#f0d878"], [{ type: "defend", amount: 12 }, { type: "dodge", amount: 0 }, { type: "multi", amount: 7, hits: 2 }, { type: "heavy", amount: 16 }], "D4C 회피와 연속 반격")
  };

  game.relics = {
    "energy-core": { id: "energy-core", name: "별의 핵", description: "전투 첫 턴 에너지 +1.", rarity: "common", price: 125, icon: "✦", effect: { trigger: "battleStart", type: "energy", amount: 1 } },
    "ripple-charm": { id: "ripple-charm", name: "파문 부적", description: "매 턴 시작 시 체력 2 회복.", rarity: "common", price: 110, icon: "☼", effect: { trigger: "playerTurnStart", type: "heal", amount: 2 } },
    "thread-charm": { id: "thread-charm", name: "실의 매듭", description: "매 턴 시작 시 방어도 2 획득.", rarity: "common", price: 115, icon: "⌘", effect: { trigger: "playerTurnStart", type: "block", amount: 2 } },
    "victory-flower": { id: "victory-flower", name: "승리의 꽃", description: "전투 승리 후 체력 4 회복.", rarity: "common", price: 100, icon: "❋", effect: { trigger: "combatVictory", type: "heal", amount: 4 } },
    "elite-aegis": { id: "elite-aegis", name: "기둥의 수호석", description: "매 턴 시작 시 방어도 5를 얻습니다.", rarity: "elite", icon: "▣", allowDuplicate: true, effect: { trigger: "playerTurnStart", type: "block", amount: 5 } },
    "elite-oracle": { id: "elite-oracle", name: "예지의 깃털", description: "전투 시작 시 카드 1장을 더 뽑습니다.", rarity: "elite", icon: "⌖", allowDuplicate: true, effect: { trigger: "battleStart", type: "draw", amount: 1 } },
    "elite-riposte": { id: "elite-riposte", name: "반격의 인장", description: "턴마다 처음 피해를 받으면 적에게 5 반격합니다.", rarity: "elite", icon: "↯", allowDuplicate: true, effect: { trigger: "playerDamaged", type: "retaliate", amount: 5, oncePerTurn: true } },
    "elite-hamon": { id: "elite-hamon", name: "파문 건틀릿", description: "파문 계열 카드의 피해가 3 증가합니다.", rarity: "elite", icon: "ϟ", allowDuplicate: true, effect: { trigger: "attackDamage", type: "damageBonus", amount: 3, cardLabel: "파문" } },
    "boss-time-crown": { id: "boss-time-crown", name: "정지한 시계의 왕관", description: "전투 시작 시 에너지 +2, 카드 1장 추가로 뽑기.", rarity: "boss", icon: "◷", allowDuplicate: false, effect: [{ trigger: "battleStart", type: "energy", amount: 2 }, { trigger: "battleStart", type: "draw", amount: 1 }] },
    "boss-saint-heart": { id: "boss-saint-heart", name: "성인의 심장", description: "매 턴 시작 시 체력 3과 방어도 4를 얻습니다.", rarity: "boss", icon: "♥", allowDuplicate: false, effect: [{ trigger: "playerTurnStart", type: "heal", amount: 3 }, { trigger: "playerTurnStart", type: "block", amount: 4 }] },
    "boss-infinite-spin": { id: "boss-infinite-spin", name: "무한 회전의 유산", description: "공격 카드의 피해가 4 증가하고 전투 첫 턴 에너지 +1.", rarity: "boss", icon: "◎", allowDuplicate: false, effect: [{ trigger: "attackDamage", type: "damageBonus", amount: 4 }, { trigger: "battleStart", type: "energy", amount: 1 }] }
  };

  game.eventBook = [
    { id: "old-shrine", title: "낡은 제단", description: "희미한 파문이 돌 틈에서 맥동합니다. 힘을 얻을 수도, 값을 치를 수도 있습니다.", shrine: "파문에 손을 얹는다", bargain: "표식을 대가로 바꾼다" },
    { id: "strange-clock", title: "멈춘 시계", description: "시곗바늘이 거꾸로 움직이며 두 갈래 길을 가리킵니다.", shrine: "고요한 틈에서 쉰다", bargain: "시간을 깎아 골드를 얻는다" },
    { id: "lost-traveler", title: "길 잃은 여행자", description: "상처 입은 여행자가 낡은 물건을 내밀며 도움을 청합니다.", shrine: "여행자의 응급약을 나눈다", bargain: "물건을 받고 대가를 치른다" },
    { id: "crossroads-rift", title: "차원의 균열", description: "다른 혈통의 전투 기억이 한 장의 카드로 모습을 드러냅니다.", shrine: "기억의 파편을 받아들인다", bargain: "파편을 거절하고 몸을 회복한다", allowForeignCard: true }
  ];

  game.balance = {
    mapLayers: { min: 14, max: 18 },
    mapSpecials: { shops: 2, events: 3, rests: 2, elites: 4 },
    chapterBossHealthScale: [1.35, 1.5, 1.65],
    cardBenchmarks: { attackDamagePerEnergy: 6, blockPerEnergy: 5, healPerEnergy: 4, drawPerEnergy: 1, startingDeckSize: 10 },
    resourceCaps: { hamon: 3, spin: 4, thread: 3, life: 2 },
    rewardGold: { combat: [10, 20], elite: [20, 35], boss: [40, 60] },
    chapterGoldBonus: [0, 3, 6],
    cardReward: { count: 3, allowDuplicates: false, maxCopies: 5, characterExclusiveShare: 0.45, chapterRareBonus: [0, 0.03, 0.06], rarityWeights: { combat: [0.68, 0.25, 0.07], elite: [0.52, 0.34, 0.14], boss: [0.42, 0.36, 0.22] } },
    shopPrices: { common: 45, uncommon: 65, rare: 90, heal: 30, remove: 75 }
  };
})();