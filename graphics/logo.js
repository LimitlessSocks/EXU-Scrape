let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

const fetchImage = (url) => new Promise((resolve, reject) => {
    let result = new Image();
    result.onload = function () {
        resolve(result);
    };
    result.crossOrigin = "anonymous";
    result.src = url;
});

const minSize = 30;
const textCentered = (ctx, op, text, { font, x, y, width, height }) => {
    ctx.font = font.size + "px \"" + font.name + "\"";
    
    let maxWidth = width - 60; // padding
    
    let words = text.split(/\s+/);
    let lines = [[]];
    for(let word of words) {
        let cur = lines[lines.length - 1];
        cur.push(word);
        let curWidth = ctx.measureText(cur.join(" ")).width;
        if(curWidth > maxWidth) {
            if(cur.length === 1) {
                // cannot do anything about 1-word overflow
                // retry with smaller text
                if(font.size < minSize) {
                    lines.push([]);
                }
                else {
                    return textCentered(ctx, op, text, {
                        x: x, y: y,
                        width: width, height: height,
                        font: {
                            size: font.size - 10,
                            name: font.name,
                        }
                    });
                }
            }
            else {
                lines.push(cur.splice(-1));
            }
        }
    }
    
    lines = lines.map(line => line.join(" "));
    
    let oldFillStyle = ctx.fillStyle;//"white";
    let oldStrokeStyle = ctx.strokeStyle;
    ctx.textAlign = "center";

    let mx = x + width/2;
    let my = y + height/2;
    
    let padding = 10;
    let vd = font.size + padding;
    
    my -= vd * lines.length / 2;
    
    ctx.textBaseline = "top";
    
    ctx.fillStyle = oldStrokeStyle;
    ctx.filter = "blur(30px)";
    let tmy = my;
    for(let line of lines) {
        ctx.fillText(line, mx, tmy);
        ctx.fillText(line, mx, tmy);
        ctx.fillText(line, mx, tmy);
        ctx.fillText(line, mx, tmy);
        tmy += vd;
    }
    ctx.fillStyle = oldFillStyle;
    ctx.filter = "none";
    for(let line of lines) {
        ctx.fillText(line, mx, my);
        my += vd;
    }
    
    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
};

const renderPreview = async (ctx, tag, main, side) => {
    showStatus("Loading images...");
    let mainImage = await fetchImage(main);
    let sideImage = await fetchImage(side);
    
    let ox = 40;
    let oy = 40;
    let halfWidth = ctx.canvas.width / 2;
    let halfHeight = ctx.canvas.height / 2;
    
    ctx.filter = "blur(30px)";
    ctx.drawImage(sideImage,
        halfWidth - ox, -oy,
        halfWidth + 2*ox, ctx.canvas.height + 2*oy
    );
    ctx.filter = "none";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 100;
    ctx.drawImage(mainImage, 0, 0, halfWidth, ctx.canvas.height);
    ctx.shadowBlur = 0;
    
    // ctx.font = "150px 'Press Start 2P'";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    textCentered(ctx, "fill", tag, {
        x: halfWidth, y: 0,
        width: halfWidth, height: ctx.canvas.height,
        font: {
            size: 150,
            name: "Press Start 2P"
        }
    });
    
    showStatus("Done");
};

const drawScaledFrom = (target, base) => {
    target.drawImage(base.canvas, 0, 0, target.canvas.width, target.canvas.height);
};

const showStatus = (msg) => {
    document.getElementById("status").textContent = msg;
};

const readTextFile = (file) => new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = function (e) {
        resolve(e.target.result);
    }

    reader.readAsText(file);
});

const parseMultiInput = (raw) =>
    raw.split(/\r?\n/)
       .map(e => JSON.parse(`[${e}]`));

window.addEventListener("load", async function () {
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    
    let canvas = document.getElementById("raw-output");
    let ctx = canvas.getContext("2d");
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    let scaled = document.getElementById("scaled-output");
    let sctx = scaled.getContext("2d");
    
    drawScaledFrom(sctx, ctx);
    
    const mainId = document.getElementById("main-id");
    const sideId = document.getElementById("side-id");
    const tag = document.getElementById("tag");
    document.getElementById("generate").addEventListener("click", async () => {
        let mainCard = CardViewer.Database.cards[mainId.value];
        let sideCard = CardViewer.Database.cards[sideId.value];
        await renderPreview(ctx, tag.value, mainCard.src, sideCard.src);
        drawScaledFrom(sctx, ctx);
    });
    
    const fileInput = document.getElementById("file-input");
    document.getElementById("generate-file").addEventListener("click", async () => {
        
        let z = new JSZip();
        
        let rawText = await readTextFile(fileInput.files[0]);
        
        let entries = parseMultiInput(rawText);
        
        console.log(entries);
        
        // let entries = [
            // ["VOLTRON",1182404,1182561],
            // ["PANDA",1260802,2203721],
            // ["ARIA FEY",1310876,1948661],
            // ["STARSHIP",1365504,1364202],
            // ["OF THE NORTH",1292502,1292516],
            // ["HOLIFEAR",2124844,1137591],
            // ["DIGITALLIAS",1898633,1898256],
            // ["AKATSUKI",1451728,1451689],
            // ["RULERS OF NAME",1388880,1389031],
            // ["KUROSHIRO",1495512,1495570],
            // ["GOO-T",1119567,1021405],
        // ];
        
        // let promises = [];
        for(let [tag, mid, sid] of entries) {
            let mainCard = CardViewer.Database.cards[mid];
            let sideCard = CardViewer.Database.cards[sid];
            await renderPreview(ctx, tag, mainCard.src, sideCard.src);
            drawScaledFrom(sctx, ctx);
            let uri = canvas.toDataURL();
            let idx = uri.indexOf("base64,") + "base64,".length;
            showStatus("Adding to ZIP...");
            z.file(tag + ".png", uri.substring(idx), { base64: true });
        }
        // await Promise.all(promises);
        showStatus("Generating ZIP file... (This may take some time!)");
        await saveZip(z, "previews.zip");
        showStatus("Done");
    });
    
    const saveZip = (zip, filename) => new Promise((resolve, reject) => {
        zip.generateAsync({ type: "blob" }).then(blob => {
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(blob, filename);
            else { // Others
                var a = document.createElement("a"),
                        url = URL.createObjectURL(blob);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    resolve();
                }, 0);
            }
        });
    });
});