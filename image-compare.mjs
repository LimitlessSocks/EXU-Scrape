// import computeAverageHash from "./image.mjs";
import phash from "./phash.mjs";

let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

// window.databaseToUse = baseURL + "/users/LimitlessSocks.json";

let loadDatabase = async function () {
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
};

function hammingDistance(str1, str2) {
    if (str1.length !== str2.length) {
        throw new Error('Strings must have equal length');
    }

    let distance = 0;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
            distance++;
        }
    }

    return distance;
}

const hashBrowser = function(canvas, imageFile) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        
        reader.onload = function(ev) {
            const image = new Image();
            image.onload = function() {
                let ctx = canvas.getContext("2d");
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                let { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let clamped = new Uint8ClampedArray(data);
                let hashed = phash({
                    image: clamped,
                    width: canvas.width,
                    height: canvas.height
                });
                console.log("input", hashed);
                resolve(hashed);
            };
            image.src = ev.target.result;
            image.onerror = function (err) {
                reject(`Error: Could not read image ${err}`);
            };
        };

        reader.readAsDataURL(imageFile);
    });
};

window.addEventListener("load", async function () {
    const hashesRaw = await fetch("./img-hashes.json");
    const hashesDatabase = await hashesRaw.json();
    const hashesDatabaseEntries = Object.entries(hashesDatabase);
    window.hashesDatabase = hashesDatabase;
    
    const submitImage = document.getElementById("submit-image");
    const imageInput = document.getElementById("image-input");
    const output = document.getElementById("output");
    
    await loadDatabase();
    let canvas = document.createElement("canvas");
    
    submitImage.addEventListener("click", async function () {
        while(output.firstChild) {
            output.removeChild(output.firstChild);
        }
        let cutoff = 30;
        let nearExactCutoff = 10;
        let messageCountCutoff = 50;
        [...imageInput.files].forEach(async (file, idx) => {
            let hash = await hashBrowser(canvas, file);
            
            // header display
            let header = document.createElement("h2");
            header.textContent = `File ${idx + 1}/${imageInput.files.length}`;
            let item = document.createElement("div");
            item.textContent = `Given image`;
            let matchImage = document.createElement("img");
            matchImage.src = canvas.toDataURL();
            matchImage.width = matchImage.height = 128;
            item.classList.add("match-item");
            item.appendChild(matchImage);
            output.appendChild(header);
            output.appendChild(item);
            
            let matchContainer = document.createElement("div");
            matchContainer.classList.add("matches");
            
            let matches = hashesDatabaseEntries
                .map(([ id, theirHash ]) => [ id, theirHash, hammingDistance(hash, theirHash) ])
                .filter(([ id, theirHash, distance ]) => distance <= cutoff)
                .sort((a, b) => a[2] - b[2]);
            
            let nearExact = matches.filter(([ id, theirHash, distance]) => distance < nearExactCutoff);
            console.log(nearExact);
            let message;
            if(nearExact.length > 0) {
                matches = nearExact;
                message = `${matches.length} near-exact match(es) found`;
            }
            else {
                message = `${matches.length} match(es) found`;
            }
                
            if(matches.length > messageCountCutoff) {
                message += `, showing first ${messageCountCutoff}`;
                matches = matches.slice(0, messageCountCutoff);
            }
            
            output.appendChild(document.createTextNode(message));
            output.appendChild(matchContainer);
            
            matches.forEach(([ id, theirHash, distance ]) => {
                // let matchImage = document.createTextNode(id + "! ");
                let card = CardViewer.Database.cards[id];
                if(!card) {
                    console.warn("Could not find card with id", id);
                    return;
                }
                card.src ||= `https://www.duelingbook.com/images/low-res/${id}.jpg`;
                
                // console.log(id, card.name, distance);
                // console.log(theirHash);
                
                
                let item = document.createElement("div");
                item.classList.add("match-item");
                item.textContent = `${card.name}`;
                let matchImage = document.createElement("img");
                matchImage.src = card.src;
                matchImage.width = matchImage.height = 128;
                item.appendChild(matchImage);
                matchContainer.appendChild(item);
            });
        });
    });
});
