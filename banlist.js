let onLoad = async function () {
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/banlist.json");
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    $("body").append(
        CardViewer.composeResult(CardViewer.Database.cards[9138])
    );
};
window.addEventListener("load", onLoad);