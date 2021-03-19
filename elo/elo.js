const Elo = (function() {
    function getRatingDelta(myRating, opponentRating, myGameResult) {
        if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
            return null;
        }

        var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));

        return Math.round(32 * (myGameResult - myChanceToWin));
    }

    function getNewRating(myRating, opponentRating, myGameResult) {
        return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
    }

    let twoWayCalculation = (a, b, aScore, bScore, mFactor = 1.5) => {
        let mScore = aScore < bScore ? 0 : aScore == bScore ? 0.5 : 1;
        let delta = Elo.getRatingDelta(a, b, mScore);
        if(aScore == 0 || bScore == 0) delta *= mFactor;
        let aNew = a + delta;
        let bNew = b - delta;
        return [aNew, bNew];
    };


    return {
        getRatingDelta: getRatingDelta,
        getNewRating: getNewRating,
        twoWayCalculation: twoWayCalculation,
    };
})();

const DEFAULT_ELO = 1000;
class PlayerCalculations {
    constructor() {
        this.scores = {};
        this.defaultElo = DEFAULT_ELO;
    }
    
    addPlayer(name, elo=null) {
        if(elo === null) {
            elo = this.defaultElo;
        }
        // name = name.toLowerCase();
        if(name in this.scores) {
            throw new Error("Player already exists: " + name);
        }
        this.scores[name] = elo;
    }
    
    parsePlayerList(input) {
        for(let [ all, name, elo ] of input.matchAll(/(.+) (\d[\d.]*)$/gm)) {
            this.addPlayer(name, parseFloat(elo));
        }
    }
    
    playerEncounter(a, b, aScore, bScore) {
        let aElo = this.scores[a];
        let bElo = this.scores[b];
        
        [aElo, bElo] = Elo.twoWayCalculation(aElo, bElo, aScore, bScore);
        
        this.scores[a] = aElo;
        this.scores[b] = bElo;
    }
    
    battlePlayers(input) {
        let count = 0;
        for(let [ all, a, aScore, bScore, b ] of input.matchAll(/^\s*(.+?)\s*(\d)\s*-\s*(\d)\s*(.+?)\s*$/gm)) {
            this.playerEncounter(a, b, parseInt(aScore), parseInt(bScore));
            count++;
        }
        return count;
    }
    
    toString() {
        return Object.entries(this.scores)
            .sort((a, b) => b[1] - a[1])
            .map(e => e.join(" "))
            .join("\n");
    }
};










