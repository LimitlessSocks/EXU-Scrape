// import "tag-extract.js"
let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";
    
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
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    
    const search = $("#search");
    let lastInput;
    const changeInput = () => {
        let text = search.val();
        if(lastInput === text) {
            return;
        }
        lastInput = text;
        let query = naturalInputToQuery(text);
        query = condenseQuery(query);
        console.log("owo", query);
        
        let results = CardViewer.filter(query);
        // $("#output").text(results.map(e => e.name).join("\n"))
        // .css("white-space", "pre-wrap");
        
        // let deck = new Deck(results.map(e => e.id));
        // deck.renderHTML($("#output"));
        
        //TODO: show results only a few at a time
        //TODO: two columns
        $("#output").empty();
        for(let card of results.slice(0, 20)) {
            $("#output").append(CardViewer.composeResult(card));
        }
         
        // console.log(JSON.stringify(naturalInputToQuery(text)));
    };
    search.change(changeInput);
    search.keypress((ev) => {
        if(ev.key === "Enter") {
            changeInput();
        }
    });
    changeInput();
};

window.addEventListener("load", onLoad);