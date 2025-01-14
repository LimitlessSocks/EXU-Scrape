const fs = require("fs");

const loadJSON = (src, target={}) => {
    Object.assign(target, JSON.parse(fs.readFileSync(src)));
    return target;
};

const database = {};
loadJSON("ycg.json", database);
loadJSON("db.json", database);

let validTargets = [];

const extraDeckColors = ["Fusion", "Synchro", "Xyz", "Link"];
const isExtraDeck = (card) =>
    extraDeckColors.some(color => card.monster_color === color);
const isMainDeck = (card) => !isExtraDeck(card);

for(let [ id, card ] of Object.entries(database)) {
    if(card.card_type === "Monster" && isMainDeck(card)) {
        validTargets.push(card);
    }
}

console.log(validTargets.map(e => e.name));

const getValidTargets = () => validTargets;
 // (name="") =>
    // CardViewer.filter({
        // name: name,
        // type: "monster"
    // }).filter(CardViewer.Filters.isMainDeck);

let stats = ["type", "attribute", "level", "atk", "def"];
let smallWorldFilter = (a, b) =>
    stats.filter(stat => a[stat] == b[stat]);

let smallWorldMatches = (a, b) =>
    smallWorldFilter(a, b).length === 1;

let rankSmallWorldMatch = (first, prospect, target) => {
    let firstBridge = smallWorldFilter(first, prospect)[0];
    let secondBridge = smallWorldFilter(prospect, target)[0];
    // TODO: better grading
    let firstIndex = stats.indexOf(firstBridge);
    let secondIndex = stats.indexOf(secondBridge);
    return firstIndex + secondIndex;
};

let bridgeSmallWorld = (first, target) => 
    getValidTargets()
          .filter(card => smallWorldMatches(first, card) && smallWorldMatches(card, target))
          // .map(card => [card, rankSmallWorldMatch(first, card, target)])
          // .sort((a, b) => a[1] - b[1]);

const outFile = "small-world.txt";
fs.writeFileSync(outFile, "== Small World Sparse Paths ==\n");

const appendQueue = [];
const handleQueueEntry = (block=true) => {
    if(block && handleQueueEntry.isHandling) return;
    handleQueueEntry.isHandling = true;
    fs.appendFile(outFile, appendQueue[0], (err) => {
        if(err) throw err;
        appendQueue.shift();
        if(appendQueue.length !== 0) {
            handleQueueEntry(false);
        }
        else {
            handleQueueEntry.isHandling = false;
        }
    });
};
handleQueueEntry.isHandling = false;

const appendOut = (text) => {
    appendQueue.push(text);
    handleQueueEntry();
};

const bigIntDivide = (a, b, m = 100n) => {
    let s = (a * m / b).toString();
    let q = s.split("");
    q.splice(-2, 0, ".");
    return q.join("");
}

let findAllBridges = function () {
    return new Promise((resolve, reject) => {
        let minSoFar = Infinity;
        let maxSoFar = -Infinity;
        let sumSoFar = 0n;
        let countSoFar = 0n;
        
        let sumThisRound = 0n;
        let countThisRound = 0n;
        
        let noticeThreshold = 50;
        
        let cards = getValidTargets();
        let smols = [];
        let addEntry = (tag, bsw, i, j) => {
            console.log("\n" + tag + ", length = " + bsw.length, " ;; ", cards[i].name, ";;", cards[j].name);
            appendOut(tag + " (" + i + ", " + j + ") = " + bsw.length + " ;; " + cards[i].name + "  ;;  " + cards[j].name + "\n");
            smols.push({
                hand: cards[i],
                deck: cards[j],
                bridges: bsw
            });
        };
        let iter2 = (i, j) => new Promise((resolveInner, rej) => {
            let iter2recur = (i, j) => {
                // $("#top").text("i=" + i + "; j=" + j);
                countSoFar++;
                countThisRound++;
                let bsw = bridgeSmallWorld(cards[i], cards[j]);
                sumSoFar += BigInt(bsw.length);
                sumThisRound += BigInt(bsw.length);
                if(bsw.length <= minSoFar) {
                    minSoFar = bsw.length;
                    addEntry("Found new minimal pair", bsw, i, j);
                }
                else if(bsw.length <= noticeThreshold) {
                    addEntry("Found noticeably small pair", bsw, i, j);
                }
                if(bsw.length >= maxSoFar) {
                    maxSoFar = bsw.length;
                    addEntry("Found new maximal pair", bsw, i, j);
                }
                
                let averageString = "RunAvg=" + bigIntDivide(sumThisRound, countThisRound) + " TotalAvg=" + bigIntDivide(sumSoFar, countSoFar);
                process.stdout.write(
                    "(" + i + ", " + j + ") => " + 
                    averageString + 
                    "          \r"
                );
                
                j++;
                if(j >= cards.length) {
                    appendOut("SUMMARY: i=" + i + ", " + averageString + "\n\n");
                    resolveInner();
                    return;
                }
                setTimeout(iter2recur, 0, i, j);
            }
            iter2recur(i, j);
        });
        let iter = (i) => {
            console.log("\ni = " + i);
            appendOut("Checking i = " + i + "...\n");
            minSoFar = Infinity;
            maxSoFar = -Infinity;
            sumThisRound = 0n;
            countThisRound = 0n;
            iter2(i, i + 1).then(() => {
                i++;
                if(i >= cards.length) {
                    resolve(smols);
                    return;
                }
                setTimeout(iter, 0, i);
            });
        };
        iter(0);
    });
};


findAllBridges().then(() => {
    // clean up
    console.log("\nDone!");
});
