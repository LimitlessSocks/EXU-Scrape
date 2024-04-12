const ExampleImages = [
    "https://ms.yugipedia.com//2/2e/BrotherhoodoftheFireFistSwan-MADU-EN-VG-artwork.png",
    "https://yugipedia.com/wiki/Special:Redirect/file/AleistertheInvoker-MADU-EN-VG-artwork.png?utm_source=bastion",
    "https://yugipedia.com/wiki/Special:Redirect/file/TreebornFrog-MADU-EN-VG-artwork.png?utm_source=bastion",
    "https://i.redd.it/plvo7j0qcwh51.jpg",
];
const ExampleNames = [
    "Fire Fist",
    "Invoked",
    "Frogs",
    "Other",
];

const addDeck = () => {
    let decksContainer = document.getElementById("decksContainer");

    let deckDiv = document.createElement("fieldset");
    deckDiv.classList.add("deck");
    let legend = document.createElement("legend");
    legend.textContent = "Deck #" + (1 + decksContainer.children.length);
    deckDiv.appendChild(legend);

    let deckNameInput = document.createElement("input");
    deckNameInput.setAttribute("type", "text");
    deckNameInput.setAttribute("placeholder", "Enter Deck Name");
    deckNameInput.classList.add("deckName");
    let deckNameLabel = document.createElement("label");
    deckNameLabel.textContent = "Deck Name: ";
    let deckNameParagraph = document.createElement("p");
    deckNameParagraph.appendChild(deckNameLabel);
    deckNameParagraph.appendChild(deckNameInput);
    deckDiv.appendChild(deckNameParagraph);

    let timesPlayedInput = document.createElement("input");
    timesPlayedInput.setAttribute("type", "number");
    timesPlayedInput.value = 1 + (Math.random() * 5 | 0);
    timesPlayedInput.setAttribute("placeholder", "Amount");
    timesPlayedInput.classList.add("timesPlayed");
    let timesPlayedLabel = document.createElement("label");
    timesPlayedLabel.textContent = "Times Played: ";
    let timesPlayedParagraph = document.createElement("p");
    timesPlayedParagraph.appendChild(timesPlayedLabel);
    timesPlayedParagraph.appendChild(timesPlayedInput);
    deckDiv.appendChild(timesPlayedParagraph);

    let deckImageInput = document.createElement("input");
    deckImageInput.setAttribute("type", "text");
    deckImageInput.setAttribute("placeholder", "Thumbnail");
    deckImageInput.value = ExampleImages[decksContainer.children.length];
    deckImageInput.classList.add("deckImage");
    let deckImageLabel = document.createElement("label");
    deckImageLabel.textContent = "Deck Image: ";
    let deckImageParagraph = document.createElement("p");
    deckImageParagraph.appendChild(deckImageLabel);
    deckImageParagraph.appendChild(deckImageInput);
    deckDiv.appendChild(deckImageParagraph);

    let deckRemoveButton = document.createElement("button");
    deckRemoveButton.textContent = "Remove Deck";
    deckRemoveButton.addEventListener("click", function(ev) {
        deckDiv.remove();
        render();
        
    });
    deckDiv.appendChild(deckRemoveButton);
    
    let moveUpButton = document.createElement("button");
    moveUpButton.textContent = "⬆️";
    moveUpButton.addEventListener("click", function(ev) {
        let myIdx = [...decksContainer.children].indexOf(deckDiv);
        if(myIdx === 0) {
            return;
        }
        let targetIdx = myIdx - 1;
        deckDiv.remove();
        decksContainer.insertBefore(deckDiv, decksContainer.children[targetIdx]);
        render();
    });
    deckDiv.appendChild(moveUpButton);
    let moveDownButton = document.createElement("button");
    moveDownButton.textContent = "⬇️";
    moveDownButton.addEventListener("click", function(ev) {
        let myIdx = [...decksContainer.children].indexOf(deckDiv);
        if(myIdx + 1 === decksContainer.children.length) {
            return;
        }
        let targetIdx = myIdx + 1;
        deckDiv.remove();
        decksContainer.insertBefore(deckDiv, decksContainer.children[targetIdx]);
        render();
    });
    deckDiv.appendChild(moveDownButton);

    decksContainer.appendChild(deckDiv);
    
    render();
};

const loadImage = url => new Promise((resolve, reject) => {
    let img = new Image();
    img.src = url;
    img.onload = function () {
        resolve(this);
    };
});

const LOGO_SRC = {
    exu: "./res/logo.png",
    sff: "./res/sff-logo.png",
};
const ATTRIBUTION = {
    exu: "discord.gg/extinctionunleashed",
    sff: "discord.gg/Za2tpNmj8m",
};

const findSectorCenter = (canvas, ctx, radius, startAngle, widthAngle) => {
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    
    let angleBisector = (startAngle + (startAngle + widthAngle)) / 2;
    
    return {
        x: centerX + Math.cos(angleBisector) * radius / 2,
        y: centerY + Math.sin(angleBisector) * radius / 2,
    };
};

const render = async () => {
    const format = $("[name=format]:checked").val();
    let allFormats = [...$("[name=format]")].map(e => $(e).val());
    
    allFormats.forEach(fmt => {
        $("#output").toggleClass(fmt, fmt === format);
    });
    
    $(".exuLogo").attr("src", LOGO_SRC[format]);
    $(".attribution").text(ATTRIBUTION[format]);
    $(".eventName").text($("input[data-target='eventName']").val());
    $(".eventDate").text($("input[data-target='eventDate']").val());
    
    const canvas = document.getElementsByTagName("canvas")[0];
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    ctx.fillStyle = "gold";

    let sections = [...$(".timesPlayed")].map(e => +$(e).val());
    let sum = sections.reduce((p, c) => p + c);
    
    // draw background circle
    let radius = canvas.width / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    let urls = [...$(".deckImage")].map(e => $(e).val() || "https://cdn3.vectorstock.com/i/1000x1000/96/47/error-pixel-glitch-vector-20409647.jpg");
    let images = await Promise.all(urls.map(url => loadImage(url)));
    console.log(images);
    console.log("Images loaded!");
    
    let deckNames = [...$(".deckName")].map(e => $(e).val());
    
    // draw inner sections
    let innerRadius = radius - 10;
    let startAngle = -Math.PI / 2;
    let pushOutDistance = 50;
    let starts = [];
    
    sections.forEach((rep, idx) => {
        starts.push(startAngle);
        let img = images[idx];
        let name = deckNames[idx];
        let widthAngle = rep / sum * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, innerRadius, startAngle, startAngle + widthAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        // change fill center
        let { x: arcCenterX, y: arcCenterY } = findSectorCenter(canvas, ctx, innerRadius, startAngle, widthAngle);
        console.log(centerX, centerY, ";;;", arcCenterX, arcCenterY);
        
        ctx.save();
        ctx.fillStyle = ctx.createPattern(img, "no-repeat");
        ctx.translate(-img.width / 2, -img.height / 2);
        // ctx.translate(img.width / 4, img.height / 4);
        // ctx.translate(-arcCenterX + img.width / 2, -arcCenterY + img.height / 2);
        ctx.translate(arcCenterX, arcCenterY);
        ctx.fill();
        ctx.restore();
        
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.fillText("HELLO!", arcCenterX, arcCenterY);
        ctx.strokeText("HELLO!", arcCenterX, arcCenterY);
        
        startAngle += widthAngle;
    });
    // draw strokes
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    sections.forEach((rep, idx) => {
        let start = starts[idx];
        let outerX = centerX + Math.cos(start) * innerRadius;
        let outerY = centerY + Math.sin(start) * innerRadius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(outerX, outerY);
        ctx.closePath();
        ctx.stroke();
    });
};

window.addEventListener("load", function () {
    const DEFAULT_DECK_COUNT = 4;
    for(let i = 0; i < DEFAULT_DECK_COUNT; i++) {
        addDeck();
    }
    
    $("#chartInfo input").on("change", render);
    render();
});