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
        
        if(this.options.parameters) {
            Statistics.updateParameters(this.options.parameterType, this.options.parameters);
        }
        else {
            Statistics.updateParameters(null, 0);
        }
        
        let sortIndex = this.options.sortIndex || Statistics.Options.sortIndex;
        let sortOrder = this.options.sortOrder || Statistics.Options.sortOrder;
        let sortByGrader = this.options.sortBy || Statistics.Options.sortBy;
        let limit = this.options.limit || Statistics.Options.limit || this.options.defaultLimit;
        
        let dat = Object.entries(this.fn(...Statistics.parameters));
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
                    display: false
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
        Statistics.Features.push(feature);
    },
    getFeature: (name) => 
        Statistics.Features.find(feature => feature && feature.id === name),
    addSpacer: () => {
        Statistics.Features.push(null);
    },
    makeParamTemplate(arr) {
        let sel = $("<select>")
            .addClass("inline")
            .addClass("param");
        sel.append("<option value=null>---</option>");
        let options = arr.map(([prop, name]) => 
            $("<option>")
                .attr("value", prop)
                .text(name)
        );
        sel.append(options);
        return sel;
    },
    update() {
        Statistics.parameters = [...$("#paramHolder .param")]
            .map(e => e.value)
            .filter(e => e !== "null");
        //commit
        Statistics.focus.button.click();
    },
    parameters: [ "type", "attribute" ],
    ParameterData: {
        type: null,
        count: null,
    },
    updateParameters(type, count) {
        if(Statistics.ParameterData.type === type && Statistics.ParameterData.count === count) {
            // no updates necessary
            return;
        }
        Statistics.ParameterData.type = type;
        Statistics.ParameterData.count = count;
        let paramHolder = $("#paramHolder");
        let template = Statistics.parameterTemplates[type];
        paramHolder.empty();
        
        if(count === 0) {
            paramHolder.append($("<em>None.</em>"));
        }
        
        for(let i = 0; i < count; i++) {
            let param = template.clone();
            param.change(() => Statistics.update());
            let oldParam = Statistics.parameters[i];
            if(oldParam) {
                param.val(oldParam);
            }
            paramHolder.append(param);
        }
    },
    Options: {
        sortIndex: 0,
        sortOrder: 1, // 1 for ascending, -1 for descending
        sortBy: null,
        limit: null,
    },
    ctx: null,
};
Statistics.parameterTemplates = {
    monster: Statistics.makeParamTemplate([
        ["level", "Level"],
        ["attribute", "Attribute"],
        ["type", "Type"],
    ]),
};

Statistics.addFeature(
    "typePopularity",
    "Card Types",
    () => cardsBy("card_type")
);

Statistics.addFeature(
    "monsterTypePopularity",
    "Monster Types",
    () => cardsBy("type", { type: "monster" })
);

Statistics.addFeature(
    "spellKinds",
    "Spell Types",
    () => cardsBy(card => card.type, { type: "spell" }),
);

Statistics.addFeature(
    "trapKinds",
    "Trap Types",
    () => cardsBy(card => card.type, { type: "trap" }),
);

Statistics.addSpacer();

Statistics.addFeature(
    "users",
    "Users",
    () => objectFilter(cardsBy("username"), (u, v) => v >= 20)
);
Statistics.addSpacer();

let attributeOrder = ["DARK", "EARTH", "FIRE", "LIGHT", "WATER", "WIND", "DIVINE"];
Statistics.addFeature(
    "monsterAttributePopularity",
    "Monster Attributes",
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
Statistics.addSpacer();

Statistics.addFeature(
    "atkMost",
    "Commonest ATK values",
    () => objectFilter(cardsBy("atk"), (u, v) => v >= 20),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "defMost",
    "Commonest DEF values",
    () => objectFilter(cardsBy("def", {}, { monsterCategory: "link" }), (u, v) => v >= 20),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "levels",
    "Commonest levels",
    () => cardsBy("level", { monsterCategory: "leveled" }),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "ranks",
    "Commonest ranks",
    () => cardsBy("level", { monsterCategory: "xyz" }),
    {
        numericName: true,
    }
);

Statistics.addFeature(
    "lratings",
    "Commonest link ratings",
    () => cardsBy("level", { monsterCategory: "link" }),
    {
        numericName: true,
    }
);

Statistics.addSpacer();
Statistics.addFeature(
    "monsterPairing",
    "Monster Pairing Explorer",
    (...params) => {
        let accept = {
            type: "monster",
        };
        // let reject = {};
        
        if(params.indexOf("level") !== -1) {
            accept.monsterCategory = "leveled";
        }
        
        let getData = (card) => params.map(p => card[p]).join("/");
        if(params.length === 0) {
            getData = () => "(no input)";
        }
        
        let data = cardsBy(
            getData,
            accept,
            // reject,
        );
        
        // console.log(data, params);
        
        return data;
    },
    {
        parameterType: "monster",
        parameters: 2,
    }
);

Statistics.addFeature(
    "advancedMonsterPairing",
    "Monster Pairing Explorer (Advanced)",
    Statistics.getFeature("monsterPairing").fn,
    {
        parameterType: "monster",
        parameters: 3,
    }
);
/*
Statistics.addFeature(
    "atkDefPair",
    "Commonest ATK/DEF pairings",
    () => objectFilter(cardsBy((card) => `${card.atk}/${card.def}`, { type: "monster" }, { monsterCategory: "link" }), (u, v) => v >= 10),
    {
        // logarithmic: true,
        numericName: true,
        limit: 15,
    }
);

Statistics.addFeature(
    "attributeTypePair",
    "Commonest Attribute/Type pairings",
    () => objectFilter(cardsBy((card) => `${card.attribute}/${card.type}`, { type: "monster" }), (u, v) => v >= 20),
    {
        // limit: 15,
    }
);

Statistics.addFeature(
    "levelAttributePair",
    "Commonest Level/Attribute pairings",
    () => objectFilter(cardsBy((card) => `${card.attribute} ${card.level}`, { monsterCategory: "leveled" }), (u, v) => v >= 15),
    {
        // limit: 15,
    }
);*/

window.addEventListener("load", async function () {
    let response = await fetch(window.databaseToUse);
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    // load buttons
    let optionContainer = $("#optionContainer");
    let firstFeature;
    for(let feature of Statistics.Features) {
        firstFeature = firstFeature || feature;
        if(feature === null) {
            optionContainer.append($("<span class=spacer>"));
        }
        else {
            feature.addTo(optionContainer);
        }
    }
    
    Statistics.ctx = document.getElementById("primaryChart").getContext("2d");
    
    const sortIndexer = $("#sortIndexer");
    const limiter = $("#limiter");
    
    let featureToClick = firstFeature;
    if(window.location.search.length > 1) {
        let inputParams = window.location.search.slice(1).split(",");
        let [ name, sortIndex, limit ] = inputParams;
        
        let dataParams = inputParams.slice(inputParams.lastIndexOf("") + 1);
        
        Statistics.parameters = dataParams;
        
        if(sortIndex) {
            sortIndexer.val(sortIndex);
        }
        if(limit) {
            limiter.val(limit);
        }
        let feature = Statistics.getFeature(name);
        if(feature) {
            featureToClick = feature;
        }
    }
    featureToClick.button.click();
    
    $("#share").click(() => {
        window.location.search = "?" + [
            Statistics.focus.id,
            sortIndexer.val(),
            limiter.val(),
            null,
            ...Statistics.parameters
        ].join(",");
    });
    
    let idToKey = {
        sortIndexer: "sortIndex",
        limiter: "limit",
    };
    let inputElements = $("#otherOptions select, #otherOptions input");
    let onUpdate = function () {
        // console.log(this);
        console.log(this.id, this, this.value);
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
    
    const MIN_HEIGHT = 200;
    let resize = () => {
        let top = canvasHolder.position().top;
        let windowHeight = $(window).height();
        let height = windowHeight - top - 30;
        if(height < MIN_HEIGHT) {
            height = windowHeight;
        }
        console.log(top, windowHeight, height);
        canvasHolder.css("height", height + "px");
    };
    
    $(window).resize(resize);
    
    resize();
});