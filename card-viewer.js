const CardViewer = {
    autoSearch: false,
    Database: {
        cards: null,
    },
    Filters: {
        Dictionary: null,
    },
    Search: {
        pageSize: 30,
        pages: null,
        currentPage: null,
        processResults: null,
    },
    Elements: {},
    // methods
    submit: null,
    query: null,
};

// helper function methods
const _F = {
    propda: (prop) => (obj) => obj[prop],
    id: x => x,
    sortBy: (list, fn) =>
        list.map(e => [e, fn(e)])
            .sort(([l, lc], [r, rc]) => (lc > rc) - (lc < rc))
            .map(([e, ec]) => e),
};

// CardViewer.Search
CardViewer.Search.processResults = function (val) {
    CardViewer.Search.pages = [];
    let res = val.slice();
    while(res.length) {
        let page = res.splice(0, CardViewer.Search.pageSize);
        CardViewer.Search.pages.push(page);
    }
    CardViewer.Elements.pageCount.text(CardViewer.Search.pages.length);
};

CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage) {
    CardViewer.Elements.results.empty();
    if(id < 0 || id >= CardViewer.Search.pages.length) {
        return;
    }
    for(let result of CardViewer.Search.pages[id]) {
        let composed = CardViewer.composeResult(result);
        CardViewer.Elements.results.append(composed);
    }
    // humans measure in 1-based indices
    CardViewer.Elements.currentPage.text(id + 1);
};

CardViewer.Search.nextPage = function () {
    if(CardViewer.Search.currentPage + 1 === CardViewer.Search.pages.length) {
        return;
    }
    CardViewer.Search.currentPage++;
    CardViewer.Search.showPage();
};

CardViewer.Search.previousPage = function () {
    if(CardViewer.Search.currentPage === 0) {
        return;
    }
    CardViewer.Search.currentPage--;
    CardViewer.Search.showPage();
};

// CardViewer.Filters
CardViewer.Filters.isMonster = (card) =>
    card.card_type === "Monster";
CardViewer.Filters.isSpell = (card) =>
    card.card_type === "Spell";
CardViewer.Filters.isTrap = (card) =>
    card.card_type === "Trap";

CardViewer.Filters.Dictionary = {
    monster:    CardViewer.Filters.isMonster,
    spell:      CardViewer.Filters.isSpell,
    trap:       CardViewer.Filters.isTrap,
    any:        () => true,
};

CardViewer.Filters.getFilter = (key) =>
    CardViewer.Filters.Dictionary[key];

CardViewer.query = function () {
    return {
        name:       CardViewer.Elements.cardName.val(),
        effect:     CardViewer.Elements.cardDescription.val(),
        type:       CardViewer.Elements.cardType.val(),
        id:         CardViewer.Elements.cardId.val(),
        author:     CardViewer.Elements.cardAuthor.val(),
    };
};

CardViewer.simplifyText = (text) =>
    text.replace(/\s*/, "")
        .toLowerCase();

CardViewer.textComparator = (needle, fn = _F.id) => {
    let simplified = CardViewer.simplifyText(needle);
    return (card) =>
        fn(card).toString().toLowerCase().indexOf(simplified) !== -1;
};

CardViewer.createFilter = function (query) {
    let filters = [
        // type filter
        CardViewer.Filters.getFilter(query.type),
        // name filter
        CardViewer.textComparator(query.name, _F.propda("name")),
        // id filter
        CardViewer.textComparator(query.id, _F.propda("id")),
        // effect filter
        CardViewer.textComparator(query.effect, _F.propda("effect")),
        // author filter
        CardViewer.textComparator(query.author, _F.propda("username")),
    ];
    
    return (card) => filters.every(filter => filter(card));
};

CardViewer.filter = function (query) {
    let filter = CardViewer.createFilter(query);
    let cards = [];
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        if(card.tcg || card.ocg) {
            continue;
        }
        if(filter(card)) {
            cards.push(card);
        }
    }
    cards = _F.sortBy(cards, (card) => card.name);
    return cards;
};

CardViewer.composeResult = function (card) {
    let img = $("<img class=img-result>").attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    let res = $("<div class=result>");
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
    let stats = $("<div>");
    
    if(card.card_type === "Monster") {
        let kind = [];
        
        let levelIndicator;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                break;
            default:
                levelIndicator = "Level ";
                break;
        }
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    
    res.append($("<div class=result-inner>").append(id, name, author, stats,
        $("<table>").append(
            $("<tr>").append(
                $("<td class=result-img-holder>").append(img),
                $("<td class=result-effect>").append(effect)
            )
        )
    ));
    return res;
};

CardViewer.submit = function () {
    let query = CardViewer.query();
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Search.showPage();
};
let onLoad = async function () {
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/db.json");
    let db = await response.json();
    CardViewer.Database.cards = db;
    
    CardViewer.Elements.searchParameters = $("#searchParamters");
    
    CardViewer.Elements.cardType = $("#cardType");
    CardViewer.Elements.cardAuthor = $("#cardAuthor");
    CardViewer.Elements.search = $("#search");
    CardViewer.Elements.results = $("#results");
    CardViewer.Elements.autoSearch = $("#autoSearch");
    CardViewer.Elements.cardName = $("#cardName");
    CardViewer.Elements.resultCount = $("#resultCount");
    CardViewer.Elements.cardDescription = $("#cardDescription");
    CardViewer.Elements.currentPage = $("#currentPage");
    CardViewer.Elements.pageCount = $("#pageCount");
    CardViewer.Elements.nextPage = $("#nextPage");
    CardViewer.Elements.previousPage = $("#previousPage");
    CardViewer.Elements.cardId = $("#cardId");
    
    CardViewer.Elements.search.click(CardViewer.submit);
    CardViewer.Elements.previousPage.click(CardViewer.Search.previousPage);
    CardViewer.Elements.nextPage.click(CardViewer.Search.nextPage);
    
    CardViewer.Elements.autoSearch.change(function () {
        CardViewer.autoSearch = this.checked;
    });
    CardViewer.Elements.autoSearch.change();
    
    const elementChanged = function () {
        if(CardViewer.autoSearch) {
            CardViewer.submit();
        }
    };
    
    for(let el of CardViewer.Elements.searchParameters.find("select, input:not(:checkbox)")) {
        $(el).change(elementChanged);
    }
    
    CardViewer.submit();
};

window.addEventListener("load", onLoad);