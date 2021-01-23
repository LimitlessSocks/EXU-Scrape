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
        inner.toggle();
        
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
            let isSearch = words.every(({ value, exact }) => {
                let range;
                
                if(anchor) {
                    range = entry.name;
                }
                else {
                    range = entry.name + " " + entry.author;
                }
                
                range = range.toLowerCase();
                
                if(exact || anchor) {
                    range = range.split(/\s+/);
                }
                
                if(anchor) {
                    let isValid = true;
                    if(anchor & ANCHOR_START) {
                        isValid = isValid && range[0].startsWith(value);
                    }
                    if(anchor & ANCHOR_END) {
                        isValid = isValid && range[range.length - 1].endsWith(value);
                    }
                    return isValid;
                    // return range.some(v =>
                        // (anchor & ANCHOR_START ? v.startsWith(value) : true) &&
                        // (anchor & ANCHOR_END   ? v.endsWith(value) : true)
                    // );
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
    /*
    let filterBy = document.getElementById("filterBy");
    let filterToggle = document.getElementById("filterByToggle");
    let inner = document.getElementById("filterByInner");
    filterToggle.addEventListener("click", function (e) {
        filterBy.style.width = filterIsShowing ? "auto" : "70%";
        inner.style.display = filterIsShowing ? "none" : "inline";
        if(filterIsShowing) {
            this.classList.remove("toggled");
        }
        else {
            this.classList.add("toggled");
        }
        
        filterIsShowing = !filterIsShowing;
    });
    
    let onInput = function () {
        //console.log("Filtering!");
        let filter = this.value.toLowerCase().split(/\s+/);
        let links = document.querySelectorAll("#listing a");
        for(let link of links) {
            let entry = Database[link.id];
            let isSearch = filter.every((word) => entry.search.indexOf(word) !== -1);
            console.log(isSearch);
        }
    };
    inner.addEventListener("input", onInput);
    inner.addEventListener("keydown", onInput);
    */
    
});