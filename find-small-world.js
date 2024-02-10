const sharedProperties = (a, b, props) =>
    props.filter(prop => a[prop] == b[prop]);

const SMALL_WORLD_PROPS = ["atk", "def", "level", "type", "attribute"];
const isSmallWorldRelated = (a, b) =>
    sharedProperties(a, b, SMALL_WORLD_PROPS).length === 1;

const findSmallWorldBridges = (raw) => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(raw, "text/xml");
    window.doc = doc;
    // let cards = doc.querySelectorAll("main card");
    let cards = doc.getElementsByTagName("card");
    let cardIds = new Set([...cards].map(card => card.id));
    let cardData = [...cardIds].map(id => CardViewer.Database.cards[id] ?? console.warn("Could not find id", id));
    console.log(cardData);
    let mainCards = cardData.filter(card => card).filter(CardViewer.Filters.isMainDeck);
    
    let bridges = [];
    for(let card of mainCards) {
        for(let bridgeCandidate of mainCards) {
            /*let shared = sharedProperties(card, bridgeCandidate, props);
            if(shared.length === 1) {
                for(let finalTarget of mainCards) {
                    let secondShared = sharedProperties(bridgeCandidate, finalTarget, props);
                    if(secondS
                }
            }*/
            if(isSmallWorldRelated(card, bridgeCandidate)) {
                for(let finalTarget of mainCards) {
                    if(finalTarget === card) continue;
                    if(isSmallWorldRelated(bridgeCandidate, finalTarget)) {
                        bridges.push([card, bridgeCandidate, finalTarget]);
                    }
                }
            }
        }
    }
    return bridges;
};

window.addEventListener("load", async function () {
    await CardViewer.Database.initialReadAll("./db.json");
    CardViewer.composeStrategy = CardViewer.composeResultSmall;
    
    const messageHolder = $("#message-holder");
    const deckInput = $("#deck-input");
    const updateSearch = () => {
        console.log("Change!");
        let anyValue = $("#any-filter").val().toLowerCase();
        let handValue = $("#hand-filter").val().toLowerCase();
        let bridgeValue = $("#bridge-filter").val().toLowerCase();
        let deckValue = $("#deck-filter").val().toLowerCase();
        $("#message-holder > *").each(function() {
            // console.log(this.children);
            let showThis = $(this).text().toLowerCase().includes(anyValue);
            showThis &&= this.children[0].textContent.toLowerCase().includes(handValue)
                && this.children[1].textContent.toLowerCase().includes(bridgeValue)
                && this.children[2].textContent.toLowerCase().includes(deckValue);
            $(this).toggle(showThis);
        });
    };
    $("#any-filter, #hand-filter, #bridge-filter, #deck-filter").each(function() {
        $(this).change(updateSearch);
        $(this).keydown(updateSearch);
    });
    $("#find-submit").click(function () {
        let file = deckInput[0].files[0];
        // console.log(file);
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let result = evt.target.result;
            let bridges = findSmallWorldBridges(result);
            messageHolder.empty();
            for(let options of bridges) {
                let holder = $("<div>");
                // [ start, bridge, end ]
                let displayed = options.map(card => CardViewer.composeStrategy(card));
                displayed.forEach(html => holder.append($("<div class=inline-result>").append(html)));
                messageHolder.append(holder);
            }
            if(bridges.length === 0) {
                messageHolder.append("Could not find any bridges.");
            }
            else {
                updateSearch();
            }
        };
    });
});