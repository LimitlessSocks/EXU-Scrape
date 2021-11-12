const {
    naturalInputToQuery, TagExtractor,
    OPERATOR_INLINE_OR, OPERATOR_MAJOR_OR, OPERATOR_NOT,
    LEFT_PARENTHESIS, RIGHT_PARENTHESIS
} = require("./../tag-extract.js");

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
    ["level 3", [
        { type: "monster", level: "3" },
    ]],
    ["level 3 psychic", [
        { type: "monster", level: "3" },
        { type: "monster", monsterType: "Psychic" },
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
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3 or 6 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3, 6, or 9 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9" },
        { type: "monster", monsterType: "Psychic" },
    ]],
    ["level 3, 6 or 9 psychic", [
        { type: "monster", level: "3" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "6" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "9" },
        { type: "monster", monsterType: "Psychic" },
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
    ["continuous trap", [
        { type: "trap", kind: "Continuous" },
    ]],
    ["ritual monster", [
        { type: "monster", monsterCategory: "ritual" },
    ]],
    ["ritual spell", [
        { type: "spell", kind: "Ritual" },
    ]],
    ["ritual", [
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
        { type: "monster", atk: "1300" },
        OPERATOR_INLINE_OR,
        { type: "monster", atk: "1400" },
    ]],
    ["atk 1300 khreygond", [
        { type: "monster", atk: "1300" },
    ]],
    ["id 2067145", [
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
    ["by     Sock", [
        { author: "Sock" },
    ]],
    ["level        12", [
        { type: "monster", level: "12" },
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
        console.log("Debug:");
        console.group();
        for(let msg of extract.getDebug()) {
            console.log("OWO:",...msg);
        }
        console.groupEnd();
        console.groupEnd();
        console.log();
    }
});
if(passed === total) {
    console.log("All test cases passed!");
}
else {
    console.log(`Test case(s) failed: ${total - passed} of ${total} (${Math.floor(passed / total * 10000) / 100}% passed)`);
}