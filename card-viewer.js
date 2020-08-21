const CardViewer = {
    autoSearch: false,
    Database: {
        cards: null,
    },
    Filters: {
        Dictionary: null,
    },
    Search: {
        pageSize: 30,
        columnWidth: 2,
        pages: null,
        currentPage: null,
        processResults: null,
    },
    Elements: {},
    // methods
    submit: null,
    query: null,
    excludeTcg: true,
};

const CardsOfTheWeek = [
    1117429, //Battlewasp - Akiza the Berserker
    1175945, //ON SALE!!!
    1222148, //Called by the Spell Book
    1000049, //Little Tanker
    1411709, //Gradielle, Symphony of Harmony
    1069476, //Elon Musk 1
    // 1331629, //Elon Musk 2
    // 1482984, //Wingbeat Wyrm (Elon Musk 3)
    1311654, //Torrential Fusion
    1079215, //Grasp
    1298826, //Eye of the Shadows
    1333641, //Chained Down
    1061760, //Sacrificial Soul Reborn
    1393301, //Cosmic Vacuum
    1374705, //Bone Chimera
    1268592, //Max Evolution Pill
    1530819, //Destoroyah, the One True Devil
    1526913, //Spellbook of Forbidden Arts
    930975,  //Equip Equality
    1471876, //Flimsy Shot
    1537498, //Ghost Wind & Bright Mist
    1492408, //Ghost Wheel & Floating Lantern
    1510626, //Caltrops
    1409651, //Underwhelming Observations
    1473788, //Malformed Test Subject
    1558753, //Charismatic Priestess
];

const OTKTools = [
    1547701, //1,000 Sun Sword
    1000049, //Little Tanker
    956234,  //Zeredia, the Spellswordswoman
    1358152, //The Green Lion
    1372934, //Tanegashima
    1479910, //Swift Archer Lumis
    1061760, //Sacrificial Soul Reborn
    1129090, //Psykid
    1067731, //Piping Hot Pink Overheatin'
    1532800, //Modernote Icon - Waterflame
    1499399, //Modernote Freshbeat
    982826,  //Aerosmith
    472990,  //Akali, the Rhino
    1485923, //Cozmo Lord, The Ultimate Lifeform
    1089148, //Damia, Sage of Stone
    928560,  //Doom Emperor Dragon
    1533268, //Itayin Herald
    1479932, //Painted Soulseaker
    1025602, //Sword Savior Salizar
    1579988, //Dark Cynet Virus Draco
    1264227, //Libradurgon
    1551912, //Sinbad the Legend
];

const Searchers = [
    1318582, //Withering Cocoon
    1318359, //Petit Cocoon
];

const Removal = [
    1644436, //Solar Flare

]

const DrawCards = [
    // 1573678, //Aurellia Conversion
    // 159726,  //Consistency Potion
];

const HandTraps = [
    1481211, //Amorel Rachel
    1661909, //Child of the Forlorn Clouds
    1473788, //Malformed Test Subject
    1343784, //Mermaidol Maiden
    1585405, //Scripture Golem
    1704232, //Sojourned Alchemist
    1494123, //Clever Forte & West's Viola
    1357705, //D.D. Crane
    1537498, //Ghost Wind & Bright Mist
    1565554, //Two Tuners' Lampoon
    1671524, //Aromaseraphy Ginkgo
    1349617, //Faergon, Watcher of the Forest
    1372900, //Kazu Geiko
    1372884, //Kufu Geiko
    1372872, //Mitori Geiko
    1473822, //Sunvine Maiden
];

const CardGroups = {
    cotw: {
        name: "Cards of the Week",
        data: CardsOfTheWeek,
    },
    otk: {
        name: "OTK Tools",
        data: OTKTools,
    },
    handtraps: {
        name: "Handtraps",
        data: HandTraps,
    },
};
for(let [key, value] of Object.entries(CardGroups)) {
    value.id = key;
}

const RetrainMap = {
    1318550: 2694,      //Reynard Chemist -> Magical Scientist
    1319024: 549,       //Occult Lab -> Brain Research Lab
    1373133: 9074,      //Iseult -> Isolde
    1169172: 9501,      //TD Rider -> Colossus
    1326492: 9501,      //Twin Flash -> Colossus
    1576121: 9082,      //System Synchronizer -> Halqifibrax
    1318485: 3688,      //Ambush Lotus -> Samsara Lotus
    1591766: 10500,     //Union Conductor -> Union Carrier
    1377692: 9253,      //Armor Up! -> Multirole
    1372758: 9245,      //Launch! -> Engage!
    1319058: 589,       //Resurrected Blade of Elma -> Butterfly Dagger - Elma
    1319017: 4217,      //Telekinetic Rehabilitation -> Telekinetic Charging Cell
    1067872: 7308,      //Mirror Fusion -> Brilliant Fusion
    1318849: 4396,      //Power Seal -> Time Seal
    1318524: 3307,      //Hippeastrum -> Amaryllis
    1319245: 5167,      //Lavalval Chain
    1318580: 8509,      //Stellar Bunting -> Independent Nightingale
    1638076: 5684,      //Horror of the Depths -> Abyss Dweller
    1477949: 144,       //Ancient Sprite Dragon -> Ancient Fairy Dragon
    1477964: 8827,      //Eros, the Dead Drake of Dread -> Destrudo the Lost Dragon's Frisson
    1708820: 10958,     //Numeron Extraction -> Numeron Calling
    1743438: 5844,      //Spellbook of Silence -> Spellbook of Judgment
    1684963: 9501,      //The Thunder Dragon's Rider -> Thunder Dragon Colossus
    1649898: 9863,      //Ib, World Chalice's Reincarnation -> Ib the World Chalice Justiciar
};

const LINK_ARROWS = {
    [0b10000000]: "\u2196\uFE0F",
    [0b01000000]: "\u2B06\uFE0F",
    [0b00100000]: "\u2197\uFE0F",
    [0b00010000]: "\u27A1\uFE0F",
    [0b00001000]: "\u2198\uFE0F",
    [0b00000100]: "\u2B07\uFE0F",
    [0b00000010]: "\u2199\uFE0F",
    [0b00000001]: "\u2B05\uFE0F",
};

// CardViewer.Database.banlist = Banlist;

CardViewer.Database.setInitial = function (db) {
    // for(let [id, info] of Object.entries(db)) {
        // if(typeof info.exu_limit !== "undefined") {
            // continue;
        // }
        // info.exu_limit = Banlist[id];
        // if(typeof info.exu_limit === "undefined") {
            // info.exu_limit = 3;
        // }
    // }
    CardViewer.Database.cards = db;
};

// helper function methods
const _F = {
    propda: (prop) => (obj) => obj[prop],
    id: x => x,
    sortBy: (list, fn) =>
        list.map(e => [e, fn(e)])
            .sort(([l, lc], [r, rc]) => (lc > rc) - (lc < rc))
            .map(([e, ec]) => e),
};

// CardViewer.Search
CardViewer.Search.processResults = function (val) {
    CardViewer.Search.pages = [];
    let res = val.slice();
    while(res.length) {
        let page = res.splice(0, CardViewer.Search.pageSize);
        CardViewer.Search.pages.push(page);
    }
    if(CardViewer.Elements.pageCount) {
        CardViewer.Elements.pageCount.text(CardViewer.Search.pages.length);
    }
};

CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage, config = {}) {
    let target = config.target || CardViewer.Elements.results;
    if(!config.append) {
        target.empty();
    }
    if(id < 0 || id >= CardViewer.Search.pages.length) {
        return;
    }
    
    let page = CardViewer.Search.pages[id];
    
    if(config.sort) {
        page = config.sort(page);
    }
    
    if(config.append) {
        page.forEach((result, i, arr) => {
            let composed = CardViewer.composeStrategy(result);
            if(config.transform) {
                composed = config.transform(composed, result);
            }
            target.append(composed);
        });
    }
    else {
        let table = $("<table class=pagetable>");
        let row = [];
        page.forEach((result, i, arr) => {
            let composed = CardViewer.composeStrategy(result);
            row.push(composed);
            if(row.length === CardViewer.Search.columnWidth || i + 1 === arr.length) {
                let tr = $("<tr>");
                for(let c of row) {
                    tr.append($("<td>").append(c));
                }
                table.append(tr);
                row = [];
            }
        });
        target.append(table);
    }
    
    // humans measure in 1-based indices
    if(CardViewer.Elements.currentPage) {
        CardViewer.Elements.currentPage.text(id + 1);
    }
};

CardViewer.Search.nextPage = function () {
    if(CardViewer.Search.currentPage + 1 === CardViewer.Search.pages.length) {
        return;
    }
    CardViewer.Search.currentPage++;
    CardViewer.Search.showPage();
};

CardViewer.Search.previousPage = function () {
    if(CardViewer.Search.currentPage === 0) {
        return;
    }
    CardViewer.Search.currentPage--;
    CardViewer.Search.showPage();
};

// CardViewer.Filters
CardViewer.Filters.isMonster = (card) =>
    card.card_type === "Monster";
CardViewer.Filters.isSpell = (card) =>
    card.card_type === "Spell";
CardViewer.Filters.isTrap = (card) =>
    card.card_type === "Trap";

CardViewer.Filters.monsterColorIs = (color) => (card) =>
    card.monster_color === color;

CardViewer.Filters.isLeveled = (card) =>
    CardViewer.Filters.isMonster(card) &&
    card.monster_color !== "Xyz" &&
    card.monster_color !== "Link";

let extraDeckColors = ["Fusion", "Synchro", "Xyz", "Link"];
CardViewer.Filters.isExtraDeck = (card) =>
    CardViewer.Filters.isMonster(card) &&
    extraDeckColors.some(color => card.monster_color === color);
CardViewer.Filters.isMainDeck = (card) =>
    CardViewer.Filters.isMonster(card) &&
    !CardViewer.Filters.isExtraDeck(card);



CardViewer.Filters.isNormal = CardViewer.Filters.monsterColorIs("Normal");
CardViewer.Filters.isEffect = CardViewer.Filters.monsterColorIs("Effect");
CardViewer.Filters.isRitual = CardViewer.Filters.monsterColorIs("Ritual");
CardViewer.Filters.isFusion = CardViewer.Filters.monsterColorIs("Fusion");
CardViewer.Filters.isSynchro = CardViewer.Filters.monsterColorIs("Synchro");
CardViewer.Filters.isXyz = CardViewer.Filters.monsterColorIs("Xyz");

CardViewer.Filters.isNonEffect = (card) => {
    if(!CardViewer.Filters.isMonster(card)) {
        return card.cached_is_non_effect = false;
    }
    
    if(typeof card.cached_is_non_effect !== "undefined") {
        return card.cached_is_non_effect;
    }
    
    if(CardViewer.Filters.isNormal(card)) {
        return card.cached_is_non_effect = true;
    }
    
    if(CardViewer.Filters.isRitual(card)) {
        let sentences = card.effect
            .replace(/".+?"/g, "")
            .replace(/\.$/g, "")
            .split(".");
        
        return card.cached_is_non_effect = sentences.length === 1;
    }
    
    if(CardViewer.Filters.isExtraDeck(card)) {
        let parsed = card.effect
            .replace(/\(.+?\)/g, "")
            .replace(/".+?"/g, "")
        let paras = parsed.trim().split(/\r?\n|\r/g);
        let sentences = parsed.split(".");
        let isNonEffect = paras.length === 1 && sentences.length === 1;
        console.log(parsed, paras, sentences);
        return card.cached_is_non_effect = isNonEffect;
    }
    
    return card.cached_is_non_effect = false;
}

CardViewer.Filters.isFlipMonster = (card) =>
    card.effect.indexOf("FLIP:") !== -1;

CardViewer.Filters.isUnionMonster = (card) =>
    card.ability === "Union";
CardViewer.Filters.isTunerMonster = (card) =>
    card.ability === "Tuner";
CardViewer.Filters.isToonMonster = (card) =>
    card.ability === "Toon";
CardViewer.Filters.isGeminiMonster = (card) =>
    card.ability === "Gemini";
CardViewer.Filters.isSpiritMonster = (card) =>
    card.ability === "Spirit";
    
CardViewer.Filters.Dictionary = {
    monster:    CardViewer.Filters.isMonster,
    spell:      CardViewer.Filters.isSpell,
    trap:       CardViewer.Filters.isTrap,
    normal:     CardViewer.Filters.isNormal,
    effect:     CardViewer.Filters.isEffect,
    ritual:     CardViewer.Filters.isRitual,
    fusion:     CardViewer.Filters.isFusion,
    synchro:    CardViewer.Filters.isSynchro,
    xyz:        CardViewer.Filters.isXyz,
    pendulum:   _F.propda("pendulum"),
    link:       _F.propda("is_link"),
    leveled:    CardViewer.Filters.isLeveled,
    extradeck:  CardViewer.Filters.isExtraDeck,
    maindeck:   CardViewer.Filters.isMainDeck,
    noneffect:  CardViewer.Filters.isNonEffect,
    gemini:     CardViewer.Filters.isGeminiMonster,
    flip:       CardViewer.Filters.isFlipMonster,
    spirit:     CardViewer.Filters.isSpiritMonster,
    tuner:      CardViewer.Filters.isTunerMonster,
    toon:       CardViewer.Filters.isToonMonster,
    union:      CardViewer.Filters.isUnionMonster,
    any:        () => true,
};

CardViewer.Filters.getFilter = (key) =>
    CardViewer.Filters.Dictionary[key] || CardViewer.Filters.Dictionary.any;

CardViewer.query = function () {
    let baseStats = {
        name:       CardViewer.Elements.cardName.val(),
        effect:     CardViewer.Elements.cardDescription.val(),
        type:       CardViewer.Elements.cardType.val(),
        limit:      CardViewer.Elements.cardLimit.val(),
        id:         CardViewer.Elements.cardId.val(),
        author:     CardViewer.Elements.cardAuthor.val(),
        retrain:    CardViewer.Elements.cardIsRetrain.is(":checked"),
        visibility: CardViewer.Elements.cardVisibility.val(),
    };
    if(CardViewer.Elements.spellStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardSpellKind.val();
    }
    else if(CardViewer.Elements.trapStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardTrapKind.val();
    }
    else if(CardViewer.Elements.monsterStats.is(":visible")) {
        baseStats.level = CardViewer.Elements.cardLevel.val();
        baseStats.monsterType = CardViewer.Elements.cardMonsterType.val();
        baseStats.monsterAttribute = CardViewer.Elements.cardMonsterAttribute.val();
        baseStats.monsterCategory = CardViewer.Elements.cardMonsterCategory.val();
        baseStats.monsterAbility = CardViewer.Elements.cardMonsterAbility.val();
        baseStats.atk = CardViewer.Elements.cardATK.val();
        baseStats.def = CardViewer.Elements.cardDEF.val();
    }
    return baseStats;
};

CardViewer.simplifyText = (text) =>
    text.toLowerCase();

CardViewer.textComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    let simplified = CardViewer.simplifyText(needle);
    return (card) => {
        let f = fn(card);
        return f !== null && f.toString().toLowerCase().indexOf(simplified) !== -1;
    }
};
const escapeRegExp = function (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
CardViewer.regexComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    needle = escapeRegExp(needle)
        .replace(/(?:\\\*){2}/g, "[^.]*?")
        .replace(/\\\*/g, ".*?");
    
    let reg = new RegExp(needle, "i");
    
    return (card) =>
        reg.test(fn(card).toString());
};
CardViewer.textAnyComparator = (needle, fn = _F.id) =>
    needle === "any" ? () => true : CardViewer.textComparator(needle, fn);

CardViewer.boolExclusiveComparator = (needle, fn = _F.id) =>
    (card) => needle ? fn(card) : true;

CardViewer.exactComparator = (needle, fn = _F.id) => {
    return (card) =>
        fn(card) === needle;
};

CardViewer.or = (...fns) => (...args) => fns.some(fn => fn(...args));

CardViewer.createFilter = function (query, exclude = null) {
    if(exclude) {
        exclude = CardViewer.createFilter(exclude);
    }
    if(typeof query === "function") {
        if(exclude) {
            return (...args) => query(...args) && !exclude(args);
        }
        else {
            return query;
        }
    }
    let filters = [
        // type filter
        CardViewer.Filters.getFilter(query.type),
        // name filter
        CardViewer.or(
            CardViewer.textComparator(query.name, _F.propda("name")),
            CardViewer.textComparator(query.name, _F.propda("also_archetype")),
        ),
        // id filter
        CardViewer.textComparator(query.id, _F.propda("id")),
        // effect filter
        CardViewer.regexComparator(query.effect, _F.propda("effect")),
        // author filter
        CardViewer.textComparator(query.author, _F.propda("username")),
        // limit filter
        CardViewer.textAnyComparator(query.limit, _F.propda("exu_limit")),
        // retrain filter
        CardViewer.boolExclusiveComparator(query.retrain, _F.propda("exu_retrain")),
        // visibility filter
        CardViewer.textAnyComparator(query.visibility, _F.propda("custom")),
    ];
    
    if(query.kind) {
        filters.push(CardViewer.exactComparator(query.kind, _F.propda("type")));
    }
    
    if(query.level) {
        let level = parseInt(query.level, 10);
        if(!Number.isNaN(level)) {
            filters.push(CardViewer.exactComparator(level, _F.propda("level")));
        }
    }
    
    if(query.monsterType) {
        filters.push(CardViewer.exactComparator(query.monsterType, _F.propda("type")));
    }
    
    if(query.monsterAttribute) {
        filters.push(CardViewer.exactComparator(query.monsterAttribute, _F.propda("attribute")));
    }
    
    if(query.monsterCategory) {
        filters.push(CardViewer.Filters.getFilter(query.monsterCategory));
    }
    
    if(query.monsterAbility) {
        filters.push(CardViewer.Filters.getFilter(query.monsterAbility));
    }
    
    if(query.atk) {
        filters.push(CardViewer.exactComparator(query.atk, _F.propda("atk")));
    }
    
    if(query.def) {
        filters.push(CardViewer.exactComparator(query.def, _F.propda("def")));
    }
    
    let filter = (card) => filters.every(filter => filter(card));
    if(exclude) {
        return (card) => filter(card) && !exclude(card);
    }
    return filter;
};

CardViewer.filter = function (query, exclude = null) {
    let filter = CardViewer.createFilter(query, exclude);
    let cards = [];
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        if(CardViewer.excludeTcg && (card.tcg || card.ocg)) {
            continue;
        }
        if(filter(card)) {
            cards.push(card);
        }
    }
    cards = _F.sortBy(cards, (card) => card.name);
    return cards;
};

const getResource = (...path) =>
    `https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/res/${path.join("/")}.png`;

const getAttribute = (attr) =>
    getResource("attribute", attr[0] + attr.slice(1).toLowerCase());

const getStar = (star) =>
    getResource("stars", star);

const getIcon = (icon) =>
    getResource("icon", icon);

const BANLIST_ICONS = {
    0: getIcon("banlist-banned"),
    1: getIcon("banlist-limited"),
    2: getIcon("banlist-semilimited")
};

let arrowIterateOrder = [
    // top row
    [0b10000000, 0b01000000, 0b00100000],
    // middle row
    [0b00000001, 0b00000000, 0b00010000],
    // bottom row
    [0b00000010, 0b00000100, 0b00001000]
]
const getLinkArrowText = (arrows) => {
    let integer = parseInt(arrows, 2);
    let result = "";
    for(let row of arrowIterateOrder) {
        for(let key of row) {
            if(integer & key) {
                result += LINK_ARROWS[key];
            }
            else {
                result += "\u2B1C";
            }
        }
        result += "\n";
    }
    return result;
};

CardViewer.composeResultSmall = function (card) {
    let img = $("<img class=img-result>")
        .attr("src", card.src)
        .attr("title", card.id);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let isPrivate = card.custom && card.custom > 1
    
    if(isPrivate) {
        res.addClass("private");
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
    let stats = $("<div>");
    
    let attribute = $("<img class=result-attribute>");
    let marking = $("<div class=markings>");
    
    let linkArrows;
    if(card.card_type === "Monster") {
        attribute.attr("src", getAttribute(card.attribute))
        let kind = [];
        
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
        }
        else {
            marking.append(levelIndicator + card.level);
        }
        
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        
        if(card.ability) {
            kind.push(card.ability);
        }
        
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
            linkArrows = $(
                "<p class=link-arrows>" +
                getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
                "</p>"
            );
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    if(card.exu_limit !== 3) {
        let banMarker = $("<img class=banicon>");
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
        marking.append($("<div>").append(banMarker));
    }
    
    res.append($("<div class=result-inner>").append(name, /*linkArrows, author, stats,*/
        $("<div class=result-img-holder>").append(
            $("<div>").append(img),
            $("<div>").append(attribute, marking),
            // $("<div>").append()
        )
        // $("<table>").append(
            // $("<tr>").append(
                // $("<td class=result-img-holder>").append(img, attribute, marking),
                // $("<td class=result-effect>").append(effect)
            // )
        // )
    ));
    return res;
};

CardViewer.composeResult = function (card) {
    let img = $("<img class=img-result>").attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    
    let idText = card.id;
    let altText = `(~${card.submission_source})`;
    let id = $("<h4 class=result-id>")
        .contextmenu((e) => {
            e.preventDefault();
            idText = idText === card.id ? altText : card.id;
            id.text(idText);
        })
        .text(idText);
    let author = $("<h4 class=result-author>").text(card.username);
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let isPrivate = card.custom && card.custom > 1;
    
    if(isPrivate) {
        res.addClass("private");
        name.append($("<i>").text(" (private)"));
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "Scale = " + card.scale + "\n[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    let stats = $("<div>");
    
    let attribute = $("<img>");
    let marking = $("<div class=markings>");
    
    let linkArrows;
    if(card.card_type === "Monster") {
        attribute.attr("src", getAttribute(card.attribute))
        let kind = [];
        
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
        }
        
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        
        if(card.ability) {
            kind.push(card.ability);
        }
        
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
            linkArrows = $(
                "<p class=link-arrows>" +
                getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
                "</p>"
            );
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    if(card.exu_limit !== 3) {
        let banMarker = $("<img class=banicon>");
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
        marking.append($("<div>").append(banMarker));
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
    let retrain = RetrainMap[card.id];
    let retrainCard = CardViewer.Database.cards[retrain];
    if(retrain && retrainCard) {
        let retrainText = "Retrain of: " + retrainCard.name;
        // retrainText += " (Id #" + retrain + ")";
        let link = $("<a>").text(retrainText);
        if(CardViewer.linkRetrain) {
            link.attr("href", "#card" + retrain)
        }
        effect.push($("<p class=retrainText>").append($("<i>").append(
            link
        )));
    }
    
    res.append($("<div class=result-inner>").append(id, name, linkArrows, author, stats,
        $("<table>").append(
            $("<tr>").append(
                $("<td class=result-img-holder>").append(img, attribute, marking),
                $("<td class=result-effect>").append(effect)
            )
        )
    ));
    return res;
};

CardViewer.composeStrategy = CardViewer.composeResult;

CardViewer.demonstrate = function (query) {
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Search.showPage();
};

CardViewer.firstTime = true;
CardViewer.submit = function () {
    let query;
    if (CardViewer.firstTime) {
        query = card => CardsOfTheWeek.indexOf(card.id) !== -1;
    }
    else {
        query = CardViewer.query();
    }
    CardViewer.demonstrate(query);
    CardViewer.Elements.resultNote.text(CardViewer.firstTime ? "Note: You are currently viewing a curated selection of our cards. Please search again to see all available cards." : "");
    CardViewer.firstTime = false;
};