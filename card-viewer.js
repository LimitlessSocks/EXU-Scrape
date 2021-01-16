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
    SaveData: {
        local: {},
        KEY: "EXU",
    },
};

CardViewer.SaveData.init = () => {
    let localItem = localStorage.getItem(CardViewer.SaveData.KEY);
    
    CardViewer.SaveData.local = localItem === null ? {} : JSON.parse(localItem);
    CardViewer.SaveData.sync();
};
CardViewer.SaveData.sync = () => {
    localStorage.setItem(CardViewer.SaveData.KEY, JSON.stringify(CardViewer.SaveData.local));
};
CardViewer.SaveData.get = (key) => {
    return CardViewer.SaveData.local[key];
};
CardViewer.SaveData.set = (key, value) => {
    CardViewer.SaveData.local[key] = value;
    CardViewer.SaveData.sync();
};

CardViewer.SaveData.init();

const downloadFile = (content, type = "application/octet-stream", filename = null) => {
    let uri = "data:" + type + "," + encodeURIComponent(content);
    let anchor = $("<a>");
    anchor.attr("href", uri);
    if(filename) {
        anchor.attr("download", filename);
    }
    anchor.get(0).click();
};

const escapeXMLString = (str) =>
    str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

class Prompt {
    constructor(title, innerFn, buttons, type = null) {
        this.title = title;
        this.innerFn = innerFn || (() => $(innerFn));
        this.buttons = buttons;
        this.type = type;
    }
    
    deploy() {
        this.anchor = $("<div>").addClass("popup-background");
        
        this.anchor.click(e => {
            if(e.target == this.anchor.get(0)) {
                this.close(true);
            }
            // console.log(e.target);
        });
        let inner = this.innerFn(this) || $("");
        let buttonEls = this.buttons.map(text => $("<button>").text(text));
        inner = $("<div class=popup-inner>").append(
            $("<h2 class=popup-title>").text(this.title),
            inner,
            $("<div>").append(buttonEls),
        );
        if(this.type !== null) {
            inner.addClass(this.type);
        }
        this.anchor.append(inner);
        return new Promise((resolve, reject) => {
            this.reject = reject;
            let i = 0;
            for(let button of buttonEls) {
                let v = i;
                button.click(() => {
                    resolve([v, this]);
                    this.close();
                });
                i++;
            }
            $("body").append(this.anchor);
        });
    }
    
    close(reject = false) {
        if(this.anchor) {
            this.anchor.remove();
        }
        if(reject && this.reject) {
            this.reject();
        }
    }
    
    static OK(title) {
        return new Prompt(title, null, ["OK"], "small");
    }
};

const CardsOfTheWeek = [
    1117429, //Battlewasp - Akiza the Berserker
    1175945, //ON SALE!!!
    1222148, //Called by the Spell Book
    // 1000049, //Little Tanker
    // 1411709, //Gradielle, Symphony of Harmony
    // 1069476, //Elon Musk 1
    // 1331629, //Elon Musk 2
    1482984, //Wingbeat Wyrm (Elon Musk 3)
    1311654, //Torrential Fusion
    // 1079215, //Grasp
    1298826, //Eye of the Shadows
    1333641, //Chained Down
    1061760, //Sacrificial Soul Reborn
    1393301, //Cosmic Vacuum
    1374705, //Bone Chimera
    // 1268592, //Max Evolution Pill
    1537818, //Destoroyah, the One True Devil
    1526913, //Spellbook of Forbidden Arts
    930975,  //Equip Equality
    // 1471876, //Flimsy Shot
    1537498, //Ghost Wind & Bright Mist
    1818903, //Ghost Wheel & Floating Lantern
    1818868, //Caltrops
    1409651, //Underwhelming Observations
    1473788, //Malformed Test Subject
    1558753, //Charismatic Priestess
    1644436, //Solar Flare
    1649242, //Mokey Mokey Shadow
    747487,  //Reset!
    1765725, //Number 108: Divine Wind Dragon
    1805896, //Localized Tornado Dragon
    1736029, //Lost Wind's Cyclone
    1409993, //Localized Typhoon
    1951637, //Half-Exchanged Spirit
    1956938, //Shattered Heart
    1770162, //Number 129: Lost Chained Dragon
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
    1653369: 3057,      //Naturia Baihu -> Naturia Beast
    1768966: 9070,      //Hieratic Dragon of Khonsu -> Hieratic Seal of the Heavenly Spheres
    1731744: 10510,     //Artifact Ame-No-Nuboku -> Artifact Dagda
    1867327: 9082,      //Crystron Halqifibrax -> Crystron Glassfiber
    1648511: 10606,     //Accesscode Talker -> Storm Accesscode Talker
    1862633: 8514,      //True King of Dimension's End -> True King of All Calamities
    1948923: 8653,      //Wallfire Dragon -> Firewall dragon
    1951635: 4546,      //Penultimate Offering -> Ultimate Offering
    1768996: 310,       //Curse of Overconfidence -> Bad Reaction to Simochi
    1865422: 7489,      //Majespecter Dragon - Ryu -> Majespecter Unicorn - Kirin
    1994622: 8335,      //True King Lepresocis, the Diseased -> True King Lithosagym, the Disaster
    1961738: 8521,      //True King's Diagram -> Dragonic Diagram
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
    CardViewer.Database.cards = db;
};
CardViewer.Database.initialReadAll = async function (...names) {
    let promises = names.map(name => fetch(name).then(response => response.json()));
    
    let dbs = await Promise.all(promises);
    
    let db = dbs.reduce((acc, next) => Object.assign(acc, next), {});
    CardViewer.Database.setInitial(db);
};

// helper function methods
const _F = {
    propda: (prop) => (obj) => obj[prop],
    id: x => x,
    sortBy: (list, ...fns) =>
        list.map(e => [e, fns.map(fn => fn(e))])
            .sort(([l, lcs], [r, rcs]) =>
                lcs.map((lc, i) => {
                    rc = rcs[i];
                    return (lc > rc) - (lc < rc);
                }).find(x => x) || 0
            )
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

CardViewer.Search.config = {};

CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage, config = CardViewer.Search.config) {
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
    
    if(config.append || config.noTable) {
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
CardViewer.Filters.isLink = CardViewer.Filters.monsterColorIs("Link");

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
        return card.cached_is_non_effect = isNonEffect;
    }
    
    return card.cached_is_non_effect = false;
}

CardViewer.initializeByName = () => {
    if(CardViewer.Database.byName) {
        return;
    }
    CardViewer.Database.byName = {};
    
    for(let card of Object.values(CardViewer.Database.cards)) {
        CardViewer.Database.byName[card.name] = card;
    }
};

CardViewer.listArchetypes = () => {
    CardViewer.initializeByName();
    
    let archetypes = new Set();
    
    for(let card of Object.values(CardViewer.Database.cards)) {
        if(card.tcg || card.ocg || CardViewer.Filters.isNormal(card)) {
            continue;
        }
        for(let [match, g1] of card.effect.matchAll(/"([^"]*?[^\s"])(?:\(s\))?"/g)) {
            // exclude card names
            g1 = g1.trim();
            if(!CardViewer.Database.byName[g1] && g1.indexOf("Token") === -1) {
                archetypes.add(g1);
            }
        }
    }
    
    return [...archetypes].sort();
};

CardViewer.listDeckSources = () =>
    [...new Set(
        CardViewer.Search
            .pages.flat()
            .map(e => e.submission_source)
    )];

CardViewer.formatDeckSources = () =>
    CardViewer.listDeckSources().map(
        sourceId => `${sourceId} - \n${
            CardViewer.Search
                .pages.flat()
                .filter(e => e.submission_source == sourceId)
                .map(e => "  " + JSON.stringify(e.name) + ` (${e.id})`)
                .join("\n")
            }`
    ).join("\n\n");


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
    link:       CardViewer.Filters.isLink,
    // link:       _F.propda("is_link"),
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

CardViewer.showImported = false;
CardViewer.query = function () {
    let baseStats = {
        name:         CardViewer.Elements.cardName.val(),
        effect:       CardViewer.Elements.cardDescription.val(),
        type:         CardViewer.Elements.cardType.val(),
        limit:        CardViewer.Elements.cardLimit.val(),
        id:           CardViewer.Elements.cardId.val(),
        author:       CardViewer.Elements.cardAuthor.val(),
        retrain:      CardViewer.Elements.cardIsRetrain.is(":checked"),
        visibility:   CardViewer.Elements.cardVisibility.val(),
        imported:     false,
        notImported:  false,
        alsoImported: CardViewer.showImported,
    };
    if(CardViewer.Elements.spellStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardSpellKind.val();
    }
    else if(CardViewer.Elements.trapStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardTrapKind.val();
    }
    else if(CardViewer.Elements.monsterStats.is(":visible")) {
        baseStats.monsterType = CardViewer.Elements.cardMonsterType.val();
        baseStats.monsterAttribute = CardViewer.Elements.cardMonsterAttribute.val();
        baseStats.monsterCategory = CardViewer.Elements.cardMonsterCategory.val();
        baseStats.monsterAbility = CardViewer.Elements.cardMonsterAbility.val();
        baseStats.level = CardViewer.Elements.cardLevel.val();
        baseStats.atk = CardViewer.Elements.cardATK.val();
        baseStats.def = CardViewer.Elements.cardDEF.val();
        baseStats.levelCompare = CardViewer.Elements.cardLevelCompare.val();
        baseStats.atkCompare = CardViewer.Elements.cardATKCompare.val();
        baseStats.defCompare = CardViewer.Elements.cardDEFCompare.val();
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
        return f !== null && f !== undefined && f.toString().toLowerCase().indexOf(simplified) !== -1;
    }
};
const escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractInlineRegexes = function * (str) {
    let build = "";
    let readingRegex = false;
    
    for(let i = 0; i < str.length; i++) {
        let ch = str[i];
        if(ch === "[") {
            readingRegex = true;
        }
        else if(ch === "]") {
            yield build + ch;
            build = "";
            readingRegex = false;
        }
        if(!readingRegex) continue;
        build += ch;
        if(ch === "\\") {
            build += str[++i];
        }
    }
};

CardViewer.regexComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    
    let accept = [];
    let reject = [];
    
    for(let regStr of extractInlineRegexes(needle)) {
        let [whole, tag, regInner] = regStr.trim().match(/^\[(.\|)?(.+)\]$/);
        let reg = new RegExp(regInner, "i");
        if(/^[ner]/i.test(tag)) {
            reject.push(reg);
        }
        else {
            accept.push(reg);
        }
        needle = needle.replace(regStr, "");
    }
    
    needle = escapeRegExp(needle)
        .replace(/(?:\\\*){2}/g, "[^.]*?")
        .replace(/\\\*/g, ".*?");
    
    let reg = new RegExp(needle, "i");
    accept.push(reg);
    
    return (card) =>
        accept.every(reg => reg.test(fn(card)))
        && !reject.some(reg => reg.test(fn(card)));
};
CardViewer.textAnyComparator = (needle, fn = _F.id) =>
    needle === "any" ? () => true : CardViewer.textComparator(needle, fn);

CardViewer.boolExclusiveComparator = (needle, fn = _F.id) =>
    (card) => needle ? fn(card) : true;

CardViewer.boolExactComparator = (needle, fn = _F.id) =>
    (card) => !!fn(card) == !!needle;

CardViewer.exactComparator = (needle, fn = _F.id) => {
    return (card) =>
        fn(card) === needle;
};

CardViewer.COMPARES = {
    equal:          (a, b) => a == b,
    unequal:        (a, b) => a != b,
    lessequal:      (a, b) => a <= b,
    less:           (a, b) => a <  b,
    greaterequal:   (a, b) => a >= b,
    greater:        (a, b) => a >  b,
    choice:         (a, bs) => bs.some(b => a == b),
}
CardViewer.comparingComparator = (needle, compareString, fn = _F.id) => {
    let cmp = CardViewer.COMPARES[compareString];
    // console.log(needle, compareString, cmp);
    if(compareString === "choice") {
        needle = needle.toString().split(/[,\s]\s*/)
            .map(e => parseInt(e, 10));
    }
    else {
        needle = parseInt(needle, 10);
    }
    // let once = true;
    return (card) => {
        // if(once){
            // once=false;
            // console.log(fn(card), needle, cmp(fn(card), needle));
        // }
        return cmp(fn(card), needle);
    }
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
        // CardViewer.textAnyComparator(query.visibility, _F.propda("custom")),
        (card) =>
            query.visibility === "any" || !query.visibility
                ? true
                : query.visibility == 1 || query.visibility == 2
                    ? card.custom == query.visibility
                    : query.visibility == 3
                        ? card.tcg && !card.ocg
                        : query.visibility == 4
                            ? card.ocg && !card.tcg
                            : card.custom,
    ];
    // import filters
    // console.log(query, !query.alsoImported);
    if(!query.alsoImported) {
        filters.push(
            // import filter
            CardViewer.boolExactComparator(query.imported, _F.propda("exu_import")),
            // not imported filter
            CardViewer.boolExactComparator(query.notImported, _F.propda("exu_ban_import")),
        );
    }
    
    if(query.kind) {
        filters.push(CardViewer.exactComparator(query.kind, _F.propda("type")));
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
    
    if(query.level) {
        let level = parseInt(query.level, 10);
        if(!Number.isNaN(level)) {
            filters.push(CardViewer.comparingComparator(
                level,
                query.levelCompare,
                _F.propda("level")
            ));
        }
    }
    
    if(query.atk) {
        filters.push(CardViewer.comparingComparator(
            query.atk,
            query.atkCompare,
            _F.propda("atk")
        ));
    }
    
    if(query.def) {
        filters.push(CardViewer.comparingComparator(
            query.def,
            query.defCompare,
            _F.propda("def")
        ));
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
        // if(id == 11086) {
            // console.log(id, card);
            // console.log(query, exclude);
        // }
        if(CardViewer.excludeTcg && (card.tcg || card.ocg)) {
            continue;
        }
        if(card.rush) {
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
    2: getIcon("banlist-semilimited"),
    
    imported: getIcon("banlist-import"),
    notImported: getIcon("banlist-no-import"),
    ocg: getIcon("ocg"),
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
    card.src = card.src || (
        "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
    );
    let img = $("<img class=img-result>")
        .attr("src", card.src)
        .attr("title", card.id);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass("small");
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    if(card.exu_ban_import) {
        res.addClass("unimported");
        // console.log(card.name, res);
    }
    
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
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=banicon>");
    if(card.exu_ban_import) {
        importMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    else if(!card.custom && !card.tcg && card.ocg) {
        importMarker.addClass("wide");
        importMarker.attr("src", BANLIST_ICONS.ocg);
    }
    
    if(card.exu_limit !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
    }
    
    if(importMarker.attr("src")) {
        marking.append($("<div>").append(importMarker));
    }
    if(banMarker.attr("src")) {
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
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=importicon>");
    if(card.exu_ban_import) {
        importMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    
    if(card.exu_limit !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
    }
    
    if(importMarker.attr("src")) {
        marking.append($("<div>").append(importMarker));
    }
    if(banMarker.attr("src")) {
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

CardViewer.setUpTabSearchSwitching = function () {
    CardViewer.Elements.cardType.change(function () {
        let val = CardViewer.Elements.cardType.val();
        if(val === "spell") {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(true);
        }
        else if(val === "trap") {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
            CardViewer.Elements.ifTrap.toggle(true);
        }
        else if(val === "monster") {
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
            CardViewer.Elements.ifMonster.toggle(true);
        }
        else {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
        }
        if(CardViewer.Editor) {
            CardViewer.Editor.recalculateView();
        }
    });
    CardViewer.Elements.cardType.change();
};

CardViewer.composeStrategy = CardViewer.composeResult;

CardViewer.demonstrate = function (query) {
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Search.showPage();
};

CardViewer.setUpCompareCompares = function () {
    //TODO:
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
    // console.log(query);
    CardViewer.demonstrate(query);
    CardViewer.Elements.resultNote.text(CardViewer.firstTime ? "Note: You are currently viewing a curated selection of our cards. Please search again to see all available cards." : "");
    CardViewer.firstTime = false;
};