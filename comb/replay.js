(function () {
    if(replay_arr.length === 0) return null;
    if(!$("#pause_replay_btn").attr("disabled")) {
        $("#pause_replay_btn").click();
    }
    
    // local copy
    let replay_actions = replay_arr.slice();
    
    const match = (compareProps, targetProps) => {
        for(let [key, val] of Object.entries(compareProps)) {
            if(targetProps[key] !== val) return false;
        }
        return true;
    }
    const findBy = (props, arr = replay_arr) =>
        arr.find(el => match(props, el));
    
    let players = findBy({ play: "Pick first" }).order;
    let roundsWon = {};
    for(let player of players) {
        roundsWon[player] = 0;
    }
    
    // parse into games
    const isDeterminator = (obj) =>
        obj.play === "Admit defeat" ||
        obj.play === "Quit duel";
    
    let canParse = true;
    let isMatch = replay_arr.some(e => e.over);
    
    const collectGame = () => {
        if(!canParse) {
            console.log("Can no longer parse games, as the match is over.");
            return null;
        }
        let actions = [];
        while(replay_actions.length && !isDeterminator(replay_actions[0])) {
            actions.push(replay_actions.shift());
        }
        let det = replay_actions.shift();
        console.log("Determinator:", det);
        console.log("Actions:", actions);
        let loser = det.username;
        console.log("Round loser:", loser);
        let winner = players[loser === players[0] ? 1 : 0]
        console.log("Round winner:", winner);
        roundsWon[winner]++;
        
        // info for next collect
        if(det.over || replay_actions.length === 0 || !isMatch) {
            canParse = false;
        }
        
        return {
            winner: winner,
            loser: loser,
            actions: actions,
        };
    };
    let game1 = collectGame();
    let game2 = collectGame();
    let game3 = collectGame();
    
    console.log("Rounds won:", roundsWon);
    let games = [game1, game2, game3].filter(e => e);
    
    return {
        players: players,
        games: games,
        roundsWon: roundsWon,
    };
    
    /*
    // test if easy winner
    let simpleDefeat = findBy({
        play: "Admit defeat",
        over: true
    });
    
    // the player who admits defeat and causes a game to be over loses
    if(simpleDefeat) {
        loser = simpleDefeat.username;
    }
    else {
        // if there is no admitted defeat, the player who quits first loses
        loser = findBy({ play: "Quit duel" }).username;
    }
    winner = players[loser === players[0] ? 1 : 0];
    
    // a winner has now been determined
    if(winner) {
        console.log("Winner:", winner);
        console.log("Loser:", loser);
    }
    
    // view cards used by the winner and loser
    return winner;
    */
})();