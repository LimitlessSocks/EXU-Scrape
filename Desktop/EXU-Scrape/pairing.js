const PAIR_DATA_KEY = "pairing";

const shuffle = list => {
    let currentIdx = list.length, randomIdx;

    while(currentIdx > 0) {
        randomIdx = Math.floor(Math.random() * currentIdx);
        currentIdx--;
        [ list[currentIdx], list[randomIdx] ] = [ list[randomIdx], list[currentIdx] ];
    }

    return list;
};

window.addEventListener("load", function () {
    // initialize
    CardViewer.SaveData.set(PAIR_DATA_KEY, CardViewer.SaveData.get(PAIR_DATA_KEY) ?? {
        pairings: [],
        focus: null,
    });
    
    let state = CardViewer.SaveData.get(PAIR_DATA_KEY);
    window.state = state;
    const newPairing = document.getElementById("newPairing");
    const loadPairing = document.getElementById("loadPairing");
    const pairingGround = document.getElementById("pairingGround");
    const deletePairing = document.getElementById("deletePairing");
    const initInfo = document.getElementById("initInfo");
    const currentRound = document.getElementById("currentRound");
    const currentRoundInfo = document.getElementById("currentRoundInfo");
    const playerInfoWrite = document.getElementById("playerInfoWrite");
    const startPairing = document.getElementById("startPairing");
    const nextRound = document.getElementById("nextRound");
    
    startPairing.addEventListener("click", function () {
        let pairingData = state.pairings[state.focus];
        // shuffle participants
        let participants = [...pairingData.players];
        shuffle(participants);
        // set round info
        let round = [];
        for(let i = 0; i < participants.length; i += 2) {
            let first = participants[i];
            let second = participants[i + 1];
            if(second === undefined) {
                // TODO: byes?
            }
            let pairing = {
                first,
                second,
                firstWins: null,
                secondWins: null,
            };
            round.push(pairing);
        }
        console.log(participants);
        console.log(round);
        pairingData.rounds.push(round);
        syncState();
    });
    
    const updatePlayerName = (id, newName) => {
        let pairingData = state.pairings[state.focus];
        let idx = pairingData.players.findIndex(player => player.id === id);
        if(idx === -1) {
            console.error("Could not find player with id", id);
            return;
        }
        pairingData.players[idx].name = newName;
        syncState();
    };
    
    const updateResults = (roundIndex, winsIndex, newWins) => {
        // console.log(roundIndex, winsIndex, newWins);
        let pairingData = state.pairings[state.focus];
        let currentRound = pairingData.rounds.at(-1);
        if(winsIndex == 0) {
            currentRound[roundIndex].firstWins = newWins;
        }
        else {
            currentRound[roundIndex].secondWins = newWins;
        }
        syncState();
    };
    
    const syncState = () => {
        CardViewer.SaveData.sync();
        loadPairing.disabled = state.pairings.length === 0;
        pairingGround.classList.toggle("hidden", state.focus === null);
        
        if(state.focus === null) {
            return;
        }
        let pairingData = state.pairings[state.focus];
        $(".pairingName").text(pairingData.name);
        $(".currentRound").text(pairingData.rounds.length);
        $(".maxRounds").text(pairingData.roundCount);
        $(".playerCount").text(pairingData.playerCount);
        // console.log(pairingData);
        // console.table(pairingData);
        
        // round parameter initialization code
        let needsInitialization = pairingData.rounds.length === 0;
        initInfo.classList.toggle("hidden", !needsInitialization);
        if(needsInitialization) {
            // add/remove inputs
            let targetPlayers = pairingData.players.length;
            while(playerInfoWrite.children.length < targetPlayers) {
                let row = $("<tr><td>?</td><td><input></td></tr>");
                row.find("input").on("change", (ev) => {
                    let id = parseInt(row.find("td").text(), 10);
                    updatePlayerName(id, ev.target.value);
                });
                $(playerInfoWrite).append(row);
            }
            while(playerInfoWrite.children.length > targetPlayers) {
                playerInfoWrite.removeChild(playerInfoWrite.lastElementChild);
            }
            let rows = [...playerInfoWrite.querySelectorAll("tr")];
            // console.log(rows);
            for(let { id, name } of pairingData.players) {
                let row = rows[id];
                let tds = row.querySelectorAll("td");
                tds[0].textContent = id;
                let input = tds[1].querySelector("input");
                input.placeholder = "(undefined)";
                input.value = name;
                if(name === "(undefined)") {
                    input.value = "";
                }
            }
        }
        
        // current round editing
        currentRound.classList.toggle("hidden", needsInitialization);
        if(!needsInitialization) {
            let currentRound = pairingData.rounds.at(-1);
            let targetRows = currentRound.length;
            while(currentRoundInfo.children.length < targetRows) {
                let row = $(`
                    <tr>
                        <td>?</td>
                        <td>?</td>
                        <td>?</td>
                        <td><input type="number" data-pidx="0"></td>
                        <td><input type="number" data-pidx="1"></td>
                        <td>?</td>
                    </tr>
                `);
                row.find("input").on("change", (ev, idx) => {
                    let id = parseInt(row.find("td").text(), 10);
                    let value = parseInt(ev.target.value, 10);
                    let { pidx } = ev.target.dataset;
                    // console.log("OWO!", ev.target.dataset.pidx);
                    updateResults(id, pidx, value);
                });
                $(currentRoundInfo).append(row);
            }
            while(currentRoundInfo.children.length > targetRows) {
                currentRoundInfo.removeChild(currentRoundInfo.lastElementChild);
            }
            let rows = [...currentRoundInfo.querySelectorAll("tr")];
            // console.log(rows);
            let id = 0;
            for(let { first, second, firstWins, secondWins } of currentRound) {
                let roundIndex = id++;
                let row = rows[roundIndex];
                let tds = row.querySelectorAll("td");
                tds[0].textContent = roundIndex;
                tds[1].textContent = first.name;
                tds[2].textContent = second.name;
                tds[3].querySelector("input").value = firstWins;
                tds[4].querySelector("input").value = secondWins;
                tds[5].textContent = firstWins === secondWins
                    ? "Tie!"
                    : firstWins < secondWins
                        ? `${second.name} wins!`
                        : `${first.name} wins!`;
            }
        }
    };
    
    syncState();
    
    let deletePairingPrompt = new Prompt(
        "Are you sure you want to delete?",
        undefined,
        [ "Yes, delete", "No, cancel" ],
        "small",
    );
    deletePairing.addEventListener("click", function () {
        deletePairingPrompt.deploy().then(([ buttonIdx ]) => {
            if(buttonIdx === 1) {
                return;
            }
            state.pairings = state.pairings
                .with(state.focus, undefined)
                .filter(pairing => pairing);
            state.focus = null;
            syncState();
        });
    });
    
    let loadPairingPrompt = new Prompt(
        "Load existing pairing",
        (prompt, options) => {
            let res = $(`
                <label>Pairing name: <select><option value=null></option></select></label>
            `);
            let select = res.find("select");
            options.forEach((option, idx) => {
                let el = $("<option>");
                el.text(option);
                el.val(idx);
                select.append(el);
            });
            if(state.focus !== null) {
                select.val(state.focus);
            }
            return res;
        },
        [ "Load selected", "Cancel" ],
        undefined,
    );
    loadPairing.addEventListener("click", function () {
        loadPairingPrompt.deploy(state.pairings.map(({ name }) => name)).then(result => {
            let [ idx, prompt, inner ] = result;
            if(idx === 1) {
                // cancelled operation
                return;
            }
            let resultIdx = parseInt(inner.find("select").val(), 10);
            if(Number.isNaN(resultIdx)) {
                resultIdx = null;
            }
            state.focus = resultIdx;
            syncState();
        });
    });
    
    let pairingPrompt = new Prompt(
        "Make new pairing",
        (prompt, ...values) => {
            let res = $(`
                <div><label>Name: <input class="inputName" placeholder="BG #???"></label></div>
                <div><label>Number of players: <input class="inputPlayers" type="number" min=0></label></div>
                <div><label>Number of rounds: <input class="inputRounds" type="number" min=0></label></div>
                <div><label>Top cut size: <input class="inputTopCut" type="number" min=0></label></div>
            `);
            // populate the corresponding inputs with the values from `values`
            res.find("input").each(function (idx) {
                let value = values[idx];
                if(typeof value !== "undefined") {
                    $(this).val(value);
                }
            });
            return res;
        },
        [ "Confirm", "Cancel" ],
        "large",
    );
    newPairing.addEventListener("click", function () {
        pairingPrompt.deploy(undefined, 31, 5, 4).then(result => {
            let [ idx, prompt, inner ] = result;
            if(idx === 1) {
                // cancelled operation
                return;
            }
            let [ name, playerCount, roundCount, topCutSize ] = 
                [...inner[0].querySelectorAll("input")].map(input => input.value);
            
            playerCount = parseInt(playerCount, 10);
            roundCount = parseInt(roundCount, 10);
            topCutSize = parseInt(topCutSize, 10);
                
            if(name.trim().length === 0) {
                return Prompt
                    .OK("Invalid pairing name")
                    .deploy();
            }
            
            if(state.pairings.some(pairing => pairing.name === name)) {
                return Prompt
                    .OK("Pairing with name " + name + " already exists")
                    .deploy();
            }
            
            state.pairings.push({
                name,
                playerCount,
                roundCount,
                topCutSize,
                players: [...Array(playerCount).keys()]
                    .map(idx => ({
                        id: idx,
                        name: "(undefined)",
                    })),
                rounds: [],
            });
            state.focus = state.pairings.length - 1;
            syncState();
        });
    });
});
