const {
    naturalInputToQuery, TagExtractor,
    OPERATOR_INLINE_OR, OPERATOR_INLINE_AND, OPERATOR_MAJOR_OR, OPERATOR_NOT,
    LEFT_PARENTHESIS, RIGHT_PARENTHESIS, CASE_SENSITIVE
} = require("./../tag-extract.js");
const { objectEqual } = require("./lib.js");

// [input, output]
const TEST_CASES = [
    ["link 2", [{
        type: "monster",
        monsterCategory: "link",
        level: "2",
        levelCompare: "equal",
    }]],
    ["dark", [{
        type: "monster",
        monsterAttribute: "DARK",
    }]],
    ["dARK", [{
        type: "monster",
        monsterAttribute: "DARK",
    }]],
    ["DARK", [{
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
        { type: "monster", monsterCategory: "link", level: "2", levelCompare: "equal" },
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterType: "Warrior" },
        { type: "monster" },
    ]],
    ["monster warrior dark link-2", [
        { type: "monster" },
        { type: "monster", monsterType: "Warrior" },
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterCategory: "link", level: "2", levelCompare: "equal" },
    ]],
    ["wind beast", [
        { type: "monster", monsterAttribute: "WIND" },
        { type: "monster", monsterType: "Beast" },
    ]],
    ["wind beAst", [
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
    ["level 3", [
        { type: "monster", level: "3", levelCompare: "equal" },
    ]],
    ["level 3 psychic", [
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["2150 atk", [
        { type: "monster", atk: "2150", atkCompare: "equal" },
    ]],
    ["ATK=2150", [
        { type: "monster", atk: "2150", atkCompare: "equal" },
    ]],
    ["1600 ATK or DEF", [
        { type: "monster", atk: "1600", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", def: "1600", defCompare: "equal" },
    ]],
    ["1600 atk or DeF", [
        { type: "monster", atk: "1600", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", def: "1600", defCompare: "equal" },
    ]],
    ["1600 ATK or DEF", [
        { type: "monster", atk: "1600", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", def: "1600", defCompare: "equal" },
    ]],
    ["level 3 or level 6 psychic", [
        { type: "monster", level: "3", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6", levelCompare: "equal" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3 or 6 psychic", [
        { type: "monster", level: "3", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6", levelCompare: "equal" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3, 6, or 9 psychic", [
        { type: "monster", level: "3", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9", levelCompare: "equal" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3, 6 or 9 psychic", [
        { type: "monster", level: "3", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9", levelCompare: "equal" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["light or dark", [
        { type: "monster", monsterAttribute: "LIGHT" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterAttribute: "DARK" },
    ]],
    ["lighT oR dragon", [
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
    ["[draw 1]", [
        { effect: "draw 1" },
    ]],
    ["[(This is treated as a Link Summon]", [
        { effect: "(This is treated as a Link Summon" },
    ]],
    ["[(This is treated as a Link Summon]", [
        { effect: "(This is treated as a Link Summon" },
    ]],
    ["spell", [
        { type: "spell" },
    ]],
    ["equip spell", [
        { type: "spell", kind: "Equip" },
    ]],
    ["equip", [
        { type: "any", kind: "Equip" },
    ]],
    ["continuous", [
        { type: "any", kind: "Continuous" },
    ]],
    ["continuous Trap", [
        { type: "trap", kind: "Continuous" },
    ]],
    ["ritual monster", [
        { type: "monster", monsterCategory: "ritual" },
    ]],
    ["Ritual monster", [
        { type: "monster", monsterCategory: "ritual" },
    ]],
    ["ritual spell", [
        { type: "spell", kind: "Ritual" },
    ]],
    ["Ritual spell", [
        { type: "spell", kind: "Ritual" },
    ]],
    ["ritual", [
        LEFT_PARENTHESIS,
        { type: "spell", kind: "Ritual" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterCategory: "ritual" },
        RIGHT_PARENTHESIS,
    ]],
    ["RiTuAl", [
        LEFT_PARENTHESIS,
        { type: "spell", kind: "Ritual" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterCategory: "ritual" },
        RIGHT_PARENTHESIS,
    ]],
    ["counter", [
        { type: "any", kind: "Counter" },
    ]],
    ["counter trap", [
        { type: "trap", kind: "Counter" },
    ]],
    ["[dark machine] [draw]", [
        { effect: "dark machine" },
        { effect: "draw" },
    ]],
    ["[dark machine] or [draw]", [
        { effect: "dark machine" },
        OPERATOR_INLINE_OR,
        { effect: "draw" },
    ]],
    ["!spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["(spell)", [
        LEFT_PARENTHESIS,
        { type: "spell" },
        RIGHT_PARENTHESIS,
    ]],
    ["not spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["non spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["non-spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["non- spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["NON- spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["nOn - spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["NOT spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["nOt spell", [
        OPERATOR_NOT,
        { type: "spell" },
    ]],
    ["not (spell or trap)", [
        OPERATOR_NOT,
        LEFT_PARENTHESIS,
        { type: "spell" },
        OPERATOR_INLINE_OR,
        { type: "trap" },
        RIGHT_PARENTHESIS
    ]],
    ["by sock", [
        { author: "sock" },
    ]],
    ["bY sock", [
        { author: "sock" },
    ]],
    ["author=sock", [
        { author: "sock" },
    ]],
    ["by \"Yummy Socks\"", [
        { author: "Yummy Socks" },
    ]],
    ["by \"Yummy Socks\" or Khreygond", [
        { author: "Yummy Socks" },
        OPERATOR_INLINE_OR,
        { author: "Khreygond" },
    ]],
    ["atk 1300 or 1400", [
        { type: "monster", atk: "1300", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", atk: "1400", atkCompare: "equal" },
    ]],
    ["atk 1300 khreygond", [
        { type: "monster", atk: "1300", atkCompare: "equal" },
    ]],
    ["id 2067145", [
        { id: "2067145" },
    ]],
    ["ID 2067145", [
        { id: "2067145" },
    ]],
    ["id=1", [
        { id: "1" },
    ]],
    ["atk=1300", [
        { type: "monster", atk: "1300", atkCompare: "equal" },
    ]],
    ["atk>1300", [
        { type: "monster", atk: "1300", atkCompare: "greater" },
    ]],
    ["atk >= 500", [
        { type: "monster", atk: "500", atkCompare: "greaterequal" },
    ]],
    ["atk<= 4000", [
        { type: "monster", atk: "4000", atkCompare: "lessequal" },
    ]],
    ["atk <2000", [
        { type: "monster", atk: "2000", atkCompare: "less" },
    ]],
    ["atk=1400 or 1600", [
        { type: "monster", atk: "1400", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", atk: "1600", atkCompare: "equal" },
    ]],
    ["def != 0", [
        { type: "monster", def: "0", defCompare: "unequal" },
    ]],
    ["def < 1000", [
        { type: "monster", def: "1000", defCompare: "less" },
    ]],
    ["level<=4", [
        { type: "monster", level: "4", levelCompare: "lessequal" },
    ]],
    ["lv > 6", [
        { type: "monster", level: "6", levelCompare: "greater" },
    ]],
    ["lv /= 1", [
        { type: "monster", level: "1", levelCompare: "unequal" },
    ]],
    ["level != 1 and 2", [
        { type: "monster", level: "1", levelCompare: "unequal" },
        OPERATOR_INLINE_AND,
        { type: "monster", level: "2", levelCompare: "unequal" },
    ]],
    ["atk <= 2000 and >= 1000", [
        { type: "monster", atk: "2000", atkCompare: "lessequal" },
        OPERATOR_INLINE_AND,
        { type: "monster", atk: "1000", atkCompare: "greaterequal" },
    ]],
    ["atk <= 2000 and def >= 1000", [
        { type: "monster", atk: "2000", atkCompare: "lessequal" },
        OPERATOR_INLINE_AND,
        { type: "monster", def: "1000", defCompare: "greaterequal" },
    ]],
    ["by     Sock", [
        { author: "Sock" },
    ]],
    ["level        12", [
        { type: "monster", level: "12", levelCompare: "equal" },
    ]],
    ["Level        12", [
        { type: "monster", level: "12", levelCompare: "equal" },
    ]],
    ["[warrior] not monster not [beast-warrior]", [
        { effect: "warrior" },
        OPERATOR_NOT,
        { type: "monster" },
        OPERATOR_NOT,
        { effect: "beast-warrior" },
    ]],
    ["(FIRE Beast) or (FIRE Pyro)", [
        LEFT_PARENTHESIS,
        { type: "monster", monsterAttribute: "FIRE" },
        { type: "monster", monsterType: "Beast" },
        RIGHT_PARENTHESIS,
        OPERATOR_INLINE_OR,
        LEFT_PARENTHESIS,
        { type: "monster", monsterAttribute: "FIRE" },
        { type: "monster", monsterType: "Pyro" },
        RIGHT_PARENTHESIS,
    ]],
    ["spell/trap", [
        LEFT_PARENTHESIS,
        { type: "spell" },
        OPERATOR_INLINE_OR,
        { type: "trap" },
        RIGHT_PARENTHESIS,
    ]],
    ["normal spell", [
        { type: "spell", kind: "Normal" },
    ]],
    ["not custom not quick-play", [
        OPERATOR_NOT,
        { visibility: "5" },
        OPERATOR_NOT,
        { type: "any", kind: "Quick-Play" }
    ]],
    ["normal spell (by T.A.P or by poketot)", [
        { type: "spell", kind: "Normal" },
        LEFT_PARENTHESIS,
        { author: "T.A.P" },
        OPERATOR_INLINE_OR,
        { author: "poketot" },
        RIGHT_PARENTHESIS,
    ]],
    ["link-3 or lower", [
        { type: "monster", monsterCategory: "link", level: "3", levelCompare: "lessequal" },
    ]],
    ["link-3 or higher", [
        { type: "monster", monsterCategory: "link", level: "3", levelCompare: "greaterequal" },
    ]],
    ["level 4 or higher", [
        { type: "monster", level: "4", levelCompare: "greaterequal" },
    ]],
    ["level 4 or lower", [
        { type: "monster", level: "4", levelCompare: "lessequal" },
    ]],
    ["rank 10 or higher", [
        { type: "monster", monsterCategory: "xyz", level: "10", levelCompare: "greaterequal" },
    ]],
    ["rank 10 or HIgher", [
        { type: "monster", monsterCategory: "xyz", level: "10", levelCompare: "greaterequal" },
    ]],
    ["rank 2 or less", [
        { type: "monster", monsterCategory: "xyz", level: "2", levelCompare: "lessequal" },
    ]],
    ["(level 2 rock) or (level 3 pyro)", [
        LEFT_PARENTHESIS,
        { type: "monster", level: "2", levelCompare: "equal" },
        { type: "monster", monsterType: "Rock" },
        RIGHT_PARENTHESIS,
        OPERATOR_INLINE_OR,
        LEFT_PARENTHESIS,
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", monsterType: "Pyro" },
        RIGHT_PARENTHESIS
    ]],
    ["@@x@@", [
        { customExpression: "x" }
    ]],
    ["@x.def = x.atk@", [
        { customExpression: "x.def = x.atk" }
    ]],
    ["@@@ @@ @@@", [
        { customExpression: " @@ " }
    ]],
    ["dated 05/16/2007", [
        { date: "05/16/2007", dateCompare: "equal" },
    ]],
    
    ["dated before 05/16/2007", [
        { date: "05/16/2007", dateCompare: "less" },
    ]],
    ["dated after 05/16/2007", [
        { date: "05/16/2007", dateCompare: "greater" },
    ]],
    ["date >= 05/16/2007", [
        { date: "05/16/2007", dateCompare: "greaterequal" },
    ]],
    ["date <= 05/16/2007", [
        { date: "05/16/2007", dateCompare: "lessequal" },
    ]],
    ["DATe <= 05/16/2007", [
        { date: "05/16/2007", dateCompare: "lessequal" },
    ]],
    ["case", [
        CASE_SENSITIVE,
    ]],
    ["CaSe", [
        CASE_SENSITIVE,
    ]],
    ["at 0", [
        { limit: "0" },
    ]],
    ["limit 1", [
        { limit: "1" },
    ]],
    ["at 2", [
        { limit: "2" },
    ]],
    ["AT 2", [
        { limit: "2" },
    ]],
    ["limit 3", [
        { limit: "3" },
    ]],
    ["at any", [
        { limit: "any" },
    ]],
    ["ban", [
        { limit: "0" },
    ]],
    ["banned", [
        { limit: "0" },
    ]],
    ["limited", [
        { limit: "1" },
    ]],
    ["limit", [
        { limit: "1" },
    ]],
    ["semi-limited", [
        { limit: "2" },
    ]],
    ["semi-limit", [
        { limit: "2" },
    ]],
    ["unlimited", [
        { limit: "3" },
    ]],
    ["unlimit", [
        { limit: "3" },
    ]],
    ["pend: [destroy this card]", [
        { pend_effect: "destroy this card" },
    ]],
    ["PEND: [ ]", [
        { pend_effect: " " },
    ]],
    ["text: [destroy this card]", [
        { main_effect: "destroy this card" },
    ]],
    ["? atk", [
        { type: "monster", atkCompare: "question", atk: "" },
    ]],
    ["def = ?", [
        { type: "monster", defCompare: "question", def: "" },
    ]],
    ["dark link 800 atk", [
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterCategory: "link" },
        { type: "monster", atkCompare: "equal", atk: "800" },
    ]],
    ["dark link 0 atk def 50", [
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterCategory: "link" },
        { type: "monster", atkCompare: "equal", atk: "0" },
        { type: "monster", defCompare: "equal", def: "50" },
    ]],
    ["dark link 0 atk 100 def", [
        { type: "monster", monsterAttribute: "DARK" },
        { type: "monster", monsterCategory: "link" },
        { type: "monster", atkCompare: "equal", atk: "0" },
        { type: "monster", defCompare: "equal", def: "100" },
    ]],
    ["normal spell/trap", [
        { kind: "Normal" },
        LEFT_PARENTHESIS,
        { type: "spell" },
        OPERATOR_INLINE_OR,
        { type: "trap" },
        RIGHT_PARENTHESIS,
    ]],
    ["continuous spell/trap", [
        { kind: "Continuous" },
        LEFT_PARENTHESIS,
        { type: "spell" },
        OPERATOR_INLINE_OR,
        { type: "trap" },
        RIGHT_PARENTHESIS,
    ]],
    ["500 atk level 2", [
        { type: "monster", atk: "500", atkCompare: "equal" },
        { type: "monster", level: "2", levelCompare: "equal" },
    ]],
    ["level 2 500 atk", [
        { type: "monster", level: "2", levelCompare: "equal" },
        { type: "monster", atk: "500", atkCompare: "equal" },
    ]],
    // this the problem the above two don't feature
    ["level 2 atk 500", [
        { type: "monster", level: "2", levelCompare: "equal" },
        { type: "monster", atk: "500", atkCompare: "equal" },
    ]],
    ["ac 2", [
        { type: "monster", attributeCount: "2", attributeCountCompare: "equal" },
    ]],
    ["AC 2", [
        { type: "monster", attributeCount: "2", attributeCountCompare: "equal" },
    ]],
    ["attributecount > 1", [
        { type: "monster", attributeCount: "1", attributeCountCompare: "greater" },
    ]],
    ["attrcount 5", [
        { type: "monster", attributeCount: "5", attributeCountCompare: "equal" },
    ]],
    ["#attr <= 2", [
        { type: "monster", attributeCount: "2", attributeCountCompare: "lessequal" },
    ]],
    ["#attribute = 3", [
        { type: "monster", attributeCount: "3", attributeCountCompare: "equal" },
    ]],
    ["tc 2", [
        { type: "monster", typeCount: "2", typeCountCompare: "equal" },
    ]],
    ["typecount > 1", [
        { type: "monster", typeCount: "1", typeCountCompare: "greater" },
    ]],
    ["#type <= 2", [
        { type: "monster", typeCount: "2", typeCountCompare: "lessequal" },
    ]],
    ["non-effect", [
        { type: "noneffect" },
    ]],
    ["NONEFFECt", [
        { type: "noneffect" },
    ]],
    ["effectless", [
        { type: "noneffect" },
    ]],
    ["sort by text", [
        { sortBy: "text" },
    ]],
    ["SORT NAME", [
        { sortBy: "name" },
    ]],
    ["sort  by  def", [
        { sortBy: "def", type: "monster" },
    ]],
    ["sort  by  atk  down", [
        { sortBy: "atk", type: "monster" },
        { sortOrder: "descending" },
    ]],
    ["UP", [
        { sortOrder: "ascending" },
    ]],
    ["asc", [
        { sortOrder: "ascending" },
    ]],
    ["ascEND", [
        { sortOrder: "ascending" },
    ]],
    ["sort down by date", [
        { sortBy: "date", sortOrder: "descending" },
    ]],
    ["sort up by LEVEL", [
        { sortBy: "level", sortOrder: "ascending" },
    ]],
];

module.exports = function testTagExtractParse(debug = false) {
    let total = TEST_CASES.length;
    let passed = 0;
    TEST_CASES.forEach(([input, output], i) => {
        // let result = naturalInputToQuery(input);
        let extract = new TagExtractor(input);
        let result = extract.parse();
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
            if(debug) {
                console.log("Debug:");
                console.group();
                for(let msg of extract.getDebug()) {
                    console.log("OWO:",...msg);
                }
                console.groupEnd();
            }
            console.groupEnd();
            console.log();
        }
    });
    if(passed === total) {
        console.log(`All ${total} test case(s) passed!`);
    }
    else {
        console.log(`Test case(s) failed: ${total - passed} of ${total} (${Math.floor(passed / total * 10000) / 100}% passed)`);
    }
    return {
        passed: passed,
        total: total,
    };
};

if(require.main === module) {
    module.exports();
}
