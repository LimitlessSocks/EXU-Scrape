let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.bfyfDatabase = baseURL + "bfyf.json";

CardViewer.format = "bfyf";
CardViewer.purge = function () {
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        card.bfyf_limit = 3;
        if(id in BFYF_CARD_BANLIST) {
            card.bfyf_limit = BFYF_CARD_BANLIST[id];
        }
        if(card.custom) continue;
        if(BFYF_CARD_IDS.indexOf(+id) !== -1) continue;
        if(CardViewer.Filters.isNormal(card) && !card.pendulum) continue;
        if(CardViewer.Filters.isNonEffect(card) && CardViewer.Filters.isRitual(card)) continue;
        card.bfyf_limit = -1;
    }
}

CardViewer.loadBfyf = async function () {
    await CardViewer.Database.initialReadAll(ycgDatabase, bfyfDatabase);
    CardViewer.purge();
};