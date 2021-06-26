const Elo = (function() {
    let eloRound = (n) => Math.round(n * 2) / 2;
    
    function getRatingDelta(myRating, opponentRating, myGameResult) {
        if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
            return null;
        }

        var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));

        return (32 * (myGameResult - myChanceToWin));
    }

    function getNewRating(myRating, opponentRating, myGameResult) {
        return eloRound(myRating + getRatingDelta(myRating, opponentRating, myGameResult));
    }

    let twoWayCalculation = (a, b, aScore, bScore, mFactor = 1.5) => {
        let mScore = aScore < bScore ? 0 : aScore == bScore ? 0.5 : 1;
        let delta = Elo.getRatingDelta(a, b, mScore);
        if(aScore == 0 || bScore == 0) delta *= mFactor;
        let aNew = eloRound(a + delta);
        let bNew = eloRound(b - delta);
        return [aNew, bNew];
    };


    return {
        getRatingDelta: getRatingDelta,
        getNewRating: getNewRating,
        twoWayCalculation: twoWayCalculation,
        eloRound: eloRound,
    };
})();

const DEFAULT_ELO = 1000;
class PlayerCalculations {
    constructor() {
        this.scores = {};
        this.defaultElo = DEFAULT_ELO;
    }
    
    addPlayer(name, ping, elo=null) {
        if(elo === null) {
            elo = this.defaultElo;
        }
        // name = name.toLowerCase();
        if(name in this.scores) {
            throw new Error("Player already exists: " + name);
        }
        this.scores[name] = {
            ping: ping,
            elo: elo
        };
    }
    
    parsePlayerList(input) {
        for(let [ all, name, ping, elo ] of input.matchAll(/(?:\d+\.\s*)?(.+?)\s*\|\s*(.+?): (\d[\d.]*)$/gm)) {
            this.addPlayer(name, ping, parseFloat(elo));
        }
    }
    
    playerEncounter(a, b, aScore, bScore) {
        if(!this.scores[a]) {
            alert("Cannot find player: " + a);
        }
        if(!this.scores[b]) {
            alert("Cannot find player: " + b);
        }
        let aElo = this.scores[a].elo;
        let bElo = this.scores[b].elo;
        
        [aElo, bElo] = Elo.twoWayCalculation(aElo, bElo, aScore, bScore);
        
        this.scores[a].elo = aElo;
        this.scores[b].elo = bElo;
    }
    
    battlePlayers(input) {
        let count = 0;
        for(let [ all, a, aScore, bScore, b ] of input.matchAll(/^\s*(.+?)\s*(\d)\s*-\s*(\d)\s*(.+?)\s*$|^-.+/gm)) {
            if(all[0] == "-") {
                let nick = all.slice(1);
                console.log(all, nick);
                delete this.scores[nick];
                continue;
            }
            this.playerEncounter(a, b, parseInt(aScore), parseInt(bScore));
            count++;
        }
        return count;
    }
    
    toString() {
        return Object.entries(this.scores)
            .sort((a, b) => b[1].elo - a[1].elo)
            .map((e, i) => (i + 1) + ". " + e[0] + " | " + e[1].ping + ": " + e[1].elo)
            .join("\n");
    }
};










