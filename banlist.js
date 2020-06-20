let onLoad = async function () {
    CardViewer.excludeTcg = false;
    CardViewer.Search.pageSize = Infinity;
    CardViewer.Search.columnWidth = -1;
    CardViewer.composeStrategy = CardViewer.composeResultSmall;
    
    let response = await fetch("https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/banlist.json");
    let db = await response.json();
    CardViewer.Database.setInitial(db);
    
    CardViewer.Elements.results = $("#results");
    
    let tags = ["Forbidden", "Limited", "Semi-Limited", "Unlimited"];
    
    const NewCards = [
        7865, 10510, 9082, 10508, 10500, 2102, 10698,
        10669, 10695, 1376287, 8429, 8803, 8861, 10138,
        6427, 8927, 7510, 979470
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
    
    for(let i = 0; i <= 3; i++) {
        let sub = $("<div class=results-holder>");
        let results = CardViewer.filter({ limit: i.toString() });
        CardViewer.Search.processResults(results);
        CardViewer.Search.currentPage = 0;
        let a = true;
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
        let header = $("<h2 class=main>").text(tags[i] + " Cards (" + CardViewer.Search.pages[0].length + ")");
        CardViewer.Elements.results.append(header);
        CardViewer.Elements.results.append(sub);
    }
    
    // $("body").append(
        // CardViewer.composeResult(CardViewer.Database.cards[9138])
    // );
};
window.addEventListener("load", onLoad);