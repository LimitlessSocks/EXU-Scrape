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
    
    // modified https://stackoverflow.com/a/49041392/4119004
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', function(ev) {
        console.log(this);
        const table = th.closest('table');
        
        // remove and reset other tags
        table.querySelectorAll("th").forEach(th => {
            th.classList.remove("descending");
            th.classList.remove("ascending");
            if(th !== this) {
                th.asc = false;
            }
        });
        
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr) );
        if(this.asc) {
            this.classList.add("ascending");
        }
        else {
            this.classList.add("descending");
        }
    }));
});