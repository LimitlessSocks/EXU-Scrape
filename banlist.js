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
        226, 9099, 1138, 5576, 3724, 6697, 9696, 9875, 5570, 7817, 10624, 3535, 10636, 2219, 9192, 3334,
        8421, 8575, 378228, 7608, 2102, 2875, 3898, 9019,
        6873, 6874, 1079, 4432,
        8803, 2730, 1314, 6944, 7303, 9762, 2252, 8429, 8861,
        
        // imports
        11110, 11064, 11065, 10898, 10992,
        // 11127, 11128, 11129
        // 10669, 884, 10606, 9070, 10503, 3057, 5684, 3895, 10958,
        // 9553, 9639, 1314,
        // 9019
    ];
    //ADAMANCIPATOR RESEARCHER
    //CYBER-STEIN
    //ACCESSCODE TALKER
    //HIERATIC SEAL OF THE HEAVENLY SPHERES
    //SIMORGH, BIRD OF SOVREIGNTY
    //NATURIA BEAST
    //ABYSS DWELLER
    //SMOKE GRENADE OF THE THIEF
    //DANGER?! JACKALOPE?
    //DANGER?! TSUCHINOKO?
    //E - EMERGENCY CALL
    //THERE CAN BE ONLY ONE
    
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