let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

let onLoad = async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    CardViewer.Editor.MajorContainer = $("#majorContainer");
    window.addEventListener("resize", CardViewer.Editor.recalculateView);
    CardViewer.Elements.results = $("#results");
    CardViewer.Editor.recalculateView();
    
    CardViewer.Elements.searchParameters = $("#searchParameters");
    
    CardViewer.Elements.cardType = $("#cardType");
    CardViewer.Elements.cardLimit = $("#cardLimit");
    CardViewer.Elements.cardAuthor = $("#cardAuthor");
    CardViewer.Elements.search = $("#search");
    CardViewer.Elements.autoSearch = $("#autoSearch");
    CardViewer.Elements.cardName = $("#cardName");
    CardViewer.Elements.resultCount = $("#resultCount");
    CardViewer.Elements.cardDescription = $("#cardDescription");
    CardViewer.Elements.currentPage = $("#currentPage");
    CardViewer.Elements.pageCount = $("#pageCount");
    CardViewer.Elements.nextPage = $("#nextPage");
    CardViewer.Elements.previousPage = $("#previousPage");
    CardViewer.Elements.resultNote = $("#resultNote");
    CardViewer.Elements.cardId = $("#cardId");
    CardViewer.Elements.cardIsRetrain = $("#cardIsRetrain");
    CardViewer.Elements.cardVisibility = $("#cardVisibility");
    CardViewer.Elements.ifMonster = $(".ifMonster");
    CardViewer.Elements.ifSpell = $(".ifSpell");
    CardViewer.Elements.ifTrap = $(".ifTrap");
    CardViewer.Elements.cardSpellKind = $("#cardSpellKind");
    CardViewer.Elements.cardTrapKind = $("#cardTrapKind");
    CardViewer.Elements.monsterStats = $("#monsterStats");
    CardViewer.Elements.spellStats = $("#spellStats");
    CardViewer.Elements.trapStats = $("#trapStats");
    CardViewer.Elements.cardLevel = $("#cardLevel");
    CardViewer.Elements.cardMonsterCategory = $("#cardMonsterCategory");
    CardViewer.Elements.cardMonsterAbility = $("#cardMonsterAbility");
    CardViewer.Elements.cardMonsterType = $("#cardMonsterType");
    CardViewer.Elements.cardMonsterAttribute = $("#cardMonsterAttribute");
    CardViewer.Elements.cardATK = $("#cardATK");
    CardViewer.Elements.cardDEF = $("#cardDEF");
    CardViewer.Elements.cardLevelCompare = $("#cardLevelCompare");
    CardViewer.Elements.cardATKCompare = $("#cardATKCompare");
    CardViewer.Elements.cardDEFCompare = $("#cardDEFCompare");
    CardViewer.Elements.toTopButton = $("#totop");
    CardViewer.Elements.saveSearch = $("#saveSearch");
    CardViewer.Elements.clearSearch = $("#clearSearch");
    
    CardViewer.Elements.deckEditor = $("#deckEditor");
    CardViewer.Elements.cardPreview = $("#cardPreview");
    
    CardViewer.setUpTabSearchSwitching();
    
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    
    // remove ocg
    // for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        // if(card.tcg === 0 && !card.exu_limit && card.ocg > 0) {
            // delete CardViewer.Database.cards[id];
        // }
    // }
    
    CardViewer.firstTime = false;
    CardViewer.autoSearch = true;
    CardViewer.Search.config.noTable = true;
    CardViewer.Search.config.transform = (el, card) => {
        el.addClass("clickable");
        el.addClass("unselectable");
        let id = card["id"];
        CardViewer.Editor.addHoverTimerPreview(el, id);
        el.click(() => {
            CardViewer.Editor.DeckInstance.addCard(id);
            CardViewer.Editor.updateDeck();
            CardViewer.Editor.setPreview(id);
        });
        el.contextmenu((e) => {
            e.preventDefault();
            CardViewer.Editor.DeckInstance.addCard(id, Deck.Location.SIDE);
            CardViewer.Editor.updateDeck();
            CardViewer.Editor.setPreview(id);
        });
        return el;
    };
    
    const elementChanged = function () {
        if(CardViewer.autoSearch) {
            CardViewer.submit();
        }
    };
    
    let allInputs = CardViewer.Elements.searchParameters.find("select, input");
    for(let el of allInputs) {
        $(el).change(elementChanged);
        $(el).keypress((event) => {
            if(event.originalEvent.code === "Enter") {
                CardViewer.submit();
                // alert("submitting");
            }
        });
    }
    CardViewer.Elements.clearSearch.click(() => {
        for(let el of allInputs) {
            el = $(el);
            if(el.is("select")) {
                el.val(el.children().first().val());
            }
            else if(el.is("input[type=checkbox]")) {
                el.prop("checked", false);
            }
            else {
                el.val("");
            }
        }
        elementChanged();
        CardViewer.Elements.cardType.change();
    });
    elementChanged();
    
    // testDeck();
    
    $("#importDeck").on("change", function () {
        // console.log($(this).val());
        let file = this.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target.result;
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(text, "text/xml");
            // CardViewer.Editor.DeckInstance = new Deck();
            let deck = CardViewer.Editor.DeckInstance;
            
            deck.clear();
            
            let i = 0;
            for(let deckContainer of xmlDoc.querySelectorAll("main, side, extra")) {
                for(let card of deckContainer.querySelectorAll("card")) {
                    deck.addCard(card.id, i);
                }
                i++;
            }
            
            let author = xmlDoc.querySelector("meta author");
            let description = xmlDoc.querySelector("meta description");
            let name = xmlDoc.querySelector("meta name");
            let thumb = xmlDoc.querySelector("meta thumb");
            
            if(author) deck.author = author.textContent;
            if(description) deck.description = description.textContent;
            if(name) deck.name = name.textContent;
            if(thumb) deck.thumb = thumb.textContent;
            
            CardViewer.Editor.updateDeck();
            // console.log(xmlDoc);
        };
        reader.readAsText(file);
    });
    
    $("#clearDeck").click(() => {
        CardViewer.Editor.DeckInstance.clear();
        CardViewer.Editor.updateDeck();
    });
    
    $("#sortDeck").click(() => {
        CardViewer.Editor.DeckInstance.sort();
        CardViewer.Editor.updateDeck();
    });
    
    $("#shuffleDeck").click(() => {
        CardViewer.Editor.DeckInstance.shuffle();
        CardViewer.Editor.updateDeck();
    });
    
    const deckInfoSavedPrompt = Prompt.OK("Deck Info Saved!");
    const deckInfoClearedPrompt = Prompt.OK("Cleared!");
    const exportPrompt = new Prompt("Export Deck",
        () => {
            let html = $(`
                <table>
                    <tr>
                        <th><label for="deckSaveName">Name:</label></th>
                        <td><input id="deckSaveName"></td>
                    </tr>
                    <tr>
                        <th><label for="deckSaveAuthor">Author:</label></th>
                        <td><input id="deckSaveAuthor"></td>
                    </tr>
                    <tr>
                        <th><label for="deckSaveDescription">Description:</label></th>
                        <td><textarea id="deckSaveDescription"></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="deckSaveThumb">Cover card:</label></th>
                        <td><select id="deckSaveThumb">
                            <option value="0"></option>
                        </select></td>
                    </tr>
                </table>
            `);
            let keys = [...new Set(CardViewer.Editor.DeckInstance.decks.flat())];
            html.find("#deckSaveThumb").append(
                keys.map(key =>
                    $("<option>")
                        .attr("value", key)
                        .text(CardViewer.Database.cards[key].name)
                )
            );
            let deck = CardViewer.Editor.DeckInstance;
            html.find("#deckSaveName").val(deck.name);
            html.find("#deckSaveAuthor").val(deck.author);
            html.find("#deckSaveDescription").val(deck.description);
            html.find("#deckSaveThumb").val(deck.thumb);
            return html;
        },
        ["Save Info", "Export Deck", "Clear Export Info", "Cancel"],
        "large",
    );
    $("#exportDeck").click(() => {
        exportPrompt.deploy().then(([buttonIndex, p]) => {
            //Cancel
            if(buttonIndex === 3) {
                return;
            }
            //Clear Export Info
            if(buttonIndex === 2) {
                let deck = CardViewer.Editor.DeckInstance;
                deck.name = deck.author = deck.description = "";
                deck.thumb = 0;
                CardViewer.Editor.saveLocalDeck();
                deckInfoClearedPrompt.deploy().then(() => $("#exportDeck").trigger("click")).catch(() => {});
                return;
            }
            
            let html = p.anchor;
            let deck = CardViewer.Editor.DeckInstance;
            deck.name        = html.find("#deckSaveName").val() || deck.name;
            deck.description = html.find("#deckSaveDescription").val() || deck.description;
            deck.author      = html.find("#deckSaveAuthor").val() || deck.author;
            deck.thumb       = html.find("#deckSaveThumb").val() || deck.thumb;
            
            if(buttonIndex === 0) {
                CardViewer.Editor.saveLocalDeck();
                deckInfoSavedPrompt.deploy();
            }
            else if(buttonIndex === 1) {
                let xml = deck.toXML();
                downloadFile(xml, "text/xml", deck.getId() + ".xml");
            }
        })
        .catch(() => {
            //pass
        });
    });
    
    const minimizeSearchOptions = $("#minimizeSearchOptions");
    minimizeSearchOptions.click(() => {
        CardViewer.Elements.searchParameters.toggle();
        CardViewer.Editor.recalculateView();
        minimizeSearchOptions.text(minimizeSearchOptions.text() !== "Minimize Options" ? "Minimize Options" : "Maximize Options");
    });
    
    CardViewer.Elements.nextPage.click(CardViewer.Search.nextPage);
    CardViewer.Elements.previousPage.click(CardViewer.Search.previousPage);
    
    /*
    window.addEventListener("beforeunload", (event) => {
        CardViewer.Editor.saveLocalDeck();
    });
    */
    
    const savePrompt = Prompt.OK("Deck Saved!");
    
    $("#saveDeck").click(() => {
        CardViewer.Editor.saveLocalDeck();
        savePrompt.deploy();
    });
    
    if(CardViewer.Editor.loadLocalDeckIfAny()) {
        CardViewer.Editor.setPreview(CardViewer.Editor.DeckInstance.thumb);
    }
};

let testDeck = function () {
    let deck = [
        1593267, 1593267, 1593267, 8859, 8859, 8859,
        1893760, 1893760, 1893760,
        
        1586518, 1768966, 1037312, 7421];
    // let deck = [9551, 1647, 11107, 11110, 1768966, 1319245, 1318849, 1766297, 11235];
    // let deck = [328, 382, 383, 562, 563, 5002, 9550, 9638, 9551, 9636, 907798, 9553, 1205167, 9639, 1307739, 1941, 4974, 2028, 2379, 5178, 6432, 3530, 3840, 5001, 3546, 4913, 82, 11107, 1039, 1041, 1647, 1753, 4971, 7207, 11110, 756, 9555, 7218, 2909, 7759, 3913, 7730];
    for(let id of deck) {
        // console.log(id);
        CardViewer.Editor.DeckInstance.addCard(id);
    }
    for(let id of [
        1893606, 1893606, 1893606
    ]) {
        CardViewer.Editor.DeckInstance.addCard(id, Deck.Location.SIDE);
    }
    CardViewer.Editor.updateDeck();
    // CardViewer.Editor.setPreview(1593267);
};

window.addEventListener("load", onLoad);