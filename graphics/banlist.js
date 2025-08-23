// graphics/banlist.js
const formatDate = date => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};

// Example usage:
const date = new Date(); // You can pass your desired date object here
const formattedDate = formatDate(date);
console.log(formattedDate); // Output: e.g., "October 03, 2022"


window.addEventListener("load", async function () {
    await CardViewer.Database.initialReadAll("./../db.json");
    
    const output = document.getElementById("output");
    
    let categories = [
        [1, 2, 3, 4],
        [51, 6, 7],
        [8, 9, 10, 11, 12],
        [13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16],
    ];
    categories = [[], [], [], []];
    
    const showUnlimited = document.getElementById("show-unlimited");
    const showOCGSymbol = document.getElementById("show-ocg-symbol");
    const showTCGSymbol = document.getElementById("show-tcg-symbol");

    const stop1 = document.getElementById("stop1");
    const stop2 = document.getElementById("stop2");
    const stop3 = document.getElementById("stop3");
    
    const ORIGINAL_HEIGHT = 1185;
    const ORIGINAL_WIDTH = 813;
    const ORIGINAL_ASPECT = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;
    const OUTPUT_WIDTH = 810;
    const GAP = 5; //px
    
    const BASE_OUTPUT_HEIGHT = 255; //px
    
    const getCategories = () => {
        let categories = [...$("#input textarea")].map(area => {
            let lines = area.value.trim().split("\n").filter(e => e.trim());
            return lines
                .map(line => CardViewer.getCardByName(line) ?? CardViewer.Database.cards[line] ?? console.error("Could not find card " + line))
                .map(card => card?.id)
                .filter(id => id);
        });
        return categories;
    };
    
    let COLOR_DICTIONARIES = {
        blue:  ["#3D747F", "#0F0F35", "#001013"],
        red:   ["#7F743D", "#350F0F", "#131000"],
        green: ["#747F3D", "#0F350F", "#101300"],
    }
    for(let input of document.querySelectorAll("input[name='theme']")) {
        input.addEventListener("change", function () {
            let chosenColors = COLOR_DICTIONARIES[this.value];
            stop1.value = chosenColors[0];
            stop2.value = chosenColors[1];
            stop3.value = chosenColors[2];
            updateDisplay();
        });
    }
    const cachedCategories = [];
    const updateDisplay = (categories) => {
        // update background
        output.style.background = `radial-gradient(circle, ${stop1.value} 0%, ${stop2.value} 88%, ${stop3.value} 100%)`;
        
        // update effective date display
        let [ year, month, day ] = document.getElementById("effective-date")
            .value
            .split("-")
            .map(e => parseInt(e, 10));
        console.log(year, month, day);
        let date = new Date(year, month - 1, day); // takes monthIndex
        let dateDisplay = formatDate(date);
        console.log(date, dateDisplay);
        $(".date").text(dateDisplay);
        
        categories ??= getCategories();
            
        let cardsPerRow = parseInt(document.getElementById("cards-per-row").value, 10);
        
        let rowCount = categories
            .map(cat => cat.length === 0
                ? 0
                : Math.max(0, 1 + (cat.length - 1) / cardsPerRow | 0)
            )
            .reduce((p, c) => p + c, 0);
        
        let outputBaseWidth = OUTPUT_WIDTH - 20; // subtracting gallery padding
        let cardBaseWidth = Math.floor(outputBaseWidth / cardsPerRow - GAP); //subtracting gap
        let cardBaseHeight = Math.floor(cardBaseWidth / ORIGINAL_ASPECT);
        console.log("B W/H", cardBaseWidth, cardBaseHeight);
        
        let cardScale = cardBaseHeight / ORIGINAL_HEIGHT;
        
        output.style.setProperty("--card-width", cardBaseWidth + "px");
        output.style.setProperty("--card-height", cardBaseHeight + "px");
        output.style.setProperty("--card-scale", cardScale);
        
        let cardTotalHeight = cardBaseHeight + GAP; //px + gap
        
        let newHeight = BASE_OUTPUT_HEIGHT + rowCount * cardTotalHeight;
        output.style.height = `${newHeight}px`;
        // scale down to fit
        let fitTo = window.innerHeight - document.querySelector("h1.title").getBoundingClientRect().bottom - 10;
        if(newHeight > fitTo) {
            output.style.transform = `scale(${fitTo / newHeight})`;
        }
        else {
            output.style.transform = `scale(1)`;
        }
        
        window.cachedCategories=cachedCategories;
        categories.forEach((cat, limit) => {
            let gallery = $($(".gallery")[limit]);
            gallery.empty();
            gallery.prev().toggleClass("missing", cat.length === 0);
            let exu_limit = limit === 3 && showUnlimited.checked ? "explicitlyUnlimited" : limit;
            cachedCategories[limit] = [];
            cat.forEach(cardId => {
                let card = {
                    ...CardViewer.Database.cards[cardId],
                    exu_limit,
                };
                if(!showOCGSymbol.checked) {
                    card.tcg = 1;
                }
                if(!showTCGSymbol.checked) {
                    card.ocg = 1;
                }
                // console.log("HMMMM", cardId, card.name);
                cachedCategories[limit].push(card);
                let view = CardViewer.composeResultDeckPreview(card);
                let holder = $("<div class=card-holder>");
                holder.append(view);
                gallery.append(holder);
            });
        });
    };
    
    $("#input textarea, #input input").on("input", ev => {
        updateDisplay();
    });
    
    $("#sortEachBanlist").click(() => {
        let textareas = [...$("#input textarea")];
        for(let limit = 0; limit <= 3; limit++) {
            let cards = cachedCategories[limit];
            let sorted = CardViewer.naturalBanlistSort([...cards]);
            let newValue = sorted.map(card => card.name).join("\n");
            textareas[limit].value = newValue;
        }
        updateDisplay();
    });
    
    const loadFromJSON = json => {
        if(json.nameChanges) {
            CardViewer.getCardByName("");
            CardViewer.integrateNameChanges(json.nameChanges);
        }
        let textareas = [...$("#input textarea")];
        for(let limit = 0; limit <= 3; limit++) {
            textareas[limit].value = json.banlistChanges[limit]?.map(card => card.name)?.join("\n") ?? "";
        }
        
        updateDisplay();
    };
        
    let cachedJSON = null;
    $("#loadFromText").click(() => {
        let p = new Prompt("Load from text", () => $("<textarea>"), ["Submit", "Cancel"], "large");
        p.deploy().then(data => {
            let [ buttonIndex, , inner ] = data;
            if(buttonIndex !== 0) {
                return;
            }
            let value = inner.find("textarea").val();
            let json = JSON.parse(value);
            cachedJSON = json;
            loadFromJSON(json);
        });
    });
    
    $("#saveAsText").click(() => {
        let oldStatusByName = {};
        if(cachedJSON) {
            Object.entries(cachedJSON.banlistChanges).forEach(([limit, cards]) => {
                for(let card of cards) {
                    oldStatusByName[card.name] = card.oldStatus;
                }
            });
        }
        
        const getOldLimit = card => {
            return oldStatusByName[card.name] ?? card[CardViewer.getLimitProperty()];
        };
        
        let result = "";
        
        const AMOUNTS = [":banlistbanned:", ":banlistlimited:", ":banlistsemilimited:", ":banlistunlimited:"];
        
        let textareas = [...$("#input textarea")];
        textareas.forEach((textarea, limit) => {
            textarea.value.split("\n").forEach(cardName => {
                if(!cardName) {
                    return; // skip
                }
                let card = CardViewer.getCardByName(cardName);
                console.log(cardName, card);
                result += `- ${card.name} ${AMOUNTS[getOldLimit(card)]} » ${AMOUNTS[limit]}\n`; 
            });
            result += "\n";
        });
        let p = new Prompt("Saved text", () => $("<textarea readonlys>").val(result), ["OK"], "large");
        p.deploy();
        
    });
    
    updateDisplay();
});
