// todo
let onLoad = async function () {
    await CardViewer.Database.initialReadAll("./db.json");
    
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
            line = line.trim();
            // remove everything before the non-word characters (emoji, bullets, etc)
            line = line.replace(/^.*?\W+/, "");
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
        // key: what red types; value: what banlist.json uses
        const ADJUST_CATEGORIES = new Map([
            ["forbidden", "banned"],
            ["limited", "limited"],
            ["semilimited", "semi_limited"],
            ["unlimited", "unlimited"],
        ]);
        for(let [ category, target ] of ADJUST_CATEGORIES) {
            for(let name of categories[category]) {
                let { id } = CardViewer.getCardByName(name);
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
};

window.addEventListener("load", onLoad);
