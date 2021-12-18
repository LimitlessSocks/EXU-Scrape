const fs = require("fs/promises");
const path = require("path");

let debug = process.argv[2] === "-d" || process.argv[2] === "/d";

let totalPassed = 0;
let totalTotal = 0;
fs.readdir(__dirname)
    .then(files => {
        files.filter(path => path.startsWith("test-"))
             .forEach(path => {
                 console.log("TESTING " + path);
                 console.group();
                 let test = require("./" + path);
                 if(typeof test !== "function") {
                     test = test.test;
                 }
                 if(!test) {
                     console.error("No testing function found.");
                 }
                 else {
                     let { passed, total } = test(debug);
                     totalPassed += passed;
                     totalTotal += total;
                 }
                 console.groupEnd();
             });
        console.log("-------------------------------------");
        console.log(`Over failed: ${totalTotal - totalPassed} of ${totalTotal} (${Math.floor(totalPassed / totalTotal * 10000) / 100}% passed)`);
    })
    .catch(console.error);