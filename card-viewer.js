const CardViewer = {
    autoSearch: false,
    Database: {
        cards: null,
        cardsIdsByName: null,
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
    Playrates: {
        Summary: null,
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
    format: "exu"
};

const isNode = typeof window === "undefined";
if(isNode) {
    window = { DEBUG: false };
}

CardViewer.initCardIdsByName = () => {
    CardViewer.Database.cardsIdsByName = {};
    for(let card of Object.values(CardViewer.Database.cards)) {
        let key = card.name.toLowerCase();
        CardViewer.Database.cardsIdsByName[key] ??= [];
        CardViewer.Database.cardsIdsByName[key].push(card.id);
    }
};
CardViewer.getCardByName = name => {
    if(!CardViewer.Database.cardsIdsByName) {
        CardViewer.initCardIdsByName();
    }
    return CardViewer.Database.cards[
        CardViewer.Database.cardsIdsByName[name.toLowerCase()]?.[0]
    ];
};

CardViewer.getCardLink = card =>
    `https://limitlesssocks.github.io/EXU-Scrape/card?id=${card.id}`;

// some constants
const CATEGORY_RETRAIN = 1;
const CATEGORY_ALT_ART = 2;

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

if(typeof localStorage !== "undefined") {
    CardViewer.SaveData.init();
}

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

const DB_DATE_FORMAT = /(.{4})-(.{2})-(.{2})/; // year-month-day
const EXU_DATE_FORMAT = /(.{2})-(.{2})-(.{4})\.(.{2})\.(.{2})\.(.{2})/; // month-day-year.hour.minute.second
const DISPLAY_DATE_FORMAT = /(.{2})\/(.{2})\/(.{4})/; // month/day/year
const formatDateAdded = (date) => {
    let fmt, year, month, day, hour, minute, second;
    // let action;
    if(fmt = DB_DATE_FORMAT.exec(date)) {
        [, year, month, day] = fmt;
        // action = "Released";
    }
    else if(fmt = EXU_DATE_FORMAT.exec(date)) {
        [, month, day, year, hour, minute, second] = fmt;
        // action = "Integrated";
    }
    else if(fmt = DISPLAY_DATE_FORMAT.exec(date)) {
        [, month, day, year] = fmt;
        // action = null;
    }
    
    let str = month + "/" + day + "/" + year;
    
    // if(!raw && action) {
        // str = action + " " + str;
    // }
    
    return str;
};
const getComparableDate = (date) => {
    let dateString = formatDateAdded(date);
    return new Date(dateString);
};

class Prompt {
    // innerFn should be a function that returns the HTML body of the prompt
    // supported types: small / large / auto / nothing
    constructor(title, innerFn, buttons, ...types) {
        this.title = title;
        if(typeof innerFn !== "function") {
            let oldInnerFn = innerFn;
            innerFn = () => oldInnerFn;
        }
        this.innerFn = innerFn;
        this.buttons = buttons;
        this.types = types;
    }
    
    deploy(...args) {
        this.anchor = $("<div>").addClass("popup-background");
        
        this.anchor.click(e => {
            const popupBackground = this.anchor.get(0);
            if(e.target == popupBackground) {
                this.close(true);
            }
            // console.log(e.target);
        });
        let inner = this.innerFn(this, ...args) || $("");
        let buttonEls = this.buttons.map(text => $("<button>").text(text));
        inner = $("<div class=popup-inner>").append(
            $("<h2 class=popup-title>").text(this.title),
            inner,
            $("<div>").append(buttonEls),
        );
        for(let type of this.types) {
            inner.addClass(type);
        }
        this.anchor.append(inner);
        return new Promise((resolve, reject) => {
            this.reject = reject;
            let i = 0;
            for(let button of buttonEls) {
                let v = i;
                button.click(() => {
                    resolve([v, this, inner]);
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
    1731724, //Artifact Teiws
    1642313, //Rooftop Inu
    1551870, //Exquisite Knowledge
    1638767, //Abyss Insurgent
    1599951, //Spawn of Exile
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
    2487668: 10503,     //Simorgh, Bird of Miracles -> Simorgh, Bird of Sovereignty
    2014209: 5576,      //Cryotitan the Elemental Lord -> Moulinglacia the Elemental Lord
    1920888: 3724,      //Scrap Turbo -> Scrap Recycler
    1999194: 6534,      //El Shaddoll Winlao -> El Shaddoll Winda
    2231144: 10606,     //Cryptocode Talker -> Accesscode Talker
    2242028: 10606,     //Backcode Talker -> Accesscode Talker
    2218012: 9074,      //Noble Knight Lefay -> Isolde, Two Tales of the Noble Knights
    1976423: 9633,      //The Phantom Knights of Forgotten Brigade -> The Phantom Knights of Rusty Bardiche
    1566623: 1566623,   //EX-Saber Gottoms -> EX-Saber Gottoms
    1717113: 11170,     //Glimmering Drytronis -> Meteonis Drytron
    2092739: 11170,     //Radiant Drytronis -> Meteonis Drytron
    797597: 2382,       //Kaiser Arena -> Kaiser Colosseum
    2511764: 10698,     //Eldlixir of Golden Convergence -> Eldlixir of Scarlet Sanguine
    1961738: 8521,      //True King's Diagram -> Dragonic Diagram
    1985232: 2219,      //Blazing Aura -> Imperial Order
    1966485: 7817,      //Ledger of Demise -> Card of Demise
    2533677: 8825,      //Sengen Taisha -> Amano-Iwato
    2050037: 5788,      //Majestic Ivory Chaoserpent -> White Dragon Wyverburster
    1793538: 6697,      //Masked HERO Dusk Law -> Masked HERO Dark Law
    // 1731744: 10510,     //Artifact Ame-No-Nuboku -> Artifact Dagda
    1653369: 3057,      //Naturia Baihu -> Naturia Beast
    1638076: 5684,      //Horror of the Depths -> Abyss Dweller
    1319245: 5167,      //Lavalval Shadow -> Lavalval Chain
    2350096: 5570,      //Madolche Queen Crownnoli -> Madolche Queen Tiaramisu
    1708820: 10958,     //Numeron Extraction -> Numeron Calling
    2529570: 9192,      //Never Surrender! -> Red Reboot
    1318485: 3688,      //Ambush Lotus -> Samsara Lotus
    1619088: 1602,      //Fishborg Defender -> Fishborg Blaster
    1743438: 5844,      //Spellbook of Silencing -> Spellbook of Judgment
    1865422: 7489,      //Majespecter Dragon - Ryu -> Majespecter Unicorn - Kirin
    1318550: 2694,      //Reynard Chemist -> Magical Scientist
    1862633: 8514,      //True King of Dimension's End -> True King of All Calamities
    1768966: 9070,      //Hieratic Dragon of Khonsu -> Hieratic Seal of the Heavenly Spheres
    2021204: 8118,      //Cyber Angel Benzaiten -> Cyber Angel Benten
    1951635: 1951635,   //Penultimate Offering -> Penultimate Offering
    1319058: 589,       //Resurrected Blade of Elma -> Butterfly Dagger - Elma
    1638270: 1752,      //Shien's Will -> Gateway of the Six
    2078157: 8865,      //Imposing Attraction -> Metaverse
    2242234: 949,       //Aether Faisy -> Dandylion
    1318524: 3307,      //Phoenixian Cluster Hippeastrum -> Phoenixian Cluster Amaryllis
    2020789: 10500,     //Union Conductor -> Union Carrier
    1933842: 11089,     //Dreadful Arsenal ZZ-ARES - Abyssal Flames
    2543585: 9082,      //Crystron Vermeridhogg -> Crystron Halqifibrax
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
    CardViewer.Database.cardsIdsByName = null;
    CardViewer.Database.cards = db;
};
CardViewer.Database.initialReadAll = async function (...names) {
    let promises = names
        .filter(name => name !== null)
        .map(name => fetch(name).then(response => response.json()));
    
    let dbs = await Promise.all(promises);
    
    let db = dbs.reduce((acc, next) => Object.assign(acc, next), {});
    CardViewer.Database.setInitial(db);
};

// helper function methods
const _F = {
    propda: (prop) => (obj) => obj[prop],
    id: x => x,
    // NOTE: this will not behave nicely with NaN. be sure to filter out NaN beforehand!!!
    sortBy: (list, ...fns) => {
        let isAscending = fns.map(entry => Array.isArray(entry) ? entry[1] : true);
        fns = fns.map(entry => Array.isArray(entry) ? entry[0] : entry);
        return list.map(e => [e, fns.map(fn => fn(e))])
            .sort(([l, lcs], [r, rcs]) =>
                lcs.map((lc, i) => {
                    rc = rcs[i];
                    let judgment = (lc > rc) - (lc < rc);
                    return isAscending[i] ? judgment : -judgment;
                }).find(x => x) || 0
            )
            .map(([e, ec]) => e);
    },
    // more accurate, but more expensive
    sortByLocale: (list, ...fns) =>
        list.map(e => [e, fns.map(fn => fn(e))])
            .sort(([l, lcs], [r, rcs]) =>
                lcs.map((lc, i) => {
                    rc = rcs[i];
                    if(typeof lc === "string" && typeof rc === "string") {
                        return lc.localeCompare(rc, undefined, { numeric: true, sensitivity: "base" });
                    }
                    else {
                        return (lc > rc) - (lc < rc);
                    }
                }).find(x => x) || 0
            )
            .map(([e, ec]) => e),
    compose: (...fns) =>
        (...args) =>
            fns.slice(0, -1).reduceRight((acc, f) => f(acc), fns[fns.length-1](...args)),
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

CardViewer.Search.config = {
    sortByProperty: "name",
    reverseSearch: "ascending",
};

CardViewer.Search.snapNavigation = false;
CardViewer.Search.snapDelta = null;
CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage, config = CardViewer.Search.config) {
    // only use snap if the user is scrolled at least 50% of the webpage down
    let useSnap = window.scrollY / window.scrollMaxY >= 0.50;
    if(useSnap && CardViewer.Search.snapNavigation) {
        // the expression (window.scrollMaxY - window.scrollY) works, but has an issue with drifting the webpage up over time
        // just snap the user to the bottom if they're beyond the halfway point for smooth, consistent deltas.
        // TODO: this could maybe be fixed by not changing snapDelta if it doesn't exceed a certain difference, assuming the drifting is due to fp arithmetic differences in scrollY.
        CardViewer.Search.snapDelta = 0;
    }
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
        let table = $("<div class=pagetable>");
        let row = [];
        page.forEach((result, i, arr) => {
            let composed = CardViewer.composeStrategy(result);
            row.push(composed);
            if(row.length === CardViewer.Search.columnWidth || i + 1 === arr.length) {
                for(let c of row) {
                    table.append($("<div class=pagetable-cell>").append(c));
                }
                row = [];
            }
        });
        target.append(table);
    }
    
    // humans measure in 1-based indices
    if(CardViewer.Elements.currentPage) {
        CardViewer.Elements.currentPage.val(id + 1);
        CardViewer.Elements.currentPage.attr("max", CardViewer.Search.pages.length);
    }
    
    if(useSnap && CardViewer.Search.snapNavigation) {
        window.scrollTo({ top: window.scrollMaxY - CardViewer.Search.snapDelta });
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
// CardViewer.Filters.isEffect = (card) => !CardViewer.Filters.isNonEffect(card);
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
            .replace(/[“"”].+?[“"”]/g, "")
            .replace(/\.$/g, "")
            .split(".");
        
        return card.cached_is_non_effect = sentences.length === 1;
    }
    
    if(CardViewer.Filters.isExtraDeck(card)) {
        let parsed = card.effect
            .replace(/\(.+?\)/g, "")
            .replace(/[“"”].+?[“"”]/g, "")
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
    card.ability?.includes("Union");
CardViewer.Filters.isTunerMonster = (card) =>
    card.ability?.includes("Tuner");
CardViewer.Filters.isToonMonster = (card) =>
    card.ability?.includes("Toon");
CardViewer.Filters.isGeminiMonster = (card) =>
    card.ability?.includes("Gemini");
CardViewer.Filters.isSpiritMonster = (card) =>
    card.ability?.includes("Spirit");
    
CardViewer.Filters.isAtkOrDef = (atkDefVal) => (card) =>
    card.atk == atkDefVal || (!CardViewer.Filters.isLink && card.def == atkDefVal);

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
    qq:         CardViewer.Filters.isAtkOrDef("?"),
    any:        () => true,
};

CardViewer.Filters.getFilter = (key) =>
    CardViewer.Filters.Dictionary[key] || CardViewer.Filters.Dictionary.any;

CardViewer.showImported = false;

CardViewer.query = function () {
    let baseStats = {
        name:               CardViewer.Elements.cardName.val(),
        effect:             CardViewer.Elements.cardDescription.val(),
        type:               CardViewer.Elements.cardType.val(),
        limit:              CardViewer.Elements.cardLimit.val(),
        id:                 CardViewer.Elements.cardId.val(),
        author:             CardViewer.Elements.cardAuthor.val(),
        category:           CardViewer.Elements.cardCategory.val(),
        visibility:         CardViewer.Elements.cardVisibility.val(),
        imported:           false,
        notImported:        false,
        alsoImported:       CardViewer.showImported,
        playRate:           CardViewer.Elements.playRate.val(),
        playRateCompare:    CardViewer.Elements.playRateCompare.val(),
    };
    let extraVisibility = [];
    if(CardViewer.format) {
        baseStats[CardViewer.format] = true;
    }
    if(CardViewer.Elements.searchSortBy) {
        baseStats.sortBy = CardViewer.Elements.searchSortBy.val();
    }
    if(CardViewer.Elements.searchSortOrder) {
        baseStats.sortOrder = CardViewer.Elements.searchSortOrder.val();
    }
    if(CardViewer.Elements.includeCustoms && CardViewer.Elements.includeYcg) {
        let useCustoms = CardViewer.Elements.includeCustoms.prop("checked");
        let useYcg = CardViewer.Elements.includeYcg.prop("checked");
        if(!useCustoms || !useYcg) {
            baseStats.visibility = [ baseStats.visibility ];
        }
        if(useCustoms && !useYcg) {
            baseStats.visibility.push(-CardViewer.Visibilities.TCGOrOCG);
        }
        if(useYcg && !useCustoms) {
            baseStats.visibility.push(-CardViewer.Visibilities.PublicOrPrivateCustom);
        }
    }
    if(CardViewer.Elements.cardPointsCompare.is(":visible") && CardViewer.Elements.cardPoints.val()) {
        baseStats.points = CardViewer.Elements.cardPoints.val();
        baseStats.pointsCompare = CardViewer.Elements.cardPointsCompare.val();
    }
    if(CardViewer.Elements.cardIsNotNormal) {
        baseStats.notNormal = CardViewer.Elements.cardIsNotNormal.is(":checked");
    }
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
        baseStats.pendScale = CardViewer.Elements.cardPendScale.val();
        baseStats.levelCompare = CardViewer.Elements.cardLevelCompare.val();
        baseStats.atkCompare = CardViewer.Elements.cardATKCompare.val();
        baseStats.defCompare = CardViewer.Elements.cardDEFCompare.val();
        baseStats.pendScaleCompare = CardViewer.Elements.cardPendScaleCompare.val();
        baseStats.exactArrows = false;
        baseStats.arrowMask = null;
        
        // arrows
        if(baseStats.monsterCategory === "link") {
            let mask = 0;
            let i = 0;
            for(let el of $(".arrow-button")) {
                if(el.classList.contains("toggled")) {
                    if(el.id === "equals") {
                        baseStats.exactArrows = true;
                    }
                    else {
                        mask |= flatArrow[i];
                    }
                }
                i++;
            }
            mask = mask.toString(2).padStart(8, "0");
            baseStats.arrowMask = mask;
        }
    }
    return baseStats;
};

CardViewer.caseSensitive = false;
CardViewer.simplifyText = (text) =>
    text.toLowerCase();

CardViewer.textComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    let simplified = CardViewer.simplifyText(needle);
    return (card) => {
        let f = fn(card);
        if(f === null || f === undefined) {
            return false;
        }
        return CardViewer.caseSensitive
            ? f.toString().includes(needle)
            : CardViewer.simplifyText(f.toString()).includes(simplified);
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
    let caselessAccept = [];
    let caselessReject = [];
    
    for(let regStr of extractInlineRegexes(needle)) {
        let [whole, tag, regInner] = regStr.trim().match(/^\[(.+?\|)?(.+)\]$/);
        let flag = "i";
        // case sensitive
        if(/^[cs]/i.test(tag)) {
            flag = "";
        }
        let reg = new RegExp(regInner, flag);
        let caselessReg = new RegExp(regInner, flag.replace("i", ""));
        if(/^[ner]/i.test(tag)) {
            reject.push(reg);
            caselessReject.push(caselessReg);
        }
        else {
            accept.push(reg);
            caselessAccept.push(caselessReg);
        }
        needle = needle.replace(regStr, "");
    }
    
    needle = escapeRegExp(needle)
        .replace(/\\\^/g, "^\\s*")
        .replace(/\\\$/g, "\\s*$")
        .replace(/(?:\\\*){2}/g, "[^.]*?")
        .replace(/\\\*/g, ".*?");
    
    let reg = new RegExp(needle, "i");
    let caselessReg = new RegExp(needle, "");
    accept.push(reg);
    caselessAccept.push(caselessReg);
    
    return (card) =>
        CardViewer.caseSensitive
            ? caselessAccept.every(reg => reg.test(fn(card)))
              && !caselessReject.some(reg => reg.test(fn(card)))
              
            : accept.every(reg => reg.test(fn(card)))
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
CardViewer.equalAnyComparator = (needle, fn = _F.id) => {
    return needle === "any" || !needle
        ? () => true
        : (card) => fn(card) == needle;
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
    else if(typeof needle === "string") {
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

CardViewer.getLimitProperty = () => `${CardViewer.format}_limit`;

CardViewer.Visibilities = {
    Any: "any",
    PublicCustom: 1,
    PrivateCustom: 2,
    TCGExclusive: 3,
    OCGExclusive: 4,
    PublicOrPrivateCustom: 5,
    TCGOrOCG: 6,
};
const checkVisibility = (card, visibility) => {
    if(Array.isArray(visibility)) {
        return visibility.every(vis => checkVisibility(card, vis));
    }
    else if(visibility === "any" || !visibility) {
        return true;
    }
    else if(visibility < 0) {
        // invert
        return !checkVisibility(card, -visibility);
    }
    else if(visibility == CardViewer.Visibilities.PublicCustom || visibility == CardViewer.Visibilities.PrivateCustom) {
        return card.custom == visibility;
    }
    else if(visibility == CardViewer.Visibilities.TCGExclusive) {
        return card.tcg && !card.ocg;
    }
    else if(visibility == CardViewer.Visibilities.OCGExclusive) {
        return card.ocg && !card.tcg
    }
    else if(visibility == CardViewer.Visibilities.PublicOrPrivateCustom) {
        return !!card.custom;
    }
    else if(visibility == CardViewer.Visibilities.TCGOrOCG) {
        return card.ocg || card.tcg;
    }
    else {
        throw Error("Unexpected visibility value " + Visibility);
    }
};

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
    // console.log(query);
    let limitProperty = CardViewer.getLimitProperty();
    let filters = [
        // type filter
        CardViewer.Filters.getFilter(query.type),
        // name filter
        CardViewer.or(
            CardViewer.regexComparator(query.name, _F.propda("name")),
            CardViewer.regexComparator(query.name, _F.propda("also_archetype")),
            CardViewer.exactComparator(query.name, _F.propda("serial_number")),
        ),
        // id filter
        CardViewer.textComparator(query.id, _F.propda("id")),
        // effect filter
        CardViewer.or(
            CardViewer.regexComparator(query.effect, _F.propda("effect")),
            CardViewer.regexComparator(query.effect, _F.propda("pendulum_effect")),
        ),
        // author filter
        CardViewer.textComparator(query.author, _F.propda("username")),
        // limit filter
        // CardViewer.textAnyComparator(query.limit, _F.propda(CardViewer.getLimitProperty())),
        // cards are at 3 unless otherwise specified
        CardViewer.equalAnyComparator(query.limit, card => card[limitProperty] ?? 3),
        // category filter
        (card) =>
            query.category === "any" || !query.category
                ? true
                : query.category == CATEGORY_RETRAIN
                    ? card.exu_retrain
                    : query.category == CATEGORY_ALT_ART
                        ? card.alt_art
                        : true,
        // // retrain filter
        // CardViewer.boolExclusiveComparator(query.retrain, _F.propda("exu_retrain")),
        // visibility filter
        // CardViewer.textAnyComparator(query.visibility, _F.propda("custom")),
        (card) => checkVisibility(card, query.visibility),
    ];
    /*
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
    */
    
    // TODO: change these from snake_case to camelCase
    if(query.main_effect) {
        filters.push(CardViewer.regexComparator(query.main_effect, _F.propda("effect")));
    }
    if(query.pend_effect) {
        filters.push(CardViewer.regexComparator(query.pend_effect, _F.propda("pendulum_effect")));
    }
    if(query.material_line) {
        filters.push(CardViewer.regexComparator(query.material_line, CardViewer.getMaterialLine));
    }
    if(query.hasMaterial) {
        filters.push(card => CardViewer.getMaterialLine(card) !== null);
    }
    
    if(query.notNormal) {
        filters.push((card) => !CardViewer.Filters.isNormal(card));
    }
    if(query.sff) {
        filters.push((card) => card.sff_limit >= 0);
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
    
    if(query.arrowMask) {
        let nArrowMask = parseInt(query.arrowMask, 2);
        filters.push(
            query.exactArrows
                ? CardViewer.exactComparator(query.arrowMask, _F.propda("arrows"))
                : (card) => (parseInt(card.arrows, 2) & nArrowMask) === nArrowMask
        );
        // console.log(query.arrowMask, query.exactArrows);
    }
    
    if(query.level) {
        let level = parseInt(query.level, 10);
        if(!Number.isNaN(level)) {
            filters.push(CardViewer.comparingComparator(
                level,
                query.levelCompare || "equal",
                _F.propda("level")
            ));
        }
    }
    
    if(query.attributeCount) {
        let attributeCount = parseInt(query.attributeCount, 10);
        if(!Number.isNaN(attributeCount)) {
            filters.push(CardViewer.comparingComparator(
                attributeCount,
                query.attributeCountCompare || "equal",
                _F.propda("attribute_count")
            ));
        }
    }
    
    if(query.typeCount) {
        let typeCount = parseInt(query.typeCount, 10);
        if(!Number.isNaN(typeCount)) {
            filters.push(CardViewer.comparingComparator(
                typeCount,
                query.typeCountCompare || "equal",
                _F.propda("type_count")
            ));
        }
    }
    
    if(query.playRate) {
        let playRate = parseFloat(query.playRate) / 100;
        if(!Number.isNaN(playRate)) {
            filters.push(CardViewer.comparingComparator(
                playRate,
                query.playRateCompare || "equal",
                CardViewer.getPlayrate,
            ));
        }
    }
    
    if(query.atk) {
        filters.push(CardViewer.comparingComparator(
            query.atk,
            query.atkCompare || "equal",
            _F.propda("atk")
        ));
    }
    else if(query.atkCompare === "question") {
        filters.push(CardViewer.exactComparator("?", _F.propda("atk")));
    }

    if(query.pendScale) {
        filters.push(CardViewer.comparingComparator(
            query.pendScale,
            query.pendScaleCompare || "equal",
            _F.propda("scale")
        ));
    }
    
    if(typeof query.points !== "undefined") {
        console.log(query.points, query.pointsCompare);
        filters.push(CardViewer.comparingComparator(
            query.points,
            query.pointsCompare || "equal",
            c => c.point_limit ?? 0,
        ));
    }
    
    if(query.def) {
        filters.push(CardViewer.comparingComparator(
            query.def,
            query.defCompare || "equal",
            _F.propda("def")
        ));
    }
    else if(query.defCompare === "question") {
        filters.push((card) =>
            card.def == "?" && !CardViewer.Filters.isLink(card)
        );
        // filters.push(CardViewer.exactComparator("?", _F.propda("def")));
    }
    // query restrictions
    if(query.sortBy === "def") {
        filters.push((card) => card.def != "?" && !CardViewer.Filters.isLink(card));
    }
    
    if(query.customExpression) {
        if(typeof Flowo !== "undefined" && Flowo) {
            // let variables = Object.assign({}, card);
            filters.push((card) => {
                if(!card.flowoCache) {
                    card.flowoCache = {
                        card_type: card.card_type,
                    };
                    if(card.card_type === "Monster") {
                        card.flowoCache.atk = parseInt(card.atk);
                        card.flowoCache.def = parseInt(card.def);
                        card.flowoCache.level = card.level;
                    }
                }
                let result = Flowo.exec(
                    query.customExpression,
                    { variables: card.flowoCache }
                )
                return result;
            });
        }
        else {
            console.error("Flowo is not enabled here");
        }
    }
    
    if(query.date) {
        let isSimpleYear = /^\d{4}/.test(query.date);
        let dateValue;
        if(!isSimpleYear) {
            let [ whole, month, day, year ] = query.date.match(/(\d+)\/(\d+)\/(\d+)/);
            dateValue = new Date(year, month - 1, day);
        }
        const longDateRegex = /^(\d+)-(\d+)-(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        filters.push((card) => {
            if(!card.dateValue) {
                if(longDateRegex.test(card.date)) {
                    // console.log(card.date);
                    let [ whole, month, day, year, ...rest ] = card.date.match(longDateRegex);
                    card.dateValue = new Date(year, month - 1, day);
                }
                else if(card.date || card.updated) {
                    let date = card.date || card.updated;
                    let [ whole, year, month, day ] = date.match(/(\d+)-(\d+)-(\d+)/);
                    card.dateValue = new Date(year, month - 1, day);
                }
                else {
                    card.dateValue = null;
                }
            }
            if(!card.dateValue) {
                return false;
            }
            let cmp = CardViewer.COMPARES[query.dateCompare || "equal"];
            if(isSimpleYear) {
                return cmp(card.dateValue.getFullYear(), query.date);
            }
            else {
                return cmp(card.dateValue.getTime(), dateValue.getTime());
            }
        });
    }
    
    // console.log(filters);
    if(window.DEBUG) {
        return (card) => filters.map(f => [f, f(card)]);
    }
    let filter = (card) => filters.every(filter => filter(card));
    if(exclude) {
        return (card) => filter(card) && !exclude(card);
    }
    
    return filter;
};

const ONE_YEAR_FROM_NOW = Date.now() + 365 * 24 * 60 * 60 * 1000;
const SortByPropertyMap = {
    text: (card) => card.effect.length + (card.pendulum_effect || "").length,
    // add a year from today's date when comparing cards to shove null dated cards to the end
    date: (card) => new Date(card.date ?? ONE_YEAR_FROM_NOW),
};

// put ? values before everything else
const preprocessYugiohStat = str =>
    str === "?" ? -1 : parseInt(str, 10);

const SortByPreprocess = {
    atk: preprocessYugiohStat,
    def: preprocessYugiohStat,
    level: preprocessYugiohStat,
    point_limit: preprocessYugiohStat,
    date: getComparableDate,
};

CardViewer.filter = function (query, exclude = null, sortOptions = query) {
    CardViewer.caseSensitive = query.caseSensitive;
    // console.log(query, query.caseSensitive, CardViewer.caseSensitive);
    let filter = CardViewer.createFilter(query, exclude);
    // console.log("query", CardViewer.caseSensitive, query.caseSensitive, filter.caseSensitive);
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
    
    // console.log("AFTER:", CardViewer.caseSensitive);
    
    let sortByProperty = sortOptions.sortBy;
    if(typeof sortByProperty === "undefined") {
        sortByProperty = CardViewer.Search.config.sortByProperty;
    }
    
    let sortOrder = sortOptions.sortOrder;
    if(typeof sortOrder === "undefined") {
        sortOrder = CardViewer.Search.config.sortOrder;
    }
    
    if(sortByProperty in SortByPropertyMap) {
        sortByProperty = SortByPropertyMap[sortByProperty];
    }
    if(typeof sortByProperty === "function") {
        sortFn = sortByProperty;
    }
    else if(sortByProperty === "playrate") {
        if(CardViewer.Playrates.Summary) {
            sortFn = CardViewer.getPlayrate;
        }
        else {
            sortFn = card => 0;
        }
    }
    else {
        sortFn = _F.propda(sortByProperty);
        if(SortByPreprocess[sortByProperty]) {
            sortFn = _F.compose(SortByPreprocess[sortByProperty], sortFn);
        }
    }
    
    let isAscending;
    switch(sortOrder) {
        case "ascending":
        case undefined:
        case null:
            isAscending = true;
            break;
        case "descending":
            isAscending = false;
            break;
        default:
            console.warn("Unknown sort order", sortOrder);
            isAscending = true;
            break;
    }
    
    cards = _F.sortBy(cards, [ sortFn, isAscending ], _F.propda("name"), _F.propda("custom"));
    
    return cards;
};

CardViewer.addCurrentPageListener = () => {
    CardViewer.Elements.currentPage.on("input", (ev) => {
        let { value } = ev.target;
        CardViewer.Search.currentPage = Math.floor(
            Math.min(CardViewer.Search.pages.length,
                Math.max(0,
                    parseInt(value, 10) - 1
                )
            )
        );
        CardViewer.Search.showPage();
    });
};

window.PREFIX_PATH = "https://limitlesssocks.github.io/EXU-Scrape/";
if(window?.location?.toString()?.includes("localhost")) {
    window.PREFIX_PATH = "http://localhost:8080/";
}
const getResource = (...path) =>
    `${window.PREFIX_PATH}/res/${path.join("/")}.png`;

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
    
    explicitlyUnlimited: getIcon("banlist-explicitly-unlimited"),
    imported: getIcon("banlist-import"),
    notImported: getIcon("banlist-no-import"),
    ocg: getIcon("ocg"),
    altArt: getIcon("alt-art"),
};

let arrowIterateOrder = [
    // top row
    [0b10000000, 0b01000000, 0b00100000],
    // middle row
    [0b00000001, 0b00000000, 0b00010000],
    // bottom row
    [0b00000010, 0b00000100, 0b00001000]
];
let flatArrow = arrowIterateOrder.flat();
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

const setMonsterAttributeIcons = (card, attribute) => {
    if(card.attribute_count > 1) {
        attribute = [ attribute ];
        while(attribute.length < card.attribute_count) {
            attribute.push(attribute[0].clone());
        }
        card.attribute.split("/").forEach((attr, i) => {
            attribute[i].attr("src", getAttribute(attr));
        });
    }
    else if(card.attribute_count === 0) {
        attribute = [];
    }
    else {
        attribute.attr("src", getAttribute(card.attribute));
    }
    
    return attribute;
};

const formatPercent = percent =>
    Math.round(percent * 10000) / 100 + "%";
    
CardViewer.Compose = {
    getImage(card) {
        card.src = card.src || (
            "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
        );
        // window.shittyDebug ??= "";
        let img = $("<img class=img-result>")
            .attr("src", card.src)
            .attr("title", card.id)
            // .on("error", () => console.log("Card image didn't load (might be deleted):", card.id || card.serial_number, card.name) || (window.shittyDebug += card.name + "\n"));
        
        return img;
    },
    
    makeResult(card, options = {}) {
        options = {
            includeId: true,
            ...options
        };
        let outer = $("<div class=result>");

        if(options.includeId) {
            outer.attr("id", "card" + card.id);
        }
        outer.addClass(card.card_type.toLowerCase());
        outer.addClass(card.monster_color.toLowerCase());
    
        if(!card.custom) {
            outer.addClass("tcg");
        }
    
        if(card.exu_ban_import) {
            outer.addClass("unimported");
        }
        
        let isPrivate = card.custom && card.custom > 1;
        if(isPrivate) {
            outer.addClass("private");
        }
        
        if(card.pendulum) {
            outer.addClass("pendulum");
        }
        
        let inner = $("<div class=result-inner>");
        
        outer.append(inner);
        
        return { outer, inner };
    },
    
    getAttribute(card) {
        let attribute = $("<img class=result-attribute>");
        if(card.card_type === "Monster") {
            attribute = setMonsterAttributeIcons(card, attribute);
        }
        else {
            attribute.attr("src", getAttribute(card.card_type));
        }
        return attribute;
    },
    
    getLevelIndicator(card) {
        return {
            Normal: "Level ",
            Effect: "Level ",
            Ritual: "Level ",
            Fusion: "Level ",
            Synchro: "Level ",
            Xyz: "Rank ",
            Link: "Link-",
        }[card.monster_color];
    },
    
    getMarking(card, options = {}) {
        options = {
            onlyImage: false,
            ...options
        };
        let marking = $("<div class=markings>");
        
        if(card.card_type === "Monster") {
            let star = {
                Normal: "Normal",
                Effect: "Normal",
                Ritual: "Normal",
                Fusion: "Normal",
                Synchro: "Normal",
                Xyz: "Xyz",
                Link: null,
            }[card.monster_color];
            
            if(star) {
                for(let i = 0; i < card.level; i++) {
                    marking.append(
                        $("<img class=star>").attr("src", getStar(star))
                    );
                }
            }
            else if(!options.onlyImage) {
                let levelIndicator = CardViewer.Compose.getLevelIndicator(card);
                marking.append(levelIndicator + card.level);
            }
        }
        else {
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
        else if(card.alt_art) {
            importMarker.attr("src", BANLIST_ICONS.altArt);
        }

        if(!card.custom && !card.tcg && card.ocg) {
            importMarker.addClass("wide");
            importMarker.attr("src", BANLIST_ICONS.ocg);
        }
        
        let limit = CardViewer.getLimitProperty();
        if(card[limit] !== 3) {
            banMarker.attr("src", BANLIST_ICONS[card[limit]]);
        }
        
        if(card.point_limit) {
            marking.append($("<div>").append($("<span class=point-limit>").text(card.point_limit)));
        }
        if(importMarker.attr("src")) {
            marking.append($("<div>").append(importMarker));
        }
        if(banMarker.attr("src")) {
            marking.append($("<div>").append(banMarker));
        }
        
        return marking;
    },
    
    getImageWithIcons(card) {
        let img = CardViewer.Compose.getImage(card);
        let attribute = CardViewer.Compose.getAttribute(card);
        let marking = CardViewer.Compose.getMarking(card);
        
        let imageHolder = $("<div class=result-img-holder>");
        imageHolder.append(
            $("<div>").append(img),
            $("<div>").append(attribute, marking),
        );
        return imageHolder;
    },

    getRetrainText(card) {
        let retrain = RetrainMap[card.id];
        let retrainCard = CardViewer.Database.cards[retrain];
        if(retrain && retrainCard) {
            let retrainText = "Retrain of: " + retrainCard.name;
            // retrainText += " (Id #" + retrain + ")";
            let link = $("<a>").text(retrainText);
            if(CardViewer.linkRetrain) {
                link.attr("href", "#card" + retrain)
            }
            return $("<p class=retrainText>").append($("<i>").append(
                link
            ));
        }
    },
    
    getAllText(card, options = {}) {
        options = {
            showRetrainText: true,
            ...options
        };
        let effect = card.effect;
        if(card.pendulum) {
            effect = effect = "Scale = " + card.scale + "\n[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        }
    
        // effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
        effect = effect.replace(/\r|\r?\n/g, "\n");
        effect = [$("<p>").text(effect).addClass("effect-text")];

        if(options.showRetrainText) {
            let retrainText = CardViewer.Compose.getRetrainText(card);
            effect.push(retrainText);
        }

        return effect;
    },
    
    getIdHeader(card) {
        let textHolder = $("<span>")
            .text(card.id);
        let id = $("<h4 class=result-id>")
            .append(textHolder);
        return id;
    },

    getInfoButton(card) {
        let infoButton = $("<button class='small info-inline' title='Show more info'>?</button>");
        let promptLines = [
            [ "DB ID", card.id ],
        ];
        if(card.serial_number) {
            promptLines.push([ "Konami Passcode", card.serial_number ]);
        }
        if(card.submission_source) {
            promptLines.push([
                $("<a>").text("DB Submission Source").attr("href", `https://www.duelingbook.com/deck?id=${card.submission_source}`).attr("target", "_blank"),
                card.submission_source,
            ]);
        }
        let dbCardLink = `https://www.duelingbook.com/card?id=${card.id}`;
        promptLines.push([
            $("<a>").text("DB Link").attr("href", dbCardLink).attr("target", "_blank"),
            $("<code>").text(`[${card.name}](<${dbCardLink}>)`),
        ]);
        let exuCardLink = `https://limitlesssocks.github.io/EXU-Scrape/card?id=${card.id}`;
        promptLines.push([
            $("<a>").text("EXU Link").attr("href", exuCardLink).attr("target", "_blank"),
            $("<code>").text(`[${card.name}](${exuCardLink})`),
        ]);
        
        promptLines = promptLines
            .map(line => $("<tr>").append(...line.map(el => $("<td>").append(el))))
            .reduce((p, c) => p.add(c), $(""));
        
        promptLines = $("<table class=spacey>").append(promptLines);
        let infoPrompt = new Prompt("Card Details", promptLines, ["OK"], "large", "auto");
        infoButton.click(() => {
            infoPrompt.deploy();
        });
        return infoButton;
    },

    getStats(card) {
        let stats = $("<div>");

        if(card.card_type === "Monster") {
            let kind = [];
            let levelIndicator = CardViewer.Compose.getLevelIndicator(card);
            
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
            }
            else {
                stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
            }
        }
        else {
            stats.append($("<p>").text(`${card.type} ${card.card_type}`));
        }

        return stats;
    },

    getPlayrateSummary(card) {
        if(!CardViewer.Playrates.Summary) {
            return;
        }
        let indicator = card.serial_number || card.id;
        let playrateInfo = CardViewer.Playrates.Summary[indicator];
        if(!playrateInfo) {
            return;
        }
        let { mode, modeRatio, playedAt, playRate } = playrateInfo;
        let playRatio = mode + " in " + formatPercent(modeRatio);
        playRate = formatPercent(playRate);
        
        return $("<h4 class=playrate-summary>").append(
            $("<em>").text("Playrate: "),
            `${playRate} (${playRatio})`,
        );
    },

    getNameHeader: card => $("<h3 class=result-name>").text(card.name),
    getLinkArrows: card => card.card_type === "Monster" && card.monster_color === "Link"
        ? $(
            "<p class=link-arrows>" +
            getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
            "</p>"
        )
        : undefined,
    getAuthorHeader: card => $("<h4 class=result-author>").text(card.username),
    getFloatingDateAddedHeader(card) {
        let dateAdded = $("<h4 class=result-date>");
        if(card.date) {
            let action = card.custom && card.custom > 0 ? "Integrated " : "Released ";
            dateAdded.text(action + formatDateAdded(card.date));
        }
        return dateAdded;
    },
};

CardViewer.composeResultSmall = function (card) {
    let name = CardViewer.Compose.getNameHeader(card);
    
    let { outer, inner } = CardViewer.Compose.makeResult(card);
    outer.addClass("small");
    
    inner.append(
        name,
        CardViewer.Compose.getImageWithIcons(card)
    );
    return outer;
};

CardViewer.composeResult = function (card) {
    let { outer, inner } = CardViewer.Compose.makeResult(card);
    
    let name = CardViewer.Compose.getNameHeader(card);
    if(outer.hasClass("private")) {
        name.append($("<i>").text(" (private)"));
    }
    
    let id = CardViewer.Compose.getIdHeader(card);
    id.append(CardViewer.Compose.getInfoButton(card));
    
    inner.append(
        id,
        name,
        CardViewer.Compose.getFloatingDateAddedHeader(card),
        CardViewer.Compose.getLinkArrows(card),
        CardViewer.Compose.getAuthorHeader(card),
        CardViewer.Compose.getStats(card)
    );
    
    inner.append(
        $("<table>").append(
            $("<tr>").append(
                $("<td>").append(CardViewer.Compose.getImageWithIcons(card)),
                $("<td class=result-effect>").append(CardViewer.Compose.getAllText(card))
            )
        )
    );
    
    inner.append(CardViewer.Compose.getPlayrateSummary(card));

    return outer;
};

CardViewer.composeResultDense = function (card) {
    let { outer, inner } = CardViewer.Compose.makeResult(card);
    outer.addClass("dense-result");
    
    // inner.append($("<img class=small-image>").attr("src", card.src));
    inner.append(CardViewer.Compose.getImage(card).addClass("small-image"));
    inner.append(CardViewer.Compose.getAttribute(card));

    let stats = CardViewer.Compose.getStats(card);
    let reformattedStats = [...stats.children()]
        .map(e => $(e).text())
        .join(" · ");

    inner.append($("<div>").append(
        CardViewer.Compose.getNameHeader(card),
        $("<p>").text(reformattedStats),
    ));
    /*
    inner.append($("<div class=flex-item-right>").append(
        // $("<h4>").text(CardViewer.Compose.getIdHeader(card).text()),
        $("<h4>").text(CardViewer.Compose.getFloatingDateAddedHeader(card).text()),
        CardViewer.Compose.getPlayrateSummary(card)
    ));
    */

    outer.click(() => {
        outer.replaceWith(CardViewer.composeResult(card));
    });

    return outer;
};

CardViewer.getPlayrateWarned = false;
CardViewer.getPlayrate = card => {
    if(!CardViewer.Playrates.Summary) {
        if(!CardViewer.getPlayrateWarned) {
            console.warn("Warning: Attempting to get card playrate without a playrate summary connected (You might need `CardViewer.Playrates.Summary = await fetch(\"./data/playrate-summary.json\").then(req => req.json());` first!)");
            CardViewer.getPlayrateWarned = true;
        }
        return;
    }
    let indicator = card.serial_number || card.id;
    return CardViewer.Playrates.Summary[indicator]?.playRate ?? 0;
};

CardViewer.setUpDefaultElements = function () {
    CardViewer.Elements.cardType = $("#cardType");
    CardViewer.Elements.cardLimit = $("#cardLimit");
    CardViewer.Elements.cardAuthor = $("#cardAuthor");
    CardViewer.Elements.search = $("#search");
    CardViewer.Elements.results = $("#results");
    CardViewer.Elements.autoSearch = $("#autoSearch");
    CardViewer.Elements.cardName = $("#cardName");
    CardViewer.Elements.resultCount = $("#resultCount");
    CardViewer.Elements.cardDescription = $("#cardDescription");
    CardViewer.Elements.currentPage = $(".currentPage");
    CardViewer.Elements.pageCount = $(".pageCount");
    CardViewer.Elements.nextPage = $(".nextPage");
    CardViewer.Elements.previousPage = $(".previousPage");
    CardViewer.Elements.resultNote = $("#resultNote");
    CardViewer.Elements.cardId = $("#cardId");
    CardViewer.Elements.cardCategory = $("#cardCategory");
    CardViewer.Elements.cardVisibility = $("#cardVisibility");
    CardViewer.Elements.ifMonster = $(".ifMonster");
    CardViewer.Elements.ifSpell = $(".ifSpell");
    CardViewer.Elements.ifTrap = $(".ifTrap");
    CardViewer.Elements.ifLink = $(".ifLink");
    CardViewer.Elements.ifPoints = $(".ifPoints");
    CardViewer.Elements.ifPendulum = $(".ifPendulum");
    CardViewer.Elements.cardSpellKind = $("#cardSpellKind");
    CardViewer.Elements.cardTrapKind = $("#cardTrapKind");
    CardViewer.Elements.monsterStats = $("#monsterStats");
    CardViewer.Elements.spellStats = $("#spellStats");
    CardViewer.Elements.trapStats = $("#trapStats");
    CardViewer.Elements.cardLevel = $("#cardLevel");
    CardViewer.Elements.cardMonsterCategory = $("#cardMonsterCategory");
    CardViewer.Elements.cardMonsterAbility = $("#cardMonsterAbility");
    CardViewer.Elements.cardMonsterType = $("#cardMonsterType");
    CardViewer.Elements.cardMonsterAttribute = $("#cardMonsterAttribute");
    CardViewer.Elements.cardATK = $("#cardATK");
    CardViewer.Elements.cardDEF = $("#cardDEF");
    CardViewer.Elements.cardPendScale = $("#cardPendScale");
    CardViewer.Elements.cardLevelCompare = $("#cardLevelCompare");
    CardViewer.Elements.cardATKCompare = $("#cardATKCompare");
    CardViewer.Elements.cardDEFCompare = $("#cardDEFCompare");
    CardViewer.Elements.cardPendScaleCompare = $("#cardPendScaleCompare");
    CardViewer.Elements.playRate = $("#cardPlayRate");
    CardViewer.Elements.playRateCompare = $("#cardPlayRateCompare");
    CardViewer.Elements.cardPoints = $("#cardPoints");
    CardViewer.Elements.cardPointsCompare = $("#cardPointsCompare");
    // CardViewer.Elements.toTopButton = $("#totop");
    CardViewer.Elements.saveSearch = $("#saveSearch");
    CardViewer.Elements.clearSearch = $("#clearSearch");
    CardViewer.Elements.searchSortBy = $("#searchSortBy");
    CardViewer.Elements.searchSortOrder = $("#searchSortOrder");
    CardViewer.Elements.includeCustoms = $("#includeCustoms");
    CardViewer.Elements.includeYcg = $("#includeYcg");
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
    CardViewer.Elements.cardMonsterCategory.change(function () {
        let val = CardViewer.Elements.cardMonsterCategory.val();
        CardViewer.Elements.ifPendulum.toggle(val === "pendulum");
        CardViewer.Elements.ifLink.toggle(val === "link");
    });
    CardViewer.Elements.cardMonsterCategory.change();
    CardViewer.Elements.cardType.change();
    CardViewer.toggleToFormat();
};

CardViewer.composeStrategy = CardViewer.composeResult;

CardViewer.demonstrate = function (query) {
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Search.showPage();
};

CardViewer.setUpFilterByToggle = function (filterByToggle, filterBy, inner) {
    inner.val("");
    filterByToggle.click(() => {
        filterByToggle.toggleClass("toggled");
        filterBy.find(".toggleable").toggle();
        
        if(filterByToggle.hasClass("toggled")) {
            filterBy.css("width", "70%");
        }
        else {
            filterBy.css("width", "auto");
        }
    });
};

CardViewer.setUpArrowToggle = function () {
    $(".arrow-button").click(function () {
        $(this).toggleClass("toggled");
    });
};

CardViewer.elementChanged = function () {
    if(CardViewer.autoSearch) {
        CardViewer.submit();
    }
};

CardViewer.setUpAllInputs = function () {
    let allInputs = CardViewer.Elements.searchParameters.find("select, input, #linkTable button");
    for(let el of allInputs) {
        $(el).change(CardViewer.elementChanged);
        $(el).keypress((event) => {
            if(event.originalEvent.code === "Enter") {
                CardViewer.submit();
            }
        });
        if(el.tagName === "BUTTON") {
            $(el).click(CardViewer.elementChanged);
        }
    }
    CardViewer.Elements.clearSearch.click(() => {
        for(let el of allInputs) {
            el = $(el);
            if(el.is("select")) {
                let defaultSelection = el.find("[selected=selected]");
                if(defaultSelection.length) {
                    el.val(defaultSelection.val());
                }
                else {
                    el.val(el.children().first().val());
                }
            }
            else if(el.is("input[type=checkbox]")) {
                el.prop("checked", !!el.attr("checked"));
            }
            else {
                el.val("");
            }
        }
        CardViewer.elementChanged();
        CardViewer.Elements.cardType.change();
        CardViewer.Elements.cardMonsterCategory.change();
    });
    return allInputs;
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

const readFile = accept => new Promise((resolve, reject) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = accept;

    fileInput.onchange = ev => {
        const file = ev.target.files[0];
        const reader = new FileReader();

        reader.onload = ev => resolve(ev.target.result);

        reader.readAsText(file);
    };

    fileInput.click();
});
const readJSONFile = () => readFile(".json").then(JSON.parse);

let passcodeToDbIdCache = null;
const passcodeToDbId = passcode => {
    if(!passcodeToDbIdCache) {
        passcodeToDbIdCache = {};
        for(let card of Object.values(CardViewer.Database.cards)) {
            let reportedPasscode = card.serial_number;
            if(reportedPasscode) {
                let paddedPasscode = reportedPasscode.padStart(8, "0");
                passcodeToDbIdCache[reportedPasscode] ??= card.id;
                passcodeToDbIdCache[paddedPasscode] ??= card.id;
            }
        }
    }
    return passcodeToDbIdCache[passcode.toString()];
};

// TODO: make this not hang the webpage
CardViewer.BaseFormat = {
    cards: null,
    name: null,
    playrates: null,
};
CardViewer.monkeyPatchFormat = formatData => {
    if(!CardViewer.BaseFormat.cards) {
        CardViewer.BaseFormat.cards = {...CardViewer.Database.cards};
        CardViewer.BaseFormat.name = CardViewer.getCurrentFormat();
        CardViewer.BaseFormat.playrates = CardViewer.Playrates.Summary;
    }
    let {
        name,
        passcodes,
        banlist,
        customs,
        playrates,
    } = formatData;
    
    CardViewer.Playrates.Summary = playrates;
    
    banlist ??= {};
    customs ??= [];
    
    CardViewer.Database.setInitial({});
    for(let [ id, card ] of Object.entries(CardViewer.BaseFormat.cards)) {
        if(card.custom) {
            // ignore source format's custom
            continue;
        }
        if(!passcodes || passcodes.some(passcode => passcode == card.serial_number)) {
            CardViewer.Database.cards[id] = {
                ...card,
                exu_limit: banlist[card.serial_number] ?? 3
            };
        }
    }
    
    for(let card of customs) {
        let idMod = parseInt(card.id, 10);
        idMod = idMod - idMod % 100000;
        let src = `https://www.duelingbook.com/images/custom-pics/${idMod}/${card.id}.jpg`;
        if(typeof card.pic !== "undefined" && card.pic != "1") {
            src += "?version=" + card.pic;
        }
        CardViewer.Database.cards[card.id] = {
            src,
            ...card,
            exu_limit: banlist[card.id] ?? 3,
        };
    }
};

CardViewer.restoreBaseFormat = (baseFormat) => {
    CardViewer.Database.cards = {...baseFormat.cards};
    CardViewer.Playrates.Summary = baseFormat.playrates; 
};

CardViewer.getCurrentFormat = (defaultFormat = "exu") => {
    let selectedFormat = CardViewer.SaveData.get("selected-format");
    if(selectedFormat === undefined) {
        CardViewer.SaveData.set("selected-format", defaultFormat);
        return defaultFormat;
    }
    return selectedFormat;
};
// prefer to call deployFormat directly
CardViewer.setCurrentFormat = (format = "exu") => {
    CardViewer.SaveData.set("selected-format", format);
};
// TODO: do not hardcode relative to base directory
const FormatSources = {
    exu: "./db.json",
    exulegacy: "./db-legacy.json",
};
// TODO: don't hardcode
const GenesysPoints = {
    "82":"5","175":"100","185":"100","188":"50","209":"100","226":"100","259":"10","328":"60","329":"60","330":"60","331":"60","332":"60","333":"60","470":"15","486":"70","526":"5","528":"7","549":"100","589":"1","612":"40","620":"40","630":"100","654":"50","662":"10","680":"33","742":"100","758":"100","800":"1","864":"33","884":"27","989":"3","1074":"100","1091":"100","1138":"20","1168":"10","1174":"45","1207":"100","1300":"7","1340":"7","1408":"3","1432":"40","1559":"30","1578":"100","1602":"33","1647":"33","1651":"5","1653":"3","1673":"40","1674":"100","1752":"100","1852":"40","1884":"91","1892":"20","1912":"33","1916":"21","1940":"10","1960":"100","1961":"40","2102":"33","2113":"100","2116":"25","2210":"100","2219":"100","2243":"88","2272":"100","2280":"1","2330":"100","2382":"100","2450":"75","2453":"3","2461":"3","2468":"3","2512":"75","2513":"100","2551":"10","2563":"100","2575":"100","2578":"1","2620":"33","2685":"75","2694":"95","2784":"100","2797":"50","2855":"10","2878":"1","2908":"10","2951":"50","2952":"20","2966":"33","3055":"10","3057":"50","3065":"100","3097":"40","3212":"91","3249":"95","3346":"30","3364":"100","3367":"27","3368":"5","3460":"7","3498":"50","3533":"40","3571":"50","3609":"100","3633":"60","3644":"10","3650":"100","3651":"100","3754":"100","3764":"100","3802":"10","3805":"33","3840":"100","3856":"65","3859":"100","3895":"87","3902":"7","3913":"7","3914":"5","3962":"20","4088":"60","4092":"100","4108":"10","4137":"33","4191":"33","4217":"100","4235":"33","4290":"100","4309":"100","4349":"100","4384":"20","4432":"3","4443":"94","4476":"3","4532":"100","4597":"100","4598":"100","4599":"100","4939":"33","4944":"20","4971":"5","4974":"5","5001":"33","5035":"75","5068":"11","5123":"100","5167":"80","5168":"1","5188":"33","5235":"33","5238":"33","5311":"66","5518":"100","5521":"50","5528":"33","5543":"40","5576":"100","5632":"81","5671":"40","5684":"100","5816":"100","5829":"33","5849":"1","5873":"7","5874":"7","5875":"7","5876":"7","5892":"1","5982":"1","6032":"70","6149":"100","6263":"33","6274":"1","6321":"50","6332":"50","6339":"5","6343":"33","6357":"40","6376":"1","6403":"50","6409":"100","6435":"100","6448":"100","6481":"100","6487":"50","6534":"60","6573":"31","6587":"1","6591":"1","6593":"1","6623":"91","6652":"100","6654":"100","6668":"7","6697":"70","6704":"100","6770":"80","6774":"20","6785":"50","6833":"100","6857":"100","6886":"27","6951":"10","6964":"100","6993":"5","7015":"3","7085":"1","7098":"100","7114":"50","7175":"5","7189":"13","7192":"100","7199":"1","7217":"100","7228":"50","7229":"33","7232":"20","7308":"33","7309":"1","7410":"7","7420":"1","7421":"100","7447":"100","7510":"77","7514":"1","7542":"10","7567":"3","7590":"15","7591":"7","7592":"7","7594":"100","7601":"1","7608":"100","7720":"100","7730":"5","7739":"40","7778":"1","7779":"5","7817":"40","7828":"10","7851":"33","7896":"100","7910":"5","7917":"10","7939":"10","7999":"40","8007":"85","8030":"20","8031":"60","8118":"40","8127":"1","8131":"100","8173":"33","8197":"5","8198":"5","8216":"5","8227":"33","8231":"20","8233":"1","8257":"100","8270":"33","8330":"50","8344":"75","8367":"66","8369":"20","8372":"1","8375":"33","8382":"50","8422":"90","8445":"33","8452":"100","8492":"33","8504":"15","8509":"1","8514":"100","8521":"33","8532":"33","8560":"1","8648":"1","8652":"20","8733":"20","8747":"100","8750":"85","8845":"33","8866":"10","8927":"5","8928":"1","8978":"20","8980":"100","9019":"100","9141":"100","9157":"5","9189":"20","9192":"50","9201":"15","9269":"33","9370":"20","9402":"70","9403":"10","9474":"10","9490":"10","9501":"67","9550":"3","9551":"7","9552":"3","9553":"7","9615":"100","9636":"3","9637":"3","9638":"3","9639":"7","9853":"3","9882":"33","9892":"100","9910":"3","9923":"100","10135":"100","10148":"10","10208":"33","10213":"33","10230":"33","10252":"20","10344":"5","10345":"10","10372":"5","10374":"15","10375":"5","10376":"3","10444":"40","10522":"10","10523":"100","10568":"100","10569":"100","10596":"7","10601":"20","10621":"33","10654":"33","10658":"60","10676":"20","10715":"3","10716":"10","10717":"20","10808":"3","10846":"50","10855":"33","10865":"93","10868":"10","10879":"10","10880":"10","10929":"40","10952":"10","10953":"10","10954":"10","10955":"10","10956":"10","10957":"33","10958":"30","11054":"3","11080":"20","11089":"20","11095":"1","11162":"33","11306":"40","11322":"3","11323":"7","11480":"40","11553":"33","11560":"1","11627":"20","11630":"7","11917":"85","12034":"3","12037":"1","12064":"3","12066":"5","12068":"3","12074":"33","12100":"20","12102":"33","12114":"33","12119":"33","12234":"30","12270":"20","12297":"5","12298":"5","12300":"20","12359":"40","12416":"33","12421":"50","12436":"33","12543":"3","12574":"66","12575":"33","12578":"33","12579":"33","12634":"100","12678":"91","12683":"20","12866":"33","12973":"50","12974":"50","12975":"50","12976":"50","13003":"50","13008":"20","13016":"20","13021":"50","13031":"33","13096":"55","13103":"1","13104":"1","13105":"50","13106":"50","13316":"5","13319":"33","13320":"20","13321":"30","13322":"30","13324":"3","13325":"30","13326":"30","13343":"33","13353":"20","13356":"20","13439":"60","13459":"5","13465":"5","13468":"10","13479":"15","13485":"5","13498":"10","13591":"30","13623":"20","13633":"97","13646":"33","13656":"13","13664":"33","13672":"5","13762":"3","13766":"25","13793":"10","13817":"5","13845":"3","13852":"10","13869":"33","13875":"10","13878":"20","13895":"15","13910":"1","14094":"33","14111":"10","14121":"33","14127":"100","14147":"33","14178":"100","14325":"33","14332":"85","14411":"20","14412":"5","14416":"33","14447":"10","14448":"33","14459":"33","14462":"100","14463":"33","14587":"33","14591":"5","14592":"3","14595":"5","14612":"40","14620":"10","14622":"10","14727":"100","14740":"5","14784":"1","14789":"33","14795":"33","14806":"10","14897":"10","14973":"100","15011":"50","15012":"1","15022":"33","15030":"33","15035":"33","15038":"20","15048":"33","15052":"100","15053":"50","15054":"50","15084":"33","15322":"40","15324":"20","15330":"50","15438":"33","15447":"5","15448":"5","15449":"3","15456":"25","15464":"10","15470":"20","15471":"20","15474":"33","15477":"25","15490":"3","15493":"100","15494":"7","15515":"10","15593":"33","15614":"91","15637":"33","15648":"1","15702":"5","15722":"7","15728":"20","15729":"33","15737":"10","15748":"33","15753":"33","15756":"33","15777":"30","15861":"20","15863":"20","15864":"25","15866":"20","15867":"20","15892":"33","15895":"33","15902":"3","15904":"3","15932":"40","15977":"40","15987":"22","15999":"3","16004":"5","16040":"33","16131":"65","16154":"100","16179":"7","16182":"20","16269":"60","16270":"60","16333":"33","16334":"33","16353":"10","16432":"7","16437":"10","16438":"33","16439":"20","16440":"20","16442":"40","16445":"20","16480":"20","16483":"5","16484":"10","16501":"20","16504":"5","16505":"20","16564":"33","16793":"70"
};
CardViewer.isPointsFormat = (format = CardViewer.getCurrentFormat()) => {
    return format === "genesys";
};
CardViewer.toggleToFormat = (format = CardViewer.getCurrentFormat()) => {
    // TODO: generic to "points format" options
    console.log("Toggling current format", format);
    CardViewer.Elements.ifPoints?.toggle(CardViewer.isPointsFormat(format));
    if(CardViewer.Elements.includeYcg?.is(":visible")) {
        CardViewer.Elements.includeYcg.prop("checked", format === "tcgocg" || format === "genesys");
    }
};
CardViewer.deployFormat = async (format) => {
    if(!format) {
        throw new Error("Expected format for CardViewer.deployFormat");
    }
    console.log("Deploying format", format);
    // exu, exulegacy, tcg, or perhaps a custom upload
    let oldFormat = CardViewer.getCurrentFormat();
    if(oldFormat === format) {
        console.warn("no-op setting format `" + format + "` when already at that format");
    }
    CardViewer.toggleToFormat(format);
    if(format === "tcgocg") {
        CardViewer.monkeyPatchFormat({
            name: "TCG/OCG",
            // passcodes: ,
            // banlist: , // TODO
            // customs: ,
            // playrates: ,
        });
        for(let card of Object.values(CardViewer.Database.cards)) {
            card.exu_limit = card.tcg_limit;
        }
    }
    else if(format === "genesys") {
        CardViewer.monkeyPatchFormat({
            name: "Genesys",
            // passcodes: ,
            // banlist: , // TODO
            // customs: ,
            // playrates: ,
        });
        
        for(let card of Object.values(CardViewer.Database.cards)) {
            card.point_limit = GenesysPoints[card.id] ?? 0;
            // TODO: allow banned to coexist?
            if(card.monster_color === "Link" || card.pendulum) {
                delete CardViewer.Database.cards[card.id];
            }
        }
    }
    else {
        if(CardViewer.BaseFormat.name === format) {
            CardViewer.restoreBaseFormat(CardViewer.BaseFormat);
        }
        else {
            console.log(format);
            let source = FormatSources[format];
            if(!source) {
                throw new Error("Cannot find source " + format);
            }
            await CardViewer.Database.initialReadAll(source);
        }
    }
    CardViewer.setCurrentFormat(format);
};

// options.monkeyPatch expects either a boolean or a function
// if a function, it is treated as a callback for when data is uploaded
CardViewer.attachGlobalSearchOptions = (el, options = {}) => {
    // initializations on page load (when attached)
    if(options.denseToggle) {
        CardViewer.baseComposeStrategy ??= CardViewer.composeStrategy;
        let isDense = CardViewer.SaveData.get("dense-view");
        if(isDense === undefined) {
            CardViewer.SaveData.set("dense-view", false);
            isDense = false;
        }
        if(isDense) {
            CardViewer.composeStrategy = CardViewer.composeResultDense;
        }
    }

    // prompt behavior for the button
    let optionsPrompt = new Prompt("Options", () => {
        let base = $("<div>");
        /*.css({
            display: "flex",
            gap: "10px",
            flexDirection: "column",
            alignItems: "center",
        });*/
        let optionsGrid = $(`<div class="options-grid"></div>`);
        
        if(options.formatSelect) {
            let formatSelect = $(`
                <label class="horizontal-label">
                    <div class="label-text">Select format:</div>
                    <div class="label-value">
                        <select class="selected-format">
                            <option value="exu">EXU</option>
                            <option value="tcgocg">TCG/OCG</option>
                            <option value="genesys">Genesys</option>
                            <option value="exulegacy">EXU Legacy</option>
                        </select>
                    </div>
                </label>
            `);
            let select = formatSelect.find(".selected-format");
            select.val(CardViewer.getCurrentFormat());
            select.change(async ev => {
                let { value } = ev.target;
                await CardViewer.deployFormat(value);
                if(typeof options.formatSelect === "function") {
                    options.formatSelect(value);
                }
            });
            optionsGrid.append(formatSelect);
        }
        
        if(options.monkeyPatch) {
            // TODO: use a templates file
            let monkeyPatchUpload = $(`
                <label class="horizontal-label">
                    <div class="label-text">Upload format:</div>
                    <div class="label-value small square-button">
                        <div class="toggleIcon">
                            <img src="./res/upload.png"/>
                        </div>
                    </div>
                </label>
            `);
            monkeyPatchUpload.on("click", async () => {
                let data = await readJSONFile();
                CardViewer.monkeyPatchFormat(data);
                if(typeof options.monkeyPatch === "function") {
                    options.monkeyPatch(data);
                }
            });
            optionsGrid.append(monkeyPatchUpload);
        }

        if(options.denseToggle) {
            let denseToggleSwitch = $(`
                <label class="horizontal-label">
                    <div class="label-text">Compact view:</div>
                    <div class="label-value toggle-switch round">
                        <input type="checkbox">
                        <span class="slider"></span>
                    </div>
                </label>
            `);

            denseToggleSwitch.find("input")
                .prop("checked", CardViewer.SaveData.get("dense-view"))
                .change(ev => {
                    CardViewer.SaveData.set("dense-view", ev.target.checked);
                    if(ev.target.checked) {
                        CardViewer.composeStrategy = CardViewer.composeResultDense;
                    }
                    else {
                        CardViewer.composeStrategy = CardViewer.baseComposeStrategy;
                    }
                    if(typeof options.denseToggle === "function") {
                        options.denseToggle(ev.target.checked);
                    }
                });
            optionsGrid.append(denseToggleSwitch);
        }

        if(optionsGrid.children().length) {
            base.append(optionsGrid);
        }
        // <div class="square-button"><div class=toggleIcon><img src="./res/upload.png"/></div></div>


        return base;
    }, [ "Done"], "auto");
    el.click(() => {
        // deploy prompt
        optionsPrompt.deploy()
            .then(([buttonIdx, prompt, body]) => {
                // done
            })
        // setTimeout(() => optionsPrompt.close(true), 1000);
    })
    /*
    const uploadFormatButton = document.getElementById("uploadFormat");
    uploadFormatButton.addEventListener("click", async function () {
        let data = await readJSONFile();
        CardViewer.monkeyPatchFormat(data);
        lastInput = null;
        changeInput();
    });
    */
};

CardViewer.initialDatabaseSetup = async () => {
    await CardViewer.deployFormat(CardViewer.getCurrentFormat());
};

CardViewer.getMaterialLine = card => {
    if(!CardViewer.Filters.isExtraDeck(card)) {
        return null;
    }
    // DuelingBook is not consistent in how it delineates lines. Since it uses \r sometimes, /\r?\n/ isn't an option.
    let lines = card.effect.split(/[\r\n]+/);
    if(CardViewer.Filters.isNonEffect(card)) {
        return lines[0];
    }
    if(lines[0].includes(" / ") || lines.length === 1) {
        lines = card.effect.split(" / ");
    }
    if(lines.length === 1) {
        return null;
    }
    let firstIndex = 0;
    while(firstIndex < lines.length) {
        let line = lines[firstIndex];
        // pretty hacky.
        if(line.startsWith("Must") || line.startsWith("Cannot") || line.startsWith("This")) {
            return null;
        }

        if(!line.startsWith("(")) {
            break;
        }

        firstIndex++;
    }
    return lines[firstIndex] || null;
};

const BanlistGradeFilters = [
    CardViewer.Filters.isNormal,
    CardViewer.Filters.isEffect,
    CardViewer.Filters.isRitual,
    CardViewer.Filters.isFusion,
    CardViewer.Filters.isSynchro,
    CardViewer.Filters.isXyz,
    // _F.propda("is_link"),
    CardViewer.Filters.isLink,
    CardViewer.Filters.isSpell,
    CardViewer.Filters.isTrap,
];
CardViewer.naturalBanlistGrade = card =>
    BanlistGradeFilters.findIndex(filter => filter(card));

CardViewer.naturalBanlistSortFunction = (a, b) => {
    let diff = CardViewer.naturalBanlistGrade(a) - CardViewer.naturalBanlistGrade(b);
    if(diff) {
        return diff;
    }
    else {
        return (a.name > b.name) - (a.name < b.name);
    }
};

CardViewer.naturalBanlistSort = page =>
    page.sort(CardViewer.naturalBanlistSortFunction);

CardViewer.integrateNameChanges = nameChanges => {
    for(let { before, after } of nameChanges) {
        let oldId = CardViewer.Database.cardsIdsByName[before.toLowerCase()];
        if(oldId) {
            CardViewer.Database.cardsIdsByName[after.toLowerCase()] = oldId;
            CardViewer.Database.cards[oldId].name = after;
        }
        else {
            console.warn("Could not find ID for ", before, "(and it's supposed to correspond to", after, ")");
        }
    }
};

CardViewer.integrateBanlistChanges = banlistChanges => {
    for(let [ limit, cards ] of Object.entries(banlistChanges)) {
        cards.forEach(cardData => {
            let { name, newStatus } = cardData;
            let card = CardViewer.getCardByName(name);
            if(card) {
                card[CardViewer.getLimitProperty()] = newStatus;
            }
        });
    }
};

/*
 * there's no debt like tech debt
 * like no debt i know
 * everything about it is revealing
 * everything the deadline will allow
 * nowhere can you get that dreadful feeling
 * when you are appending that extra line
 */
CardViewer.savePlayedCustoms = async (baseQuery = "played custom", prefix=["EX2", "Save"]) => {
    let [ prefixHead, prefixName ] = prefix;
    // this code is bad for multiple reasons
    // chiefest being condenseQuery/naturalInputToQuery do not exist in this file
    // and this requires zip.js, which is not a permanent include in any file page
    /*
    <script type="module">
        import { BlobWriter, TextReader, ZipWriter } from "https://unpkg.com/@zip.js/zip.js@2.7.72/index.min.js";
        window.zip = {
            BlobWriter, TextReader, ZipWriter,
        };
    </script>
    */
    // i am too tired to do this correctly; i wish to be done
    const simpleFilter = text =>
        CardViewer.filter(
            condenseQuery(query = naturalInputToQuery(text)),
            null,
            query.reduce((p, c) => ({...p, ...c}), {})
        )
        .map(card => `<card id="${card.id}" passcode="">${card.name.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, "&#39;")
            .replace(/"/g, "&quot;")
        }</card>`);
    
    let playedExtra = simpleFilter(`(${baseQuery}) extra`);
    let playedMain = simpleFilter(`(${baseQuery}) (not extra)`);
    
    playedExtra.reverse();
    playedMain.reverse();
    
    console.log(`Compressing ${playedExtra.length} extra deck card(s) and ${playedMain.length} main deck cards`);
    
    let index = 1;
    let zipFileWriter = new zip.BlobWriter();
    let zipWriter = new zip.ZipWriter(zipFileWriter);
    
    while(playedExtra.length && playedMain.length) {
        let displayIndex = index.toString().padStart(4, "0");
        let saveName = `[${prefixHead}] ${prefixName}_${displayIndex}`;
        
        let instanceMain = playedMain.splice(-60);
        let instanceExtra = playedExtra.splice(-15);
        
        let instanceSide = [];
        if(playedExtra.length) {
            instanceSide.push(...playedExtra.splice(-15));
        }
        if(instanceSide.length < 15) {
            instanceSide.push(...instanceMain.splice(-(15 - instanceSide.length)));
        }
        
        index++;
        
        let fileContent = `<?xml version="1.0" encoding="utf-8" ?>
<deck name="${saveName}">
 <main>
   ${instanceMain.join("\n")}
 </main>
 <side>
   ${instanceSide.join("\n")}
 </side>
 <extra>
   ${instanceExtra.join("\n")}
 </extra>
</deck>
`;
        await zipWriter.add(saveName + ".xml", new zip.TextReader(fileContent));
        
        
        // console.log(instanceMain, instanceExtra, instanceSide);
    }
    await zipWriter.close();
    let zipFileBlob = await zipFileWriter.getData();
    
    const downloadZipFile = (name, blob) => {
        let a;
        document.body.appendChild(a = Object.assign(document.createElement("a"), {
            download: name,
            href: URL.createObjectURL(blob),
            textContent: "Download zip file",
        }));
        a.click();
    };
    
    downloadZipFile("lists.zip", zipFileBlob);
    
    return;
};

// secret silly
(function () {
    let now = new Date();
    if(!(window.location.toString().includes("this_website_cannot_be_silly") || Math.random() < 0.00001 || now.getMonth() === 3 && now.getDate() === 1)) {
        return;
    }
    let newLink = document.createElement("link");
    newLink.href = "https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap";
    newLink.rel = "stylesheet";
    let newStyleText = `
        html {
            filter: hue-rotate(180deg);
        }
        .img-result {
            filter: blur(1px) contrast(500%);
        }
        * {
            font-family: "Comic Sans", cursive !important;
            text-transform: uppercase !important;
        }
        h1, h1.title a, h2, h3, h4, h5, h6 {
            font-family: "Rock Salt", "Comic Sans", cursive !important;
        }
        .hud {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 1000;
            width: 100%;
            height: 100%;
            user-select: none;
        }
        .countdown {
            position: fixed;
            cursor: pointer;
            top: 16%;
            left: 43%;
            height: 4.5%;
            width: 16%;
            z-index: 2000;
            color: black;
            text-align: center;
        }
    `.trim();
    let newStyle = document.createElement("style");
    newStyle.innerHTML = newStyleText;
    document.head.appendChild(newLink);
    document.head.appendChild(newStyle);
    let hud = document.createElement("img");
    hud.className = "hud";
    hud.src = getResource("bg", "foreground-fools");
    let countdown = document.createElement("div");
    countdown.className = "countdown";
    countdown.textContent = "lmao";
    let sillyState = {
        running: true,
        revoke() {
            this.running = false;
            document.head.removeChild(newLink);
            document.head.removeChild(newStyle);
            document.body.removeChild(hud);
            document.body.removeChild(countdown);
        },
    };
    window.sillyState = sillyState;
    let midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    window.addEventListener("load", () => {
        document.body.appendChild(hud);
        document.body.appendChild(countdown);
        let updateTime = () => {
            if(!sillyState.running) {
                return;
            }
            let timeLeft = midnight - Date.now();
            if(timeLeft <= 0) {
                sillyState.revoke();
                return;
            }
            let hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            timeLeft %= (1000 * 60 * 60);
            let minutesLeft = Math.floor(timeLeft / (1000 * 60));
            timeLeft %= (1000 * 60);
            let secondsLeft = Math.floor(timeLeft / 1000);
            countdown.textContent = `lmao ${hoursLeft}:${minutesLeft}:${secondsLeft}`;
            setTimeout(updateTime, 1000);
        };
        updateTime();
        countdown.addEventListener("click", ev => {
            if(ev.detail === 3) {
                sillyState.revoke();
            }
        });
    });
})();

if(typeof module !== "undefined") {
    module.exports = CardViewer;
}
