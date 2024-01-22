// import "tag-extract.js"
let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
baseURL = "./../";
window.exuDatabase = baseURL + "db.json";

/*
// doesn't work: unsupported CSS properties by html2canvas
const saveElementToImage = (element, outputFileName="output.png") => {
    html2canvas(element).then(canvas => {
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = outputFileName;

        link.click();
    });
};
*/

const BASE_WIDTH = 810;
window.addEventListener("load", async function () {
    const form = document.getElementById("input");
    const output = document.getElementById("output");
    
    let cardThumb = output.getElementsByClassName("cardThumb")[0];
    let imgOffsetX = document.querySelector("input[data-target='imgOffsetX']");
    let imgOffsetY = document.querySelector("input[data-target='imgOffsetY']");
    let imgZoom = document.querySelector("input[data-target='imgZoom']");
    
    imgOffsetX.value ||= "0";
    imgOffsetY.value ||= "0";
    imgZoom.value ||= "100";
    
    CardViewer.Editor.DeckInstance = new Deck(
        [],
        [],
        [],
        false, //not editable
    );
    CardViewer.Editor.DeckInstance.bannerScale = 0.15;
    CardViewer.Editor.DeckInstance.setDeckWidth(10);
    
    // console.log(imgOffsetX.value, imgOffsetY.value);
    const MouseState = {
        pressed: false,
        x: null,
        y: null,
        
        startX: null,
        startY: null,
        localX: null,
        localY: null,
        
        scrollTop: null,
        
        syncXYWithInputs() {
            this.x = parseInt(imgOffsetX.value, 10);
            this.y = parseInt(imgOffsetY.value, 10);
        },
        startPressing(x, y) {
            this.pressed = true;
            this.startX = x;
            this.localX = x;
            this.startY = y;
            this.localY = y;
            // stop scrolling the page, remember where we started
            this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            cardThumb.classList.add("moving");
        },
        stopPressing() {
            this.pressed = false;
            this.startX = null;
            this.localX = null;
            this.startY = null;
            this.localY = null;
            this.syncXYWithInputs();
            this.scrollTop = null;
            cardThumb.classList.remove("moving");
        },
        sendMouseMoveUpdate(x, y) {
            if(!this.pressed) {
                return;
            }
            this.localX = x;
            this.localY = y;
            // update offsets
            this.dx = this.localX - this.startX;
            this.dy = this.localY - this.startY;
            imgOffsetX.value = this.x + this.dx;
            imgOffsetY.value = this.y + this.dy;
            // update visual offset
            updateState("imgOffsetX");
            updateState("imgOffsetY");
        },
    };
    MouseState.syncXYWithInputs();
    window.MouseState = MouseState;
    
    const loadDeckDisplay = file => {
        if(!file) {
            return;
        }
        CardViewer.Editor.DeckInstance.clear();
        
        let reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target.result;
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(text, "text/xml");
            let deck = CardViewer.Editor.DeckInstance;
            
            deck.clear();
            
            let i = 0;
            for(let deckContainer of xmlDoc.querySelectorAll("main, side, extra")) {
                for(let card of deckContainer.querySelectorAll("card")) {
                    deck.addCard(card.id, i);
                }
                i++;
            }
            
            if(CardViewer.Elements.deckEditor) {
                CardViewer.Editor.updateDeck();
            }
            
            for(let area of ["main", "side", "extra"]) {
                let count = xmlDoc.querySelectorAll(area + " card").length;
                let text = `${count} cards`;
                $(`.${area}.count`).text(text);
            }
        };
        reader.readAsText(file);
        if(CardViewer.Elements.deckEditor) {
            CardViewer.Editor.updateDeck();
        }   
    };
    
    const updateState = el => {
        if(typeof el === "string") {
            el = form.querySelector(`[data-target="${el}"]`);
        }
        let { target: targetName, ancestor } = el.dataset;
        
        if(targetName === "deckXml") {
            loadDeckDisplay(el.files[0]);
            return;
        }
        
        let targets = output.getElementsByClassName(ancestor || targetName);
        
        // let { value } = el;
        let value = el.value || el.placeholder;
        for(let target of targets) {
            // console.log(target, targetName);
            if(targetName === "cardThumb") {
                if(CardViewer.Database.cards) {
                    let src;
                    if(value.startsWith("http")) {
                        src = value;
                    }
                    else {
                        let card = CardViewer.getCardByName(value);
                        src = card?.src ?? "";
                    }
                    target.src = src;
                }
            }
            else if(targetName === "imgOffsetX") {
                target.style.left = `${value}px`;
            }
            else if(targetName === "imgOffsetY") {
                target.style.top = `${value}px`;
            }
            else if(targetName === "imgZoom") {
                let amount = BASE_WIDTH * parseFloat(value, 10) / 100;
                target.style.width = `${amount}px`;
            }
            else if(targetName === "duelistNameFontSize") {
                target.style.fontSize = value + "px";
                target.style.lineHeight = parseFloat(value, 10) * 1.1 + "px";
            }
            else if(targetName === "deckNameColor") {
                target.style.color = value;
            }
            else {
                target.textContent = value;
            }
        }
    };
    
    // start loading
    CardViewer.Database.initialReadAll(exuDatabase).then(() => {
        updateState("cardThumb");
        // database loaded; load the deck
        CardViewer.Editor.MajorContainer = $("#majorContainer");
        CardViewer.Elements.deckEditor = $("#deckEditor");
        CardViewer.Elements.cardPreview = $("<div></div>");
        CardViewer.Editor.updateDeck();
        CardViewer.Editor.recalculateView();
    });
    
    const updateAll = () => {
        for(let input of form.querySelectorAll("input")) {
            updateState(input);
        }
    };
    
    updateAll();
    
    form.addEventListener("input", ev => {
        updateState(ev.target);
        /*
        let targetName = ev.target.dataset.target;
        if(targetName === "imgOffsetX") {
            console.log(ev.target.value);
            // MouseState.x = parseInt(ev.target.value, 10);
        }
        else if(targetName === "imgOffsetY") {
            console.log(ev.target.value);
            // MouseState.y = parseInt(ev.target.value, 10);
        }
        */
    });
    
    // events
    cardThumb.addEventListener("mousedown", ev => {
        MouseState.startPressing(ev.clientX, ev.clientY);
    });
    window.addEventListener("mouseup", ev => {
        MouseState.stopPressing();
    });
    window.addEventListener("mousemove", ev => {
        if(MouseState.pressed) {
            MouseState.sendMouseMoveUpdate(ev.clientX, ev.clientY);
        }
    });
    cardThumb.addEventListener("wheel", ev => {
        // TODO: take into account multiple wheels?
        ev.preventDefault();
        let amount = 10;
        amount *= Math.sign(ev.deltaY);
        imgZoom.value = parseInt(imgZoom.value, 10) - amount;
        updateState("imgZoom");
    });
    window.addEventListener("blur", ev => {
        MouseState.stopPressing();
    });
    cardThumb.addEventListener("dragstart", ev => {
        ev.preventDefault();
    });
});
