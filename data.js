let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

// add background plugin
// https://stackoverflow.com/a/71395413/4119004
const custom_canvas_background_color = bgColor => ({
    id: 'custom_canvas_background_color_' + bgColor,
    beforeDraw: (chart, args, options) => {
        const {
            ctx,
            chartArea: { top, right, bottom, left, width, height },
            scales: { x, y },
        } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        let clip = chart?.options?.clip ?? 0;
        ctx.fillRect(
            left - clip,
            top - clip,
            width + 2 * clip,
            height + 2 * clip
        );
        ctx.restore();
    },
});

const getStatsFilter = (query, exclude = null) => {
    let finalQuery = {};
    let finalExclude = null;
    if(!popupPrompt.needsSetup) {
        Object.assign(finalQuery, CardViewer.query());
    }
    Object.assign(finalQuery, query);
    finalExclude = exclude;
    let cards = CardViewer.filter(finalQuery, finalExclude);

    switch(Statistics.Options.metaFilter) {
        case "useBoth":
        default:
            break;
        case "useTcg":
            cards = cards.filter(card => card.ocg || card.tcg);
            break;
        case "useCustom":
            cards = cards.filter(card => card.custom);
            break;
    }
    
    return cards;
};

const getFunctionFrom = fn =>
    typeof fn === "function"
        ? fn
        : (type => card => card[type])(fn);

const bubbleBy = (fn1, fn2, query, exclude = null) => {
    let hash = {};
    fn1 = getFunctionFrom(fn1);
    fn2 = getFunctionFrom(fn2);
    let swath = getStatsFilter(query, exclude);
    // let max = 0;
    for(let card of Object.values(swath)) {
        let key = fn1(card) + "," + fn2(card);
        hash[key] ??= 0;
        hash[key]++;
        // if(hash[key] > max) max = hash[key];
    }
    let bubbles = [];
    // bubbles.max = max;
    for(let [key, value] of Object.entries(hash)) {
        let [x, y] = key.split(",").map(e => parseFloat(e));
        bubbles.push({
            x: x,
            y: y,
            size: value,
        });
    }
    return bubbles;
}

const cardsBy = (fn, query = {}, exclude = null) => {
    let hash = {};
    if(typeof fn !== "function") {
        let type = fn;
        fn = (card) => card[type];
    }
    let swath = getStatsFilter(query, exclude);
    for(let card of Object.values(swath)) {
        let prop = fn(card);
        if(!Array.isArray(prop)) {
            prop = [prop];
        }
        for(let sub of prop) {
            hash[sub] = hash[sub] || 0;
            hash[sub]++;
        }
    }
    return hash;
};

const cardsByRecord = (fn, holder, query = {}, exclude = null, cmp = compare) => {
    let hash = {};
    if(typeof fn !== "function") {
        let type = fn;
        fn = (card) => card[type];
    }
    if(typeof holder !== "function") {
        let type = holder;
        holder = (card) => card[type];
    }
    let swath = getStatsFilter(query, exclude);
    for(let card of Object.values(swath)) {
        let prop = fn(card);
        let h = holder(card);
        // console.log(h, hash[h]);
        if(typeof hash[h] === "undefined" || cmp(hash[h].prop, prop) < 0) {
            hash[h] = { prop: prop, card: card };
        }
    }
    let resultHash = {};
    
    for(let [key, value] of Object.entries(hash)) {
        resultHash[key + " (" + value.card.name + ")"] = value.prop;
    }
    return resultHash;
};

const cardsByAverage = (fn, holder, min = 0, query = {}, exclude = null, cmp = compare) => {
    let hash = {};
    let totals = {};
    if(typeof fn !== "function") {
        let type = fn;
        fn = (card) => card[type];
    }
    if(typeof holder !== "function") {
        let type = holder;
        holder = (card) => card[type];
    }
    let swath = getStatsFilter(query, exclude);
    for(let card of Object.values(swath)) {
        let prop = fn(card);
        let h = holder(card);
        if(typeof totals[h] === "undefined") {
            totals[h] = 0;
            hash[h] = 0;
        }
        hash[h] += prop;
        totals[h]++;
    }
    for(let key of Object.keys(hash)) {
        let total = totals[key];
        if(total < min) {
            delete hash[key];
        }
        else {
            hash[key] /= totals[key];
        }
    }
    return hash;
};

const wordLength = (str) => str.split(/\s/).length;

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
        // console.log("== RENDER ==");
        console.group(" == RENDER == ");
        console.trace();
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
        let reverse = this.options.reverse;
        let kind = this.options.kind || "bar";
        // console.log("Limit:", limit);
        
        let dat = Object.entries(this.fn(...Statistics.parameters));
        let sortedDat;
        console.log("Data post retrieve:", dat);
        
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
        console.log("Data post sort:", dat);
        
        if(reverse) {
            dat = dat.reverse();
            console.log("Reversed:", dat);
        }
        
        if(limit) {
            console.log("Limit:", limit);
            if(kind === "bubble") {
                dat = dat.filter(c => c[1].size >= limit);
            }
            else {
                dat = dat.slice(0, limit);
            }
        }
        
        console.log("Data post limit:", dat);
        console.log(dat.map(a => a.join(" - ")).join("\n"));
        
        let [
            background, border,
            hoverBackground, hoverBorder,
        ] = Feature.hueArrays(dat.length);
        
        if(kind === "bar") {
            console.log("bar data", dat.map(e => e[1]));
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
                    plugins: {
                        title: {
                            text: this.disp,
                            display: true,
                            color: "#dddddd",
                            font: {
                                size: 20,
                            },
                        },
                    },
                    scales: {
                        y: {
                            display: true,
                            ticks: {
                                beginAtZero: true
                            }
                        },
                        x: {
                            display: true,
                            ticks: {
                                fontColor: "#dddddd",
                                fontSize: 16,
                            }
                        },
                        /*
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
                        }]*/
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
        else if(kind === "bubble") {
            dat = dat.map(e => e[1]);
            // console.log(dat);
            let max = Math.max(...dat.map(c => c.size));
            // console.log(max);
            let f = true;
            let displayMin = this.options.displayMin ?? 2;
            let displayMax = this.options.displayMax ?? 50;
            let displayDiff = displayMax - displayMin;
            // console.log(displayMin, displayMax, displayDiff);
            let myData = {
                datasets: [{
                    label: "",
                    data: dat,
                    radius(context) {
                        let point = context.dataset.data[context.dataIndex];
                        return displayMin + point.size / max * displayDiff;
                    },
                    backgroundColor(context) {
                        let point = context.dataset.data[context.dataIndex];
                        if(point.x == point.y) {
                            return 'rgba(181, 130, 81, 0.8)';
                        }
                        else {
                            return 'rgba(94, 181, 51, 0.8)';
                        }
                    },
                    // borderColor: "rgba(200, 200, 200, 0.8)",
                    // borderWidth: 1,
                }]
            };
            this.chart = new Chart(ctx, {
                type: "bubble",
                data: myData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    clip: 10,
                    plugins: {
                        title: {
                            text: this.disp,
                            display: true,
                            color: "#dddddd",
                            font: {
                                size: 20,
                            },
                        },
                    },
                },
                plugins: [custom_canvas_background_color("rgba(0, 0, 0, 0.7)")],
            });
        }
        else {
            console.error("Unrecognized chart type:", kind);
        }
        
        console.groupEnd();
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
        count: 0,
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
        ["atk", "ATK"],
        ["def", "DEF"],
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
    () => cardsBy("username"),
    {
        defaultLimit: 40,
    }
);
Statistics.addSpacer();

Statistics.addFeature(
    "averageUsersCardWords",
    "Users' Average Card (Words)",
    () => cardsByAverage((card) => wordLength(card.effect) + wordLength(card.pendulum_effect), "username", 10),
    {
        defaultLimit: 15,
    }
);
Statistics.addFeature(
    "averageUsersCardCharacters",
    "Users' Average Card (Characters)",
    () => cardsByAverage((card) => card.effect.length + card.pendulum_effect.length, "username", 10),
    {
        defaultLimit: 15,
    }
);
Statistics.addSpacer();

Statistics.addFeature(
    "longestCardsWords",
    "Longest User Cards (Words)",
    () => cardsByRecord((card) => wordLength(card.effect) + wordLength(card.pendulum_effect), "username"),
    {
        defaultLimit: 15,
    }
);
Statistics.addFeature(
    "longestCardsCharacters",
    "Longest User Cards (Characters)",
    () => cardsByRecord((card) => card.effect.length + card.pendulum_effect.length, "username"),
    {
        defaultLimit: 15,
    }
);
Statistics.addSpacer();

Statistics.addFeature(
    "shortestCardsWords",
    "Shortest User Cards (Words)",
    () => cardsByRecord((card) => wordLength(card.effect) + wordLength(card.pendulum_effect), "username", {}, null, (a, b) => b - a),
    {
        defaultLimit: 15,
        reverse: true,
    }
);
Statistics.addFeature(
    "shortestCardsCharacters",
    "Shortest User Cards (Characters)",
    () => cardsByRecord((card) => card.effect.length + card.pendulum_effect.length, "username", {}, null, (a, b) => b - a),
    {
        defaultLimit: 15,
        reverse: true,
    }
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
    () => cardsBy("atk", { type: "monster" }),
    {
        numericName: true,
        defaultLimit: 35,
    }
);

Statistics.addFeature(
    "defMost",
    "Commonest DEF values",
    () => cardsBy("def", { type: "monster" }, { monsterCategory: "link" }),
    {
        numericName: true,
        defaultLimit: 35,
    }
);

Statistics.addFeature(
    "atkDefMostBubble",
    "Commonest ATK/DEF (Bubble)",
    () => bubbleBy("atk", "def", { type: "monster" }, { monsterCategory: "link" }),
    {
        kind: "bubble",
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

const getArrowArray = (card) => 
    getLinkArrowText(card.arrows)
        .replace(/[\u2B1C\n\uFE0F]/g, "")
        .split("")
        .map(arrow => arrow + "\uFE0F");

Statistics.addFeature(
    "arrows",
    "Commonest link arrows",
    () => cardsBy(getArrowArray, { monsterCategory: "link" }),
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
        let reject = {};
        
        for(let param of params) {
            switch(param) {
            case "level":
                accept.monsterCategory = "leveled";
                break;
            case "DEF":
                reject.monsterCategory = "link";
                break;
            }
        }
        console.log(accept, reject);
        
        let getData = (card) => params.map(p => card[p]).join("/");
        if(params.length === 0) {
            getData = () => "(no input)";
        }
        
        let data = cardsBy(
            getData,
            accept,
            // reject ? reject : null,
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

const filterHTML = `
<div id=searchParameters><div>
    <table id=mainStats>
        <tr>
            <th colspan=4>Primary Stats</th>
        </tr>
        <tr>
            <td>Card name:</td>
            <td><input id="cardName"></td>
            <td>Card ID:</td>
            <td><input id="cardId" type=number></td>
        </tr>
        <tr>
            <td>Card description:</td>
            <td><input id="cardDescription"></td>
            <td>Card author:</td>
            <td><input id="cardAuthor"></td>
        </tr>
        <tr>
            <td>Card type:</td>
            <td>
                <select id="cardType">
                    <option value=any></option>
                    <option value=monster>Monster Card</option>
                    <option value=spell>Spell Card</option>
                    <option value=trap>Trap Card</option>
                </select>
            </td>
            <td>Card limit:</td>
            <td>
                <select id="cardLimit">
                    <option value=any></option>
                    <option value=3>Unlimited</option>
                    <option value=2>Semi-limited</option>
                    <option value=1>Limited</option>
                    <option value=0>Forbidden</option>
                </select>
            </td>
        </tr>
        <tr>
            <td><label for="cardVisibility">Card visibility</label></td>
            <td>
                <select id="cardVisibility">
                    <option value=any></option>
                    <option value=1>Public</option>
                    <option value=2>Private</option>
                </select>
            </td>
            <td><label for="cardCategory">Card Category:</label></td>
            <td>
                <select id="cardCategory">
                    <option value=any></option>
                    <option value=1>Retrain</option>
                    <option value=2>Alt Art</option>
                </select>
            </td>
        </tr>
    </table>
    <table id=conditionalStats>
        <tr class="ifMonster ifSpell ifTrap">
            <th colspan=5>Secondary Stats</th>
        </tr>
        <tbody class="ifMonster" id="monsterStats">
            <tr>
                <td>Category</td>
                <td>
                    <select id="cardMonsterCategory">
                        <option value=any></option>
                        <option value="normal">Normal</option>
                        <option value="effect">Effect</option>
                        <option value="ritual">Ritual</option>
                        <option value="fusion">Fusion</option>
                        <option value="synchro">Synchro</option>
                        <option value="xyz">Xyz</option>
                        <option value="pendulum">Pendulum</option>
                        <option value="link">Link</option>
                        <option value="leveled">Leveled</option>
                        <option value="maindeck">Main Deck</option>
                        <option value="extradeck">Extra Deck</option>
                        <option value="noneffect">Non-Effect</option>
                        <option value="flip">Flip</option>
                        <option value="qq">? ATK or DEF</option>
                    </select>
                </td>
                <td>ATK</td>
                <td><select id=cardATKCompare class=thin>
                    <option value="equal">=</option>
                    <option value="lessequal">&le;</option>
                    <option value="less">&lt;</option>
                    <option value="greaterequal">&ge;</option>
                    <option value="greater">&gt;</option>
                    <option value="unequal">&ne;</option>
                    <option value="question">?</option>
                    <!-- <option value="choice">any of</option> -->
                </select></td>
                <td><input type=number id=cardATK min=0 max=9999 step=50></td>
            </tr>
            <tr>
                <td>Ability</td>
                <td>
                    <select id="cardMonsterAbility">
                        <option value=any></option>
                        <option value="union">Union</option>
                        <option value="gemini">Gemini</option>
                        <option value="spirit">Spirit</option>
                        <option value="tuner">Tuner</option>
                        <option value="toon">Toon</option>
                        <option value="noneffect">Non-Effect</option>
                    </select>
                </td>
                <td>DEF</td>
                <td><select id=cardDEFCompare class=thin>
                    <option value="equal">=</option>
                    <option value="lessequal">&le;</option>
                    <option value="less">&lt;</option>
                    <option value="greaterequal">&ge;</option>
                    <option value="greater">&gt;</option>
                    <option value="unequal">&ne;</option>
                    <option value="question">?</option>
                    <!-- <option value="choice">any of</option> -->
                </select></td>
                <td><input type=number id=cardDEF min=0 max=9999 step=50></td>
            </tr>
            <tr>
                <td>Attribute</td>
                <td>
                    <select id="cardMonsterAttribute">
                        <option value=""></option>
                        <option value="DARK">DARK</option>
                        <option value="EARTH">EARTH</option>
                        <option value="FIRE">FIRE</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="WATER">WATER</option>
                        <option value="WIND">WIND</option>
                        <option value="DIVINE">DIVINE</option>
                    </select>
                </td>
                <td>Level/Rank:</td>
                <td><select id=cardLevelCompare class=thin>
                    <option value="equal">=</option>
                    <option value="lessequal">&le;</option>
                    <option value="less">&lt;</option>
                    <option value="greaterequal">&ge;</option>
                    <option value="greater">&gt;</option>
                    <option value="unequal">&ne;</option>
                    <!-- <option value="choice">any of</option> -->
                </select></td>
                <td><input type=number id=cardLevel min=0 max=12></td>
            </tr>
            <tr>
                <td>Type</td>
                <td>
                    <select id="cardMonsterType">
                        <option value=""></option>
                        <option value="Aqua">Aqua</option>
                        <option value="Beast">Beast</option>
                        <option value="Beast-Warrior">Beast-Warrior</option>
                        <option value="Cyberse">Cyberse</option>
                        <option value="Dinosaur">Dinosaur</option>
                        <option value="Dragon">Dragon</option>
                        <option value="Fairy">Fairy</option>
                        <option value="Fiend">Fiend</option>
                        <option value="Fish">Fish</option>
                        <option value="Insect">Insect</option>
                        <option value="Machine">Machine</option>
                        <option value="Plant">Plant</option>
                        <option value="Psychic">Psychic</option>
                        <option value="Pyro">Pyro</option>
                        <option value="Reptile">Reptile</option>
                        <option value="Rock">Rock</option>
                        <option value="Sea Serpent">Sea Serpent</option>
                        <option value="Spellcaster">Spellcaster</option>
                        <option value="Thunder">Thunder</option>
                        <option value="Warrior">Warrior</option>
                        <option value="Winged Beast">Winged Beast</option>
                        <option value="Wyrm">Wyrm</option>
                        <option value="Yokai">Yokai</option>
                        <option value="Zombie">Zombie</option>
                        <option value="Creator God">Creator God</option>
                        <option value="Divine-Beast">Divine-Beast</option>
                    </select>
                </td>
            </tr>
        </tbody>
        <tbody class="ifSpell" id="spellStats">
            <tr>
                <td>Kind</td>
                <td>
                    <select id="cardSpellKind">
                        <option value=""></option>
                        <option value=Normal>Normal Spell</option>
                        <option value=Quick-Play>Quick-Play Spell</option>
                        <option value=Field>Field Spell</option>
                        <option value=Continuous>Continuous Spell</option>
                        <option value=Ritual>Ritual Spell</option>
                        <option value=Equip>Equip Spell</option>
                    </select>
                </td>
            </tr>
        </tbody>
        <tbody class="ifTrap" id="trapStats">
            <tr>
                <td>Kind</td>
                <td>
                    <select id="cardTrapKind">
                        <option value=""></option>
                        <option value=Normal>Normal Trap</option>
                        <option value=Continuous>Continuous Card</option>
                        <option value=Counter>Counter Card</option>
                    </select>
                </td>
            </tr>
        </tbody>
    </table>
    <table id="linkTable">
        <tbody class="ifLink">
            <tr>
                <th colspan=3>Link Arrows</th>
            </tr>
            <tr>
                <td><button class="arrow-button">↖</button></td>
                <td><button class="arrow-button">↑</button></td>
                <td><button class="arrow-button">↗</button></td>
            </tr>
            <tr>
                <td><button class="arrow-button">←</button></td>
                <td><button class="arrow-button" id="equals">=</button></td>
                <td><button class="arrow-button">→</button></td>
            </tr>
            <tr>
                <td><button class="arrow-button">↙</button></td>
                <td><button class="arrow-button">↓</button></td>
                <td><button class="arrow-button">↘</button></td>
            </tr>
        </tbody>
    </table>
</div>
`;
    
    
const popupPrompt = new Prompt(
    "Filters",
    $(filterHTML),
    [ "Done" ],
    "large"
);
popupPrompt.needsSetup = true;

window.addEventListener("load", async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    // let response = await fetch(window.databaseToUse);
    // let db = await response.json();
    // CardViewer.Database.setInitial(db);
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    for(let [ id, card ] of Object.entries(CardViewer.Database.cards)) {
        if(!card.username) {
            card.username = "TCG/OCG";
        }
        if(!card.pendulum_effect) {
            card.pendulum_effect = "";
        }
    }
    
    // fix stupid chart.js bubble chart
    Chart.overrides.bubble.plugins.tooltip.callbacks.label = (item) => {
        // console.log(item);
        const { x, y, size: r } = item.raw;
        return `${item.label}: (${x}/${y}, ${r})`;
    };

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
        let inputParams = window.location.search
            .replaceAll("%2C", ",")
            .slice(1)
            .split(",");
        let [ name, sortIndex, limit, filter ] = inputParams;
        
        let dataParams = inputParams.slice(inputParams.lastIndexOf("") + 1);
        
        if(dataParams.length) {
            Statistics.parameters = dataParams;
        }
        
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
        let params = [
            Statistics.focus.id,
            sortIndexer.val(),
            limiter.val(),
            null, // filter??
            null,
        ];
        console.log(params);
        params.push(...Statistics.parameters.slice(0, Statistics.ParameterData.count));
        window.location.search = "?" + params.join(",").replaceAll(",", "%2C");
    });
    
    let idToKey = {
        sortIndexer: "sortIndex",
        limiter: "limit",
        useCustom: "metaFilter",
        useTcg: "metaFilter",
        useBoth: "metaFilter",
    };
    const sortIndexMap = {
        0: 0, // name
        1: 1, // value
        2: 1, // value ascending
    };
    let inputElements = $("#otherOptions select, #otherOptions input, input[name='card-category']");
    let onUpdate = function () {
        // console.log(this);
        if(this.value === "") return;
        let property = idToKey[this.id];
        
        /*
        console.dir({
            property: property,
            id: this.id,
            // this: this,
            thisValue: this.value
        });*/
        
        if(this.type === "radio") {
            if(!this.checked) return;
            Statistics.Options[property] = this.id;
        }
        else {
            Statistics.Options[property] = this.value;
        }
        
        if(this.type == "number") {
            Statistics.Options[property] = parseFloat(Statistics.Options[property]);
        }
        
        if(property === "sortIndex") {
            Statistics.Options.sortOrder = this.value == "1" ? -1 : 1;
            Statistics.Options[property] = sortIndexMap[Statistics.Options[property]];
        }
        
        Statistics.focus.button.click();
    };
    
    // window.popupPrompt = popupPrompt;
    const filterHide = $("#filterHide");
    $("#filter").click(() => {
        if(popupPrompt.needsSetup) {
            let innerFn = popupPrompt.innerFn();
            console.log(innerFn, popupPrompt);
            CardViewer.Elements.cardType = innerFn.find("#cardType");
            CardViewer.Elements.ifMonster = innerFn.find(".ifMonster");
            CardViewer.Elements.ifSpell = innerFn.find(".ifSpell");
            CardViewer.Elements.ifTrap = innerFn.find(".ifTrap");
            CardViewer.Elements.ifLink = innerFn.find(".ifLink");
            CardViewer.Elements.cardCategory = innerFn.find("#cardCategory");
            CardViewer.Elements.monsterStats = innerFn.find("#monsterStats");
            CardViewer.Elements.spellStats = innerFn.find("#spellStats");
            CardViewer.Elements.trapStats = innerFn.find("#trapStats");
            CardViewer.Elements.cardName = innerFn.find("#cardName");
            CardViewer.Elements.cardDescription = innerFn.find("#cardDescription");
            CardViewer.Elements.cardLimit = innerFn.find("#cardLimit");
            CardViewer.Elements.cardId = innerFn.find("#cardId");
            CardViewer.Elements.cardAuthor = innerFn.find("#cardAuthor");
            // CardViewer.Elements.cardIsRetrain = innerFn.find("#cardIsRetrain");
            CardViewer.Elements.cardVisibility = innerFn.find("#cardVisibility");
            CardViewer.Elements.cardSpellKind = innerFn.find("#cardSpellKind");
            CardViewer.Elements.cardTrapKind = innerFn.find("#cardTrapKind");
            CardViewer.Elements.cardMonsterType = innerFn.find("#cardMonsterType");
            CardViewer.Elements.cardMonsterAttribute = innerFn.find("#cardMonsterAttribute");
            CardViewer.Elements.cardMonsterCategory = innerFn.find("#cardMonsterCategory");
            CardViewer.Elements.cardMonsterAbility = innerFn.find("#cardMonsterAbility");
            CardViewer.Elements.cardLevel = innerFn.find("#cardLevel");
            CardViewer.Elements.cardATK = innerFn.find("#cardATK");
            CardViewer.Elements.cardDEF = innerFn.find("#cardDEF");
            CardViewer.Elements.cardLevelCompare = innerFn.find("#cardLevelCompare");
            CardViewer.Elements.cardATKCompare = innerFn.find("#cardATKCompare");
            CardViewer.Elements.cardDEFCompare = innerFn.find("#cardDEFCompare");

            // CardViewer.setUpTabSearchSwitching();
            popupPrompt.needsSetup = false;
        }
        
        filterHide.empty();
        CardViewer.setUpTabSearchSwitching();
        popupPrompt.deploy().then(() => {
            popupPrompt.innerFn().appendTo(filterHide);
            Statistics.focus.button.click();
        });
        
    });
    
    for(let el of inputElements) {
        $(el).change(onUpdate);
        // onUpdate.bind(el)();
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
        // console.log(top, windowHeight, height);
        canvasHolder.css("height", height + "px");
    };
    
    $(window).resize(resize);
    
    resize();
});