

const indicators = [
    {
        "key": "link",
        "followed_by": "number"
    }
];
const naturalInputToQuery = (input) => {
    
};


//=======================TESTING=======================//
// [input, output]
const TEST_CASES = [
    ["link 2", {
        type: "monster",
        monsterCategory: "link",
        level: "2",
    }],
    ["dark", {
        type: "monster",
        monsterAttribute: "DARK",
    }],
    ["Dragon \"Number\"", {
        
    }]
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
    console.log(`Test case(s) failed: ${total - passed} (${(total/passed*10000|0)/100}% passed)`);
}