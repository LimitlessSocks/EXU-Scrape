const Config = {
    minUseful: 3,
    maxUseful: 6,
};
const isUseful = val => Config.minUseful <= val && val <= Config.maxUseful;

const ClassifierFrequency = Symbol("ClassifierFrequency");
const ClassifierBoolean = Symbol("ClassifierBoolean");
const Classifiers = [
    // frequency classifiers
    {
        type: ClassifierFrequency,
        format: val => `${val} ATK`,
        fn: card => card.atk,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val} DEF`,
        fn: card => card.def,
    },
    {
        type: ClassifierFrequency,
        format: val => `Level ${val}`,
        fn: card => card.level,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val}-Attribute`,
        fn: card => card.attribute,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val}-Type`,
        fn: card => CardViewer.Filters.isMonster(card) ? card.type : null,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val}`,
        fn: card => CardViewer.Filters.isMonster(card) ? null : `${card.type} ${card.card_type}`,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val} monster`,
        fn: card => card.ability,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val} combined ATK/DEF`,
        fn: card => +card.atk + +card.def,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val}`,
        fn: card => card.card_type,
    },
    {
        type: ClassifierFrequency,
        format: val => `${val} Monster`,
        fn: card => card.monster_color,
    },
    {
        type: ClassifierFrequency,
        format: val => ["Forbidden", "Limited", "Semi-Limited", "Unlimited"][val],
        fn: card => (card.tcg_limit ?? 3),
    },
    {
        type: ClassifierFrequency,
        format: val => `TCG year ${val}`,
        fn: card => card.tcg_date && card.tcg_date.match(/\d{4}/)?.[0],
    },
    {
        type: ClassifierFrequency,
        format: val => `${val} points`,
        fn: card => CardViewer.isPointsFormat() ? (card.point_limit ?? 0) : null,
    },
    // boolean classifiers
    {
        type: ClassifierBoolean,
        format: sameATKDEF => sameATKDEF ? "ATK = DEF" : null,
        fn: card => CardViewer.Filters.isMonster(card) && !CardViewer.Filters.isLink(card) && card.atk === card.def,
    },
    {
        type: ClassifierBoolean,
        format: isExtra => isExtra ? "Extra Deck Card" : "Main Deck Card",
        fn: card => CardViewer.Filters.isExtraDeck(card),
    },
    {
        type: ClassifierBoolean,
        format: hasAbility => hasAbility ? "Has ability" : "Has no ability",
        fn: card => !!card.ability,
    },
    {
        type: ClassifierBoolean,
        format: isOnBanlist => isOnBanlist ? "On banlist" : null,
        fn: card => (card.tcg_limit ?? 3) < 3,
    },
];

const isReturnValueValid = value =>
    !(value === undefined || value === "" || Number.isNaN(value) || value === null);

const parseConnections = cardList => {
    const foundConnections = {};
    for(let card of cardList) {
        for(let classifier of Classifiers) {
            let { type, format, fn, isValid } = classifier;
            isValid ??= isReturnValueValid;
            let value = fn(card);
            if(!isValid(value)) {
                continue;
            }
            let key = format(value);
            if(key === null) {
                continue;
            }
            foundConnections[key] ??= [];
            foundConnections[key].push(card);
        }
    }
    return Object.entries(foundConnections)
        // .filter(([key, list]) => 2 <= list.length && list.length <= 6)
        .sort(([k1, l1], [k2, l2]) =>
            // sort our preferred range first
            200 * (isUseful(l2.length) - isUseful(l1.length))
            // then sort by length descending
            || 100 * (l2.length - l1.length)
            // then sort by key name
            || k1.localeCompare(k2)
        );
};

window.addEventListener("load", async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    const playrateSummary = await fetch("./data/playrate-summary.json").then(req => req.json());
    CardViewer.Playrates.Summary = playrateSummary;
    
    await CardViewer.Database.initialReadAll("./db.json");
    await CardViewer.initialDatabaseSetup();
    
    CardViewer.SaveData.init();
    
    let cardOutput = $("#card-output");
    CardViewer.SaveData.set("connection-cards",
        CardViewer.SaveData.get("connection-cards") ?? []
    );
    let cardList = CardViewer.SaveData.get("connection-cards");
    const saveCardList = () =>
        CardViewer.SaveData.set("connection-cards", cardList);
    
    let connOutput = $("#connections");
    const updateConnections = () => {
        cardOutput.empty();
        for(let cardId of cardList) {
            let card = CardViewer.Database.cards[cardId];
            let res = CardViewer.composeResultSmall(card);
            res.click(() => {
                cardList = cardList.filter(otherId => otherId !== cardId);
                saveCardList();
                updateConnections();
            });
            cardOutput.append(res);
        }
        
        connOutput.empty();
        let conns = parseConnections(cardList.map(cardId => CardViewer.Database.cards[cardId]));
        conns.forEach(([label, cards]) => {
            let connTag = cards.length < 3 || cards.length > 6 ? "ignore" : cards.length;
            let connBody = $(`<div class="connections-group connect-${connTag}">`).append(
                $("<h3>").text(`${label} (${cards.length})`),
                $("<ul>").append(
                    ...cards.map(card => $("<li>").text(card.name))
                ),
            );
            connOutput
                .append(connBody)
                .click();
        });
    };
    
    let filter = $("#card-filter");
    let results = $("#results");
    let updateFilter = () => {
        results.empty();
        let name = filter.val();
        if(name.trim().length === 0) {
            return;
        }
        let cards = CardViewer.filter({ name }).slice(0, 8);
        cards.forEach(card => {
            let dense = CardViewer.composeResultDense(card);
            results.append(dense);
            dense.off("click");
            dense.click(() => {
                if(cardList.some(otherId => otherId === card.id)) {
                    return;
                }
                cardList.push(card.id);
                saveCardList();
                updateConnections();
            });
        });
    };
    filter[0].addEventListener("input", updateFilter);
    updateFilter();
    updateConnections();
    
    $("#clear").click(() => {
        cardList = [];
        saveCardList();
        updateConnections();
    });
    
    $("#fill-random").click(() => {
        let keyList = Object.keys(CardViewer.Database.cards)
            .filter(id => !cardList.some(otherId => otherId === id));
        while(cardList.length < 16) {
            let idx = Math.random() * keyList.length | 0;
            let [ id ] = keyList.splice(idx, 1);
            cardList.push(id);
        }
        saveCardList();
        updateConnections();
    });
    
    CardViewer.attachGlobalSearchOptions(
        $("#showOptions"),
        {
            monkeyPatch(data) {
            },
            // denseToggle: updateInputDisplay,
            formatSelect(data) {
            },
        },
    );
    CardViewer.addEventListener("formatChange", format => {
        console.log("format changing ....");
        updateFilter();
        updateConnections();
    });
});
