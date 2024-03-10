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
    
    const updateDisplay = (categories) => {
        // update background
        for(let input of document.querySelectorAll("input[name='theme']")) {
            if(input.checked) {
                output.classList.add(input.value);
            }
            else {
                output.classList.remove(input.value);
            }
        }
        
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
        
        categories.forEach((cat, limit) => {
            let gallery = $($(".gallery")[limit]);
            gallery.empty();
            gallery.prev().toggleClass("missing", cat.length === 0);
            let exu_limit = limit === 3 && showUnlimited.checked ? "explicitlyUnlimited" : limit;
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
                // console.log(card);
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
    
    updateDisplay();
});
