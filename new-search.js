// import "tag-extract.js"
const EMPTY_QUERY = {
    type: "",
    name: "",
    id: "",
    effect: "",
    author: "",
    limit: "",
    category: "any",
    visibility: "",
};

let onLoad = async function () {
    CardViewer.SaveData.init();
    if(!CardViewer.SaveData.get("credit")) {
        CardViewer.SaveData.set("credit", {
            isArtFinder: false,
        });
    }
    
    const creditButton = document.getElementById("creditArt");
    if(CardViewer.SaveData.get("credit").isArtFinder) {
        creditButton.classList.toggle("hidden", false);
    }
    creditButton.addEventListener("click", function () {
        // TODO: actually implement
    });
    
    await CardViewer.Database.initialReadAll("./db.json");
    
    const playrateSummary = await fetch("./data/playrate-summary.json").then(req => req.json());
    CardViewer.Playrates.Summary = playrateSummary;
    
    const state = {
        stepSize: 25,
    };
    window.NewSearchState = state;
    
    const updateTexts = () => {
        $(".cards-showing").text(state.showing);
        $(".cards-total").text(state.total);
    };
    const appendCard = (card, update=false) => {
        $("#output").append(CardViewer.composeResult(card));
        if(update) {
            updateTexts();
        }
    };
    
    const search = $("#search");
    let lastInput;
    const changeInput = () => {
        let text = search.val();
        if(lastInput === text) {
            return;
        }
        lastInput = text;
        let query = naturalInputToQuery(text);
        let condensed = condenseQuery(query);
        
        // extract date info
        let congealed = query.reduce((p, c) => ({...p, ...c}), {});
        
        console.log("owo");
        console.log("TEXT:", text);
        console.log("QUERY:", query);
        console.log("CONDENSED:", condensed, "(case sensitive:", condensed.caseSensitive, ")");
        console.log("CONGEALED DATE:", congealed);
        // text, "==>", query, condensed, condensed.caseSensitive);
        
        
        state.results = CardViewer.filter(condensed, null, congealed);
        state.total = state.results.length
        state.showing = Math.min(state.total, state.stepSize);
        
        //TODO: show results only a few at a time
        $("#output").empty();
        for(let card of state.results.slice(0, state.showing)) {
            appendCard(card);
        }
        updateTexts();
        
        let needsExpansion = state.results.length > state.stepSize;
        $(".button-expand").toggleClass("hidden", !needsExpansion);
        $(".navigation.bottom").toggle("hidden", !needsExpansion);
    };
    
    let expandOnce = () => {
        for(let i = 0; i < state.stepSize; i++) {
            if(state.showing >= state.results.length) {
                state.showing = state.results.length;
                break;
            }
            let card = state.results[state.showing++];
            appendCard(card);
        }
        updateTexts();
    };
    let expandAll = () => {
        expandOnce();
        if(state.showing < state.results.length) {
            setTimeout(expandAll, 0);
        }
    };
    
    $(".button-expand.some").click(expandOnce);
    $(".button-expand.all").click(expandAll);
    search.change(changeInput);
    search.keypress((ev) => {
        if(ev.key === "Enter") {
            changeInput();
        }
    });
    
    if(window.location.search) {
        $("#search").val(
            decodeURI(
                window.location.search.replaceAll("%2C", ",")
                                      .replaceAll("%2E", ".")
            ).slice(3)
        );
    }

    changeInput();
    
    $("#save-link").click(() => {
        window.location.search = encodeURI("?q=" + $("#search").val())
            .replaceAll(".", "%2E")
            .replaceAll(",", "%2C");
    });
};

window.addEventListener("load", onLoad);
