$(document).ready(function () {
    // let filterIsShowing = false;
    for(let [key, value] of Object.entries(Database)) {
        value.id = key;
    }
    
    let filterByToggle = $("#filterByToggle");
    let filterBy = $("#filterBy");
    let inner = $("#filterByInner");
    let randomArchetype = $("#randomArchetype");
    let randomArchetypeButton = $("#randomArchetypeButton");
    // CardViewer.setUpFilterByToggle(filterByToggle, filterBy, inner);
    let resizeCalc = () => {
        let left = filterBy.position().left;
        let width = filterBy.width();
        randomArchetype.css("left", 50 + width + "px");
    };
    resizeCalc();
    $(window).resize(resizeCalc);
    inner.val("");
    filterByToggle.click(() => {
        filterByToggle.toggleClass("toggled");
        filterBy.find(".toggleable").toggle();
        
        if(filterByToggle.hasClass("toggled")) {
            filterBy.css("width", "70%");
        }
        else {
            filterBy.css("width", "auto");
        }
        resizeCalc();
    });
    const archNames = [...$("#listing .deck-link")].map(e => e.textContent);
    randomArchetypeButton.click(() => {
        let r = archNames[Math.random() * archNames.length | 0];
        if(!filterByToggle.hasClass("toggled")) {
            filterByToggle.click();
        }
        setTimeout(resizeCalc, 0);
        inner.val('name:"' + r + '"');
        onInput.bind(inner[0])();
    });
    
    
    const ANCHOR_NONE  = 0b000;
    const ANCHOR_START = 0b001;
    const ANCHOR_END   = 0b010;
    const ANCHOR_BOTH  = ANCHOR_START | ANCHOR_END;
    let onInput = function () {
        //console.log("Filtering!");
        let filter = this.value.toLowerCase();
        let anchor = ANCHOR_NONE;
        if(filter.startsWith("^")) {
            anchor |= ANCHOR_START;
            filter = filter.slice(1);
        }
        if(filter.endsWith("$"))   {
            anchor |= ANCHOR_END;
            filter = filter.slice(0, -1);
        }
        
        let words = [];
        let inString = false;
        let buildWord = "";
        for(let ch of filter) {
            if(ch == '"') inString = !inString;
            else if(ch.match(/\s/) && !inString) {
                if(buildWord) {
                    words.push(buildWord);
                    buildWord = "";
                }
                continue;
            }
            buildWord += ch;
        }
        if(buildWord) {
            words.push(buildWord);
        }
        // console.log(words);
        words = words
            .map(e => {
                let res = {
                    value: e,
                    exact: false,
                    // split: true,
                    split: false,
                    field: null,
                };
                
                let hasField = e.match(/(\w+)([:=])/);
                
                if(hasField) {
                    res.field = hasField[1];
                    res.value = res.value.slice(hasField[0].length);
                    res.exact = hasField[2] == "=";
                }
                
                let quoteBounded = res.value.startsWith('"') && res.value.endsWith('"');
                
                if(quoteBounded && res.value.length >= 2) {
                    res.value = res.value.slice(1, -1);
                    if(!hasField) {
                        res.exact = true;
                    }
                    res.split = false;
                }
                
                if(!res.field) {
                    // res.field = "name";
                }
                
                res.value = res.value.replace(/["']/g, "");
                console.log(words, res);
                return res;
            });
            
        console.log(words);
        
        let links = $("#listing a");
        for(let link of links) {
            let entry = Database[link.id];
            if(anchor && !words.some(({ exact }) => exact)) {
                words = words.reduce((o1, o2) => ({
                    value: o1.value + " " + o2.value,
                    exact: false,
                    field: o1.field || o2.field,
                    split: o1.split,
                }));
                words = [ words ];
                window.wordTest = words;
                // console.log(words);
            }
            let isSearch = words.every(({ value, exact, field, split }, i) => {
                let range;
                if(anchor || field == "name") {
                    range = entry.name;
                }
                else if(entry[field]) {
                    range = entry[field];
                }
                else {
                    range = [
                        entry.name,
                        entry.author,
                        ...(entry.tags || ["untagged"])
                    ].join(" ");
                    // range = entry.name + " " + entry.author;
                }
                console.log(field, range, value);
                
                range = range.toLowerCase();
                // console.log(split);
                // if(split) {
                    // range = range.split(/\s+/);
                // }
                
                if(anchor) {
                    let isValid = true;
                    if(anchor & ANCHOR_START) {
                        isValid = isValid && range.startsWith(value);
                    }
                    if(anchor & ANCHOR_END) {
                        isValid = isValid && range.endsWith(value);
                    }
                    return isValid;
                }
                else {
                    if(exact) {
                        return range == value;
                    }
                    else {
                        return range.indexOf(value) !== -1;
                    }
                }
                
            });
            $(link).toggle(isSearch);
        }
    };
    inner.on("input", onInput);
    inner.on("keydown", function (ev) {
        if(ev.originalEvent.key === "Enter") {
            onInput.bind(this)();
        }
    });
    
});