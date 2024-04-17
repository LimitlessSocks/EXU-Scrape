const UNCARD_CLAUSE = "cannot be used in an official tournament or ranked match";

const ALPHABET = `ABCDEFGHJKMNPQRSUVWXYZ0123456789`;
const makeRandomSeed = () => {
    const SEED_LENGTH = 12;
    let result = "";
    for(let i = 0; i < SEED_LENGTH; i++) {
        result += ALPHABET[Math.random() * ALPHABET.length | 0];
    }
    return result;
};

window.addEventListener("load", async function () {
    CardViewer.excludeTcg = false;
    await CardViewer.Database.initialReadAll("./db.json");
    const startPack = document.getElementById("startPack");
    const pullPack = document.getElementById("pullPack");
    const pullQueryPack = document.getElementById("pullQueryPack");
    const query = document.getElementById("query");

    let state = {
        seed: null,
        rng: null,
        pool: null,
        allowRepeats: null,
        perPack: null,
        pull(queryText) {
            let subPool = this.pool;
            if(queryText) {
                let query = naturalInputToQuery(queryText);
                let condensed = condenseQuery(query);
                // console.log(query, condensed);
                subPool = subPool.filter(cardId => condensed(CardViewer.Database.cards[cardId]));
                // console.log(subPool);
            }
            let hand = [];
            for(let i = 0; i < this.perPack; i++) {
                let idx = Math.floor(this.rng() * subPool.length);
                let cardId = subPool[idx];
                if(!this.allowRepeats) {
                    let sourceIndex = this.pool.indexOf(cardId);
                    this.pool.splice(sourceIndex, 1);
                }
                hand.push(cardId);
            }
            return hand;
        },
    };
    startPack.addEventListener("click", function () {
        let [ seed, perPack, allowRepeats, useYCG, useTCG, useOCG, useCustoms, useUncards ] = [...document.querySelectorAll(".initialization input")].map(e =>
            e.type === "checkbox" ? e.checked : e.value
        );
        state.seed = seed || makeRandomSeed();
        state.rng = new Math.seedrandom(state.seed);

        let pool = [];
        for(let card of Object.values(CardViewer.Database.cards)) {
            if(card.hidden || card.rush) {
                continue;
            }
            if(!useYCG && card.tcg && card.ocg) {
                continue;
            }
            if(!useTCG && card.tcg && !card.ocg) {
                continue;
            }
            if(!useOCG && card.ocg && !card.tcg) {
                continue;
            }
            let isUncard = card.effect.toLowerCase().includes(UNCARD_CLAUSE);
            if(useCustoms) {
                if(!useUncards && isUncard) {
                    continue;
                }
            }
            else if(useUncards) {
                if(card.custom && !isUncard) {
                    continue;
                }
            }
            else {
                if(card.custom) {
                    continue;
                }
            }
            pool.push(card.id);
        }

        state.pool = pool;
        state.allowRepeats = allowRepeats;
        state.perPack = perPack;

        $("#simulation").toggleClass("hidden", false);
        $(".pack").remove();
        $(".user-seed").text(state.seed);
        $(".cards-in-pool").text(state.pool.length);
    });

    const jail = $("<div class=hidden></div>");
    window.jail = jail;

    const composeMutexDense = (card, parent) => {
        let base = CardViewer.composeResultDense(card);
        let expanded = CardViewer.composeResult(card);
        base.off("click");
        base.data("id", card.id);
        expanded.data("id", card.id);

        base.on("click", () => {
            // unjail every dense element
            [...parent.find(".result")].forEach(child => {
                let jChild = $(child);
                let theirId = jChild.data("id");
                if(theirId !== card.id && !child.classList.contains("dense-result")) {
                    let theirDenseCounterpart = [...jail.children()].find(child => $(child).data("id") === theirId);
                    if(!theirDenseCounterpart) {
                        console.log("Weird, no dense counterpart", theirId, card.id);
                        return;
                    }
                    theirDenseCounterpart = $(theirDenseCounterpart);
                    console.log(theirDenseCounterpart, jChild);
                    theirDenseCounterpart.insertBefore(jChild);
                    jChild.appendTo(jail);
                }
            });
            expanded.insertBefore(base);
            base.appendTo(jail);
        });

        return base;
    };

    const renderHand = (hand, withQuery) => {
        let numberOfPacks = $(".pack").length;
        let rendered = $(`<div class=pack><h2>Pack ${numberOfPacks + 1}</h2></div>`);
        if(withQuery) {
            rendered.append(`<h3>Query: <code>${withQuery}</code></h3>`);
        }
        
        for(let id of hand) {
            let card = CardViewer.Database.cards[id];
            let renderedCard = composeMutexDense(card, rendered);
            rendered.append(renderedCard);
        }
        $("#simulation").append(rendered);
    };

    pullPack.addEventListener("click", function () {
        let hand = state.pull();
        renderHand(hand);
    });
    pullQueryPack.addEventListener("click", function () {
        let hand = state.pull(query.value);
        renderHand(hand, query.value);
    });
});
