let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.exuDatabase = baseURL + "db.json";

window.addEventListener("load", async function () {
    await CardViewer.Database.initialReadAll(exuDatabase);
    
    const per = document.getElementById("percent");
    const sofar = document.getElementById("sofar");
    const customtotal = document.getElementById("customtotal");
    let ids = [...document.querySelectorAll("#credits tr td:nth-child(2)")]
        .map(e=>e.textContent);
    
    let uniqueIds = new Set(ids);
    let trueCount = uniqueIds.size;
    if(ids.length !== trueCount) {
        console.log("Size mismatch!", ids.length, "!=", trueCount);
        for(let id of ids) {
            if(ids.filter(e => e == id).length > 1) {
                console.log(id);
            }
        }
    }
    
    let customs = CardViewer.filter({ custom: true });
    let total = customs.length;
    let ratio = trueCount / total;
    percent.textContent = Math.floor(ratio * 10000) / 100 + "%";
    sofar.textContent = trueCount;
    customtotal.textContent = total;
    percent.style.color = `rgb(${255 - 100 * ratio}, ${100 + 150 * ratio}, 100)`;
});