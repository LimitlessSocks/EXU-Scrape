let onLoad = async function () {
    // load static info
    // $("#cardCount").text(CardViewer.Editor.DeckInstance.decks[0].length);
    
    // card/deck display
    CardViewer.Editor.MajorContainer = $("#majorContainer");
    window.addEventListener("resize", CardViewer.Editor.recalculateView);
    CardViewer.Editor.recalculateView();
    
    CardViewer.Elements.deckEditor = $("#deckEditor");
    CardViewer.Elements.cardPreview = $("#cardPreview");
    CardViewer.Elements.downloadDeck = $("#downloadDeck");
    
    CardViewer.Elements.downloadDeck.click(() => {
        window.open("./" + window.deckPath, "_blank");
    });
    
    // CardViewer.setUpTabSearchSwitching();
    
    CardViewer.Elements.deckEditor.text("Loading deck...");
    await CardViewer.Database.initialReadAll("./db.json", "./support.json");
    
    // load ids into deck
    
    let testSource = (source, ids) =>
        source && (
            source.length
                ? source.some(s => ids.indexOf(s) !== -1)
                : ids.indexOf(source) !== -1
        );
    
    let cards = CardViewer.filter(
        CardViewer.createFilter((card) =>
            // sourceIds.indexOf(card.submission_source) !== -1 &&
            testSource(card.submission_source, sourceIds) &&
            excludeIds.indexOf(card.id) === -1
        )
    );
    
    for(let card of cards) {
        CardViewer.Editor.DeckInstance.addCard(card.id);
    }
    for(let id of extraIds) {
        CardViewer.Editor.DeckInstance.addCard(id);
    }
    
    CardViewer.Editor.DeckInstance.sort();
    
    for(let deck of CardViewer.Editor.DeckInstance.decks) {
        let nonCustom = [];
        for(let i = deck.length - 1; i >= 0; --i) {
            let id = deck[i];
            let card = CardViewer.Database.cards[id];
            if(card.custom) {
                continue;
            }
            let [ shifted ] = deck.splice(i, 1);
            nonCustom.push(shifted);
        }
        for(let id of nonCustom.reverse()) {
            deck.push(id);
        }
    }
    
    // load deck
    CardViewer.Editor.updateDeck();
    if(window.thumb) {
        CardViewer.Editor.setPreview(window.thumb);
    }
};
window.addEventListener("load", onLoad);