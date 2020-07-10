(async function () {
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/beta.json");
    let db = await response.json();
    CardViewer.Database.setInitial(db);
})();