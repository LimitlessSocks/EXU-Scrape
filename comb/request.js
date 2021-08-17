(function() {
    // don't ask why I chose ThisCasingForThisScript.
    console.log("!! Injected API created");
    let URL_START = "https://www.duelingbook.com/";
    window.DeckRequest = {
        // variables
        Responses: {},
        Results: null,
        Order: [], // the order in which to return the results
        Missed: [],
        Complete: false, // we are still waiting for responses
        Reading: true, // user is still writing
        // methods
        Load(deck_id) {
            // copied & modified from loadDeck
            this.Order.push(deck_id);
            
            // initialize
            this.Responses[deck_id] = {
                sent: false,
                fulfilled: false,
            }; 
            
            var fd = new FormData();
            fd.append("id", deck_id);
            fd.append("master", NaN);
            fd.append("user_id", NaN);
            fd.append("duel_id", NaN);
            fd.append("player", false);
            fd.append("secret", false);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", URL_START + "php-scripts/load-deck.php", true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        console.log("Received decklist " + deck_id);
                        this.AddResponse(deck_id, xhr.responseText);
                    }
                    else {
                        console.log("Failed to receive decklist " + deck_id);
                        this.AddMiss(deck_id);
                    }
                }
            };
            this.Responses[deck_id].sent = true;
            xhr.send(fd);
        },
        LoadAll(ids) {
            for(let id of ids) {
                this.Load(id);
            }
        },
        AddResponse(id, text) {
            this.Responses[id].fulfilled = true;
            this.Responses[id].body = text;
        },
        AddMiss(id) {
            this.Missed.push(id);
        },
        CheckAllDone() {
            if(this.Reading) return;
            this.Complete = Object.values(this.Responses)
                .every(({ fulfilled }) => fulfilled);
        },
        Finish() {
            this.Reading = false;
        },
        ProcessResponses() {
            if(this.Results) return;
            this.Results = {};
            
            let tempResults = {};
            for(let [ id, obj ] of Object.entries(this.Responses)) {
                let { body } = obj;
                let cardArray = [];
                body = JSON.parse(body);
                for(let prop of [ "main", "side", "extra" ]) {
                    if(!body[prop]) continue;
                    for(let card of body[prop]) {
                        cardArray.push(this.ProcessCard(card));
                    }
                }
                tempResults[id] = cardArray
            }
            for(let id of this.Order) {
                this.Results[id] = tempResults[id];
            }
        },
        ProcessCard(card) {
            let src = card.custom > 0 ? CUSTOM_PICS_START : CARD_IMAGES_START;
            let id = card.id;
            if(card.custom > 0) {
                let idMod = id - id % 100000;
                src += idMod + "/";
            }
            src += id + ".jpg" + (card.pic != "1" ? "?version=" + card.pic : "");
            card.src = src;
            return card;
        },
        GetResults() {
            this.CheckAllDone();
            if(!this.Complete) {
                return {
                    success: false,
                    results: null,
                    missed: null,
                };
            }
            
            this.ProcessResponses();
            
            return {
                success: true,
                results: this.Results,
                missed: this.Missed,
            };
        },
    };
})();