window.addEventListener("load", function () {
    // let filterIsShowing = false;
    for(let [key, value] of Object.entries(Database)) {
        value.id = key;
    }
    
    let filterByToggle = $("#filterByToggle");
    let filterBy= $("#filterBy");
    let inner = $("#filterByInner");
    inner.val("");
    filterByToggle.click(() => {
        filterByToggle.toggleClass("toggled");
        $("#filterBy .toggleable").toggle();
        
        if(filterByToggle.hasClass("toggled")) {
            filterBy.css("width", "70%");
        }
        else {
            filterBy.css("width", "auto");
        }
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
        
        let words = filter
            .split(/\s+/)
            .map(e => {
                let res = {
                    value: e,
                    exact: false
                };
                if(e.startsWith('"') && e.endsWith('"') && e.length >= 2) {
                    res.value = res.value.slice(1, -1);
                    res.exact = true;
                }
                res.value = res.value.replace(/["']/g, "");
                return res;
            });
        
        let links = $("#listing a");
        for(let link of links) {
            let entry = Database[link.id];
            if(anchor && !words.some(({ exact }) => exact)) {
                words = words.reduce((o1, o2) => ({
                    value: o1.value + " " + o2.value,
                    exact: false,
                }));
                words = [ words ];
                window.wordTest = words;
                // console.log(words);
            }
            let isSearch = words.every(({ value, exact }, i) => {
                let range;
                
                if(anchor) {
                    range = entry.name;
                }
                else {
                    range = [
                        entry.name,
                        entry.author,
                        ...(entry.tags || ["untagged"])
                    ].join(" ");
                    // range = entry.name + " " + entry.author;
                }
                
                range = range.toLowerCase();
                
                if(exact) {
                    range = range.split(/\s+/);
                }
                
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
                    return range.indexOf(value) !== -1;
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