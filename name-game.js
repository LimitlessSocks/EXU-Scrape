let onLoad = async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    CardViewer.addEventListener("formatChange", format => {
        document.getElementById("loaded-format").textContent = format;
        console.log("format changing ....", format);
    });
    
    await CardViewer.Database.initialReadAll("./db.json");
    await CardViewer.initialDatabaseSetup();
    
    CardViewer.attachGlobalSearchOptions(
        $("#showOptions"),
        {
            monkeyPatch(data) {
                // document.querySelector("#top a").textContent = `${data.name} Deck Editor`;
                // updateInputDisplay();
            },
            // denseToggle: updateInputDisplay,
            formatSelect(data) {
            },
        },
    );
    
    let cardInput = $("#card-input");
    let timer = $("#timer")[0];
    
    const GameState = {};
    let syncTargetOutput = () => {
        for(let target of document.querySelectorAll(".guess-target-output")) {
            target.textContent = $("#guess-target").val();
        }
    };
    const init = () => {
        Object.assign(GameState, {
            timerState: null,
            finalTime: null,
            guessedCardNames: new Set,
            guessTarget: +$("#guess-target").val(),
        });
        if(Number.isNaN(GameState.guessTarget) || GameState.guessTarget < 0 || GameState.guessTarget > Object.keys(CardViewer.Database.cards).length) {
            $("#guess-target").val(GameState.guessTarget = 100);
        }
        syncTargetOutput();
        // initialize cache
        CardViewer.getCardByName("");
        $("#output").empty();
    };
    $("#guess-target").on("input", syncTargetOutput);
    $("#guess-target").change(syncTargetOutput);
    syncTargetOutput();
    
    let updateTimer = (timestamp) => {
        if(!GameState.timeStart) {
            return;
        }
        timer.textContent = (Date.now() - GameState.timeStart) / 1000 + "s";
        requestAnimationFrame(updateTimer);
    };
    let startTimer = () => {
        GameState.timeStart = Date.now();
        updateTimer();
    };
    let stopTimer = () => {
        GameState.finalTime = Date.now() - GameState.timeStart;
        GameState.timeStart = null;
        return GameState.finalTime;
    };
    let toggle = () => {
        $("#start-area").toggle();
        $("#options").toggle();
        $("#play-area")[0].classList.toggle("hidden");
    };
    let shutdown = () => {
        toggle();
        $("#message").text(`Congratulations! You guessed ${GameState.guessTarget} cards in ${GameState.finalTime / 1000} seconds!`);
    };
    let submit = () => {
        let userGuess = cardInput.val().trim();
        if(!userGuess) {
            return;
        }
        let card = CardViewer.getCardByName(userGuess);
        let feedback;
        let feedbackClass;
        if(card) {
            let oldSize = GameState.guessedCardNames.size;
            GameState.guessedCardNames.add(card.name);
            let newSize = GameState.guessedCardNames.size;
            if(newSize === oldSize) {
                feedback = "Already guessed";
                feedbackClass = "warn";
            }
            else {
                feedback = `Correct! (${newSize}/${GameState.guessTarget})`;
                feedbackClass = "right";
            }
        }
        else {
            // TODO: "close"
            feedback = "No such card (spelling?)";
            feedbackClass = "wrong";
        }
        $("#output").prepend($("<tr>").append(
            $("<td>").text(userGuess),
            $("<td>").text(feedback).addClass(feedbackClass),
        ));
        if(GameState.guessedCardNames.size === GameState.guessTarget) {
            stopTimer();
            shutdown();
        }
        else {
            cardInput.val("");
        }
    };
    cardInput.keydown((ev) => {
        if(ev.originalEvent.key === "Enter") {
            submit();
        }
    });
    $("#submit").click(submit);
    $("#name100").click(() => {
        toggle();
        init();
        cardInput.val("");
        cardInput.focus();
        startTimer();
    });
};

window.addEventListener("load", onLoad);
