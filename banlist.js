CardViewer.showImported = true;

$(document).ready(() => {
    let filterByToggle = $("#filterByToggle");
    let filterBy = $("#filterBy");
    let inner = $("#filterByInner");
    // console.log("fuck");
    CardViewer.setUpFilterByToggle(filterByToggle, filterBy, inner);
    let onInput = function () {
        let filter = this.value.toLowerCase();
        for(let card of $("#results .result")) {
            let name = card
                .querySelector(".result-name")
                .textContent
                .toLowerCase();
            
            let hasName = name.indexOf(filter) !== -1;
            let hasClass = card.classList.contains(filter);
            
            $(card).toggle(hasName || hasClass);
        }
        
        $("#results .expander").toggle(!filter);
        if(!filter) {
            $("#results .expander .op").text("show");
            $("#results .same").toggle(false);
        }
        // update numbers
        for(let h2 of $("#results h2")) {
            h2 = $(h2);
            let cards = h2.next().find(".result:visible");
            let span = $(h2).find("span");
            span.text(span.text().replace(/\d+/, (n) => cards.length));
        }
    };
    inner.on("input", onInput);
    inner.on("keydown", function (ev) {
        if(ev.originalEvent.key === "Enter") {
            onInput.bind(this)();
        }
    });
});

let onLoad = async function () {
    CardViewer.excludeTcg =  false;
    CardViewer.Search.pageSize = Infinity;
    CardViewer.Search.columnWidth = -1;
    CardViewer.Elements.popupResults = $("#popupResults");
    CardViewer.Elements.popup = $("#popup");
    CardViewer.linkRetrain = true;
    
    // local testing
    let response = await fetch("./banlist.json");
    // let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/banlist.json");
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    CardViewer.Elements.results = $("#results");
    CardViewer.Elements.tableOfContents = $("#toc");
    
    const togglePopup = () => {
        CardViewer.Elements.popup.toggle();
    };
    
    CardViewer.Elements.popup.click((ev) => {
        if(["popup", "popupResults"].indexOf(ev.target.id) !== -1) {
            togglePopup();
        }
    });
    $("body").keydown((ev) => {
        if(CardViewer.Elements.popup.is(":visible") && ev.originalEvent.code === "Escape") {
            togglePopup();
        }
    });
    
    let tags = ["Forbidden", "Limited", "Semi-Limited", "Unlimited"];
    
    const NewCards = [
        9783, 9481, 12100, 12064, 8827, 185, 12091, 12102, 12066, 8928, 9522, 8575
    ];
    
    const GradeFilters = [
        CardViewer.Filters.isNormal,
        CardViewer.Filters.isEffect,
        CardViewer.Filters.isRitual,
        CardViewer.Filters.isFusion,
        CardViewer.Filters.isSynchro,
        CardViewer.Filters.isXyz,
        _F.propda("is_link"),
        CardViewer.Filters.isSpell,
        CardViewer.Filters.isTrap,
    ];
    
    const grade = (card) =>
        GradeFilters.findIndex(filter => filter(card));
    
    let nameExists = {};
    const appendSearchPage = (results, tag) => {
        results = results.filter((card) => {
            let exists = nameExists[card.name];
            nameExists[card.name] = true;
            return !exists;
        });
        let sub = $("<div class=results-holder>");
        CardViewer.composeStrategy = CardViewer.composeResultSmall;
        CardViewer.Search.processResults(results);
        CardViewer.Search.currentPage = 0;
        CardViewer.Search.showPage(0, {
            append: true,
            target: sub,
            transform: (el, card) => {
                if(NewCards.indexOf(card.id) !== -1) {
                    el.addClass("new");
                }
                else if(card.exu_limit != card.tcg_limit) {
                    el.addClass("different");
                }
                else if(!card.custom) {
                    el.addClass("same");
                }
                if(RetrainMap[card.id]) {
                    el.addClass("retrain");
                }
                el.addClass("clickable");
                el.click(() => {
                    togglePopup();
                    
                    CardViewer.Elements.popupResults.empty();
                    CardViewer.composeStrategy = CardViewer.composeResult;
                    CardViewer.Search.processResults([ card ]);
                    CardViewer.Search.showPage(0, {
                        append: true,
                        target: CardViewer.Elements.popupResults,
                    });
                });
                return el;
            },
            sort: (page) =>
                page.sort((a, b) => {
                    let diff = grade(a) - grade(b);
                    if(diff) {
                        return diff;
                    }
                    else {
                        return (a.name > b.name) - (a.name < b.name);
                    }
                }),
        });
        
        let sameGroup = sub.find(".same");
        let useExpand = sameGroup.length > 1;
        if(useExpand) {
            sameGroup.toggle(false);
            
            let expand;
            expand = $("<div>")
                .addClass("result")
                .addClass("small")
                .addClass("monster")
                .addClass("synchro")
                .addClass("clickable")
                .addClass("expander")
                .click(() => {
                    sameGroup.toggle();
                    let op = expand.find(".op");
                    op.text(op.text() == "show" ? "hide" : "show");
                })
                .append($(`<div><h3 class=result-name><em><u>Toggle Similarities</u></em></h3><em>Click to <span class=op>show</span> all ${sameGroup.length} cards with the same status as in the TCG.</em></div>`).addClass("result-inner"));
            sub.append(expand);
        }
        else {
            sameGroup.toggleClass("same");
        }
        
        let selection = CardViewer.Search.pages.flat();
        let header = $("<h2 class=main>")
            .append($("<span>").text(tag + " Card" + (selection.length == 1 ? " 😔 " : "s ")+ "(" + selection.length + ")"))
            .attr("id", tag)
            .append($("<a class=top-arrow>").text("\u2b06").attr("href", "#top"));
        CardViewer.Elements.results.append(header);
        CardViewer.Elements.results.append(sub);
        
        $("#status").insertAfter(sub);
        
        return sub;
    };
    
    let results = CardViewer.filter({ category: CATEGORY_RETRAIN, });
    appendSearchPage(results, "Retrained");
    
    let i = 0;
    let handleStep = () => {
        let limit = i.toString();
        let filter = { limit: limit, notImported: false };
        let exclude = { category: CATEGORY_RETRAIN };
        let results = CardViewer.filter(filter, exclude);
        
        if(i !== 3) {
            if(i === 0) {
                filter.notImported = true;
            }
            else {
                filter.imported = true;
            }
            let notImportResults = CardViewer.filter(filter, exclude);
            results = results.concat(notImportResults);
        }
        
        let tag = tags[i];
        appendSearchPage(results, tag);
        
        if(i < 3) {
            i++;
            setTimeout(handleStep, 0);
        }
        else {
            $("#status").remove();
        }
    };
    handleStep();
    
    // let importResults = CardViewer.filter({ imported: true, });
    // console.log(importResults);
    // appendSearchPage(importResults, "Imported");
    
    
    // $("body").append(
        // CardViewer.composeResult(CardViewer.Database.cards[9138])
    // );
};
window.addEventListener("load", onLoad);