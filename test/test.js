const fs = require("fs/promises");
const path = require("path");

let totalPassed = 0;
let totalTotal = 0;
fs.readdir(__dirname)
    .then(files => {
        files.filter(path => path.startsWith("test-"))
             .forEach(path => {
                 console.log("TESTING " + path);
                 let test = require("./" + path);
                 console.group();
                 let { passed, total } = test();
                 console.groupEnd();
                 totalPassed += passed;
                 totalTotal += total;
             });
        console.log("-------------------------------------");
        console.log(`Over failed: ${totalTotal - totalPassed} of ${totalTotal} (${Math.floor(totalPassed / totalTotal * 10000) / 100}% passed)`);
    })
    .catch(console.error);