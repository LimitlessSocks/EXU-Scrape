// import computeAverageHash from "./image.mjs";
// import { createCanvas, loadImage } from "canvas";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import phash from "./phash.mjs";
import jpeg from "jpeg-js";

const imgDirectory = process.argv[2] ?? "./../ImageCompare/img/";
const outFile = process.argv[3] ?? "./img-hashes.json";

let files = await readdir(imgDirectory);
let imgFiles = files.filter(file => extname(file).toLowerCase() === ".jpg");

let output = {};
// let canvas = createCanvas(0, 0);
let i = 0;
for(let filePath of imgFiles) {
    let id = basename(filePath, ".jpg");
    let fullPath = join(imgDirectory, filePath);
    let file = await readFile(fullPath);
    let decoded = jpeg.decode(file);
    let data = new Uint8ClampedArray(decoded.data);
    let hash = phash({ image: data, width: decoded.width, height: decoded.height });
    
    if(i++ % 50 == 0) {
        process.stdout.write(`${i}/${imgFiles.length}     \r`);
    }
    
    output[id] = hash;
}

console.log(`Writing to ${outFile}...`);
await writeFile(outFile, JSON.stringify(output));
console.log("Done");
