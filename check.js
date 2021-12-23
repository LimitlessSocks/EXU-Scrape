const countToLimit = (n) => [
    "Banned",
    "Limited",
    "Semi-limited",
    "Unlimited"
][n];

const verifyXMLList = (raw) => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(raw, "text/xml");
    window.doc = doc;
    let cards = doc.getElementsByTagName("card");
    
    let invalidEntries = {};
    
    for(let card of cards) {
        let { id, passcode } = card.attributes;
        let idValue = id.value;
        let passcodeValue = passcode.value;
        let isCustom = !passcodeValue;
        let reason, limit;
        if(isCustom && !pool[idValue]) {
            reason = "Non-existent custom card";
        }
        else if(pool[idValue] && pool[idValue].ocg && !pool[idValue].tcg) {
            reason = "OCG card";
        }
        else {
            if(banlist[idValue]) {
                limit = banlist[idValue].exu_limit;
            }
            else if(pool[idValue]) {
                limit = pool[idValue].exu_limit;
            }
            // assume at 3
            if(typeof limit === "undefined") {
                console.log(`Assuming ${card.textContent} is at 3`);
                limit = 3;
            }
            let word = countToLimit(limit);
            reason = `Too many copies of ${limit === 3 ? "an" : "a"} ${word} card`;
        }
        if(reason) {
            let entry = invalidEntries[idValue] || {};
            if(typeof entry.count === "undefined") {
                entry.count = 0;
                if(limit) {
                    entry.limit = limit;
                }
                entry.name = card.textContent;
                entry.reason = reason;
            }
            entry.count++;
            invalidEntries[idValue] = entry;
        }
    }
    
    let messages = [];
    for(let [id, data] of Object.entries(invalidEntries)) {
        let { count, name, reason, limit } = data;
        if(count > limit || typeof limit === "undefined") {
            messages.push({
                report: `${reason}: ${count}x ${name}`,
                type: "error",
            });
        }
    }
    if(!messages.length) {
        messages.push({
            report: "No problems found!",
            type: "success",
        });
    }
    let bounds = [
        ["main", 40, 60],
        ["extra", 0, 15],
        ["side", 0, 15],
    ];
    for(let [tag, min, max] of bounds) {
        let count = doc.getElementsByTagName(tag)[0].children.length;
        let excess;
        if(count < min) {
            excess = "few";
        }
        else if(count > max) {
            excess = "many";
        }
        if(excess) {
            messages.push({
                report: `Too ${excess} cards in ${tag} (expected ${min} to ${max}, got ${count})`,
                type: "error",
            });
        }
        else {
            messages.push({
                report: `Sufficient cards in ${tag} (${count})`,
                type: "success",
            });
        }
        if((tag === "side" || tag === "extra") && count < 15 && (tag === "extra" ? count > 0 : true)) {
            messages.push({
                report: `Usually, it is to your advantage to have 15 cards in your ${tag} deck.`,
                type: "hint",
            });
        }
    }
    
    // let name = doc.getElementsByTagName("deck")[0].attributes.name.value;
    let name = doc.getElementsByTagName("deck")[0].attributes[0].value;
    messages.unshift({
        report: "Result for checking deck " + name,
        type: "header",
    });
    
    return messages;
};

const getList = async (name) => {
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/" + name + ".json");
    let db = await response.json();
    return db;
};

let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";
window.addEventListener("load", async function () {
    window.banlist = await getList("banlist");
    // window.pool = await getList("db");
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    window.pool = CardViewer.Database.cards;
    
    const messageHolder = $("#message-holder");
    const deckInput = $("#deck-input");
    $("#check-submit").click(function () {
        let file = deckInput[0].files[0];
        // console.log(file);
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let result = evt.target.result;
            let messages = verifyXMLList(result);
            messageHolder.empty();
            for(let { report, type } of messages) {
                let p = $("<p>");
                if(type) {
                    p.addClass(type);
                }
                p.text(report);
                messageHolder.append(p);
            }
        };
    });
});