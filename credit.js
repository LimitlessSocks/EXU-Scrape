window.addEventListener("load", async function () {
    await CardViewer.Database.initialReadAll("./db.json");
    
    const per = document.getElementById("percent");
    const sofar = document.getElementById("sofar");
    const customtotal = document.getElementById("customtotal");
    
    // add credits from JSON
    let unread = await fetch("./credit.json");
    let creditContent = await unread.json();
    let creditsElement = document.querySelector("#credits tbody");
    for(let [ id, data ] of Object.entries(creditContent)) {
        // console.log(data);
        let tr = document.createElement("tr");
        let cardName = document.createElement("td");
        let cardId = document.createElement("td");
        let artSource = document.createElement("td");
        let artist = document.createElement("td");
        let notes = document.createElement("td");
        
        cardName.textContent = data.name;
        
        let cardIdAnchor = document.createElement("a");
        cardIdAnchor.textContent = data.id;
        cardIdAnchor.href = `./card?id=${data.id}`;
        cardId.appendChild(cardIdAnchor);
        
        let { href, text } = data.src;
        if(href || text) {
            let artSourceAnchor = document.createElement("a");
            artSourceAnchor.textContent = text;
            artSourceAnchor.href = href;
        }
        
        artist.textContent = data.artist;
        if(data.links.length) {
            artist.textContent += " (";
            data.links.forEach(({ href, text}, index) => {
                let artistLinkAnchor = document.createElement("a");
                artistLinkAnchor.textContent = text;
                artistLinkAnchor.href = href;
                artist.appendChild(artistLinkAnchor);
                let after = index + 1 === data.links.length
                    ? ")"
                    : " \u22c5 ";
                artist.appendChild(document.createTextNode(after));
            });
        }
        
        notes.textContent = data.notes;
        
        tr.appendChild(cardName);
        tr.appendChild(cardId);
        tr.appendChild(artSource);
        tr.appendChild(artist);
        tr.appendChild(notes);
        
        creditsElement.appendChild(tr);
    }
    
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