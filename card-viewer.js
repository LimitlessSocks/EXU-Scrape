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
        pages: null,
        currentPage: null,
        processResults: null,
    },
    Elements: {},
    // methods
    submit: null,
    query: null,
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
];

const Banlist = {
    // banned - tcg cards
    91869203: 0,    // Amazoness Archer
    65064143: 0,    // Anti-Aircraft Flower
    74440055: 0,    // Cactus Fighter
    11384280: 0,    // Cannon Soldier
    14702066: 0,    // Cannon Soldier MK-2
    67316075: 0,    // Darklord Nurse Reficule
    33396948: 0,    // Exodia the Forbidden One
    53257892: 0,    // Gigaplant
    38572779: 0,    // Miscellaneousaurus
    27869883: 0,    // Shadowpriestess of Ohm
    63012333: 0,    // Soul-Absorbing Bone Tower
    91258852: 0,    // SPYRAL Master Plan
    35699   : 0,    // SPYRAL Sleeper
    79875176: 0,    // Toon Cannon Soldier
    6602300:  0,    // Blaze Fenix, the Burning Bombardment Bird
    37818794: 0,    // Dragun of Red-Eyes
    94977269: 0,    // El Shaddoll Winda
    47611119: 0,    // Gem-Knight Lady Lapis Lazuli
    76815942: 0,    // Lyrilusc - Independent Nightingale
    4280258:  0,    // Apollousa, Bow of the Goddess
    50588353: 0,    // Crystron Halqifibrax
    59934749: 0,    // Isolde, Two Tales of the Noble Knights
    15939229: 0,    // D/D/D Duo-Dawn King Kali Yuga
    52653092: 0,    // Number S0: Utopic ZEXAL
    88581108: 0,    // True King of All Calamities
    85668449: 0,    // Brain Research Lab
    85562745: 0,    // Dark Room of Nightmare
    76375976: 0,    // Mystic Mine
    27970830: 0,    // Gateway of the Six
    14391920: 0,    // Inferno Tempest
    91819979: 0,    // Magical Blast
    5990062:  0,    // Reversal Quiz
    24010609: 0,    // Sky Striker Mecha Modules - Multirole
    61032879: 0,    // Synchronized Realm
    68392533: 0,    // Telekinetic Charging Cell
    40633297: 0,    // Bad Reaction to Simochi
    48716527: 0,    // The Monarchs Erupt
    76218313: 0,    // Dragon Buster Destruction Sword
    69448290: 0,    // Mist Valley Thunderbird    
    // limited - TCG cards
    53804307: 1,    // Blaster, Dragon Ruler of Infernos
    83190280: 1,    // Lunalight Tiger
    40318957: 1,    // Performapal Skullcrobat Joker
    16428514: 1,    // Subterror Guru
    30741503: 1,    // Galatea, the Orcust Automaton
    74997493: 1,    // Saryuja Skull Dread
    87871125: 1,    // Salamangreat Sunlight Wolf
    93854893: 1,    // Dingirsu, the Orcust of the Evening Star
    18144506: 1,    // Harpie's Feather Duster
    // semi-limited - TCG cards
    27552504: 2,    // Beatrice, Lady of the Eternal
    2295440:  2,    // One for One
    37520316: 2,    // Mind Control
    14532163: 2,    // Lightning Storm
    // unlimited - TCG cards
    7902349:  3,    // Left Arm of the Forbidden One
    44519536: 3,    // Left Leg of the Forbidden One
    70903634: 3,    // Right Arm of the Forbidden One
    8124921:  3,    // Right Leg of the Forbidden One
    57143342: 3,    // Cir, Malebranche of the Burning Abyss
    20758643: 3,    // Graff, Malebranche of the Burning Abyss
    10802915: 3,    // Tour Guide From the Underworld
    48063985: 3,    // Ritual Beast Ulti-Cannahawk
    83152482: 3,    // Union Carrier
    // 70369116: 3,    // Predaplant Verte Anaconda
    22842126: 3,    // Pantheism of the Monarchs
    24940422: 3,    // Sekka's Light
    89208725: 3,    // Metaverse
    23002292: 3,    // Red Reboot
    35125879: 3,    // True King's Return
    // banned - EXU cards
    1307926:  0,    // Pyrodent Accelerator
    667308:   1,    // Twilight Mountain Titan
    // limited - EXU cards
    1061760:  1,    // Sacrificial Soul Reborn
    979470:   1,    // Ravager Planet: LV-426
    // unlimited - EXU cards
    1169172:  3,    // Thunder Dragon Rider
    1310678:  3,    // Titanus - Queen's Hideout
    1310651:  3,    // Titanus - Fire Demon's Lair
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

CardViewer.Database.banlist = Banlist;

CardViewer.Database.setInitial = function (db) {
    for(let [id, info] of Object.entries(db)) {
        info.exu_limit = Banlist[id];
        if(typeof info.exu_limit === "undefined") {
            info.exu_limit = 3;
        }
    }
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
    CardViewer.Elements.pageCount.text(CardViewer.Search.pages.length);
};

CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage) {
    CardViewer.Elements.results.empty();
    if(id < 0 || id >= CardViewer.Search.pages.length) {
        return;
    }
    let table = $("<table class=pagetable>");
    let row = [];
    CardViewer.Search.pages[id].forEach((result, i, arr) => {
        let composed = CardViewer.composeResult(result);
        row.push(composed);
        if(row.length === 2 || i + 1 === arr.length) {
            let tr = $("<tr>");
            for(let c of row) {
                tr.append($("<td>").append(c));
            }
            table.append(tr);
            row = [];
        }
    });
    
    CardViewer.Elements.results.append(table);
    // humans measure in 1-based indices
    CardViewer.Elements.currentPage.text(id + 1);
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
        let paras = card.effect.trim().split(/\r?\n|\r/g);
        let sentences = card.effect
            .replace(/".+?"/g, "")
            .split(".");
        let isNonEffect = paras.length === 1 && sentences.length === 1;
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
    CardViewer.Filters.Dictionary[key];

CardViewer.query = function () {
    let baseStats = {
        name:       CardViewer.Elements.cardName.val(),
        effect:     CardViewer.Elements.cardDescription.val(),
        type:       CardViewer.Elements.cardType.val(),
        limit:      CardViewer.Elements.cardLimit.val(),
        id:         CardViewer.Elements.cardId.val(),
        author:     CardViewer.Elements.cardAuthor.val(),
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
    text.replace(/\s*/, "")
        .toLowerCase();

CardViewer.textComparator = (needle, fn = _F.id) => {
    let simplified = CardViewer.simplifyText(needle);
    return (card) =>
        fn(card).toString().toLowerCase().indexOf(simplified) !== -1;
};
CardViewer.textAnyComparator = (needle, fn = _F.id) =>
    needle === "any" ? () => true : CardViewer.textComparator(needle, fn);

CardViewer.exactComparator = (needle, fn = _F.id) => {
    return (card) =>
        fn(card) === needle;
};

CardViewer.createFilter = function (query) {
    if(typeof query === "function") {
        return query;
    }
    let filters = [
        // type filter
        CardViewer.Filters.getFilter(query.type),
        // name filter
        CardViewer.textComparator(query.name, _F.propda("name")),
        // id filter
        CardViewer.textComparator(query.id, _F.propda("id")),
        // effect filter
        CardViewer.textComparator(query.effect, _F.propda("effect")),
        // author filter
        CardViewer.textComparator(query.author, _F.propda("username")),
        // limit filter
        CardViewer.textAnyComparator(query.limit, _F.propda("exu_limit")),
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
    
    return (card) => filters.every(filter => filter(card));
};

CardViewer.filter = function (query) {
    let filter = CardViewer.createFilter(query);
    let cards = [];
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        if(card.tcg || card.ocg) {
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

CardViewer.composeResult = function (card) {
    let img = $("<img class=img-result>").attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    let res = $("<div class=result>");
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
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

CardViewer.firstTime = true;
CardViewer.submit = function () {
    let query;
    if (CardViewer.firstTime) {
        query = card => CardsOfTheWeek.indexOf(card.id) !== -1;
    }
    else {
        query = CardViewer.query();
    }
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Elements.resultNote.text(CardViewer.firstTime ? "Note: You are currently viewing a curated selection of our cards. Please search again to see all available cards." : "");
    CardViewer.Search.showPage();
    CardViewer.firstTime = false;
};
let onLoad = async function () {
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/db.json");
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    CardViewer.Elements.searchParameters = $("#searchParamters");
    
    CardViewer.Elements.cardType = $("#cardType");
    CardViewer.Elements.cardLimit = $("#cardLimit");
    CardViewer.Elements.cardAuthor = $("#cardAuthor");
    CardViewer.Elements.search = $("#search");
    CardViewer.Elements.results = $("#results");
    CardViewer.Elements.autoSearch = $("#autoSearch");
    CardViewer.Elements.cardName = $("#cardName");
    CardViewer.Elements.resultCount = $("#resultCount");
    CardViewer.Elements.cardDescription = $("#cardDescription");
    CardViewer.Elements.currentPage = $("#currentPage");
    CardViewer.Elements.pageCount = $("#pageCount");
    CardViewer.Elements.nextPage = $("#nextPage");
    CardViewer.Elements.previousPage = $("#previousPage");
    CardViewer.Elements.resultNote = $("#resultNote");
    CardViewer.Elements.cardId = $("#cardId");
    CardViewer.Elements.ifMonster = $(".ifMonster");
    CardViewer.Elements.ifSpell = $(".ifSpell");
    CardViewer.Elements.ifTrap = $(".ifTrap");
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
    CardViewer.Elements.toTopButton = $("#totop");
    
    CardViewer.Elements.search.click(CardViewer.submit);
    CardViewer.Elements.previousPage.click(CardViewer.Search.previousPage);
    CardViewer.Elements.nextPage.click(CardViewer.Search.nextPage);
    
    CardViewer.Elements.toTopButton.click(() => {
        $("html, body").animate(
            { scrollTop: "0px" },
            { duration: 200, }
        );
    });
    
    CardViewer.Elements.autoSearch.change(function () {
        CardViewer.autoSearch = this.checked;
    });
    CardViewer.Elements.autoSearch.change();
    
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
    });
    CardViewer.Elements.cardType.change();
    
    const elementChanged = function () {
        if(CardViewer.autoSearch) {
            CardViewer.submit();
        }
    };
    
    for(let el of CardViewer.Elements.searchParameters.find("select, input:not(:checkbox)")) {
        $(el).change(elementChanged);
        $(el).keypress((event) => {
            if(event.originalEvent.code === "Enter") {
                CardViewer.submit();
            }
        });
    }
    
    CardViewer.submit();
    
    let updateBackground = () => {
        if(localStorage.getItem("EXU_REDOX_MODE") === "true") {
            $("html").css("background-image", "url(\"" + getResource("bg", "godzilla") + "\")");
            $("html").css("background-size", "100% 100%");
        }
        else {
            $("html").css("background-image", "");
            $("html").css("background-size", "");
        }
    };
    
    $(window).keydown((ev) => {
        let orig = ev.originalEvent;
        if(ev.altKey && ev.key === "R") {
            let wasActive = localStorage.getItem("EXU_REDOX_MODE") === "true";
            localStorage.setItem("EXU_REDOX_MODE", !wasActive);
            updateBackground();
        }
    });
    
    updateBackground();
};

window.addEventListener("load", onLoad);