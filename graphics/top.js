// import "tag-extract.js"
let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
baseURL = "./../";
window.exuDatabase = baseURL + "db.json";

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
    
    const updateState = el => {
        if(typeof el === "string") {
            el = form.querySelector(`[data-target="${el}"]`);
        }
        let { target: targetName, ancestor } = el.dataset;
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
            else {
                target.textContent = value;
            }
        }
    };
    
    const updateAll = () => {
        for(let input of form.querySelectorAll("input")) {
            updateState(input);
        }
    };
    
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
    
    // start loading
    CardViewer.Database.initialReadAll(exuDatabase).then(() => updateState("cardThumb"));
    
    updateAll();
    
    
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
