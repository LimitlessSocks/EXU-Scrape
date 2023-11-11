(function () {
    // note: must be a single expression to play nice with evaluate_script
    // note: fuck you xteven, thanks for nothing
    console.log("dbi - inject script starting to evaluate");
    console.log("dbi - within function closure");
    let oldLDC = loadDeckComplete;
    window.responseData = { loaded: false, tokenRequired: false, deckDeleted: false, cards: [] };
    console.log("dbi - old ldc:", oldLDC);
    window.loadDeckComplete = function loadDeckComplete(str) {
        oldLDC(str);
        
        const data = JSON.parse(str);
        if(data.action === "Error") {
            console.log("TOKEN REQUIRED!");
            if(data.message === "Deck does not exist") {
                window.responseData.deckDeleted = true;
            }
            else {
                window.responseData.tokenRequired = true;
            }
            return;
        }
        
        // cards is a list of jquery objects
        const cards = deck_arr.concat(side_arr, extra_arr)
            .map(jqo => jqo.data());
        console.log("loaded cards:", cards, str);
        window.responseData.cards = cards;
        window.responseData.loaded = true;
    };
})();
