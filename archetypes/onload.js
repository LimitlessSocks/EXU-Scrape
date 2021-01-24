let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

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
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    
    // load ids into deck
    
    let cards = CardViewer.filter(
        CardViewer.createFilter((card) =>
            sourceIds.indexOf(card.submission_source) !== -1
        )
    );
    
    for(let card of cards) {
        CardViewer.Editor.DeckInstance.addCard(card.id);
    }
    for(let id of extraIds) {
        CardViewer.Editor.DeckInstance.addCard(id);
    }
    
    CardViewer.Editor.DeckInstance.sort();
    
    // load deck
    CardViewer.Editor.updateDeck();
    if(window.thumb) {
        CardViewer.Editor.setPreview(window.thumb);
    }
    
    $("#tags").append(
        tags.map(tag => $("<span class=tag>").text(tag))
    );
};
window.addEventListener("load", onLoad);