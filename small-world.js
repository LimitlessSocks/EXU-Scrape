let stats = ["type", "attribute", "level", "atk", "def"];
let smallWorldFilter = (a, b) =>
    stats.filter(stat => a[stat] == b[stat])

let smallWorldMatches = (a, b) =>
    smallWorldFilter(a, b).length === 1;

let rankSmallWorldMatch = (first, prospect, target) => {
    let firstBridge = smallWorldFilter(first, prospect)[0];
    let secondBridge = smallWorldFilter(prospect, target)[0];
    // TODO: better grading
    let firstIndex = stats.indexOf(firstBridge);
    let secondIndex = stats.indexOf(secondBridge);
    return firstIndex + secondIndex;
};

let bridgeSmallWorld = (first, target) => 
    getValidTargets()
          .filter(card => smallWorldMatches(first, card) && smallWorldMatches(card, target))
          .map(card => [card, rankSmallWorldMatch(first, card, target)])
          .sort((a, b) => a[1] - b[1]);

let findAllBridgesBelow = function (thresh) {
    return new Promise((resolve, reject) => {
        let cards = getValidTargets();
        let smols = [];
        let iter2 = (i, j) => new Promise((res, rej) => {
            $("#top").text("i=" + i + "; j=" + j);
            let bsw = bridgeSmallWorld(cards[i], cards[j]);
            if(bsw.length < thresh) {
                console.log(`Found ${bsw.length ? "smol" : "zero!!"} pair: `, cards[i].name, ";;", cards[j].name);
                smols.push({
                    hand: cards[i],
                    deck: cards[j],
                    bridges: bsw
                });
            }
            if(j >= cards.length) resolve();
            setTimeout(iter2, 0, i, j + 1);
        });
        let iter = (i) => {
            console.log("!! i=", i);
            iter2(i, i + 1).then(() => {
                if(i >= cards.length) return resolve(smols);
                setTimeout(iter, 0, i + 1);
            });
        };
        iter(0);
    });
};

let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

const getRandomCard = (kind=null) => {
    let cache = CardViewer.Search.pages.flat();
    if(kind === Deck.Location.MAIN) {
        cache = cache.filter(card => !CardViewer.Filters.isExtraDeck(card));
    }
    else if(kind === Deck.Location.EXTRA) {
        cache = cache.filter(CardViewer.Filters.isExtraDeck);
    }
    let card = cache[Math.random() * cache.length | 0];
    if(!card) return null;
    return card;
};

const getValidTargets = (name="") =>
    CardViewer.filter({
        name: name,
        type: "monster"
    }).filter(CardViewer.Filters.isMainDeck);

const filterByMonsterName = (name="") => {
    CardViewer.Search.processResults(getValidTargets(name));
};

const getFirstMatchCard = (name) => {
    filterByMonsterName(name);
    let pages = CardViewer.Search.pages
        .flat()
        .sort((a, b) =>
            Math.abs(name.length - a.name.length) - Math.abs(name.length - b.name.length)
        );
    
    return pages[0] || NO_CARD_FOUND;
};

CardViewer.composeResultMinimal = function (card) {
    let res = CardViewer.composeResultSmall(card);
    let inner = res.find(".result-inner");
    if(card.card_type === "Monster") {
        let kinds = [
            "Level " + card.level,
            card.attribute,
            card.type
        ];
        if(card.ability) kinds.push(card.ability)
        kinds.push("(" + card.monster_color + ")");
        if(card.pendulum) kinds.push("Pendulum");
        inner.append($("<div>").text(kinds.join(" ")));
        inner.append($("<div>").text(
            "ATK/" + card.atk + " DEF/" + card.def
        ));
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "Scale = " + card.scale + "\n[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
    }
    inner.append(
        $("<div>")
            .text(effect)
            .addClass("text-preview")
    );
    return res;
};

const CardResults = {
    handCard: null,
    deckCard: null,
};
const changeContentToCard = (base, card) => {
    CardResults[base.prop("id")] = card;
    base.empty();
    base.append(CardViewer.composeResultMinimal(card));
};

const NO_CARD_LOADED = {
    card_type: "Spell",
    type: "Counter",
    monster_color: "spell",
    effect: "(Loading...)",
    src: getResource("loading"),
};
const NO_CARD_FOUND = { 
    src: getResource("no_img"),
    name: "Error: No Card",
    id: -1,
    username: "--",
    card_type: "Monster",
    monster_color: "Error",
    custom: 0,
    effect: "(No card found!)",
    attribute: "ERROR",
    level: 0,
    atk: -1,
    def: -1,
    exu_limit: 3,
};
let onLoad = async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    const handCard = $("#handCard");
    const deckCard = $("#deckCard");
    
    changeContentToCard(handCard, NO_CARD_LOADED);
    changeContentToCard(deckCard, NO_CARD_LOADED);
    
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    CardViewer.Search.config.noTable = true;
    
    // get two random cards
    filterByMonsterName();
    let a = getRandomCard(Deck.Location.MAIN);
    let b = getRandomCard(Deck.Location.MAIN);
    changeContentToCard(handCard, a);
    changeContentToCard(deckCard, b);
    
    let inputs = [
        [$("#handCardSearch"), handCard],
        [$("#deckCardSearch"), deckCard]
    ];
    for(let [ textbox, output ] of inputs) {
        let cb = function () {
            let name = textbox.val();
            if(!name) return;
            changeContentToCard(output, getFirstMatchCard(name));
        };
        textbox.change(cb);
        textbox.keypress((event) => {
            if(event.originalEvent.code === "Enter") {
                cb();
            }
        });
        cb();
    }
    
    const container = $("#bridge-output-container");
    const output = $("#bridge-output");
    const outputInfo = $("#info");
    const moreButton = $("#showMore");
    const allButton = $("#showAll");
    const sliceLength = 36;
    let appendAllInterval = null;
    let displayBridges = () => {
        if(appendAllInterval !== null) {
            clearInterval(appendAllInterval);
        }
        let bridges = bridgeSmallWorld(CardResults.handCard, CardResults.deckCard);
        output.empty();
        outputInfo.text(bridges.length + " result(s) found");
        let appendMore = () => {
            for(let [ card, rank ] of bridges.splice(0, sliceLength)) {
                output.append(CardViewer.composeResultMinimal(card));
            }
        };
        appendMore();
        let appendAll = () => {
            if(!bridges.length) return;
            appendMore();
            appendAllInterval = setTimeout(appendAll, 100);
        }
        if(bridges.length) {
            moreButton.prop("disabled", false);
            allButton.prop("disabled", false);
            moreButton.unbind("click");
            moreButton.click(appendMore);
            allButton.click(() => {
                allButton.prop("disabled", true);
                showAlll();
            });
        }
        else {
            moreButton.prop("disabled", true);
            allButton.prop("disabled", true);
        }
    };
    $("#submitBridge").click(displayBridges);
    displayBridges();
};

window.addEventListener("load", onLoad);