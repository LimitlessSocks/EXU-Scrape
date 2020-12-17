let onLoad = async function () {
    CardViewer.excludeTcg =  false;
    CardViewer.Search.pageSize = Infinity;
    CardViewer.Search.columnWidth = -1;
    CardViewer.Elements.popupResults = $("#popupResults");
    CardViewer.Elements.popup = $("#popup");
    CardViewer.linkRetrain = true;
    
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/banlist.json");
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
        8521, 8118, 10208, 5788, 8489, 8490, 8488, 8335, 5035, 4599, 3885, 9624,
        1673, 5543, 4909, 5188, 8452, 10694, 6339, 9242, 4878, 10505,
        7229,
        4396, 11110, 10669, 5793, 6874, 6873, 4432, 9693, 8537,
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
    
    const appendSearchPage = (results, tag) => {
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
        let header = $("<h2 class=main>")
            .text(tag + " Cards (" + CardViewer.Search.pages[0].length + ")")
            .attr("id", tag)
            .append($("<a class=top-arrow>").text("\u2b06").attr("href", "#top"));
        CardViewer.Elements.results.append(header);
        CardViewer.Elements.results.append(sub);
        CardViewer.Elements.tableOfContents.append(
            $("<li>").append($("<a>")
                .attr("href", "#" + tag)
                .text(tag))
        );
    };
    
    
    let results = CardViewer.filter({ retrain: true, });
    appendSearchPage(results, "Retrained");
    
    let importResults = CardViewer.filter({ imported: true, });
    appendSearchPage(importResults, "Imported");
    
    for(let i = 0; i <= 3; i++) {
        let results = CardViewer.filter({ limit: i.toString(), notImported: false }, { retrain: true });
        let tag = tags[i];
        appendSearchPage(results, tag);
    }
    
    let notImportResults = CardViewer.filter({ notImported: true, });
    appendSearchPage(notImportResults, "Unimported");
    
    // $("body").append(
        // CardViewer.composeResult(CardViewer.Database.cards[9138])
    // );
};
window.addEventListener("load", onLoad);