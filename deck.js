const CARD_BASE_WIDTH = 813;
const CARD_BASE_HEIGHT = 1185;
const MAX_WIDTHS = [ 40, 10, 10 ];
class Deck {
    constructor(main = [], side = [], extra = [], editable = true) {
        this.decks = [
            main,
            side,
            extra
        ];
        this.target = null;
        this.deckWidthInCards = 10;
        this.editable = editable;
    }
    
    addCard(card, location = 0) {
        let destDeck = this.decks[location];
        destDeck.push(card);
    }
    
    applyCSS() {
        if(!this.target) {
            return;
        }
        const deckWidthInCards = this.deckWidthInCards;
        let width = this.target.width() - 30;
        let marginWidth = 5;
        let unitWidth = width - (deckWidthInCards - 1) * marginWidth;
        unitWidth /= deckWidthInCards;
        let totalWidth = unitWidth + marginWidth;
        
        let scaleRatio = unitWidth / CARD_BASE_WIDTH;
        let unitHeight = CARD_BASE_HEIGHT * scaleRatio;
        let totalHeight = unitHeight + marginWidth;
        
        let j = 0;
        let cIndex = 0;
        for(let container of this.target.children()) {
            let i = 0;
            let multiplier = 1;
            if(this.decks[cIndex].length > MAX_WIDTHS[cIndex]) {
                multiplier = 0.64;//about 2/3
            }
            let containerWidth = Math.floor(deckWidthInCards / multiplier);
            console.log(containerWidth);
            for(let card of $(container).children()) {
                card = $(card);
                card.css("left", i * multiplier * totalWidth);
                card.css("top", j * totalHeight);
                card.css("transform", `scale(${scaleRatio})`);
                i++;
                if(i >= containerWidth) {
                    i = 0;
                    j++;
                }
            }
            if(i) j++;
            j += 0.2;
            cIndex++;
        }
    }
    
    applyHoverPreview(composed, id) {
        let hoverTimer = null;
        let setPreviewToThis = () => CardViewer.Editor.setPreview(id);
        composed.click(setPreviewToThis);
        composed.hover(() => {
            if(hoverTimer !== null) {
                // only set hover once
                return;
            }
            hoverTimer = setTimeout(setPreviewToThis, 100);
        });
        composed.mouseleave(() => {
            console.log("leaving");
            clearTimeout(hoverTimer);
            hoverTimer = null;
        });
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
        
        for(let deck of this.decks) {
            let container = $("<div class=sub-deck-container>");
            for(let id of deck) {
                let card = CardViewer.Database.cards[id];
                let composed = CardViewer.composeStrategy(card);
                this.applyHoverPreview(composed, id);
                container.append(composed);
            }
            target.append(container);
        }
        
        this.applyCSS();
    }
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
CardViewer.Editor.recalculateView = function () {
    let topPosition = CardViewer.Editor.MajorContainer.position().top;
    
    let max = $(window).height() - topPosition - 24;
    
    CardViewer.Editor.MajorContainer.children().css("height", max + "px");
    
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
    
    let attribute = $("<img>");
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
    
    // effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    
    res.append($("<div class=result-inner>").append(id, name, img, linkArrows, marking, author, stats, effect
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
        console.warn("No card passed to deck preview");
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
    // console.log(res);
    // res.on("load", function () {
        // console.log("Loaded!");
    // });
    res.ready(function () {
        let longer = name.width();
        let shorter = name.parent().width() - attribute.width() - 24;
        if(shorter >= longer) return;
        let scaleRatio = shorter / longer;
        name.css("transform", "scaleX(" + scaleRatio + ")");
        console.log(longer, shorter);
    });
    return res;
};
CardViewer.composeStrategy = CardViewer.composeResultDeckPreview;

CardViewer.Editor.updateDeck = function (deckInstance = CardViewer.Editor.DeckInstance) {
    CardViewer.Elements.deckEditor.empty();
    CardViewer.Editor.DeckInstance.renderHTML(CardViewer.Elements.deckEditor);
    CardViewer.Editor.setPreview(0);
};