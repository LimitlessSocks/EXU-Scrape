let DEBUG = false;
const debug = (...args) => DEBUG && console.log(...args);

class Memory {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.lastParameter = null;
        this.lastValue = null;
        this.used = false;
    }
    
    use() {
        return this.used = true;
    }
}

class TagIndicator {
    constructor(reg, fn) {
        this.toMatch = reg;
        this.onParse = fn;
        this.remember = {
            value: false,
            parameter: false,
        };
    }
    
    isRemembering() {
        return this.remember.value || this.remember.parameter;
    }
    
    matches(string, index, memory=null) {
        let match = string.slice(index).match(this.toMatch);
        
        //TODO: match by minimum
        if(match && match.index === 0) {
            debug(string, ";;;", string.slice(index));
            debug("Match = ", match);
            debug("Match.index =", match.index);
            match.index += index;
            match.input = string;
            
            let result = this.onParse(match, memory);
            
            if(result && memory) {
                if(this.remember.parameter) {
                    memory.lastParameter = result;
                }
                if(this.remember.value) {
                    memory.lastValue = result;
                }
            }
            
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
    
    rememberParameter() {
        this.remember.parameter = true;
        return this;
    }
    rememberValue() {
        this.remember.value = true;
        return this;
    }
    rememberAll() {
        return this
            .rememberParameter()
            .rememberValue();
    }
}

const stripToLoose = (str) =>
    str.toLowerCase()
       .replace(/\s|-/g, "");

const getProper = (list) => {
    let loose = list.map(stripToLoose);
    return (text) =>
        list[loose.indexOf(stripToLoose(text))];
};

const PROPER_MONSTER_TYPES = [
    "Aqua", "Beast", "Beast-Warrior", "Cyberse",
    "Dinosaur", "Dragon", "Fairy", "Fiend", "Fish",
    "Insect", "Machine", "Plant", "Psychic", "Pyro",
    "Reptile", "Rock", "Sea Serpent", "Spellcaster",
    "Thunder", "Warrior", "Winged Beast", "Wyrm",
    "Yokai", "Zombie", "Creator God", "Divine-Beast"
];
const getProperMonsterType = getProper(PROPER_MONSTER_TYPES);

const PROPER_SPELL_TRAP_TYPES = [
    "Normal", "Equip", "Quick-Play", "Ritual", "Field", "Continuous",
    "Counter"
];
const getProperSpellTrapType = getProper(PROPER_SPELL_TRAP_TYPES);

// const LOOSE_MATCH_MONSTER_TYPES = PROPER_MONSTER_TYPES.map(stripToLoose)
// const getProperMonsterType = (loose) => 
    // PROPER_MONSTER_TYPES[
        // LOOSE_MATCH_MONSTER_TYPES.indexOf(stripToLoose(loose))
    // ];

const IGNORE_ENTRY = Symbol("IGNORE_ENTRY");
const OPERATOR_NOT = Symbol("OPERATOR_NOT");
const OPERATOR_INLINE_OR = Symbol("OPERATOR_INLINE_OR");
const OPERATOR_INLINE_AND = Symbol("OPERATOR_INLINE_AND");

const OPERATOR_MAJOR_OR = Symbol("OPERATOR_MAJOR_OR");
const OPERATOR_MAJOR_AND = Symbol("OPERATOR_MAJOR_AND");

const LEFT_PARENTHESIS = Symbol("LEFT_PARENTHESIS");
const RIGHT_PARENTHESIS = Symbol("RIGHT_PARENTHESIS");

const wrapParens = (arr) => [LEFT_PARENTHESIS, ...arr, RIGHT_PARENTHESIS];

//TODO: export these


//TODO: parens, search by author, search by text
const TRANSLATE_TABLE = {
    extra: "extradeck",
    main: "maindeck",
};

const INDICATORS = [
    new TagIndicator(/\s+/, () => IGNORE_ENTRY),
    new TagIndicator(/\|\|/, () => OPERATOR_MAJOR_OR),
    new TagIndicator(/or/i, () => OPERATOR_INLINE_OR),
    new TagIndicator(/and/i, () => OPERATOR_INLINE_AND),
    new TagIndicator(/!|not/i, () => OPERATOR_NOT),
    new TagIndicator(/link[- ]?\s*(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "link",
        level: match[1],
    })).rememberParameter(),
    new TagIndicator(/(level\/rank|rank\/level)\s*(\d+)/i, (match, memory) => (
        memory.lastParameter = {
            type: "monster",
            level: match[2],
        }
    )).rememberParameter(),
    new TagIndicator(/spell\s*\/\s*trap|trap\s*\/\s*spell/i, (match) => 
        wrapParens([
            { type: "spell" },
            OPERATOR_INLINE_OR,
            { type: "trap" }
        ])
    ),
    new TagIndicator(/rank\s*(\d+)/i, (match) => ({
        type: "monster",
        monsterCategory: "xyz",
        level: match[1],
    })).rememberParameter(),
    new TagIndicator(/level\s*(\d+)/i, (match) => ({
        type: "monster",
        level: match[1],
    })).rememberParameter(),
    new TagIndicator(/(?:by|author)[ =]+(\w+|"([^"]+)")/i, (match) => ({
        author: match[2] || match[1],
    })).rememberParameter(),
    new TagIndicator(/(\d+)[\s=]*(atk|def)|(atk|def)[\s=]*(\d+)/i, (match) => ({
        type: "monster",
        [(match[2] || match[3]).toLowerCase()]: match[1] || match[4],
    })).rememberAll(),
    new TagIndicator(/atk|def/i, (match, memory) => (memory.lastValue && memory.use() && {
        type: "monster",
        [match[0].toLowerCase()]: memory.lastValue.atk || memory.lastValue.def
    })),
    new TagIndicator(/id[\s=]+(\d+)/i, (match) => ({
        id: match[1],
    })).rememberParameter(),
    //TODO: relative comparisons
    new TagIndicator(/custom/i, (match) => ({
        visibility: "5",
    })),
    new TagIndicator(/tcg\/?ocg/i, (match) => ({
        visibility: "6",
    })),
    new TagIndicator(/tcg/i, (match) => ({
        visibility: "3",
    })),
    new TagIndicator(/ocg/i, (match) => ({
        visibility: "4",
    })),
    new TagIndicator(/private/i, (match) => ({
        visibility: "2",
    })),
    new TagIndicator(/public/i, (match) => ({
        visibility: "1",
    })),
    new TagIndicator(/normal\s*(spell|trap)/i, (match) => ({
        type: match[1].toLowerCase(),
        kind: "Normal",
    })),
    new TagIndicator(/fusion|xyz|synchro|link|pendulum|normal|effect|leveled|gemini|flip|spirit|tuner|toon|union/i, (match) => ({
        type: "monster",
        monsterCategory: match[0].toLowerCase(),
    })),
    new TagIndicator(/(extra|main)(\s*deck)?/i, (match) => ({
        type: "monster",
        monsterCategory: TRANSLATE_TABLE[match[1].toLowerCase()],
    })),
    new TagIndicator(/ritual\s*(monster|spell)?/, (match) => {
        let type = (match[1] || "any").toLowerCase();
        switch(type) {
            case "spell":
                return { type: type, kind: "Ritual" };
            case "monster":
                return { type: type, monsterCategory: "ritual" };
            default:
                return wrapParens([
                    { type: "spell", kind: "Ritual" },
                    OPERATOR_INLINE_OR,
                    { type: "monster", monsterCategory: "ritual" }
                ]);
        }
    }),
    new TagIndicator(/\[([^[\]]+)\]/, (match) => ({
        effect: match[1],
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
    new TagIndicator(/(continuous|quick-play|equip|normal|counter|field)\s*(spell|trap)?/i, (match) => ({
        type: (match[2] || "any").toLowerCase(),
        kind: getProperSpellTrapType(match[1]),
    })),
    new TagIndicator(/"((?:".*?")?(?: ".*?"|[^"])+|"[^"]+")"/, (match) => ({
        name: match[1],
    })),
    new TagIndicator(/\|\|/, () => OPERATOR_MAJOR_OR),
    new TagIndicator(/,\s*or|or|,/i, () => OPERATOR_INLINE_OR),    
    
    new TagIndicator(/\(/, () => LEFT_PARENTHESIS),
    new TagIndicator(/\)/, () => RIGHT_PARENTHESIS),
    
    new TagIndicator(/(\w+)|"([^"]+)"/, (match, memory) => {
        if(!memory.lastParameter) {
            return IGNORE_ENTRY;
        }
        let toSet = match[2] || match[1];
        let param = Object.keys(memory.lastParameter).pop();
        if((param === "atk" || param === "def") && !/^\d+/.test(toSet)) {
            // console.log("IGNORING", toSet);
            return IGNORE_ENTRY;
        }
        memory.use();
        let res = Object.assign({}, memory.lastParameter);
        res[param] = toSet;
        return res;
    }),
];

class TagExtractor {
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.output = [];
        this.memory = new Memory();
        
        this.debugStatements = [];
    }
    
    * getDebug() {
        yield* this.debugStatements;
    }
    
    debugInternal(...args) {
        this.debugStatements.push(args);
    }
    
    resetMemory() {
        this.memory.reset();
    }
    
    static isTerminator(entry) {
        return typeof entry !== "symbol";
    }
    
    step() {
        for(let ind of INDICATORS) {
            let { match, result } = ind.matches(this.input, this.index, this.memory);
            if(match) {
                debug("MATCH: ", ind.toMatch, match[0]);
                debug("Output so far:", this.output);
                this.index += match[0].length;
                if(result !== IGNORE_ENTRY) {
                    if(Array.isArray(result)) {
                        this.output.push(...result);
                    }
                    else {
                        this.output.push(result);
                    }
                    this.debugInternal(result);
                    this.debugInternal(this.output.slice());
                    
                    // TODO: figure out if this really is working now
                    let isRemembering = ind.isRemembering();
                    isRemembering = isRemembering || this.memory.used;
                    let isTerminator = TagExtractor.isTerminator(this.output.at(-1));
                    if(!isRemembering && isTerminator) {
                        this.debugInternal("RESETTING AT", this.output.at(-1), "and", Object.assign({}, this.memory));
                        this.resetMemory();
                    }
                    else {
                        // memory must be actively used
                        this.memory.used = false;
                    }
                }
                
                return;
            }
        }
        // no case
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

const OPERATOR_PRECEDENCE = {
    [OPERATOR_INLINE_OR]:   10,
    [OPERATOR_INLINE_AND]:  20,
    
    [OPERATOR_MAJOR_OR]:    40,
    [OPERATOR_MAJOR_AND]:   50,
    [OPERATOR_NOT]:         1000,
};
const UNARY_OPERATORS = new Set([OPERATOR_NOT]);
const isOperator = (token) => {
    return typeof OPERATOR_PRECEDENCE[token] !== "undefined";
};

const shunt = function* (queryList, createFilter=CardViewer.createFilter) {
    let operatorStack = [];
    let lastToken = null;    
    let lastWasData = false;
    for(let token of queryList) {
        let thisIsData = false;
        if(isOperator(token)) {
            let precedence = OPERATOR_PRECEDENCE[token];
            let isUnary = false;
            // isUnary = lastToken === null || lastToken === LEFT_PARENTHESIS || isOperator(lastToken);
            isUnary = UNARY_OPERATORS.has(token);
            
            if(isUnary) {
                if(lastWasData) {
                    // new expression; flush stack
                    while(operatorStack.length) {
                        yield operatorStack.shift();
                    }
                }
            }
            else {
                while(operatorStack.length) {
                    let top = operatorStack[operatorStack.length - 1];
                    if(top !== LEFT_PARENTHESIS && OPERATOR_PRECEDENCE[top] >= precedence) {
                        yield operatorStack.pop();
                    }
                    else {
                        break;
                    }
                }
            }
            
            operatorStack.push(token);
        }
        else if(token === LEFT_PARENTHESIS) {
            operatorStack.push(token);
        }
        else if(token === RIGHT_PARENTHESIS) {
            while(operatorStack.length) {
                let top = operatorStack.pop();
                if(top !== LEFT_PARENTHESIS) {
                    yield top;
                }
                else {
                    break;
                }
                //TODO:(optional) implement functions here
            }
        }
        else {
            if(lastWasData) {
                // flush operators; implicit and
                while(operatorStack.length) {
                    yield operatorStack.pop();
                }
            }
            if(typeof token === "object") {
                yield createFilter(token);
            }
            else {
                yield token;
            }
            thisIsData = true;
        }
        lastWasData = thisIsData;
        lastToken = token;
    }
    while(operatorStack.length) {
        yield operatorStack.pop();
    }
};

const condenseQuery = (queryList, createFilter=CardViewer.createFilter) => {
    let outputQueue = shunt(queryList, createFilter);
    // evaluate expression
    let evalStack = [];
    for(let token of outputQueue) {
        if(token === OPERATOR_INLINE_OR) {
            let [ a, b ] = evalStack.splice(-2);
            evalStack.push((card) => a(card) || b(card));
        }
        else if(token === OPERATOR_INLINE_AND) {
            let [ a, b ] = evalStack.splice(-2);
            evalStack.push((card) => a(card) && b(card));
        }
        else if(token === OPERATOR_NOT) {
            let a = evalStack.pop();
            evalStack.push((card) => !a(card));
        }
        else {
            evalStack.push(token);
        }
    }
    
    return (card) => evalStack.every(fn => fn(card));
};

if(typeof process !== "undefined") {
    module.exports = {
        TagExtractor: TagExtractor,
        naturalInputToQuery: naturalInputToQuery,
        OPERATOR_MAJOR_OR: OPERATOR_MAJOR_OR,
        OPERATOR_INLINE_OR: OPERATOR_INLINE_OR,
        OPERATOR_INLINE_AND: OPERATOR_INLINE_AND,
        OPERATOR_NOT: OPERATOR_NOT,
        LEFT_PARENTHESIS: LEFT_PARENTHESIS,
        RIGHT_PARENTHESIS: RIGHT_PARENTHESIS,
        shunt: shunt,
    };
}