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

const condenseQuery = (queryList) =>
    queryList.reduce((acc, cur) => Object.assign(acc, cur), {});

if(typeof process !== "undefined") {
    module.exports = {
        naturalInputToQuery: naturalInputToQuery,
        OPERATOR_MAJOR_OR: OPERATOR_MAJOR_OR,
        OPERATOR_INLINE_OR: OPERATOR_INLINE_OR,
    };
}