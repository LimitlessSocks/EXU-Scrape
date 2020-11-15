window.databaseToUse = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/db.json";

const cardsBy = (fn, query = {}, exclude = null) => {
    let hash = {};
    if(typeof fn !== "function") {
        let type = fn;
        fn = (card) => card[type];
    }
    let swath = CardViewer.filter(query, exclude);
    for(let card of Object.values(swath)) {
        let prop = fn(card);
        hash[prop] = hash[prop] || 0;
        hash[prop]++;
    }
    return hash;
};

// const compare = (x, y) => (x > y) - (x < y);
const compare = (x, y) => x.toString().localeCompare(y, undefined, { numeric: true });

const sortBy = (arr, gfn) => {
    let graded = arr.map((v, e, oa) => [v, gfn(v, e, oa)]);
    return graded.sort(([av, ag], [bv, bg]) => compare(ag, bg))
        .map(([v, g]) => v);
}
const objectFilter = (obj, fn) => {
    let res = {};
    for(let [key, value] of Object.entries(obj)) {
        if(fn(key, value)) res[key] = value;
    }
    return res;
}

class Feature {
    constructor(id, disp, fn, options = {}) {
        this.id = id;
        this.disp = disp;
        this.fn = fn;
        this.options = options;
    }
    
    addTo(src) {
        this.button = $("<button >")
            .text(this.disp)
            .attr("id", this.id)
            .click(() => this.render(Statistics.ctx));
        $(src).append(this.button);
        return this.button;
    }
    
    static hueArrays(max) {
        let delta = 330 / max;
        let background = [];
        let border = [];
        let hoverBackground = [];
        let hoverBorder = [];
        for(let i = 0; i < max; i++) {
            let h = i * delta;
            background.push(`hsla(${h}, 100%, 65%, 0.2)`);
            border.push(`hsla(${h}, 100%, 65%, 1.0)`);
            hoverBackground.push(`hsla(${h}, 100%, 85%, 0.2)`);
            hoverBorder.push(`hsla(${h}, 100%, 85%, 1.0)`);
        }
        return [background, border, hoverBackground, hoverBorder];
    }
    
    render(ctx) {
        if(Statistics.focus && Statistics.focus.chart) {
            Statistics.focus.chart.destroy();
        }
        Statistics.focus = this;
        
        let sortIndex = this.options.sortIndex || Statistics.Options.sortIndex;
        let sortOrder = this.options.sortOrder || Statistics.Options.sortOrder;
        let sortByGrader = this.options.sortBy || Statistics.Options.sortBy;
        let limit = this.options.limit || Statistics.Options.limit;
        
        let dat = Object.entries(this.fn());
        let sortedDat;
        
        if(sortIndex == 0) {
            if(this.options.sort) {
                sortedDat = this.options.sort(dat);
            }
            else if(sortByGrader) {
                sortedDat = sortBy(dat, a => sortByGrader(a[sortIndex]));
            }
        }
        if(!sortedDat) {
            sortedDat = dat.sort((a, b) =>
                sortOrder * compare(a[sortIndex], b[sortIndex])
            );
        }
        
        dat = sortedDat;
        
        if(limit) {
            dat = dat.slice(0, limit);
        }
        
        let [
            background, border,
            hoverBackground, hoverBorder,
        ] = Feature.hueArrays(dat.length);
        
        this.chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: dat.map(e => e[0]),
                datasets: [{
                    label: "Occurrences",
                    data: dat.map(e => e[1]),
                    backgroundColor: background,
                    borderColor: border,
                    hoverBackgroundColor: hoverBackground,
                    hoverBorderColor: hoverBorder,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                            
                            // fontColor: "green",
                            // fontSize: 18,
                        },
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: "#dddddd",
                            fontSize: 16,
                        }
                    }]
                },
                legend: {
                    // labels: {
                        // fontColor: "blue",
                        // fontSize: 18
                    // }
                },
            }
        });
    }
}

const Statistics = {
    Features: [],
    addFeature: (...args) => {
        let feature = new Feature(...args);
        Statistics.Features[feature.id] = feature;
    },
    Options: {
        sortIndex: 0,
        sortOrder: 1, // 1 for ascending, -1 for descending
        sortBy: null,
    },
    ctx: null,
};

Statistics.addFeature(
    "typePopularity",
    "Card Type Popularity",
    () => cardsBy("card_type")
);

Statistics.addFeature(
    "monsterTypePopularity",
    "Monster Type Popularity",
    () => cardsBy("type", { type: "monster" })
);

let attributeOrder = ["DARK", "EARTH", "FIRE", "LIGHT", "WATER", "WIND", "DIVINE"];
Statistics.addFeature(
    "monsterAttributePopularity",
    "Monster Attribute Popularity",
    () => cardsBy("attribute", { type: "monster" }),
    {
        // sort: (dat) => {
            // return sortBy(dat, (e) => attributeOrder.indexOf(e));
        // }
        sortBy: e => attributeOrder.indexOf(e),
    }
);

Statistics.addFeature(
    "monsterCardKind",
    "Monster Card Kinds",
    () => cardsBy("monster_color", { type: "monster" }, { monsterCategory: "effect" })
);

Statistics.addFeature(
    "users",
    "Users by Card Count",
    () => objectFilter(cardsBy("username"), (u, v) => v >= 20)
);

Statistics.addFeature(
    "atkMost",
    "Most common ATK values",
    () => objectFilter(cardsBy("atk"), (u, v) => v >= 20),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "defMost",
    "Most common DEF values",
    () => objectFilter(cardsBy("def", {}, { monsterCategory: "link" }), (u, v) => v >= 20),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "levels",
    "Most common levels",
    () => cardsBy("level", { monsterCategory: "leveled" }),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "ranks",
    "Most common ranks",
    () => cardsBy("level", { monsterCategory: "xyz" }),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "lratings",
    "Most common link ratings",
    () => cardsBy("level", { monsterCategory: "link" }),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "atkDefPair",
    "Most common ATK/DEF pairings",
    () => objectFilter(cardsBy((card) => `${card.atk}/${card.def}`, { type: "monster" }, { monsterCategory: "link" }), (u, v) => v >= 10),
    {
        // logarithmic: true,
        numericName: true,
        limit: 15,
    }
);

window.addEventListener("load", async function () {
    let response = await fetch(window.databaseToUse);
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    // load buttons
    let optionContainer = $("#optionContainer");
    let firstFeature;
    for(let feature of Object.values(Statistics.Features)) {
        firstFeature = firstFeature || feature;
        feature.addTo(optionContainer);
    }
    
    Statistics.ctx = document.getElementById("primaryChart").getContext("2d");
    
    let featureToClick = firstFeature;
    if(window.location.search.length > 1) {
        let name = window.location.search.slice(1);
        let feature = Statistics.Features[name]
        if(feature) {
            featureToClick = feature;
        }
    }
    featureToClick.button.click();
    
    $("#share").click(() => {
        window.location.search = "?" + Statistics.focus.id;
    });
    
    let idToKey = {
        sortIndexer: "sortIndex"
    };
    let inputElements = $("#otherOptions select, #otherOptions input");
    let onUpdate = function () {
        // console.log(this);
        let val = idToKey[this.id];
        
        if(val === "sortIndex") {
            Statistics.Options.sortOrder = this.value == "1" ? -1 : 1;
        }
        Statistics.Options[val] = this.value;
        Statistics.focus.button.click();
    };
    
    for(let el of inputElements) {
        $(el).change(onUpdate);
        onUpdate.bind(el)();
    }
    
    let canvasHolder = $("#canvasHolder");
    
    let resize = () => {
        let top = canvasHolder.position().top;
        let windowHeight = $(window).height();
        let height = windowHeight - top - 30;
        console.log(top, windowHeight, height);
        canvasHolder.css("height", height + "px");
    };
    
    $(window).resize(resize);
    
    resize();
});