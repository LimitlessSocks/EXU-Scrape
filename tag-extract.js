let DEBUG = false;
const debug = (...args) => DEBUG && console.log(...args);

class TagIndicator {
    constructor(reg, fn) {
        this.toMatch = reg;
        this.onParse = fn;
    }
    
    matches(string, index) {
        let match = string.slice(index).match(this.toMatch);
        
        //TODO: match by minimum
        if(match && match.index === 0) {
            debug(string, ";;;", string.slice(index));
            debug("Match = ", match);
            debug("Match.index =", match.index);
            match.index += index;
            match.input = string;
            
            let result = this.onParse(match);
            return {
                match: match,
                result: result,
            };
        }
        
        return {
            match: null,
            result: null,
        }
        
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
       .replace(/\s|-/g, "");

const LOOSE_MATCH_MONSTER_TYPES = PROPER_MONSTER_TYPES.map(stripToLoose)
const getProperMonsterType = (loose) => 
    PROPER_MONSTER_TYPES[
        LOOSE_MATCH_MONSTER_TYPES.indexOf(stripToLoose(loose))
    ];

const IGNORE_ENTRY = Symbol("IGNORE_ENTRY");
const NEGATE_NEXT = Symbol("NEGATE_NEXT");
const OPERATOR_INLINE_OR = Symbol("OPERATOR_INLINE_OR");
const OPERATOR_MAJOR_OR = Symbol("OPERATOR_MAJOR_OR");

//TODO: parens, search by author, search by text
const INDICATORS = [
    new TagIndicator(/\s+/, () => IGNORE_ENTRY),
    new TagIndicator(/\|\|/, () => OPERATOR_MAJOR_OR),
    new TagIndicator(/or/, () => OPERATOR_INLINE_OR),
    new TagIndicator(/link[- ]?\s*(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "link",
        level: match[1],
    })),
    new TagIndicator(/(level\/rank|rank\/level)\s*(\d+)/i, (match) => ({
        type: "monster",
        level: match[2],
    })),
    new TagIndicator(/rank\s*(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "xyz",
        level: match[1],
    })),
    new TagIndicator(/level\s*(\d+)/i, (match) => ({
        type: "monster",
        level: match[1],
    })),
    new TagIndicator(/(\d+)[\s=]*(atk|def)|(atk|def)[\s=]*(\d+)/i, (match) => ({
        type: "monster",
        [(match[2] || match[3]).toLowerCase()]: match[1] || match[4],
    })),
    new TagIndicator(/fusion|xyz|synchro|link|ritual|pendulum|normal|effect|leveled|extra|main|gemini|flip|spirit|tuner|toon|union/i, (match) => ({
        type: "monster",
        monsterCategory: match[0].toLowerCase(),
    })),
    new TagIndicator(/beast[ -]?warrior|aqua|beast|cyberse|dinosaur|dragon|fairy|fiend|fish|insect|machine|plant|psychic|pyro|reptile|rock|sea[ -]?serpent|spellcaster|thunder|warrior|winged[ -]?beast|wyrm|yokai|zombie|creator[ -]?god|divine[ -]?beast/i, (match) => ({
        type: "monster",
        monsterType: getProperMonsterType(match[0]),
    })),
    new TagIndicator(/dark|light|fire|earth|wind|water|divine/i, (match) => ({
        type: "monster",
        monsterAttribute: match[0].toUpperCase(),
    })),
    new TagIndicator(/spell|trap|monster/i, (match) => ({
        type: match[0].toLowerCase()
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
                debug("MATCH: ", ind.toMatch, match[0]);
                debug("Output so far:", this.output);
                this.index += match[0].length;
                if(result !== IGNORE_ENTRY) {
                    this.output.push(result);
                }
                return;
            }
        }
        this.index++;
    }
    
    parse() {
        debug();
        debug("== STARTING PARSE ==");
        debug("Input: ", this.input);
        debug();
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
    ["link-2 dark warrior monster", [
        { type: "monster", monsterCategory: "link", level: "2" },
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterType: "Warrior" },
        { type: "monster" },
    ]],
    ["monster warrior dark link-2", [
        { type: "monster" },
        { type: "monster", monsterType: "Warrior" },
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterCategory: "link", level: "2" },
    ]],
    ["wind beast", [
        { type: "monster", monsterAttribute: "WIND" },
        { type: "monster", monsterType: "Beast" },
    ]],
    ["beast wind", [
        { type: "monster", monsterType: "Beast" },
        { type: "monster", monsterAttribute: "WIND" },
    ]],
    ["beast-warrior", [
        { type: "monster", monsterType: "Beast-Warrior" },
    ]],
    ["beast warrior", [
        { type: "monster", monsterType: "Beast-Warrior" },
    ]],
    ["divine-beast", [
        { type: "monster", monsterType: "Divine-Beast" },
    ]],
    ["divine beast", [
        { type: "monster", monsterType: "Divine-Beast" },
    ]],
    ["beast divine", [
        { type: "monster", monsterType: "Beast" },
        { type: "monster", monsterAttribute: "DIVINE" },
    ]],
    ["Winged Beast", [
        { type: "monster", monsterType: "Winged Beast" },
    ]],
    ["winged beast", [
        { type: "monster", monsterType: "Winged Beast" },
    ]],
    ["wingedbeast", [
        { type: "monster", monsterType: "Winged Beast" },
    ]],
    ["2150 atk", [
        { type: "monster", atk: "2150" },
    ]],
    ["ATK=2150", [
        { type: "monster", atk: "2150" },
    ]],
    ["1600 ATK or DEF", [
        { type: "monster", atk: "1600" },
        OPERATOR_INLINE_OR,
        { type: "monster", def: "1600" },
    ]],
    ["1600 ATK or DEF", [
        { type: "monster", atk: "1600" },
        OPERATOR_INLINE_OR,
        { type: "monster", def: "1600" },
    ]],
    ["level 3 or level 6 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        { type: "monster", monsterType: "psychic" },
    ]],
    ["level 3 or 6 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        { type: "monster", monsterType: "psychic" },
    ]],
    ["level 3, 6, or 9 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9" },
        { type: "monster", monsterType: "psychic" },
    ]],
    ["level 3, 6 or 9 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9" },
        { type: "monster", monsterType: "psychic" },
    ]],
    ["light or dark", [
        { type: "monster", monsterAttribute: "LIGHT" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterAttribute: "DARK" },
    ]],
    ["light or dragon", [
        { type: "monster", monsterAttribute: "LIGHT" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterType: "Dragon" },
    ]],
    ["light warrior || dark dragon", [
        { type: "monster", monsterAttribute: "LIGHT" },
        { type: "monster", monsterType: "Warrior" },
        OPERATOR_MAJOR_OR,
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterType: "Dragon" },
    ]],
];
const objectEqual = (a, b) => {
    if(a == b) return true;
    if(Array.isArray(a) && Array.isArray(b)) {
        return a.length == b.length && a.every((e, i) => objectEqual(e, b[i]));
    }
    if(a == null || b == null) return a == b;
    if(typeof a == "object" && typeof b == "object") {
        return Object.entries(a).every(([k, v]) => objectEqual(v, b[k])) && Object.keys(b).every(k => k in a);
    }
    return a == b;
};

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