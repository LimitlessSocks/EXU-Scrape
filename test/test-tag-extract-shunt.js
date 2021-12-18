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
];

module.exports = function testTagExtractShunt(debug = false) {
    let total = TEST_CASES.length;
    let passed = 0;
    TEST_CASES.forEach(([input, output], i) => {
        // let result = naturalInputToQuery(input);
        let extract = new TagExtractor(input);
        let result = [...shunt(extract.parse(), x => x)];
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
    return {
        passed: passed,
        total: total,
    };
};

if(require.main === module) {
    module.exports();
}