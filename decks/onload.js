let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

let onLoad = async function () {
    // load static info
    $("#cardCount").text(CardViewer.Editor.DeckInstance.decks[0].length);
    
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
    // load deck
    CardViewer.Editor.updateDeck();
    if(window.thumb) {
        CardViewer.Editor.setPreview(window.thumb);
    }
};
window.addEventListener("load", onLoad);