const {
    shunt,
    TagExtractor,
    OPERATOR_NOT,
    OPERATOR_INLINE_AND,
    OPERATOR_INLINE_OR,
    CASE_SENSITIVE,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
} = require("./../tag-extract.js");
const { objectEqual } = require("./lib.js");

// [input, output]
const TEST_CASES = [
    ["not custom and not quick-play", [
        { visibility: "5" },
        OPERATOR_NOT,
        { type: "any", kind: "Quick-Play" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["not custom not quick-play", [
        { visibility: "5" },
        OPERATOR_NOT,
        { type: "any", kind: "Quick-Play" },
        OPERATOR_NOT
    ]],
    ["level 3 or level 4", [
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", level: "4", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3,4", [
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", level: "4", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3 or level 4 or level 7", [
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", level: "4", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "7", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3, 4, or 7", [
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", level: "4", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "7", levelCompare: "equal" },
        OPERATOR_INLINE_OR,
    ]],
    ["xyz [using 1] and not [transfer] and not custom", [
        { type: "monster", monsterCategory: "xyz" },
        { effect: "using 1" },
        OPERATOR_INLINE_AND,
        { effect: "transfer" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        { visibility: "5" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["xyz [using 1] not [transfer] not custom", [
        { type: "monster", monsterCategory: "xyz" },
        { effect: "using 1" },
        OPERATOR_INLINE_AND,
        { effect: "transfer" },
        OPERATOR_NOT,
        { visibility: "5" },
        OPERATOR_NOT,
    ]],
    ["xyz [using 1] and not [transfer] not custom", [
        { type: "monster", monsterCategory: "xyz" },
        { effect: "using 1" },
        OPERATOR_INLINE_AND,
        { effect: "transfer" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        { visibility: "5" },
        OPERATOR_NOT,
    ]],
    ["level 1 main deck and not 500 def", [
        { type: "monster", level: "1", levelCompare: "equal" },
        { type: "monster", monsterCategory: "maindeck" },
        OPERATOR_INLINE_AND,
        { type: "monster", def: "500", defCompare: "equal" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["level 1 and not 500 def or 300 atk", [
        { type: "monster", level: "1", levelCompare: "equal" },
        { type: "monster", def: "500", defCompare: "equal" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        { type: "monster", atk: "300", atkCompare: "equal" },
        OPERATOR_INLINE_OR,
    ]],
    ["300 atk or level 1 and not 500 def", [
        { type: "monster", atk: "300", atkCompare: "equal" },
        { type: "monster", level: "1", levelCompare: "equal" },
        { type: "monster", def: "500", defCompare: "equal" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        OPERATOR_INLINE_OR,
    ]],
    ["(level 2 rock) or (level 3 pyro)", [
        { type: "monster", level: "2", levelCompare: "equal" },
        { type: "monster", monsterType: "Rock" },
        OPERATOR_INLINE_AND,
        { type: "monster", level: "3", levelCompare: "equal" },
        { type: "monster", monsterType: "Pyro" },
        OPERATOR_INLINE_AND,
        OPERATOR_INLINE_OR,
    ]],
    ["case [lv]", [
        CASE_SENSITIVE,
        { effect: "lv" },
    ]],
    ["not custom ritual monster [discard this]", [
        { visibility: "5" },
        OPERATOR_NOT,
        { type: "monster", monsterCategory: "ritual" },
        OPERATOR_INLINE_AND,
        { effect: "discard this" },
        OPERATOR_INLINE_AND,
    ]],
    ["not custom ritual [discard this]", [
        { visibility: "5" },
        OPERATOR_NOT,
        { type: "spell", kind: "Ritual" },
        { type: "monster", monsterCategory: "ritual" },
        OPERATOR_INLINE_OR,
        { effect: "discard this" },
        OPERATOR_INLINE_AND,
    ]],
    ["not custom [discard this]", [
        { visibility: "5" },
        OPERATOR_NOT,
        { effect: "discard this" },
        OPERATOR_INLINE_AND,
    ]],
    ["not ritual and not warrior", [
        { type: "spell", kind: "Ritual" },
        { type: "monster", monsterCategory: "ritual" },
        OPERATOR_INLINE_OR,
        OPERATOR_NOT,
        { type: "monster", monsterType: "Warrior" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["not ritual not warrior", [
        { type: "spell", kind: "Ritual" },
        { type: "monster", monsterCategory: "ritual" },
        OPERATOR_INLINE_OR,
        OPERATOR_NOT,
        { type: "monster", monsterType: "Warrior" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["[ojama] or \"ojama\"", [
        { effect: "ojama" },
        { name: "ojama" },
        OPERATOR_INLINE_OR,
    ]],
    ["[[ojama]]", [
        { effect: "ojama" },
        { name: "ojama" },
        OPERATOR_INLINE_OR,
    ]],
];

module.exports = function testTagExtractShunt(debug = false) {
    let total = TEST_CASES.length;
    let passed = 0;
    TEST_CASES.forEach(([input, output], i) => {
        i++;
        // let result = naturalInputToQuery(input);
        let extract = new TagExtractor(input);
        let result = [...shunt(extract.parse(), x => x)];
        if(objectEqual(result, output)) {
            passed++;
        }
        else {
            console.log(`(${i}/${total}) Test case failed:`);
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