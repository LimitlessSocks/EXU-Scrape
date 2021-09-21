const {
    naturalInputToQuery, OPERATOR_INLINE_OR, OPERATOR_MAJOR_OR
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
    ["ritual spell", [
        { type: "spell", kind: "Ritual" },
        OPERATOR_INLINE_OR,
        { type: "monster", monsterCategory: "ritual" },
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
    console.log(`Test case(s) failed: ${total - passed} of ${total} (${Math.floor(passed / total * 10000) / 100}% passed)`);
}