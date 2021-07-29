


class TagIndicator {
    constructor(reg, fn) {
        this.toMatch = reg;
        this.onParse = fn;
    }
    
    matches(string, index) {
        let match = string.slice(index).match(this.toMatch);
        let result = null;
        
        if(match) {
            match.index += index;
            match.input = string;
            
            result = this.onParse(match);
        }
        
        return {
            match: match,
            result: result,
        };
    }
}

const PROPER_MONSTER_TYPES = [
    "Aqua", "Beast", "Beast-Warrior", "Cyberse",
    "Dinosaur", "Dragon", "Fairy", "Fiend", "Fish",
    "Insect", "Machine", "Plant", "Psychic", "Pyro",
    "Reptile", "Rock", "Sea Serpent", "Spellcaster",
    "Thunder", "Warrior", "Winged Beast", "Wyrm",
    "Yokai", "Zombie", "Creator God", "Divine-Beast"
];
const stripToLoose = (str) =>
    str.toLowerCase()
       .replace(/\s/g, "");

const LOOSE_MATCH_MONSTER_TYPES = PROPER_MONSTER_TYPES.map(stripToLoose)
const getProperMonsterType = (loose) => 
    PROPER_MONSTER_TYPES[
        LOOSE_MATCH_MONSTER_TYPES.indexOf(stripToLoose(loose))
    ];

const INDICATORS = [
    new TagIndicator(/link[- ]?(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "link",
        level: match[1],
    })),
    new TagIndicator(/(level\/rank|rank\/level) ?(\d+)/i, (match) => ({
        type: "monster",
        level: match[2],
    })),
    new TagIndicator(/rank ?(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "xyz",
        level: match[1],
    })),
    new TagIndicator(/level ?(\d+)/i, (match) => ({
        type: "monster",
        level: match[1],
    })),
    new TagIndicator(/dark|light|fire|earth|wind|water/i, (match) => ({
        type: "monster",
        monsterAttribute: match[0].toUpperCase(),
    })),
    new TagIndicator(/aqua|beast|beast[ -]warrior|cyberse|dinosaur|dragon|fairy|fiend|fish|insect|machine|plant|psychic|pyro|reptile|rock|sea[ -]serpent|spellcaster|thunder|warrior|winged[ -]beast|wyrm|yokai|zombie|creator[ -]god|divine[ -]beast/i, (match) => ({
        type: "monster",
        monsterType: getProperMonsterType(match[0]),
    })),
    new TagIndicator(/"([^"]+?)"/, (match) => ({
        name: match[1],
    })),
];

class TagExtractor {
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.output = [];
    }
    
    step() {
        for(let ind of INDICATORS) {
            let { match, result } = ind.matches(this.input, this.index);
            if(match) {
                this.index += match[0].length;
                this.output.push(result);
                return;
            }
        }
        this.index++;
    }
    
    parse() {
        while(this.index < this.input.length) {
            this.step();
        }
        return this.output;
    }
}

const naturalInputToQuery = (input) => {
    let te = new TagExtractor(input);
    return te.parse();
};


//=======================TESTING=======================//
// [input, output]
const TEST_CASES = [
    ["link 2", [{
        type: "monster",
        monsterCategory: "link",
        level: "2",
    }]],
    ["dark", [{
        type: "monster",
        monsterAttribute: "DARK",
    }]],
    ["Dragon \"Number\"", [{
        type: "monster",
        monsterType: "Dragon"
    }, {
        name: "Number"
    }]],
    ["dark dragon \"number\"", [{
        type: "monster",
        monsterAttribute: "DARK",
    }, {
        type: "monster",
        monsterType: "Dragon"
    }, {
        name: "number"
    }]],
];
const objectEqual = (a, b) =>
    a == b || (
        Array.isArray(a) && Array.isArray(b)
            ? a.length == b.length && a.every((e, i) => objectEqual(e, b[i]))
            : typeof a == "object" && typeof b == "object"
                ? Object.entries(a).every(([k, v]) => objectEqual(v, b[k])) && Object.keys(b).every(k => k in a)
                : a == b
    );

let total = TEST_CASES.length;
let passed = 0;
TEST_CASES.forEach(([input, output], i) => {
    let result = naturalInputToQuery(input);
    if(objectEqual(result, output)) {
        passed++;
    }
    else {
        console.log(`(${i + 1}/${total}) Test case failed:`);
        console.group();
        console.dir(input);
        console.log("Expected:");
        console.group();
        console.dir(output);
        console.groupEnd();
        console.log("Received:");
        console.group();
        console.dir(result);
        console.groupEnd();
        console.groupEnd();
        console.log();
    }
});
if(passed === total) {
    console.log("All test cases passed!");
}
else {
    console.log(`Test case(s) failed: ${total - passed} (${(passed/total*10000|0)/100}% passed)`);
}