// todo
let onLoad = async function () {
    await CardViewer.Database.initialReadAll("./db.json");
    
    let totalComposite;
    const MAX_LENGTH = 10;
    fetch("./totalComposite.json").then(async (data) => {
        let decklists = await data.json();
        let originalToFind = document.getElementById("originalToFind");
        let originalResults = document.getElementById("originalResults");
        let results = originalResults.querySelector("tbody");
        
        const findResults = () => {
            let { value } = originalToFind;
            if(!value) {
                return;
            }
            
            value = value.toLowerCase();
            
            let messages = [];
            
            results.innerHTML = "";
            let matchingLists = Object.entries(decklists).map(([id, decklist]) => {
                let allCards = [].concat(decklist.main, decklist.side, decklist.extra);
                let matches = allCards.filter(card => card.id == value || card.name?.toLowerCase()?.includes(value));
                return { id, name: decklist.name, matches };
            })
            .filter(({ matches }) => matches.length !== 0);
            
            if(matchingLists.length > MAX_LENGTH) {
                matchingLists = matchingLists.slice(0, MAX_LENGTH);
                messages.push(`Showing first 10 of ${matchingLists.length} results`);
            }
            
            for(let { id, name, matches } of matchingLists) {
                let tr = document.createElement("tr");
                let idTd = document.createElement("td");
                let nameTd = document.createElement("td");
                let matchTd = document.createElement("td");
                
                idTd.textContent = id;
                nameTd.textContent = name;
                matchTd.textContent = matches.map(match => [
                    match.name,
                    match.id,
                    match.username,
                    match.card_type,
                    match.type,
                ].join(" · ")).join("\n");
                
                tr.appendChild(idTd);
                tr.appendChild(nameTd);
                tr.appendChild(matchTd);
                
                results.appendChild(tr);
            }
        };
        
        findResults();
        originalToFind.addEventListener("input", findResults);
        
    });
    
    const updateCardNameToLinkOutput = () => {
        let value = $("#cardNameToLinkInput").val();
        
        if(!value.trim()) {
            return;
        }
        
        let outputs = [
            $("#cardNameToLinkOutput"),
            $("#cardNameToLinkMarkdown"),
        ];
        for(let output of outputs) {
            output.removeClass("hidden");
        }
        outputs[0].empty();
        outputs[1].val("");
        CardViewer.initCardIdsByName();
        
        let lowerValue = value.toLowerCase();
        let names = [];
        for(let name of Object.keys(CardViewer.Database.cardsIdsByName)) {
            if(lowerValue.includes(name)) {
                names.push(name);
            }
        }
        if(!names.length) {
            return;
        }
        
        names.sort((a, b) => b.length - a.length);
        
        let reg = new RegExp(names.map(name => "\\b" + escapeRegExp(name) + "\\b").join("|"), "gui");
        let html = value.replace(reg, name => {
            let card = CardViewer.getCardByName(name);
            return `<a href="${CardViewer.getCardLink(card)}">${name}</a>`;
        });
        let md = value.replace(reg, name => {
            let card = CardViewer.getCardByName(name);
            return `[${name}](${CardViewer.getCardLink(card)})`;
        });
        outputs[0].html(html);
        outputs[1].val(md);
    };
    
    $("#cardNameToLinkInput").on("input", updateCardNameToLinkOutput);
    updateCardNameToLinkOutput();
    
    const updateBanlistChanges = async () => {
        let text = $("#banlistChanges").val();
        if(!text.trim()) {
            return;
        }
        let categories = {};
        let category = null;
        for(let line of text.split(/\r?\n/)) {
            console.log(category);
            line = line.trim();
            // remove everything before the non-word characters (emoji, bullets, etc)
            line = line.replace(/^.*?(:[~\w]+?:|\W)+/, "");
            if(line.endsWith(":")) {
                line = line.replace(/\W/g, "");
                category = line.toLowerCase();
                categories[category] = [];
            }
            else if(line) {
                categories[category].push(line);
            }
        }
        
        const oldBanlist = await fetch("./banlist.json").then(req => req.json());
        const newBanlist = Object.assign({}, oldBanlist, {
            newly_changed: []
        });
        
        let newNewlyChanged = [];
        // key: what @Red types; value: what banlist.json uses
        const ADJUST_CATEGORIES = new Map([
            ["forbidden", "banned"],
            ["limited", "limited"],
            ["semilimited", "semi_limited"],
            ["semi-limited", "semi_limited"],
            ["unlimited", "unlimited"],
        ]);
        for(let [ category, target ] of ADJUST_CATEGORIES) {
            for(let name of categories[category] ?? []) {
                let card = CardViewer.getCardByName(name);
                if(!card) {
                    // TODO: we can do better than alert
                    alert(`Could not find card with name '${name}'`);
                }
                let { id } = card;
                newBanlist.newly_changed.push(id);
                // remove from existing arrays
                for(let removeTarget of ADJUST_CATEGORIES.values()) {
                    newBanlist[removeTarget] = newBanlist[removeTarget].filter(theirId => theirId != id);
                }
                // add to new target
                newBanlist[target].push(id);
            }
        }
        
        // render the new json file
        const ITERATE_ORDER = [
            "banned",
            "limited",
            "semi_limited",
            "unlimited",
            "newly_changed",
        ];
        const MAX_WIDTH = 80; // characters
        let prettyJsonLines = [ "{" ];
        for(let target of ITERATE_ORDER) {
            prettyJsonLines.push(" ".repeat(4) + `"${target}": [`);
            prettyJsonLines.push(" ".repeat(8));
            let lastIndex = prettyJsonLines.length - 1;
            for(let id of newBanlist[target]) {
                let stringRep = `${id}, `;
                if(prettyJsonLines[lastIndex].length + stringRep.length >= MAX_WIDTH) {
                    prettyJsonLines.push(" ".repeat(8));
                    lastIndex++;
                }
                prettyJsonLines[lastIndex] += stringRep;
            }
            // remove trailing ", "
            prettyJsonLines[lastIndex] = prettyJsonLines[lastIndex].slice(0, -2);
            prettyJsonLines.push(" ".repeat(4) + "],");
        }
        prettyJsonLines.pop();
        prettyJsonLines.push(" ".repeat(4) + "]");
        prettyJsonLines.push("}");
        let newValue = prettyJsonLines.join("\n") + "\n";
        $("#banlistChangesOutput").val(newValue).removeClass("hidden");
    };
    $("#banlistChanges").on("input", updateBanlistChanges);
    updateBanlistChanges();
    
    const updateSpreadsheetOutput = () => {
        let val = $("#cardsToSpreadsheet").val();
        if(!val.trim()) {
            return;
        }
        let limits = ["Forbidden", "Limited", "Semi-Limited", "Unlimited"];
        let rejected = [];
        let tableValues = val
            .trim()
            .split("\n")
            .map(e => CardViewer.getCardByName(e) ?? CardViewer.Database.cards[e] ?? (rejected.push(e), undefined))
            .filter(e => e)
            .map(e => [
                e.card_type + (
                    e.card_type=="Monster" && e.monster_color !== "Normal"
                        ? "/" + e.monster_color : ""
                    ),
                    e.serial_number,
                    e.name.toUpperCase(),
                    limits[e.tcg_limit],
                    ,
                    limits[e.exu_limit],
            ]);
        
        // console.log(tableValues);
        $("#spreadsheetOutput").removeClass("hidden").val(
            (rejected.length
                ? `!!! ERROR !!! COULD NOT FIND !!!\n${rejected.join("; ")}\n------------------------------\n`
                : ""
            ) + tableValues.map(row => row.join("\t")).join("\n")
        );
    };
    $("#cardsToSpreadsheet").on("input", updateSpreadsheetOutput);
    updateSpreadsheetOutput();
    
    const updateCardGuess = (name, cardDisplay) => {
        let guess = CardViewer.getCardByName(name);
        if(guess) {
            cardDisplay.empty();
            cardDisplay.append(CardViewer.composeResultSmall(guess));
        }
        else {
            cardDisplay.text("Could not find <" + name + ">");
        }
    };
    const textBanlistState = {
        missingCards: [],
        changeMap: {},
    };
    const updateTextBanlistOutput = () => {
        let val = $("#textBanlistInput").val();
        if(!val) {
            return;
        }
        
        textBanlistState.missingCards = [];
        textBanlistState.changeMap = {};
        
        let errored = false;
        let errorMessages = [];
        
        val.split(/\r?\n/).forEach(line => {
            if(line.startsWith("- ")) {
                line = line.slice(2);
            }
            if(!line) {
                return; // skip
            }
            let parts = line
                .trim()
                .match(/^(.+) ([0-3]\s*(?:>|->|>>)\s*[0-3])\s*$/);
            if(!parts) {
                errorMessages.push("Malformed line: " + line);
                errored = true;
                return;
            }
            let [ , name, statusChange ] = parts;
            let oldStatus = statusChange.at(0);
            let newStatus = statusChange.at(-1);
            
            let card = CardViewer.getCardByName(name);
            
            if(!card) {
                textBanlistState.missingCards.push(name);
            }
            textBanlistState.changeMap[newStatus] ||= [];
            textBanlistState.changeMap[newStatus].push({ name, oldStatus, newStatus });
            // console.log(name, ";", oldStatus, ";", newStatus);
        });
        
        if(errored) {
            $("#textBanlistOutput").removeClass("hidden");
            $("#missingCards").addClass("hidden");
            $("#textBanlistOutput").val(errorMessages.join("\n"));
            return;
        }
        
        if(textBanlistState.missingCards.length > 0) {
            $("#missingCards").removeClass("hidden");
            $("#textBanlistOutput").addClass("hidden");
            $("#missingCards tbody").empty();
            for(let name of textBanlistState.missingCards) {
                let row = $("<tr>");
                let input = $("<input>");
                let cardDisplay = $("<div>");
                input.on("input", () => {
                    updateCardGuess(input.val(), cardDisplay);
                });
                row.append($("<td>").text(name));
                row.append($("<td>").append(input));
                row.append($("<td>").append(cardDisplay));
                $("#missingCards tbody").append(row);
            }
        }
        else {
            $("#missingCards").addClass("hidden");
            finishTextBanlist();
        }
    };
    
    const finishTextBanlist = () => {
        $("#textBanlistOutput").removeClass("hidden");
        let finishedEntries = [...$("#missingCards input")].map(i => i.value);
        let output = JSON.stringify({
            nameChanges: textBanlistState.missingCards.map((newName, idx) => ({
                before: finishedEntries[idx],
                after: newName,
            })),
            banlistChanges: textBanlistState.changeMap, 
        });
        $("#textBanlistOutput").val(output);
    };
    
    $("#submitMissingCards").on("click", finishTextBanlist);
    $("#textBanlistInput").on("input", updateTextBanlistOutput);
    updateTextBanlistOutput();
    
    $("#updateChanges").click(() => {
        let p = new Prompt("Load from text", () => $("<textarea>"), ["Submit", "Cancel"], "large");
        p.deploy().then(data => {
            let [ buttonIndex, , inner ] = data;
            if(buttonIndex !== 0) {
                return;
            }
            let value = inner.find("textarea").val();
            let json = JSON.parse(value);
            CardViewer.integrateNameChanges(json.nameChanges);
            CardViewer.integrateBanlistChanges(json.banlistChanges);
            $("#cardsToSpreadsheet").val(Object.entries(json.banlistChanges).flatMap(([ limit, cards ]) => cards.map(card => card.name)).join("\n"));
            updateSpreadsheetOutput();
        });
    });
};

window.addEventListener("load", onLoad);
