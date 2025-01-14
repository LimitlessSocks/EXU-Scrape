// modified from https://stackoverflow.com/a/33063222/4119004
const getMousePos = (canvas, ev) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (ev.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (ev.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
};

class DragManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.attachListeners();
        this.reset();
    }

    reset() {
        // TODO: Z-Ordering
        this.children = [];
        this.focus = null;
        this.mouseState = {
            pressed: false,
            x: null,
            y: null,

            dx: null,
            dy: null,
            
            focusStartX: null,
            focusStartY: null,

            dragStartX: null,
            dragStartY: null,
            currentDragX: null,
            currentDragY: null,
            
            scrollTop: null,
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        this.clearCanvas();
        for(let child of this.children) {
            child.render();
        }
    }

    append(...children) {
        this.children.push(...children);
    }

    startPressing(x, y) {
        this.mouseState = {
            ...this.mouseState,
            pressed: true,
            dragStartX: x,
            dragStartY: y,
            currentDragX: x,
            currentDragY: y,
            focusStartX: this.focus.x,
            focusStartY: this.focus.y,
            scrollTop: window.scrollY ?? document.documentElement.scrollTop,
        };
    }

    stopPressing() {
        this.mouseState = {
            ...this.mouseState,
            pressed: false,
            dragStartX: null,
            dragStartY: null,
            currentDragX: null,
            currentDragY: null,
            focusStartX: null,
            focusStartY: null,
            scrollTop: null,
        };
        this.focus?.stopDragging();
        this.focus = null;
    }

    updateMouseMove(x, y) {
        if(!this.mouseState.pressed) {
            return;
        }

        this.mouseState.currentDragX = x;
        this.mouseState.currentDragY = y;

        this.mouseState.dx = this.mouseState.currentDragX - this.mouseState.dragStartX;
        this.mouseState.dy = this.mouseState.currentDragY - this.mouseState.dragStartY;

        this.focus.x = this.mouseState.focusStartX + this.mouseState.dx;
        this.focus.y = this.mouseState.focusStartY + this.mouseState.dy;
    }

    attachListeners() {
        this.canvas.addEventListener("mousemove", ev => {
            let { x, y } = getMousePos(this.canvas, ev);
            this.updateMouseMove(x, y);
            let interactables = this.children.filter(child => child.draggable);
            if(!interactables.length) {
                return;
            }
            // TODO: split children into interactable and non-interactable to optimize
            let contact = interactables.findLast(child => child.hasPoint( x, y ));
            interactables.forEach(child => {
                if(child === contact) {
                    child.startHovering();
                }
                else {
                    child.stopHovering();
                }
            });
            // TODO: only re-render on edge transition (i.e. contact changes or mouse up/down change)
            if(contact) {
                this.canvas.style.cursor = "pointer";
                this.render();
            }
            else {
                this.canvas.style.cursor = "auto";
                this.render();
            }
        });
        this.canvas.addEventListener("mousedown", ev => {
            let { x, y } = getMousePos(this.canvas, ev);
            let contact = this.children.findLast(child => child.hasPoint( x, y ));
            if(!contact) {
                this.focus = null;
                return;
            }
            this.focus = contact;
            this.focus.startDragging();
            this.startPressing(x, y);
            this.render();
        });
        window.addEventListener("mouseup", ev => {
            this.stopPressing();
            this.render();
        });
        window.addEventListener("blur", ev => {
            this.stopPressing();
            this.render();
        });
        this.canvas.addEventListener("wheel", ev => {
            if(!this.focus) {
                return;
            }
            let amount = -10;
            amount *= Math.sign(ev.deltaY);
            this.focus.zoomBy(amount);
            ev.preventDefault();
            this.render();
        });
    }

    // use DragManager.for(canvas) to prevent duplicate events
    static CanvasMap = new Map();
    static for(ctx) {
        let manager = DragManager.CanvasMap.get(ctx);
        if(!manager) {
            manager = new DragManager(ctx);
            DragManager.CanvasMap.set(ctx, manager);
        }
        return manager;
    }
}

class Renderable {
    constructor(ctx, renderFn = function () {}) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.renderFn = renderFn;
        this.draggable = false;
        this.zoomRatio = 1.0;
    }

    // by default, Renderables are not interactable
    hasPoint(...args) {
        return false;
    }

    render() {
        this.renderFn.call(this);
    }

    deduceBorder() {
        return;
    }

    zoomBy(amt) {
        let oldZoom = this.zoomRatio;

        if(amt > 0) {
            this.zoomRatio += 0.1;
        }
        else {
            this.zoomRatio -= 0.1;
        }
        
        /*
        let oldWidth = this.width * oldZoom;
        let oldHeight = this.height * oldZoom;
        let oldCenterX = this.x + oldWidth / 2;
        let oldCenterY = this.y + oldHeight / 2;
        // let newCenterX = this.x + this.width * this.zoomRatio / 2;
        // let newCenterY = this.y + this.height * this.zoomRatio / 2;
        let newWidth = this.width * this.zoomRatio;
        let newHeight = this.height * this.zoomRatio;
        let newTopLeftX = oldCenterX - newWidth / 2;
        let newTopLeftY = oldCenterY - newHeight / 2;
        this.x = newTopLeftX;
        this.y = newTopLeftY;
        */
    }

    startHovering() {
        this.isHovering = true;
        this.deduceBorder();
    }

    stopHovering() {
        this.isHovering = false;
        this.deduceBorder();
    }

    startDragging() {
        this.isDragging = true;
        this.deduceBorder();
    }
    
    stopDragging() {
        this.isDragging = false;
        this.deduceBorder();
    }
}

class DraggableElement extends Renderable {
    constructor({ ctx, width, height, x = 0, y = 0 }) {
        super(ctx, null);
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.baseBorder = null;
        this.border = this.baseBorder;
        this.isDragging = false;
        this.isHovering = false;
        this.draggable = true;
        this.clipFunction = null;
    }

    setBaseBorder(newBaseBorder) {
        this.baseBorder = newBaseBorder;
        if(!this.border) {
            this.border = this.baseBorder;
        }
        return this;
    }

    deduceBorder() {
        if(this.isDragging) {
            this.border = "red";
        }
        else if(this.isHovering) {
            this.border = "white";
        }
        else {
            this.border = this.baseBorder;
        }
    }

    hasPoint(testX, testY) {
        let { x, y, width, height, zoomRatio } = this;
        return (
            testX >= x &&
            testX <= x + width * zoomRatio &&
            testY >= y &&
            testY <= y + height * zoomRatio &&
            (!this.clipFunction || this.clipFunction(testX, testY))
        );
    }

    render() {
        if(!this.border) {
            return;
        }
        this.ctx.strokeStyle = this.border;
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(this.x, this.y, this.width * this.zoomRatio, this.height * this.zoomRatio);
    }
}

class DraggableImage extends DraggableElement {
    constructor({ ctx, src, x, y, width, height }) {
        super({ ctx, x, y, width, height });
        this.loaded = false;
        this.img = new Image();
        this.img.src = src;
        this.border = "red";
        this.img.onload = () => {
            this.border = null;
            this.loaded = true;
            this.width ??= this.img.width;
            this.height ??= this.img.height;
        };
    }

    render() {
        if(this.loaded) {
            this.ctx.drawImage(this.img, this.x, this.y, this.width * this.zoomRatio, this.height * this.zoomRatio);
        }
        super.render();
    }
}

class DraggableText extends DraggableElement {
    constructor({ ctx, text, fontSize, fontName, x, y }) {
        super({ ctx, width: null, height: null, x, y });
        this.fontSize = fontSize ?? 36;
        this.fontName = fontName ?? "Sweet Sans Pro Italic";
        this.setDimensions();
        this.text = text;
        this.shadowIteration = 10;
    }

    offsetCenter() {
        this.x -= this.width / 2;
        this.y -= this.height / 2;
        return this;
    }

    zoomBy(amt) {
        if(amt > 0) {
            this.fontSize += 2;
        }
        else {
            this.fontSize -= 2;
        }
        this.setDimensions();
    }

    getFont() {
        return `${this.fontSize}px "${this.fontName}"`;
    }

    setDimensions() {
        this.setTextStyle();
        let metrics = this.ctx.measureText(this.text);
        let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        this.height = height;
        this.width = metrics.width;
    }

    setTextStyle() {
        this.ctx.font = this.getFont();
        this.ctx.shadowColor = "black";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1.5;
    }

    render() {
        this.setTextStyle();
        this.ctx.shadowBlur = 7;
        for(let i = 0; i < this.shadowIteration; i++) {
            this.ctx.fillText(this.text, this.x, this.y);
        }
        this.ctx.shadowBlur = 0;
        super.render();
        // this.ctx.strokeText(this.text, this.x, this.y);
    }
}
