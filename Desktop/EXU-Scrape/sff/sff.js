let baseURL = "./";
// TODO: refactor, ycg.json does not exist anymore
window.ycgDatabase = baseURL + "../ycg.json";
window.sffDatabase = baseURL + "sff.json";

CardViewer.format = "sff";
CardViewer.purge = function () {
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        card.sff_limit = 3;
        if(id in SFF_CARD_BANLIST) {
            card.sff_limit = SFF_CARD_BANLIST[id];
        }
        if(card.custom) continue;
        if(SFF_CARD_IDS.indexOf(+id) !== -1) continue;
        if(CardViewer.Filters.isNormal(card) && !card.pendulum) continue;
        if(CardViewer.Filters.isNonEffect(card) && CardViewer.Filters.isRitual(card)) continue;
        card.sff_limit = -1;
    }
}

CardViewer.loadSff = async function () {
    await CardViewer.Database.initialReadAll(ycgDatabase, sffDatabase);
    CardViewer.purge();
};