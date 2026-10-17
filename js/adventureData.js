(() => {
  const game = window.Jojo;
  const palette = (hair, skin, coat, accent) => ({ hair, skin, coat, accent, outline: "#17151d" });
  const makeEnemy = (id, name, part, type, maxHp, caption, hair, colors, intents, special = "") => ({
    id, name, part, type, maxHp, caption, hair,
    palette: palette(...colors),
    intents,
    special
  });

  game.chapterParts = {
    1: [1, 1, 1], 2: [2, 2, 2], 3: [3, 3, 3], 4: [4, 4, 4],
    5: [5, 5, 5], 6: [6, 6, 6], 7: [7, 7, 7]
  };
  game.themes = {
    1: { id: "phantom-blood", name: "팬텀 블러드", setting: "저택의 석가면", chapterSettings: ["윈드나이츠 로트의 밤", "기사와 괴물이 맞선 계곡", "죠스타 저택의 마지막 결전"], className: "theme-phantom", regulars: ["jack-ripper", "zombie-swordsman", "vampire-bat", "zombie-pitfighter", "executioner-zombie"], elites: ["doobie", "tarkus", "bruford"], chapterRegulars: [["jack-ripper", "zombie-swordsman", "vampire-bat"], ["zombie-pitfighter", "executioner-zombie", "jack-ripper"], ["zombie-swordsman", "vampire-bat", "executioner-zombie"]], chapterElites: [["doobie"], ["tarkus"], ["doobie", "tarkus"]], chapterBosses: ["bruford", "tarkus", "dio-part1"], bosses: ["dio-part1"] },
    2: { id: "battle-tendency", name: "전투조류", setting: "기둥 속 사내의 유적", chapterSettings: ["뉴욕과 석가면의 추적", "기둥 속 사내의 결전", "화산섬의 완전생물"], className: "theme-tendency", regulars: ["donovan", "wired-beck", "vampire-guard", "temple-scout", "stone-mask-thrall"], elites: ["straizo", "santana", "esidisi", "wamuu"], chapterRegulars: [["donovan", "vampire-guard", "temple-scout"], ["wired-beck", "stone-mask-thrall", "donovan"], ["vampire-guard", "temple-scout", "stone-mask-thrall"]], chapterElites: [["straizo"], ["santana", "esidisi"], ["wamuu", "esidisi"]], chapterBosses: ["santana", "wamuu", "kars"], bosses: ["kars"] },
    3: { id: "stardust-crusaders", name: "스타더스트 크루세이더즈", setting: "이집트의 어둠", chapterSettings: ["홍콩에서 인도까지의 추격", "파키스탄과 카이로의 사투", "이집트에서 맞선 시간의 제왕"], className: "theme-stardust", regulars: ["gray-fly", "fake-tennille", "rubber-soul", "zz-racer", "arabia-fats"], elites: ["hol-horse", "j-geil", "devo", "ndoul", "anubis", "vanilla-ice"], chapterRegulars: [["gray-fly", "fake-tennille", "rubber-soul"], ["zz-racer", "arabia-fats", "fake-tennille"], ["rubber-soul", "zz-racer", "arabia-fats"]], chapterElites: [["hol-horse", "j-geil"], ["devo", "ndoul", "anubis"], ["vanilla-ice"]], chapterBosses: ["ndoul", "vanilla-ice", "dio-part3"], bosses: ["dio-part3"] },
    4: { id: "diamond-is-unbreakable", name: "다이아몬드는 부서지지 않는다", setting: "모리오초의 골목", chapterSettings: ["모리오초의 스탠드 사건", "활과 화살, 그리고 연쇄 살인", "킬러 퀸과의 마지막 추적"], className: "theme-diamond", regulars: ["yukako", "hazamada", "tamami", "surface-doll", "harvest-swarm"], elites: ["akira", "red-hot-chili-pepper", "kira-elite"], chapterRegulars: [["hazamada", "tamami", "yukako"], ["surface-doll", "harvest-swarm", "hazamada"], ["tamami", "surface-doll", "harvest-swarm"]], chapterElites: [["yukako"], ["akira", "red-hot-chili-pepper"], ["kira-elite"]], chapterBosses: ["akira", "red-hot-chili-pepper", "kira-boss"], bosses: ["kira-boss"] },
    5: { id: "golden-wind", name: "황금의 바람", setting: "베네치아의 밤", chapterSettings: ["갱단의 시험과 로마행", "암살팀과의 열차 추격", "콜로세움에서 로마의 결전"], className: "theme-golden", regulars: ["sale", "zucchero", "squalo", "tiziano", "passione-guard"], elites: ["formaggio", "pesci", "ghiaccio", "prosciutto", "risotto", "carne"], chapterRegulars: [["sale", "zucchero", "squalo"], ["squalo", "tiziano", "sale"], ["zucchero", "squalo", "tiziano", "passione-guard"]], chapterElites: [["prosciutto", "formaggio"], ["pesci", "ghiaccio", "risotto"], ["risotto", "carne"]], chapterBosses: ["polpo", "risotto", "diavolo"], bosses: ["diavolo"] },
    6: { id: "stone-ocean", name: "스톤 오션", setting: "그린 돌핀 스트리트", chapterSettings: ["그린 돌핀 스트리트 교도소", "탈옥과 케이프 커내버럴", "천국을 향한 시간 가속"], className: "theme-stone", regulars: ["d-and-g", "guccio", "convict-lookout", "white-snake-disciple", "prison-brawler"], elites: ["sports-maxx", "rikiel", "miu-miu", "lang-rangler", "viviano-westwood", "pucci-elite"], chapterRegulars: [["d-and-g", "guccio", "convict-lookout", "prison-brawler"], ["white-snake-disciple", "d-and-g", "guccio"], ["guccio", "white-snake-disciple", "convict-lookout"]], chapterElites: [["miu-miu", "sports-maxx"], ["lang-rangler", "viviano-westwood", "rikiel"], ["pucci-elite"]], chapterBosses: ["johngalli-a", "rikiel", "pucci-boss"], bosses: ["pucci-boss"] },
    7: { id: "steel-ball-run", name: "스틸 볼 런", setting: "황야의 결승선", chapterSettings: ["대륙 횡단 레이스의 출발", "악천후 속의 추격과 결투", "성인의 유해를 건 최종 결전"], className: "theme-steel", regulars: ["soundman", "boom-boom-family", "pork-pie-hat-kid", "eleven-men", "oyecomova"], elites: ["blackmore", "ringo", "diego", "valentine-elite"], chapterRegulars: [["soundman", "boom-boom-family", "pork-pie-hat-kid"], ["eleven-men", "oyecomova", "boom-boom-family"], ["pork-pie-hat-kid", "eleven-men", "oyecomova"]], chapterElites: [["ringo"], ["diego", "blackmore"], ["valentine-elite"]], chapterBosses: ["ringo", "diego", "valentine-boss"], bosses: ["valentine-boss"] }
  };

  game.enemyBook = {
    bruford: makeEnemy("bruford", "브루포드", 1, "normal", 36, "검은 기사의 검이 길을 막는다.", "waves", ["#202331", "#d0a087", "#456276", "#a8c8bb"], [{ type: "attack", amount: 6 }, { type: "defend", amount: 5 }]),
    tarkus: makeEnemy("tarkus", "타커스", 1, "elite", 58, "거대한 도끼를 들어 올린다.", "swept", ["#34252d", "#bd8f79", "#783e4b", "#d6aa59"], [{ type: "prepare", amount: 13 }, { type: "heavy", amount: 8 }], "강타 준비 후 큰 피해"),
    "dio-part1": makeEnemy("dio-part1", "디오 브란도", 1, "boss", 82, "흡혈귀의 힘으로 상처를 되돌린다.", "swept", ["#a6a6af", "#c8a7a4", "#802f51", "#d95471"], [{ type: "drain", amount: 7, heal: 5 }, { type: "attack", amount: 10 }, { type: "heavy", amount: 13 }], "흡혈과 강한 일격"),
    straizo: makeEnemy("straizo", "스트레이초", 2, "normal", 40, "파문을 버린 흡혈귀가 달려든다.", "swept", ["#ddd5c6", "#d6a38a", "#776b7a", "#91d6d0"], [{ type: "attack", amount: 7 }, { type: "drain", amount: 5, heal: 3 }]),
    santana: makeEnemy("santana", "산타나", 2, "elite", 58, "기둥 속 사내의 몸이 벽을 타고 다가온다.", "swept", ["#9c7d56", "#c99e7a", "#675647", "#d4b76a"], [{ type: "prepare", amount: 12 }, { type: "heavy", amount: 8 }, { type: "drain", amount: 6, heal: 4 }], "벽 타기 기습과 흡혈 회복"),
    wamuu: makeEnemy("wamuu", "와무우", 2, "elite", 64, "바람의 흐름을 모아 전투를 준비한다.", "waves", ["#514237", "#d2a981", "#547a6b", "#e1c77a"], [{ type: "prepare", amount: 16 }, { type: "heavy", amount: 9 }, { type: "defend", amount: 7 }], "준비 후 폭풍 공격"),
    esidisi: makeEnemy("esidisi", "에시디시", 2, "elite", 60, "열기를 끌어올려 다음 공격을 강화한다.", "swept", ["#572f3b", "#d6a186", "#9c4552", "#ed9c63"], [{ type: "buff", amount: 3 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 9 }], "강화되는 연속 공격"),
    kars: makeEnemy("kars", "카즈", 2, "boss", 88, "완전생물의 힘이 점차 깨어난다.", "waves", ["#b6b0a3", "#e0b99d", "#624c72", "#e8d579"], [{ type: "attack", amount: 9 }, { type: "regenerate", amount: 7 }, { type: "buff", amount: 2 }, { type: "heavy", amount: 14 }], "재생과 단계별 공격 강화"),
    "hol-horse": makeEnemy("hol-horse", "홀 호스", 3, "normal", 43, "총구를 겨누며 연속 사격한다.", "hat", ["#bf9d68", "#d1a180", "#776445", "#d6bd72"], [{ type: "multi", amount: 4, hits: 2 }, { type: "attack", amount: 7 }]),
    ndoul: makeEnemy("ndoul", "은두르", 3, "elite", 62, "게브의 물줄기가 사각에서 휘감아 온다.", "swept", ["#40384b", "#c99e83", "#445a74", "#70c4cf"], [{ type: "mark", amount: 0 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 10 }], "물의 표식과 원거리 연속 공격"),
    "vanilla-ice": makeEnemy("vanilla-ice", "바닐라 아이스", 3, "elite", 68, "어둠 속으로 모습을 감춘다.", "swept", ["#302c42", "#c69891", "#424056", "#b88ac0"], [{ type: "defend", amount: 9 }, { type: "heavy", amount: 14 }, { type: "attack", amount: 10 }], "높은 방어와 기습"),
    "dio-part3": makeEnemy("dio-part3", "DIO", 3, "boss", 92, "시간을 멈추고 흡혈의 힘을 드러낸다.", "swept", ["#d3c69a", "#d8aa91", "#a4435a", "#f0d36d"], [{ type: "attack", amount: 10 }, { type: "timeStop", amount: 0 }, { type: "drain", amount: 9, heal: 6 }], "시간 정지로 다음 턴 에너지를 빼앗고 흡혈"),
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
    "valentine-boss": makeEnemy("valentine-boss", "퍼니 밸런타인", 7, "boss", 112, "D4C의 차원 이동으로 공격을 비껴낸다.", "swept", ["#d2a0a9", "#d9a88f", "#82617f", "#f0d878"], [{ type: "defend", amount: 12 }, { type: "dodge", amount: 0 }, { type: "multi", amount: 7, hits: 2 }, { type: "heavy", amount: 16 }], "D4C 회피와 연속 반격"),
    "jack-ripper": makeEnemy("jack-ripper", "잭 더 리퍼", 1, "normal", 34, "어둠 속에서 급습해 약점을 노린다.", "swept", ["#40343a", "#c99c84", "#56474e", "#b85e62"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 7 }], "약화 후 기습"),
    doobie: makeEnemy("doobie", "도비", 1, "elite", 52, "독기가 차오른 뒤 맹렬히 덮친다.", "waves", ["#31353d", "#a88b79", "#454a50", "#8cb58d"], [{ type: "defend", amount: 6 }, { type: "prepare", amount: 11 }, { type: "heavy", amount: 8 }], "방어 후 독기의 강타"),
    "donovan": makeEnemy("donovan", "도노반", 2, "normal", 38, "칼날을 숨기고 연속 공격을 노린다.", "swept", ["#40352f", "#c99e81", "#66503e", "#c8a45d"], [{ type: "defend", amount: 4 }, { type: "multi", amount: 4, hits: 2 }], "방어와 연속 공격"),
    "wired-beck": makeEnemy("wired-beck", "와이어드 벡", 2, "normal", 42, "덩굴 같은 머리카락으로 움직임을 방해한다.", "waves", ["#594538", "#c99b7e", "#6a4b3e", "#a5c278"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 9 }], "약화"),
    "j-geil": makeEnemy("j-geil", "J. 가일", 3, "normal", 40, "거울 속에서 표식을 남기고 공격한다.", "swept", ["#4d394c", "#c99b83", "#714d64", "#b67cad"], [{ type: "mark", amount: 0 }, { type: "explode", amount: 10 }], "표식 후 지연 공격"),
    anubis: makeEnemy("anubis", "아누비스신", 3, "elite", 60, "검이 전투를 읽으며 다음 공격을 회피한다.", "swept", ["#38333f", "#b89b88", "#665677", "#c1ae62"], [{ type: "dodge", amount: 0 }, { type: "multi", amount: 5, hits: 2 }, { type: "attack", amount: 9 }], "회피 후 연속 참격"),
    yukako: makeEnemy("yukako", "야마기시 유카코", 4, "normal", 43, "머리카락이 얽혀 공격을 약화한다.", "waves", ["#3b343e", "#d0a18c", "#695574", "#d2c06f"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 8 }], "약화와 속박"),
    rohan: makeEnemy("rohan", "키시베 로한", 4, "normal", 46, "헤븐즈 도어로 전투의 흐름을 바꾼다.", "swept", ["#e1d9c7", "#d6a78d", "#59747d", "#b7a5d0"], [{ type: "weaken", turns: 1 }, { type: "defend", amount: 7 }, { type: "attack", amount: 9 }], "약화와 방어"),
    "red-hot-chili-pepper": makeEnemy("red-hot-chili-pepper", "레드 핫 칠리 페퍼", 4, "elite", 64, "전류를 축적해 강력한 연속 공격을 한다.", "swept", ["#56424d", "#d2a18a", "#744b62", "#e1c45e"], [{ type: "buff", amount: 2 }, { type: "multi", amount: 6, hits: 2 }, { type: "defend", amount: 8 }], "전류 축적과 연속 공격"),
    formaggio: makeEnemy("formaggio", "포르마조", 5, "normal", 45, "작아지는 압박으로 공격을 흐트러뜨린다.", "swept", ["#625b58", "#d4a58d", "#76655b", "#d1c372"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 8 }], "약화"),
    ghiaccio: makeEnemy("ghiaccio", "기아초", 5, "normal", 49, "얼음 갑옷으로 공격을 막고 강타를 준비한다.", "swept", ["#c5e0de", "#d5a58d", "#607d8b", "#d4e6dd"], [{ type: "defend", amount: 7 }, { type: "prepare", amount: 12 }, { type: "heavy", amount: 8 }], "방어와 강타"),
    risotto: makeEnemy("risotto", "리조토 네로", 5, "elite", 70, "철분을 빼앗고 약화한 뒤 연속 공격한다.", "swept", ["#37343c", "#c99b84", "#55535e", "#bb7182"], [{ type: "weaken", turns: 1 }, { type: "multi", amount: 6, hits: 2 }, { type: "drain", amount: 8, heal: 4 }], "약화, 연타, 흡혈 회복"),
    "sports-maxx": makeEnemy("sports-maxx", "스포츠 맥스", 6, "normal", 48, "보이지 않는 기습 뒤 체력을 빼앗는다.", "swept", ["#393c47", "#c99d87", "#575a68", "#bc8b67"], [{ type: "dodge", amount: 0 }, { type: "drain", amount: 8, heal: 4 }], "회피와 흡혈"),
    "miu-miu": makeEnemy("miu-miu", "뮤뮤", 6, "elite", 68, "집중을 흐트러뜨리고 약화된 틈을 노린다.", "swept", ["#51445e", "#d0a28d", "#746185", "#d3bd70"], [{ type: "defend", amount: 8 }, { type: "weaken", turns: 1 }, { type: "multi", amount: 6, hits: 2 }], "방어와 약화, 연타"),
    ringo: makeEnemy("ringo", "링고 로드어게인", 7, "elite", 66, "시간을 되감듯 공격을 피하고 결투를 건다.", "hat", ["#4a4540", "#c99b82", "#6b594b", "#d4c477"], [{ type: "dodge", amount: 0 }, { type: "prepare", amount: 14 }, { type: "heavy", amount: 9 }], "회피 후 강한 결투 공격"),
    diego: makeEnemy("diego", "디에고 브란도", 7, "elite", 74, "공룡의 속도로 압박하고 강타를 준비한다.", "swept", ["#52644e", "#d1a184", "#687254", "#d3c773"], [{ type: "buff", amount: 2 }, { type: "multi", amount: 5, hits: 2 }, { type: "heavy", amount: 12 }], "강화되는 연속 공격"),
    soundman: makeEnemy("soundman", "샌드맨", 7, "normal", 48, "소리의 파동을 모아 날카롭게 공격한다.", "swept", ["#383a42", "#cf9c80", "#66525a", "#d3ba6b"], [{ type: "prepare", amount: 10 }, { type: "heavy", amount: 8 }], "준비 후 강타"),
    pocoloco: makeEnemy("pocoloco", "포코로코", 7, "normal", 42, "행운을 믿고 거침없이 연속 공격한다.", "swept", ["#c1a576", "#d2a287", "#56656d", "#d5c76e"], [{ type: "multi", amount: 4, hits: 2 }, { type: "defend", amount: 5 }], "연속 공격 후 방어"),
    polpo: makeEnemy("polpo", "폴포", 5, "elite", 72, "블랙 사바스가 어둠에서 덮치도록 방어를 굳힌다.", "swept", ["#33333b", "#c99b85", "#514b57", "#c9ae69"], [{ type: "defend", amount: 8 }, { type: "weaken", turns: 1 }, { type: "prepare", amount: 12 }, { type: "heavy", amount: 8 }], "방어, 약화, 준비 강타"),
    "johngalli-a": makeEnemy("johngalli-a", "존갈리 A", 6, "elite", 70, "화이트스네이크의 환각 속에서 저격을 준비한다.", "swept", ["#586478", "#c99e86", "#5b667c", "#d1bf75"], [{ type: "mark", amount: 0 }, { type: "prepare", amount: 11 }, { type: "heavy", amount: 8 }], "표식 후 저격 강타")
  };

  const ordinaryEnemies = [
    makeEnemy("zombie-swordsman", "시생인 검투사", 1, "normal", 29, "낡은 검을 휘두른 뒤 자세를 가다듬는다.", "swept", ["#292b37", "#b68c79", "#526071", "#ba8a52"], [{ type: "multi", amount: 4, hits: 2 }, { type: "defend", amount: 5 }], "약한 이연격 뒤 방어"),
    makeEnemy("vampire-bat", "흡혈 박쥐", 1, "normal", 24, "빠르게 파고들어 상처를 핥으며 회복한다.", "swept", ["#30263d", "#a77b78", "#55405f", "#bd5365"], [{ type: "multi", amount: 3, hits: 3 }, { type: "drain", amount: 5, heal: 3 }], "삼연속 공격과 소량 흡혈"),
    makeEnemy("zombie-pitfighter", "계곡의 시생인 투사", 1, "normal", 34, "무거운 주먹을 들어 올려 큰 일격을 예고한다.", "swept", ["#332b2d", "#c2977c", "#655051", "#d1a35b"], [{ type: "prepare", amount: 9 }, { type: "heavy", amount: 6 }], "강타를 미리 준비"),
    makeEnemy("executioner-zombie", "저택의 처형자", 1, "normal", 32, "도끼를 세워 공격을 받아낼 태세를 취한다.", "swept", ["#34343a", "#bb927d", "#53605d", "#ad645b"], [{ type: "defend", amount: 7 }, { type: "heavy", amount: 8 }, { type: "attack", amount: 5 }], "방어 후 강타"),
    makeEnemy("vampire-guard", "석가면의 흡혈귀 경비", 2, "normal", 31, "창으로 찌르고 틈을 타 생기를 빼앗는다.", "swept", ["#33283b", "#c3947b", "#5b4667", "#bb6670"], [{ type: "attack", amount: 6 }, { type: "drain", amount: 4, heal: 3 }], "공격과 흡혈"),
    makeEnemy("temple-scout", "유적의 감시자", 2, "normal", 28, "먼 거리에서 약점을 노린 뒤 파문을 방해한다.", "swept", ["#4b4239", "#c7a184", "#596a66", "#d1b469"], [{ type: "mark", amount: 0 }, { type: "weaken", turns: 1 }, { type: "attack", amount: 6 }], "표식과 약화"),
    makeEnemy("stone-mask-thrall", "석가면의 노예", 2, "normal", 35, "피격을 견디며 다음 공격을 거칠게 강화한다.", "swept", ["#39313b", "#bf9178", "#6a4b54", "#c39459"], [{ type: "defend", amount: 6 }, { type: "buff", amount: 2 }, { type: "attack", amount: 7 }], "방어 뒤 공격 강화"),
    makeEnemy("gray-fly", "그레이 플라이", 3, "normal", 27, "고속으로 날아들며 약한 연타를 퍼붓는다.", "swept", ["#727e65", "#c49c80", "#53695e", "#d0b565"], [{ type: "multi", amount: 3, hits: 3 }, { type: "defend", amount: 3 }], "빠른 삼연격"),
    makeEnemy("fake-tennille", "가짜 캡틴 테닐", 3, "normal", 35, "수중전의 우위를 이용해 호흡을 흐트러뜨린다.", "swept", ["#485d72", "#c99e84", "#536f7d", "#d2bd67"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 7 }, { type: "defend", amount: 4 }], "약화와 방어"),
    makeEnemy("rubber-soul", "러버 소울", 3, "normal", 37, "옐로 템퍼런스의 막을 두르고 공격을 준비한다.", "swept", ["#b7a84c", "#c99d82", "#796a37", "#e1cc59"], [{ type: "defend", amount: 8 }, { type: "prepare", amount: 8 }, { type: "heavy", amount: 5 }], "방어막 뒤 기습 강타"),
    makeEnemy("zz-racer", "ZZ", 3, "normal", 40, "탱크로 짓누르며 둔중한 공격을 준비한다.", "swept", ["#585e50", "#c49379", "#626d5c", "#d2b85e"], [{ type: "defend", amount: 6 }, { type: "prepare", amount: 10 }, { type: "heavy", amount: 7 }], "방어 후 전차 강타"),
    makeEnemy("arabia-fats", "아라비아 팟츠", 3, "normal", 34, "태양의 열기를 모아 공격을 강화한다.", "swept", ["#b4934e", "#bd9279", "#826a3e", "#f0cc57"], [{ type: "buff", amount: 2 }, { type: "attack", amount: 7 }, { type: "prepare", amount: 8 }], "공격 강화 후 열기 공격"),
    makeEnemy("hazamada", "하자마다", 4, "normal", 31, "인형의 공격으로 카드 사용을 봉쇄하려 든다.", "swept", ["#5b6175", "#d0a18a", "#54596c", "#d3b864"], [{ type: "seal", amount: 0 }, { type: "attack", amount: 6 }, { type: "defend", amount: 4 }], "다음 턴 기술 카드 봉쇄"),
    makeEnemy("tamami", "코바야시 타마미", 4, "normal", 30, "죄책감을 부추겨 다음 턴의 기력을 깎는다.", "swept", ["#8c785e", "#d2a58e", "#655b50", "#cdbb69"], [{ type: "weaken", turns: 1 }, { type: "attack", amount: 6 }, { type: "defend", amount: 5 }], "약화와 방어"),
    makeEnemy("surface-doll", "서피스 인형", 4, "normal", 33, "동작을 흉내 내며 다음 공격을 준비한다.", "swept", ["#bba56e", "#c7a087", "#756449", "#d8c85e"], [{ type: "prepare", amount: 9 }, { type: "heavy", amount: 6 }, { type: "defend", amount: 4 }], "준비 후 모방 강타"),
    makeEnemy("harvest-swarm", "하베스트 무리", 4, "normal", 28, "작은 개체들이 쉬지 않고 달려들어 연타한다.", "swept", ["#9c9a63", "#c9a089", "#79764d", "#dfca61"], [{ type: "multi", amount: 3, hits: 3 }, { type: "multi", amount: 4, hits: 2 }], "끊임없는 다단 공격"),
    makeEnemy("sale", "살레", 5, "normal", 35, "크래프트 워크로 자세를 굳히고 반격을 노린다.", "swept", ["#717d65", "#d2a58d", "#63705b", "#d1bc64"], [{ type: "defend", amount: 6 }, { type: "counter", amount: 5 }, { type: "attack", amount: 7 }], "방어 뒤 공격에 반응하는 반격"),
    makeEnemy("zucchero", "즈케로", 5, "normal", 32, "작아진 몸으로 빈틈을 파고들어 약화시킨다.", "swept", ["#617a70", "#c99c84", "#526c61", "#d3c16a"], [{ type: "weaken", turns: 1 }, { type: "multi", amount: 4, hits: 2 }], "약화 뒤 연속 공격"),
    makeEnemy("squalo", "스쿠알로", 5, "normal", 38, "토킹 헤드의 방해로 전투의 흐름을 끊는다.", "swept", ["#657c75", "#d1a18a", "#4d6b66", "#d4c766"], [{ type: "seal", amount: 0 }, { type: "attack", amount: 8 }], "기술 카드 봉쇄 후 공격"),
    makeEnemy("tiziano", "티치아노", 5, "normal", 33, "말을 왜곡해 공격의 기세를 약화한다.", "swept", ["#6d8c81", "#d3a58d", "#536f69", "#d8c45e"], [{ type: "weaken", turns: 1 }, { type: "defend", amount: 5 }, { type: "attack", amount: 7 }], "약화와 방어"),
    makeEnemy("d-and-g", "D&G", 6, "normal", 34, "언더 월드의 함정을 꺼내 큰 공격을 준비한다.", "swept", ["#606579", "#c89b83", "#596073", "#c8bd6a"], [{ type: "prepare", amount: 10 }, { type: "heavy", amount: 7 }], "지면의 함정과 강타"),
    makeEnemy("guccio", "구초", 6, "normal", 29, "서바이버의 자극으로 공격을 거칠게 강화한다.", "swept", ["#756b7c", "#c99c84", "#655a71", "#d5c562"], [{ type: "buff", amount: 2 }, { type: "multi", amount: 4, hits: 2 }], "공격 강화 후 연속 공격"),
    makeEnemy("convict-lookout", "교도소 감시 죄수", 6, "normal", 31, "동료의 신호를 흉내 내며 방어를 굳힌다.", "swept", ["#4e5a64", "#c99b82", "#52606a", "#c8b966"], [{ type: "defend", amount: 7 }, { type: "attack", amount: 6 }, { type: "weaken", turns: 1 }], "방어와 약화"),
    makeEnemy("white-snake-disciple", "화이트스네이크의 추종자", 6, "normal", 36, "환각으로 기술 카드의 사용을 방해한다.", "swept", ["#d1c9b5", "#c79a83", "#68727d", "#d2c878"], [{ type: "seal", amount: 0 }, { type: "mark", amount: 0 }, { type: "attack", amount: 7 }], "기술 봉쇄와 표식"),
    makeEnemy("pork-pie-hat-kid", "포크 파이 햇 키드", 7, "normal", 33, "모래 속에서 나타나 카드를 약화시킬 기회를 노린다.", "swept", ["#a88c65", "#ce9f84", "#685847", "#d4c274"], [{ type: "mark", amount: 0 }, { type: "weaken", turns: 1 }, { type: "attack", amount: 7 }], "표식과 약화"),
    makeEnemy("boom-boom-family", "붐붐 일가", 7, "normal", 39, "가족의 집념으로 공격을 누적하고 상처를 회복한다.", "swept", ["#6f6653", "#c6977d", "#695d4e", "#c5a75e"], [{ type: "multi", amount: 3, hits: 2 }, { type: "regenerate", amount: 5 }, { type: "attack", amount: 7 }], "연타와 재생"),
    makeEnemy("eleven-men", "일레븐 맨", 7, "normal", 36, "분열된 사격을 퍼부은 뒤 강한 탄환을 준비한다.", "swept", ["#5d6670", "#c79b81", "#59636b", "#c8b85f"], [{ type: "multi", amount: 3, hits: 3 }, { type: "prepare", amount: 9 }, { type: "heavy", amount: 6 }], "연속 사격 후 준비 강타"),
    makeEnemy("oyecomova", "오에코모바", 7, "normal", 35, "폭탄 표식을 남기고 폭발을 노린다.", "swept", ["#685b50", "#c89d82", "#5d5149", "#d0c066"], [{ type: "mark", amount: 0 }, { type: "explode", amount: 10 }, { type: "defend", amount: 5 }], "지연 폭발과 방어"),
    makeEnemy("passione-guard", "파시오네의 경비", 5, "normal", 32, "총격으로 압박한 뒤 엄폐물을 이용해 방어한다.", "swept", ["#4f625b", "#c7977e", "#53665d", "#c6b760"], [{ type: "attack", amount: 6 }, { type: "defend", amount: 6 }, { type: "multi", amount: 3, hits: 2 }], "엄폐와 짧은 연사"),
    makeEnemy("prison-brawler", "교도소 난투 죄수", 6, "normal", 38, "거친 연타와 강타를 번갈아 쓰며 호흡을 몰아친다.", "swept", ["#555f67", "#c7977e", "#53616a", "#c6b760"], [{ type: "multi", amount: 4, hits: 2 }, { type: "prepare", amount: 9 }, { type: "heavy", amount: 6 }], "연타 뒤 예고 강타")
  ];
  const enemySilhouettes = ["waves", "swept", "cap", "pompadour", "curls", "braids", "hat"];
  ordinaryEnemies.forEach((enemy, index) => {
    enemy.hair = enemySilhouettes[index % enemySilhouettes.length];
    game.enemyBook[enemy.id] = enemy;
  });
  for (const theme of Object.values(game.themes)) {
    theme.regulars = [...new Set(theme.chapterRegulars.flat())];
    theme.elites = [...new Set(theme.chapterElites.flat())];
    theme.chapterBosses.slice(0, 2).forEach((enemyId) => {
      const enemy = game.enemyBook[enemyId];
      if (enemy) enemy.rank = "midboss";
    });
    const finalBoss = game.enemyBook[theme.chapterBosses[2]];
    if (finalBoss) finalBoss.rank = "finalBoss";
  }

  const bossPhases = {
    "dio-part1": { type: "drain", amount: 13, heal: 8 },
    kars: { type: "heavy", amount: 19 },
    "dio-part3": { type: "heavy", amount: 20 },
    "kira-boss": { type: "explode", amount: 18 },
    diavolo: { type: "multi", amount: 7, hits: 3 },
    "pucci-boss": { type: "timeStop", amount: 0 },
    "valentine-boss": { type: "heavy", amount: 20 }
  };
  for (const [enemyId, intent] of Object.entries(bossPhases)) game.enemyBook[enemyId].phaseIntent = intent;

  game.relics = {
    "energy-core": { id: "energy-core", name: "별의 핵", description: "게임 창작 유물. 전투 첫 턴 에너지 +1.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "common", price: 125, icon: "✦", effect: { trigger: "battleStart", type: "energy", amount: 1 } },
    "ripple-charm": { id: "ripple-charm", name: "파문 부적", description: "파문 모티프를 활용한 게임 창작 유물. 매 턴 시작 시 체력 2 회복.", origin: "게임 창작 · 파문 모티프", parts: [1, 2], rarity: "common", price: 110, icon: "☼", effect: { trigger: "playerTurnStart", type: "heal", amount: 2 } },
    "thread-charm": { id: "thread-charm", name: "실의 매듭", description: "스탠드 모티프를 활용한 게임 창작 유물. 매 턴 시작 시 방어도 2 획득.", origin: "게임 창작 · 스탠드 모티프", parts: [3, 4, 5, 6], rarity: "common", price: 115, icon: "⌘", effect: { trigger: "playerTurnStart", type: "block", amount: 2 } },
    "victory-flower": { id: "victory-flower", name: "승리의 꽃", description: "게임 창작 유물. 전투 승리 후 체력 4 회복.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "common", price: 100, icon: "❋", effect: { trigger: "combatVictory", type: "heal", amount: 4 } },
    "stone-mask": { id: "stone-mask", name: "석가면", description: "원작 소재: 석가면. 게임 효과: 전투 시작 시 체력 5 회복.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [1, 2], rarity: "common", price: 120, icon: "◉", effect: { trigger: "battleStart", type: "heal", amount: 5 } },
    "stand-disc": { id: "stand-disc", name: "스탠드 디스크", description: "원작 소재: 스탠드 디스크. 게임 효과: 전투 시작 시 카드 1장 추가로 뽑기.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [6], rarity: "common", price: 120, icon: "◉", effect: { trigger: "battleStart", type: "draw", amount: 1 } },
    "saint-fragment": { id: "saint-fragment", name: "성인의 유해 조각", description: "원작 소재: 성인의 유해. 게임 효과: 매 턴 시작 시 방어도 4 획득.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [7], rarity: "common", price: 120, icon: "✧", effect: { trigger: "playerTurnStart", type: "block", amount: 4 } },
    "elite-aegis": { id: "elite-aegis", name: "기둥의 수호석", description: "제2부 모티프의 게임 창작 유물. 매 턴 시작 시 방어도 5 획득.", origin: "게임 창작 · 기둥 속 사내 모티프", parts: [1, 2], rarity: "elite", icon: "▣", allowDuplicate: true, effect: { trigger: "playerTurnStart", type: "block", amount: 5 } },
    "elite-oracle": { id: "elite-oracle", name: "예지의 깃털", description: "게임 창작 유물. 전투 시작 시 카드 1장 추가로 뽑기.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "elite", icon: "⌖", allowDuplicate: true, effect: { trigger: "battleStart", type: "draw", amount: 1 } },
    "elite-riposte": { id: "elite-riposte", name: "반격의 인장", description: "게임 창작 유물. 턴마다 처음 피해를 받을 때 피해 5 감소 후 적에게 5 반격.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "elite", icon: "↯", allowDuplicate: true, effect: { trigger: "playerDamaged", type: "retaliate", amount: 5, oncePerTurn: true } },
    "elite-hamon": { id: "elite-hamon", name: "파문 건틀릿", description: "게임 창작 유물. 파문 카드의 피해가 3 증가.", origin: "게임 창작 · 파문 모티프", parts: [1, 2], rarity: "elite", icon: "ϟ", allowDuplicate: true, effect: { trigger: "attackDamage", type: "damageBonus", amount: 3, cardLabel: "파문" } },
    "aja-stone": { id: "aja-stone", name: "에이자의 적석", description: "원작 소재: 에이자의 적석. 게임 효과: 파문 카드 피해 +3.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [2], rarity: "elite", icon: "♦", allowDuplicate: true, effect: { trigger: "attackDamage", type: "damageBonus", amount: 3, cardLabel: "파문" } },
    "stand-arrow": { id: "stand-arrow", name: "스탠드 화살", description: "원작 소재: 스탠드 화살. 게임 효과: 턴마다 처음 사용한 기술 카드 뒤 카드 1장 뽑기.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [3, 4, 5, 6], rarity: "elite", icon: "➶", allowDuplicate: true, effect: { trigger: "cardPlayed", type: "draw", amount: 1, cardType: "skill", oncePerTurn: true } },
    "race-spur": { id: "race-spur", name: "질주의 박차", description: "말과 레이스 모티프의 게임 창작 유물. 공격 카드 피해 +2.", origin: "게임 창작 · 스틸 볼 런 모티프", parts: [7], rarity: "elite", icon: "✦", allowDuplicate: true, effect: { trigger: "attackDamage", type: "damageBonus", amount: 2, cardType: "attack" } },
    "boss-time-crown": { id: "boss-time-crown", name: "정지한 시계의 왕관", description: "시간 능력 모티프의 보스 유물. 전투 시작 시 에너지 +2, 카드 1장 추가로 뽑기.", origin: "게임 창작 · 시간 능력 모티프", parts: [3, 5, 6], rarity: "boss", icon: "◷", effect: [{ trigger: "battleStart", type: "energy", amount: 2 }, { trigger: "battleStart", type: "draw", amount: 1 }] },
    "boss-saint-heart": { id: "boss-saint-heart", name: "성인의 심장", description: "원작 소재: 성인의 유해. 게임 효과: 매 턴 시작 시 체력 3, 방어도 4 획득.", origin: "원작 소재 · 효과는 게임 밸런스용 창작", parts: [7], rarity: "boss", icon: "♥", effect: [{ trigger: "playerTurnStart", type: "heal", amount: 3 }, { trigger: "playerTurnStart", type: "block", amount: 4 }] },
    "boss-infinite-spin": { id: "boss-infinite-spin", name: "무한 회전의 유산", description: "황금 회전 모티프의 보스 유물. 공격 피해 +4, 전투 첫 턴 에너지 +1.", origin: "게임 창작 · 황금 회전 모티프", parts: [7], rarity: "boss", icon: "◎", effect: [{ trigger: "attackDamage", type: "damageBonus", amount: 4 }, { trigger: "battleStart", type: "energy", amount: 1 }] },
    "boss-oath": { id: "boss-oath", name: "혈통의 맹세", description: "게임 창작 보스 유물. 매 턴 시작 시 방어도 6 획득.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "boss", icon: "✧", effect: { trigger: "playerTurnStart", type: "block", amount: 6 } },
    "boss-last-stand": { id: "boss-last-stand", name: "운명에 맞선 의지", description: "게임 창작 보스 유물. 전투 시작 시 체력 8 회복, 카드 1장 추가로 뽑기.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "boss", icon: "★", effect: [{ trigger: "battleStart", type: "heal", amount: 8 }, { trigger: "battleStart", type: "draw", amount: 1 }] },
    "boss-bloodline": { id: "boss-bloodline", name: "별의 혈통", description: "게임 창작 보스 유물. 공격 카드 피해 +3, 전투 첫 턴 에너지 +1.", origin: "게임 창작", parts: [1, 2, 3, 4, 5, 6, 7], rarity: "boss", icon: "✦", effect: [{ trigger: "attackDamage", type: "damageBonus", amount: 3 }, { trigger: "battleStart", type: "energy", amount: 1 }] }
  };

  const basicEventOptions = [
    { id: "shrine", label: "숨을 고른다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } },
    { id: "bargain", label: "표식을 거래한다", description: "체력 6을 잃고 골드 30 획득", effect: { type: "bloodGold", health: 6, gold: 30 } }
  ];
  game.eventBook = [
    { id: "old-shrine", title: "낡은 제단", description: "희미한 파문이 돌 틈에서 맥동합니다. 힘을 얻을 수도, 값을 치를 수도 있습니다.", parts: [1, 2], options: basicEventOptions },
    { id: "strange-clock", title: "멈춘 시계", description: "시곗바늘이 거꾸로 움직이며 두 갈래 길을 가리킵니다.", parts: [3, 4, 5, 6], options: [
      { id: "upgrade", label: "시간의 틈에 카드를 단련한다", description: "강화 가능한 카드 한 장을 무작위로 무료 강화", effect: { type: "upgrade" } },
      { id: "gamble", label: "잃어버린 시간을 건다", description: "절반의 확률로 골드 45, 실패하면 체력 8 손실", effect: { type: "gamble", chance: 0.5, gold: 45, health: 8 } }
    ] },
    { id: "lost-traveler", title: "길 잃은 여행자", description: "상처 입은 여행자가 낡은 물건을 내밀며 도움을 청합니다.", options: [
      { id: "heal", label: "여행자의 응급약을 나눈다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } },
      { id: "card", label: "전투 기록을 받아든다", description: "현재 주인공 테마 카드 한 장 획득", effect: { type: "card" } }
    ] },
    { id: "crossroads-rift", title: "차원의 균열", description: "다른 혈통의 전투 기억이 한 장의 카드로 모습을 드러냅니다.", allowForeignCard: true, options: [
      { id: "foreign-card", label: "다른 혈통의 기억을 받아들인다", description: "무작위 다른 주인공 전용 카드 획득 (특별 교차 이벤트)", effect: { type: "foreignCard" } },
      { id: "heal", label: "균열에서 물러나 숨을 고른다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } }
    ] },
    { id: "windknights-rescue", title: "윈드나이츠 로트의 구조자", description: "마을 사람들이 상처를 치료해 주지만, 귀중한 장비를 내놓아야 합니다.", parts: [1], options: [
      { id: "heal", label: "치료를 받는다", description: "체력 16 회복", effect: { type: "heal", amount: 16 } },
      { id: "pay", label: "장비를 건넨다", description: "골드 20을 내고 체력 8 회복", effect: { type: "payHeal", gold: 20, heal: 8 } }
    ] },
    { id: "roman-market", title: "로마의 골동품 상인", description: "석가면의 흔적을 쫓던 상인이 유물 조각과 전투 기록을 내밉니다.", parts: [2], options: [
      { id: "relic", label: "유물 조각을 교환한다", description: "골드 25를 내고 해당 부의 유물 획득", effect: { type: "relic", cost: 25 } },
      { id: "card", label: "파문 전투 기록을 받는다", description: "현재 주인공 테마 카드 한 장 획득", effect: { type: "card" } },
      { id: "gold", label: "남은 보급품을 판다", description: "골드 18 획득", effect: { type: "gold", amount: 18 } }
    ] },
    { id: "cairo-fortune", title: "카이로의 점술가", description: "점술가는 다가올 적의 약점을 보여 주거나 행운을 시험하라고 권합니다.", parts: [3], options: [
      { id: "heal", label: "안전한 길을 택한다", description: "체력 10 회복", effect: { type: "heal", amount: 10 } },
      { id: "gamble", label: "운명을 시험한다", description: "절반의 확률로 골드 50, 실패하면 체력 9 손실", effect: { type: "gamble", chance: 0.5, gold: 50, health: 9 } }
    ] },
    { id: "morioh-manga", title: "모리오초의 만화 원고", description: "기묘한 원고의 빈칸에 손을 대자 전투의 기억이 새겨집니다.", parts: [4], options: [
      { id: "upgrade", label: "원고에 전투를 기록한다", description: "강화 가능한 카드 한 장을 무작위로 무료 강화", effect: { type: "upgrade" } },
      { id: "gold", label: "원고를 상인에게 넘긴다", description: "골드 35 획득", effect: { type: "gold", amount: 35 } }
    ] },
    { id: "venice-boatman", title: "베네치아의 뱃사공", description: "뱃사공은 안전한 수로와 위험한 지름길 중 하나를 안내합니다.", parts: [5], options: [
      { id: "heal", label: "안전한 수로로 간다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } },
      { id: "gamble", label: "지름길을 택한다", description: "절반의 확률로 골드 55, 실패하면 체력 10 손실", effect: { type: "gamble", chance: 0.5, gold: 55, health: 10 } }
    ] },
    { id: "prison-infirmary", title: "교도소 의무실", description: "의무실의 문이 잠겨 있습니다. 시간을 들여 치료를 받거나 약품을 가져갈 수 있습니다.", parts: [6], options: [
      { id: "heal", label: "응급 치료를 받는다", description: "체력 14 회복", effect: { type: "heal", amount: 14 } },
      { id: "gold", label: "약품 상자를 챙긴다", description: "골드 30 획득", effect: { type: "gold", amount: 30 } }
    ] },
    { id: "steel-ball-camp", title: "레이서들의 야영지", description: "황야의 야영지에서 회전 기술을 연마하거나 보급품을 얻을 수 있습니다.", parts: [7], options: [
      { id: "upgrade", label: "회전 훈련을 한다", description: "강화 가능한 카드 한 장을 무작위로 무료 강화", effect: { type: "upgrade" } },
      { id: "heal", label: "보급품을 나눈다", description: "체력 12 회복", effect: { type: "heal", amount: 12 } }
    ] },
    { id: "desert-supply", title: "사막의 보급 마차", description: "레이스 도중 만난 보급 마차에서 길을 정비하거나 다음 구간의 여비를 마련합니다.", parts: [7], options: [
      { id: "heal", label: "말과 함께 쉰다", description: "체력 10 회복", effect: { type: "heal", amount: 10 } },
      { id: "gold", label: "보급품을 나눈다", description: "골드 32 획득", effect: { type: "gold", amount: 32 } }
    ] }
  ];

  game.balance = {
    mapLayers: { min: 14, max: 18 },
    mapSpecials: { shops: 2, events: 4, rests: 2, elites: 4 },
    chapterBossHealthScale: [1.35, 1.5, 1.65],
    cardBenchmarks: { attackDamagePerEnergy: 6, blockPerEnergy: 5, healPerEnergy: 4, drawPerEnergy: 1, startingDeckSize: 10 },
    resourceCaps: { hamon: 3, spin: 4, thread: 3, life: 2 },
    rewardGold: { combat: [10, 20], elite: [20, 35], boss: [40, 60] },
    chapterGoldBonus: [0, 3, 6],
    cardReward: { count: 3, allowDuplicates: true, maxCopies: 5, characterExclusiveShare: 0.45, chapterRareBonus: [0, 0.03, 0.06], rarityWeights: { combat: [0.68, 0.25, 0.07], elite: [0.52, 0.34, 0.14], boss: [0.42, 0.36, 0.22] } },
    shopPrices: { common: 45, uncommon: 65, rare: 90, heal: 30, remove: 75 }
  };
})();