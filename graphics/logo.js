let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
// baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";

const fetchImage = (url) => new Promise((resolve, reject) => {
    let result = new Image();
    result.onload = function () {
        resolve(result);
    };
    result.onerror = function (e) {
        reject(e);
    }
    result.crossOrigin = "anonymous";
    result.src = url;
});

const minSize = 30;
const textCentered = (ctx, op, text, { blur=30, font, x, y, width, height }) => {
    ctx.font = font.size + "px \"" + font.name + "\"";
    
    let maxWidth = width - 60; // padding
    
    let words = text.split(/\s+/);
    let lines = [[]];
    let i = 0;
    while(i < words.length) {
        let word = words[i];
        let cur = lines[lines.length - 1];
        cur.push(word);
        let curWidth = ctx.measureText(cur.join(" ")).width;
        // console.log(curWidth, maxWidth);
        if(curWidth > maxWidth) {
            if(cur.length === 1) {
                // cannot do anything about 1-word overflow
                // retry with smaller text
                if(font.size < minSize) {
                    // console.log("Font too small, unable to decrease");
                    lines.push([]);
                }
                else {
                    // console.log("Attempting to decrease font size");
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
                cur.pop();
                lines.push([]);
                // console.log("Re-running to make sure word can fit");
            }
        }
        else {
            i++;
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
    ctx.filter = `blur(${blur}px)`;
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

const readImageFile = (file) => new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = function (e) {
        let result = new Image();
        result.onload = function () {
            resolve(result);
        }
        result.onerror = reject;
        result.src = e.target.result;
    }

    reader.readAsDataURL(file);
});

const parseMultiInput = (raw) =>
    raw.split(/\r?\n/)
       .map(e => JSON.parse(`[${e}]`));

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

const urlSource = (id) => {
    let card = CardViewer.Database.cards[id];
    card.src = card.src || "https://images.duelingbook.com/card-pics/" + id + ".jpg";
    return card.src;
};

const renderArchSplashPreview = async (ctx, tag, main, side) => {
    let mainImage, sideImage;
    try {
        showStatus("Loading images... (0/2)");
        mainImage = await fetchImage(main);
        showStatus("Loading images... (1/2)");
        sideImage = await fetchImage(side);
        showStatus("Loading images... (2/2)");
    }
    catch(e) {
        showStatus("Error loading image " + (1 + !!sideImage + !!mainImage));
        return;
    }
    
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

const setDimensions = (ctx, sctx, width, height, scale) => {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    
    sctx.canvas.width = width * scale;
    sctx.canvas.height = height * scale;
};

const initShowcaseDisplay = (ctx, sctx) => {
    const DEST_WIDTH = 1920;
    const DEST_HEIGHT = 1080;
    const DEST_SCALE = 0.5;
    
    const background = document.getElementById("showcase-background");
    const card = document.getElementById("showcase-card");
    const header = document.getElementById("showcase-header");
    const content = document.getElementById("showcase-content");
    
    const cardBorderRegion = new Path2D();
    cardBorderRegion.moveTo(50, 50);
    cardBorderRegion.lineTo(50, 1030);
    cardBorderRegion.lineTo(670, 955);
    cardBorderRegion.lineTo(670, 125);
    cardBorderRegion.lineTo(50, 50);
    
    document.getElementById("showcase-generate").addEventListener("click", async function () {
        setDimensions(ctx, sctx, DEST_WIDTH, DEST_HEIGHT, DEST_SCALE);
        
        showStatus("Reading background image...");
        let bg = await readImageFile(background.files[0]);
        ctx.drawImage(bg, 0, 0, ctx.canvas.width, ctx.canvas.height);
        
        showStatus("Reading card image...");
        let c = await readImageFile(card.files[0]);
        
        let fxCanvas = fx.canvas();
        let texture = fxCanvas.texture(c);
        fxCanvas
            .draw(texture)
            .perspective(
                //before
                [
                    0, 0,
                    616, 0,
                    0, 906,
                    616, 906,
                ],
                [
                    10, 10,
                    606, 10+69,
                    10, 896,
                    606, 896-69,
                ],
            )
            .update();
        
        ctx.fillStyle = "white";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 50;
        ctx.fill(cardBorderRegion);
        ctx.fill(cardBorderRegion);
        ctx.shadowBlur = 0;
        
        ctx.drawImage(fxCanvas, 50, 50, 620, 980);
        
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        textCentered(ctx, "fill", header.value, {
            blur: 10,
            x: 670, y: 0,
            width: 1250, height: 200,
            font: {
                size: 80,
                name: "Press Start 2P"
            }
        });
        textCentered(ctx, "fill", content.value, {
            blur: 10,
            x: 670, y: 100,
            width: 1250, height: 880,
            font: {
                size: 100,
                name: "Press Start 2P"
            }
        });
        
        drawScaledFrom(sctx, ctx);
    });
};

const initArchDisplay = (ctx, sctx) => {
    const DEST_WIDTH = 2120;
    const DEST_HEIGHT = 1084;
    const DEST_SCALE = 0.5;
    
    const mainId = document.getElementById("arch-main-id");
    const sideId = document.getElementById("arch-side-id");
    const tag = document.getElementById("arch-tag");
    
    const generateSingle = async (main, side, tag) => {
        let mainSrc = urlSource(main);
        let sideSrc = urlSource(side);
        await renderArchSplashPreview(ctx, tag, mainSrc, sideSrc);
        drawScaledFrom(sctx, ctx);
    };
    
    document.getElementById("arch-generate").addEventListener("click", async () => {
        setDimensions(ctx, sctx, DEST_WIDTH, DEST_HEIGHT, DEST_SCALE);
        generateSingle(mainId.value, sideId.value, tag.value);
    });
    
    const fileInput = document.getElementById("arch-file-input");
    document.getElementById("arch-generate-file").addEventListener("click", async () => {
        setDimensions(ctx, sctx, DEST_WIDTH, DEST_HEIGHT, DEST_SCALE);
        let z = new JSZip();
        
        let rawText = await readTextFile(fileInput.files[0]);
        
        let entries = parseMultiInput(rawText);
        
        console.log(entries);
        
        for(let [tag, mid, sid] of entries) {
            generateSingle(mid, sid, tag);
            
            let uri = canvas.toDataURL();
            let idx = uri.indexOf("base64,") + "base64,".length;
            showStatus("Adding to ZIP...");
            z.file(tag + ".png", uri.substring(idx), { base64: true });
        }
        showStatus("Generating ZIP file... (This may take some time!)");
        await saveZip(z, "previews.zip");
        showStatus("Done");
    });
};

const updateVisibileMethodOptions = function() {
    let val = this.value;
    let sel = "if-" + val;
    for(let el of document.querySelectorAll("[class^=if-]")) {
        // console.log(el, sel, this, this.value);
        if(el.classList.contains(sel)) {
            // console.log('show');
            el.style.display = "block";
        }
        else {
            el.style.display = "none";
        }
    }
};

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
    
    // methods
    initArchDisplay(ctx, sctx);
    initShowcaseDisplay(ctx, sctx);
    
    const method = document.getElementById("method");
    method.addEventListener("change", updateVisibileMethodOptions);
    updateVisibileMethodOptions.bind(method)();
    
    showStatus("Done initializing all functions");
    document.getElementById("method-options").style.display = "block";
});