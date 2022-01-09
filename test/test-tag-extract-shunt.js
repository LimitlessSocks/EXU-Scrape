const {
    shunt,
    TagExtractor,
    OPERATOR_NOT,
    OPERATOR_INLINE_AND,
    OPERATOR_INLINE_OR,
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
        { type: "monster", level: "3" },
        { type: "monster", level: "4" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3,4", [
        { type: "monster", level: "3" },
        { type: "monster", level: "4" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3 or level 4 or level 7", [
        { type: "monster", level: "3" },
        { type: "monster", level: "4" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "7" },
        OPERATOR_INLINE_OR,
    ]],
    ["level 3, 4, or 7", [
        { type: "monster", level: "3" },
        { type: "monster", level: "4" },
        OPERATOR_INLINE_OR,
        { type: "monster", level: "7" },
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
        { type: "monster", level: "1" },
        { type: "monster", monsterCategory: "maindeck" },
        OPERATOR_INLINE_AND,
        { type: "monster", def: "500" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
    ]],
    ["level 1 and not 500 def or 300 atk", [
        { type: "monster", level: "1" },
        { type: "monster", def: "500" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        { type: "monster", atk: "300" },
        OPERATOR_INLINE_OR,
    ]],
    ["300 atk or level 1 and not 500 def", [
        { type: "monster", atk: "300" },
        { type: "monster", level: "1" },
        { type: "monster", def: "500" },
        OPERATOR_NOT,
        OPERATOR_INLINE_AND,
        OPERATOR_INLINE_OR,
    ]],
    ["(level 2 rock) or (level 3 pyro)", [
        { type: "monster", level: "2" },
        { type: "monster", monsterType: "Rock" },
        OPERATOR_INLINE_AND,
        { type: "monster", level: "3" },
        { type: "monster", monsterType: "Pyro" },
        OPERATOR_INLINE_AND,
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