let Elo = (function() {
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

  return {
    getRatingDelta: getRatingDelta,
    getNewRating: getNewRating
  };
})();

let getNewScores = (a, b, aScore, bScore) => {
    let mScore = aScore < bScore ? 0 : aScore == bScore ? 0.5 : 1;
    let delta = Elo.getRatingDelta(a, b, mScore);
    // if(aScore == 0 || bScore == 0) delta *= 1.5;
    let aNew = a + delta;
    let bNew = b - delta;
    return [aNew, bNew];
};

const PlayerScores = {};
const DEFAULT_ELO = 1000;
const ensurePlayer = (name, def=DEFAULT_ELO) => {
    if(!(name in PlayerScores)) {
        PlayerScores[name] = def;
    }
}

const battle = (p1, p2, aScore, bScore) => {
    ensurePlayer(p1);
    ensurePlayer(p2);
    let p1Elo = PlayerScores[p1];
    let p2Elo = PlayerScores[p2];
    console.log(`${p1} (${p1Elo}) vs ${p2} (${p2Elo})`);
    console.log("   RESULT:", aScore, "-", bScore);
    [p1Elo, p2Elo] = getNewScores(p1Elo, p2Elo, aScore, bScore);
    console.log(`   ${p1} (${p1Elo})\n   ${p2} (${p2Elo})`);
    PlayerScores[p1] = p1Elo;
    PlayerScores[p2] = p2Elo;
}

let matches = [
    ["blaze", "lettuce", 2, 1],
    ["ake", "matsu", 2, 0],
    ["ocean", "ake", 2, 0],
    ["sock", "redox", 2, 0],
    ["khrey", "v9", 2, 0],
    ["khrey", "v9", 1, 2],
    ["delta", "dan", 2, 0],
    ["khrey", "delta", 2, 0],
    ["lettuce", "gatr", 2, 1],
    ["matsu", "vector", 0, 2],
    ["khrey", "delta", 2, 1],
    ["ocean", "xccel", 2, 0],
    ["masha", "lyoko", 2, 0],
    ["46", "xerex", 2, 0],
    ["monkey man", "ake", 2, 0],
    ["khrey", "v9", 1, 2],
    ["ake", "v9", 2, 0],
    ["blaze", "oryja", 2, 0],
    ["xerex", "ocean", 0, 2],
    ["khrey", "v9", 2, 0],
    ["xccel", "ake", 2, 1],
    ["ake", "khrey", 2, 0],
    ["masha", "lyoko", 2, 0],
    ["khrey", "v9", 1, 2],
    ["khrey", "v9", 2, 1],
    ["khrey", "ake", 2, 0],
    ["blaze", "sock", 2, 1],
    ["khrey", "xccel", 2, 0],
    ["cryselle", "dan", 2, 0],
    ["46", "ocean", 1, 2],
    ["lyoko", "masha", 2, 0],
    ["oryja", "ocean", 2, 0],
    ["khrey", "xerex", 2, 0],
    ["lyoko", "matsu", 2, 0],
    ["lyoko", "rail", 2, 0],
    ["oryja", "ocean", 2, 0],
    ["ocean", "khrey", 2, 1],
    ["lyoko", "delta", 2, 0],
    ["xccel", "ake", 2, 1],
    ["xccel", "ake", 2, 0],
    ["cryselle", "yummysocks", 2, 1],
    ["lyoko", "delta", 2, 0],
    ["gatr", "blaze", 2, 0],
    ["gatr", "blaze", 2, 1],
    ["ocean", "46", 2, 0],
    ["sock", "blaze", 2, 1],
    ["sock", "blaze", 2, 0],
    ["sock", "gatr", 2, 0],
    ["gatr", "sock", 2, 0],
    ["blaze", "khrey", 2, 0],
    ["ocean", "khrey", 2, 0],
    ["lyoko", "delta", 2, 1],
    ["sock", "gatr", 2, 0],
    ["gatr", "sock", 2, 1],
    ["khrey", "ocean", 2, 0],
    ["blaze", "sock", 1, 0],
    ["awk", "yummysocks", 2, 1],
    ["46", "oryja", 2, 1],
    ["oryja", "46", 2, 1],
    ["ake", "46", 2, 0],
    ["oryja", "ake", 2, 1],
    ["blaze", "gatr", 2, 0],
    ["blaze", "gatr", 2, 1],
    ["masha", "awk", 2, 1],
    ["ake", "46", 2, 0],
    ["ocean", "sock", 2, 0],
    ["ocean", "sock", 2, 1],
    ["oryja", "ake", 2, 0],
    ["awk", "masha", 2, 0],
    ["lyoko", "xccel", 1, 0],
    ["khrey", "ocean", 2, 1],
    ["sock", "ocean", 2, 1],
    ["psychic", "lyoko", 1, 2],
    ["psychic", "lyoko", 2, 1],
    ["lyoko", "psychic", 2, 0],
    ["lyoko", "psychic", 2, 0],
    ["sock", "ocean", 0, 2],
    ["sock", "ocean", 2, 0],
    ["khrey", "blaze", 2, 0],
    ["khrey", "blaze", 2, 0],
    ["blaze", "sock", 2, 0],
    ["awk", "delta", 1, 2],
    ["khrey", "gatr", 2, 1],
    ["sock", "ocean", 2, 0],
    ["khrey", "blaze", 2, 0],
    ["sock", "blaze", 2, 1],
    ["blaze", "sock", 2, 0],
];

for(let match of matches) {
    // let [p1, p2, p1score, p2score] = match;
    battle(...match);
}

let entries = Object.entries(PlayerScores);
entries.sort((a, b) => b[1] - a[1]);

console.log(entries);













