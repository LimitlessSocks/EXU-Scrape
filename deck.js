const CARD_BASE_WIDTH = 813;
const CARD_BASE_HEIGHT = 1185;
const NO_CARD = {
    src: "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/res/no_img.png",
    name: "Error: No Card",
    id: -1,
    username: "--",
    card_type: "Monster",
    monster_color: "Error",
    custom: 0,
    effect: "This card does not exist.",
    attribute: "ERROR",
    level: 0,
    atk: -1,
    def: -1,
    exu_limit: 3,
};

const splitInto = (total, bucketCount, min = 0) => {
    let base = total / bucketCount | 0;
    let remainder = total % bucketCount;
    let needOverflow = bucketCount - remainder;
    let buckets = [];
    for(let i = 0; i < bucketCount; i++) {
        buckets[i] = Math.max(min, base);
        if(i >= needOverflow && base >= min) {
            buckets[i]++;
        }
    }
    return buckets;
};

// https://stackoverflow.com/a/12646864/4119004
const shuffleInPlace = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

class Deck {
    constructor(main = [], side = [], extra = [], editable = true) {
        this.decks = [
            main,
            side,
            extra
        ];
        this.target = null;
        this.showSideDeck = true;
        // this.deckWidthInCards = 10;
        // this.mainDeckRowCount = 4;
        this.editable = editable;
        this.units = {};
        this.name = "My Deck";
        this.description = "";
        this.author = "Anonymous";
        this.thumb = 0;
        this.rowCounts = {
            [Deck.Location.MAIN]: 4,
            [Deck.Location.SIDE]: 1,
            [Deck.Location.EXTRA]: 1,
        };
        this.deckWidths = {
            [Deck.Location.MAIN]: 10,
            [Deck.Location.SIDE]: 0,
            [Deck.Location.EXTRA]: 0,
        }
    }
    
    setDeckWidth(width) {
        this.deckWidths[Deck.Location.MAIN] = width;
    }
    
    setRows(location, rowCount=1) {
        this.rowCounts[location] = rowCount;
    }
    
    toSimpleObject() {
        return {
            decks: this.decks,
            editable: this.editable,
            name: this.name,
            description: this.description,
            author: this.author,
            thumb: this.thumb,
            rowCounts: this.rowCounts,
            deckWdiths: this.deckWidths,
            // deckWidthInCards: this.deckWidthInCards,
        };
    }
    
    /*
    static fromSimpleObject(obj) {
        let res = new Deck();
        Object.assign(res, obj);
        return res;
    }
    */
    
    getId() {
        return this.name.trim().replace(/\W+/g, "");
    }
    
    sort() {
        const CardTypeIterator = [
            "Monster",
            "Spell",
            "Trap",
        ];
        const MonsterColorIterator = [
            "Ritual",
            "Normal",
            // "Pendulum",
            "Fusion",
            "Synchro",
            "Xyz",
            "Link",
        ];
        this.decks = this.decks.map(deck => {
            let cards = deck.map(id => CardViewer.Database.cards[id]);
            
            return CardTypeIterator.flatMap(type => {
                
                let subCards = _F.sortByLocale(
                    cards.filter(card => card.card_type === type),
                    card => {
                        let i = MonsterColorIterator.indexOf(card.monster_color);
                        if(CardViewer.Filters.Dictionary.pendulum(card)) {
                            i += MonsterColorIterator.length;
                        }
                        return i;
                    },
                    card => card.name,
                );
                
                return subCards.map(card => card.id);
            });
        });
    }
    
    shuffle() {
        for(let deck of this.decks) {
            shuffleInPlace(deck);
        }
    }
    
    clear() {
        for(let deck of this.decks) {
            deck.splice(0);
        }
    }
    
    getLocation(cardId) {
        let card = CardViewer.Database.cards[cardId];
        return CardViewer.Filters.isExtraDeck(card) ? Deck.Location.EXTRA : Deck.Location.MAIN;
    }
    
    addCard(cardId, location = this.getLocation(cardId), index = null) {
        let destDeck = this.decks[location];
        if(index === null) {
            index = destDeck.length;
        }
        // console.log(this.decks, location);
        destDeck.splice(index, 0, cardId);
        return { destination: location, index: index };
    }
    
    swapCards(aloc, a, bloc, b) {
        [this.decks[aloc][a], this.decks[bloc][b]] = [this.decks[bloc][b], this.decks[aloc][a]];
    }
    
    moveInFrontOf(deck, drag, end) {
        let destDeck = this.decks[deck];
        let [val] = destDeck.splice(drag, 1);
        destDeck.splice(end, 0, val);
    }
    
    removeCard(deck, index) {
        return this.decks[deck].splice(index, 1)[0];
    }
    
    trimToNormalSize(deck) {
        let size = deck === Deck.Location.MAIN ? 60 : 15;
        while(this.decks[deck].length > size) {
            let id = this.removeCard(deck, this.decks[deck].length - 1);
            if(deck !== Deck.Location.SIDE) {
                this.addCard(id, Deck.Location.SIDE);
            }
        }
    }
    
    applyCSS() {
        if(!this.target) {
            return;
        }
        
        let pixelWidth = this.target.width() - 30;
        let getUnits = (deckWidthInCards) => {
            let marginWidth = 5;
            let unitWidth = pixelWidth - (deckWidthInCards - 1) * marginWidth;
            unitWidth /= deckWidthInCards;
            let totalWidth = unitWidth + marginWidth;
            
            let scaleRatio = unitWidth / CARD_BASE_WIDTH;
            let unitHeight = CARD_BASE_HEIGHT * scaleRatio;
            let totalHeight = unitHeight + marginWidth;
            
            return {
                scaleRatio: scaleRatio,
                totalWidth: totalWidth,
                totalHeight: totalHeight,
                // unitWidth: unitWidth,
            };
        };
        
        let j = 0;
        let cIndexOffset = 0;
        let containerIndex = 0;
        
        let deckWidthInCards = this.deckWidths[Deck.Location.MAIN];
        
        let baseUnits = getUnits(deckWidthInCards);
        
        const inBetweenMultiplier = 0.3;
        
        for(let container of this.target.children()) {
            let i = 0;
            let deckJ = 0;
            let cardFound = false;
            // console.log(i, cIndexOffset, containerIndex);
            
            $(container).find(".container-info").remove();
            
            if(containerIndex === 1 && !this.showSideDeck) {
                $(container).empty();
                containerIndex++;
                continue;
            }
            
            let children = $(container).children();
            let size = children.length;
            let widths = splitInto(size, this.rowCounts[containerIndex], this.deckWidths[containerIndex]);
            for(let card of children) {
                let w = widths[deckJ];
                if(w < deckWidthInCards) {
                    w = deckWidthInCards;
                }
                let diff = deckWidthInCards - w;
                let r = diff / (w - 1);
                let q = r * baseUnits.totalWidth;
                
                let heightMultiplier = j + cIndexOffset * inBetweenMultiplier;
                card = $(card);
                card.css("left", i * baseUnits.totalWidth + q * i);
                card.css("top", heightMultiplier * baseUnits.totalHeight);
                card.css("transform", `scale(${baseUnits.scaleRatio})`);
                i++;
                if(i >= w) {
                    i = 0;
                    j++;
                    deckJ++;
                }
                cardFound = true;
            }
            
            // container info
            let info = $("<div class=container-info>");
            info.data({ deck: containerIndex, index: null, });
            
            $(container).append(info);
            
            if(i || !cardFound) j++;
            
            info.text(`${["Main", "Side", "Extra"][containerIndex]} Deck (${size})`);
            info.css({
                top: (j + cIndexOffset * inBetweenMultiplier) * baseUnits.totalHeight + 7.5,
                // fontSize: 0.25 * baseUnits.totalHeight + "px",
                height: 0.3 * baseUnits.totalHeight + "px",
                width: pixelWidth,
            });
            
            
            cIndexOffset++;
            containerIndex++;
        }
    }
    
    isEmpty() {
        return this.decks.every(deck => deck.length === 0);
    };
    
    renderHTML(target) {
        this.target = target;
        
        if(this.isEmpty()) {
            target.text("\xA0");//nbsp
            return;
        }
        
        let j = 0;
        for(let deck of this.decks) {
            let i = 0;
            let container = $("<div class=sub-deck-container>");
            for(let id of deck) {
                let card = CardViewer.Database.cards[id];
                if(!card) {
                    console.warn("Card with id does not exist: " + id);
                    card = CardViewer.Database.cards[id] = Object.assign({}, NO_CARD);
                    card.effect += " Original ID: " + id;
                    // continue;
                }
                let composed = CardViewer.composeResultDeckPreview(card);
                composed.data("index", i);
                composed.data("deck", j);
                composed.data("id", id);
                CardViewer.Editor.addHoverTimerPreview(composed, id);
                if(this.editable) {
                    composed.mousedown((e) => {
                        // only accept left mouse click
                        if(e.which !== 1) return;
                        let offset = getOffsetFrom(e.originalEvent, composed);
                        CardViewer.Editor.trackMouse(this, composed, offset);
                    });
                    composed.contextmenu((e) => {
                        e.preventDefault();
                        this.removeCard(composed.data("deck"), composed.data("index"));
                        CardViewer.Editor.updateDeck();
                    });
                }
                container.append(composed);
                i++;
            }
            if(j === 1 && !this.showSideDeck) {
                container.empty();
            }
            j++;
            target.append(container);
        }
        
        this.applyCSS();
    }
    
    toXML() {
        let deckString = ["main", "side", "extra"].map((name, i) =>
            ` <${escapeXMLString(name)}>\n` +
            this.decks[i]
                .map(id => CardViewer.Database.cards[id])
                .map(card => `  <card id="${card.id}" passcode="${card.serial_number}">${escapeXMLString(card.name)}</card>\n`
                ).join("") +
            ` </${name}>`
        ).join("\n");
        let xmlString = `
<?xml version="1.0" encoding="utf-8" ?>
<deck id="${this.getId()}">
 <meta>
  <author>${escapeXMLString(this.author)}</author>
  <description>${escapeXMLString(this.description)}</description>
  <name>${escapeXMLString(this.name)}</name>
  <thumb>${this.thumb}</thumb>
 </meta>
${deckString}
</deck>
        `.trim();
        if(!CardViewer.Database.cards[this.thumb].custom) {
            xmlString = xmlString.replace("<thumb>", "<thumb custom=\"false\">");
        }
        return xmlString;
    }
}
Deck.Location = {
    MAIN: 0,
    SIDE: 1,
    EXTRA: 2,
};


const getOffsetFrom = (originalEvent, container) => {
    let { pageX, pageY } = originalEvent;
    let { left, top } = container.offset();
    return {
        x: pageX - left,
        y: pageY - top,
    };
}


CardViewer.Editor = {};
CardViewer.Editor.DeckInstance = new Deck();
CardViewer.Editor.setPreview = function (id) {
    CardViewer.Elements.cardPreview.empty();
    if(!id) return;
    CardViewer.Elements.cardPreview.append(
        CardViewer.composeResultCardPreview(CardViewer.Database.cards[id])
    );
};
CardViewer.Editor
CardViewer.Editor.TIMER_DELAY = 100;//ms
CardViewer.Editor.addHoverTimerPreview = function (composed, id) {
    let hoverTimer = null;
    let setPreviewToThis = () => CardViewer.Editor.setPreview(id);
    composed.click(setPreviewToThis);
    composed.hover(() => {
        if(hoverTimer !== null) {
            // only set hover once
            return;
        }
        hoverTimer = setTimeout(setPreviewToThis, CardViewer.Editor.TIMER_DELAY);
    });
    composed.mouseleave(() => {
        clearTimeout(hoverTimer);
        hoverTimer = null;
    });
};

const isBounded = (x, y, bounds) => {
    let isLeftRightBounded = bounds.left <= x && x <= bounds.right;
    let isTopBottomBounded = bounds.top <= y && y <= bounds.bottom;
    return isLeftRightBounded && isTopBottomBounded;
};  

CardViewer.Editor.trackMouse = function (deck, composed, offset) {
    offset = offset || { x: 0, y: 0 };
    composed.addClass("dragging");
    offset.x += 10;
    offset.y -= 15;
    let sourceIndex = composed.data("index");
    let sourceDeck = composed.data("deck");
    let sourceLocation = deck.getLocation(composed.data("id"));
    let focusedChild = null;
    
    let container = $(".sub-deck-container");
    
    let onMove = (e) => {
        let { x, y } = getOffsetFrom(e.originalEvent, container);
        // x -= offset.x;
        // y -= offset.y;
        composed.css("left", (x - offset.x) + "px");
        composed.css("top", (y - offset.y) + "px");
        // let minDistance = Infinity;
        // let minChild = null;
        let allCards = container.find(".editor-item");
        allCards.removeClass("focused");
        // let { screenX, screenY } = e.originalEvent;
        let { clientX, clientY } = e.originalEvent;
        
        let myX, myY;
        myX = clientX;
        myY = clientY;
        
        focusedChild = null;
        
        for(let child of allCards) {
            child = $(child);
            let childLocation = deck.getLocation(child.data("id"));
            let childCurrentDeck = child.data("deck");
            
            let isSameExactCard = child.data("index") === sourceIndex
                && childCurrentDeck === composed.data("deck");
            
            let isInvalidDestination = childLocation !== sourceLocation;
            let isChildInSide = childCurrentDeck === Deck.Location.SIDE;
            
            if(isSameExactCard || isInvalidDestination && !isChildInSide) {
                continue;
            }
            let childOffset = child.offset();
            // let containerOffset = container.offset();
            let bounds = child.get(0).getBoundingClientRect();
            // let isLeftRightBounded = bounds.left <= myX && myX <= bounds.right;
            // let isTopBottomBounded = bounds.top <= myY && myY <= bounds.bottom;
            if(isBounded(myX, myY, bounds)) {
                focusedChild = child;
                break;
            }
        }
        
        let infoChild;
        for(let infoLabel of $(".container-info")) {
            // $(".container-info")
            let ilBounds = infoLabel.getBoundingClientRect();
            // console.log(myY <= ilBounds.top, [myX, myY], ilBounds);
            if(myY <= ilBounds.top) {
                infoChild = infoLabel;
                break;
                // if(!focusedChild) {
                    // focusedChild = $(infoLabel);
                // }
                // break;
            }
            // let scBounds = subContainer.getBoundingClientRect();
            // console.log(myX, myY, scBounds, isBounded(myX, myY, scBounds));
        }
        // console.log(".");
        // infoChild = $(infoChild);
        if(!focusedChild) {
            focusedChild = $(infoChild);
        }
        
        if(focusedChild) {
            focusedChild.addClass("focused");
        }
    };
    let onMouseUp = (e) => {
        composed.removeClass("dragging");
        //TODO: just handle it with a single listener
        $(window).unbind("mousemove", onMove);
        $(window).unbind("mouseup", onMouseUp);
        
        if(!focusedChild) {
            focusedChild = composed;
        }
        let myIndex = composed.data("index");
        let myDeck = composed.data("deck");
        let targetIndex = focusedChild.data("index");
        let targetDeck = focusedChild.data("deck");
        if(targetIndex === null) {
            deck.removeCard(myDeck, myIndex);
            deck.addCard(composed.data("id"), targetDeck);
        }
        else if(myDeck === targetDeck) {
            deck.moveInFrontOf(myDeck, myIndex, targetIndex);
        }
        else {
            deck.addCard(composed.data("id"), targetDeck, targetIndex + 1);
        }
        CardViewer.Editor.updateDeck();
    };
    $(window).mousemove(onMove);
    $(window).mouseup(onMouseUp);
};
CardViewer.Editor.recalculateView = function () {
    const MARGIN = 24;
    let windowHeight = $(window).height();
    
    let topPosition = CardViewer.Editor.MajorContainer.position().top;
    let max = windowHeight - topPosition - MARGIN;
    CardViewer.Editor.MajorContainer.children().css("height", max + "px");
    
    if(CardViewer.Elements.results) {
        let resultTop = CardViewer.Elements.results.position().top;
        let resultMax = windowHeight - resultTop - MARGIN;
        CardViewer.Elements.results.css("height", resultMax + "px");
    }
    
    CardViewer.Editor.DeckInstance.applyCSS();
};

CardViewer.composeResultCardPreview = function (card) {
    let img = $("<img class=img-result>").attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    
    let idText = card.id;
    let altText = `(~${card.submission_source})`;
    let id = $("<h4 class=result-id>")
        .contextmenu((e) => {
            e.preventDefault();
            idText = idText === card.id ? altText : card.id;
            id.text(idText);
        })
        .text(idText);
    let author = $("<h4 class=result-author>");
    if(card.username) {
        author.text(card.username);
    }
    else {
        //TCG card
        let subtitle = "Yu-Gi-Oh!";
        if(card.exu_import) subtitle += " Imported";
        author.append($("<em>").text(subtitle));
    }
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass("card-preview");
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let isPrivate = card.custom && card.custom > 1;
    
    if(isPrivate) {
        res.addClass("private");
        name.append($("<i>").text(" (private)"));
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "Scale = " + card.scale + "\n[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    let stats = $("<div>");
    
    let attribute = $("<img>").addClass("attribute");
    let marking = $("<div class=markings>");
    
    let linkArrows;
    if(card.card_type === "Monster") {
        attribute.attr("src", getAttribute(card.attribute))
        let kind = [];
        
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
        }
        
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        
        if(card.ability) {
            kind.push(card.ability);
        }
        
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
            linkArrows = $(
                "<p class=link-arrows>" +
                getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
                "</p>"
            );
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=importicon>");
    if(card.exu_ban_import) {
        importMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    
    if(card.exu_limit !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
    }
    
    if(importMarker.attr("src")) {
        marking.append($("<div>").append(importMarker));
    }
    if(banMarker.attr("src")) {
        marking.append($("<div>").append(banMarker));
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    // effect = 
    
    res.append($("<div class=result-inner>").append(id, name, img, attribute, linkArrows, marking, author, stats, effect
        // $("<table>").append(
            // $("<tr>").append(
                // $("<td class=result-img-holder>").append(img, attribute, marking),
                // $("<td class=result-effect>").append(effect)
            // )
        // )
    ));
    return res;
};

const LINK_ARROW_IMAGE_SOURCES = {
    [0b10000000]: "topLeft",
    [0b01000000]: "topCenter",
    [0b00100000]: "topRight",
    [0b00010000]: "middleRight",
    [0b00001000]: "bottomRight",
    [0b00000100]: "bottomCenter",
    [0b00000010]: "bottomLeft",
    [0b00000001]: "middleLeft",
};
const getLinkArrowImages = function (arrows) {
    let res = [];
    arrows = parseInt(arrows, 2);
    for(let i = 1; i <= 0b10000000; i <<= 1) {
        if((arrows & i) !== 0) {
            let arrowName = LINK_ARROW_IMAGE_SOURCES[i];
            let img = $("<img>")
                .addClass("arrow")
                .addClass(arrowName)
                .attr("src", getResource("marker", arrowName));
            res.push(img);
        }
    }
    return res;
};

CardViewer.composeResultDeckPreview = function (card) {
    // console.log(card);
    if(!card) {
        console.warn("No card passed to deck preview (" + card + ")");
        return $("");
    }
    card.src = card.src || (
        "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
    );
    
    let img = $("<img class=img-result>")
        .attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    
    let res = $("<div class=result>");
    // res.attr("title", card.name);
    res.addClass("editor-item");
    res.addClass("unselectable");
    // res.attr("id", "card" + card.id);
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    let isPrivate = card.custom && card.custom > 1;
    
    if(isPrivate) {
        res.addClass("private");
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
    // let stats = $("<div>");
    
    let attribute = $("<img class=result-attribute>");
    let marking = $("<div class=markings>");
    
    let stats = [];
    let linkArrows = [];
    if(card.card_type === "Monster") {
        attribute.attr("src", getAttribute(card.attribute));
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
            if(star === "Xyz") {
                marking.addClass("xyz");
            }
        }
        
        stats.push(
            $("<div>")
                .text(`ATK/${card.atk}`)
                .addClass("stat")
                .addClass("atk")
        );
        if(card.monster_color === "Link") {
            linkArrows = getLinkArrowImages(card.arrows);
        }
        else {
            stats.push(
                $("<div>")
                    .text(`DEF/${card.def}`)
                    .addClass("stat")
                    .addClass("def")
            );
        }
        
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.addClass("spelltrap");
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=importicon>");
    let pos = 0;
    if(card.exu_ban_import) {
        banMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_limit !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card.exu_limit]);
    }
    if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    else if(!card.custom && !card.tcg && card.ocg) {
        importMarker.addClass("wide");
        importMarker.attr("src", BANLIST_ICONS.ocg);
    }
    let hasBanMarker = !!banMarker.attr("src");
    let hasImportMarker = !!importMarker.attr("src");
    let iconPosition = 0;
    
    importMarker.toggle(hasImportMarker);
    if(hasImportMarker) {
        importMarker.addClass("icon" + iconPosition++);
    }
    
    banMarker.toggle(hasBanMarker);
    if(hasBanMarker) {
        banMarker.addClass("icon" + iconPosition++);
    }
    
    marking.prepend(attribute);
    
    res.append($("<div class=result-inner>").append(
        name, attribute, img, marking, banMarker, importMarker,
        ...linkArrows, ...stats
    ));
    res.ready(function () {
        let longer = name.width();
        let shorter = name.parent().width() - attribute.width() - 24;
        if(shorter >= longer) return;
        let scaleRatio = shorter / longer;
        name.css("transform", "scaleX(" + scaleRatio + ")");
    });
    
    //prevent dragable images
    res.find("img")
        .on("dragstart", (e) => e.preventDefault());
    
    return res;
};
// CardViewer.composeStrategy = CardViewer.composeResultDeckPreview;
CardViewer.composeStrategy = CardViewer.composeResultSmall;
CardViewer.excludeTcg = false;

CardViewer.Editor.updateDeck = function (deckInstance = CardViewer.Editor.DeckInstance) {
    CardViewer.Elements.deckEditor.empty();
    deckInstance.renderHTML(CardViewer.Elements.deckEditor);
    // CardViewer.Editor.setPreview(0);
};

CardViewer.Editor.saveLocalDeck = function () {
    CardViewer.SaveData.set("deck", CardViewer.Editor.DeckInstance.toSimpleObject());
};
CardViewer.Editor.loadLocalDeckIfAny = function () {
    let savedDeck = CardViewer.SaveData.get("deck");
    if(savedDeck) {
        Object.assign(CardViewer.Editor.DeckInstance, savedDeck);
        CardViewer.Editor.updateDeck();
        return true;
    }
    return false;
};