let loadDatabase = async function () {
    await CardViewer.Database.initialReadAll("./db.json");
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
};

let onLoad = async function () {
    await loadDatabase();
    
    const playrateSummary = await fetch("./data/playrate-summary.json").then(req => req.json());
    CardViewer.Playrates.Summary = playrateSummary;
    
    CardViewer.Elements.searchParameters = $("#searchParameters, .extraParamaters");
    
    CardViewer.Elements.cardType = $("#cardType");
    CardViewer.Elements.cardLimit = $("#cardLimit");
    CardViewer.Elements.cardAuthor = $("#cardAuthor");
    CardViewer.Elements.search = $("#search");
    CardViewer.Elements.results = $("#results");
    CardViewer.Elements.autoSearch = $("#autoSearch");
    CardViewer.Elements.cardName = $("#cardName");
    CardViewer.Elements.resultCount = $("#resultCount");
    CardViewer.Elements.cardDescription = $("#cardDescription");
    CardViewer.Elements.currentPage = $(".currentPage");
    CardViewer.Elements.pageCount = $(".pageCount");
    CardViewer.Elements.nextPage = $(".nextPage");
    CardViewer.Elements.previousPage = $(".previousPage");
    CardViewer.Elements.resultNote = $("#resultNote");
    CardViewer.Elements.cardId = $("#cardId");
    CardViewer.Elements.cardCategory = $("#cardCategory");
    CardViewer.Elements.cardVisibility = $("#cardVisibility");
    CardViewer.Elements.ifMonster = $(".ifMonster");
    CardViewer.Elements.ifSpell = $(".ifSpell");
    CardViewer.Elements.ifTrap = $(".ifTrap");
    CardViewer.Elements.ifLink = $(".ifLink");
    CardViewer.Elements.ifPendulum = $(".ifPendulum");
    CardViewer.Elements.cardSpellKind = $("#cardSpellKind");
    CardViewer.Elements.cardTrapKind = $("#cardTrapKind");
    CardViewer.Elements.monsterStats = $("#monsterStats");
    CardViewer.Elements.spellStats = $("#spellStats");
    CardViewer.Elements.trapStats = $("#trapStats");
    CardViewer.Elements.cardLevel = $("#cardLevel");
    CardViewer.Elements.cardMonsterCategory = $("#cardMonsterCategory");
    CardViewer.Elements.cardMonsterAbility = $("#cardMonsterAbility");
    CardViewer.Elements.cardMonsterType = $("#cardMonsterType");
    CardViewer.Elements.cardMonsterAttribute = $("#cardMonsterAttribute");
    CardViewer.Elements.cardATK = $("#cardATK");
    CardViewer.Elements.cardDEF = $("#cardDEF");
    CardViewer.Elements.cardPendScale = $("#cardPendScale");
    CardViewer.Elements.cardLevelCompare = $("#cardLevelCompare");
    CardViewer.Elements.cardATKCompare = $("#cardATKCompare");
    CardViewer.Elements.cardDEFCompare = $("#cardDEFCompare");
    CardViewer.Elements.cardPendScaleCompare = $("#cardPendScaleCompare");
    CardViewer.Elements.playRate = $("#cardPlayRate");
    CardViewer.Elements.playRateCompare = $("#cardPlayRateCompare");
    // CardViewer.Elements.toTopButton = $("#totop");
    CardViewer.Elements.saveSearch = $("#saveSearch");
    CardViewer.Elements.clearSearch = $("#clearSearch");
    CardViewer.Elements.searchSortBy = $("#searchSortBy");
    CardViewer.Elements.searchSortOrder = $("#searchSortOrder");
    CardViewer.Elements.includeCustoms = $("#includeCustoms");
    CardViewer.Elements.includeYcg = $("#includeYcg");
    
    CardViewer.Search.snapNavigation = true;
    CardViewer.Elements.search.click(CardViewer.submit);
    CardViewer.Elements.previousPage.click(CardViewer.Search.previousPage);
    CardViewer.Elements.nextPage.click(CardViewer.Search.nextPage);
    
    CardViewer.addCurrentPageListener();

    const updateInputDisplay = () => CardViewer.submit();

    CardViewer.attachGlobalSearchOptions(
        $("#showOptions"),
        {
            monkeyPatch(data) {
                document.querySelector(".title a").textContent = `${data.name}`;
                CardViewer.Elements.includeYcg.prop("checked", true);
                updateInputDisplay();
            },
            denseToggle: updateInputDisplay,
        },
    );
    
    /*
    CardViewer.Elements.toTopButton.click(() => {
        $("html, body").animate(
            { scrollTop: "0px" },
            { duration: 200, }
        );
    });
    */
    
    const unsavedValues = [ "", "any" ];
    const unsavedKeys = [ "imported", "notImported", "alsoImported" ];
    const shouldIgnoreKeyValue = (key, value) =>
        unsavedValues.indexOf(value) !== -1
        || unsavedKeys.indexOf(key) !== -1
        || key === CardViewer.format
        || (key === "retrain" && !value)
        || (key.indexOf("Compare") !== -1 && value === "equal");
        
    CardViewer.Elements.saveSearch.click(() => {
        let strs = [];
        for(let [key, value] of Object.entries(CardViewer.query())) {
            if(!shouldIgnoreKeyValue(key, value)) {
                if(key === "visibility" && Array.isArray(value)) {
                    // ignore excess values
                    value = value[0];
                }
                console.log(key, "uwu", value);
                strs.push(key + "=" + value);
            }
        }
        // alert("saving " + JSON.stringify(strs));
        if(strs.length || window.location.search) {
            window.location.search = encodeURI(strs.join(","))
                .replaceAll(".", "%2E")
                .replaceAll(",", "%2C");
        }
    });
    
    const KeyToElement = {
        name:               CardViewer.Elements.cardName,
        effect:             CardViewer.Elements.cardDescription,
        type:               CardViewer.Elements.cardType,
        sortBy:             CardViewer.Elements.searchSortBy,
        sortOrder:          CardViewer.Elements.searchSortOrder,
        limit:              CardViewer.Elements.cardLimit,
        id:                 CardViewer.Elements.cardId,
        author:             CardViewer.Elements.cardAuthor,
        // retrain:         CardViewer.Elements.cardIsRetrain,
        category:           CardViewer.Elements.cardCategory,
        visibility:         CardViewer.Elements.cardVisibility,
        monsterType:        CardViewer.Elements.cardMonsterType,
        monsterAttribute:   CardViewer.Elements.cardMonsterAttribute,
        monsterCategory:    CardViewer.Elements.cardMonsterCategory,
        monsterAbility:     CardViewer.Elements.cardMonsterAbility,
        level:              CardViewer.Elements.cardLevel,
        levelCompare:       CardViewer.Elements.cardLevelCompare,
        atk:                CardViewer.Elements.cardATK,
        atkCompare:         CardViewer.Elements.cardATKCompare,
        def:                CardViewer.Elements.cardDEF,
        defCompare:         CardViewer.Elements.cardDEFCompare,
        playRate:           CardViewer.Elements.playRate,
        playRateCompare:    CardViewer.Elements.playRateCompare,
        pendScale:          CardViewer.Elements.cardPendScale,
        pendScaleCompare:   CardViewer.Elements.cardPendScaleCompare,
    };
    
    const parseStringValue = (str) => {
        if(str === "true" || str === "false") {
            return str === "true";
        }
        
        let tryInt = parseInt(str);
        if(!Number.isNaN(tryInt)) {
            return tryInt;
        }
        
        return str;
    }
    
    if(window.location.search) {
        let searchString = decodeURI(
            window.location.search.replaceAll("%2C", ",")
        )
        CardViewer.firstTime = false;
        let type = null;
        for(let pair of searchString.slice(1).split(",")) {
            pair = pair.replace(
                /%([0-9A-Fa-f]{2})/g,
                (_, $1) => String.fromCharCode(parseInt($1, 16))
            );
            let [ key, value ] = pair.split(/=(.+)?/);
            let el = KeyToElement[key];
            if(!el) {
                if(key === "kind") {
                    if(type === "spell") {
                        el = CardViewer.Elements.cardSpellKind
                    }
                    else {
                        el = CardViewer.Elements.cardTrapKind;
                    }
                }
                else if(key === "arrowMask") {
                    let buttons = $(".arrow-button");
                    let mask = parseInt(value, 2);
                    
                    for(let i = 0; i < flatArrow.length; i++) {
                        let subMask = flatArrow[i];
                        // console.log(subMask, i, flatArrow[i], mask);
                        if(subMask && (mask & subMask) === subMask) {
                            $(buttons[i]).toggleClass("toggled");
                        }
                    }
                    continue;
                }
                else if(key === "exactArrows") {
                    if(value === "true") {
                        $("#equals").toggleClass("toggled");
                    }
                    continue;
                }
                else if(key === "group" || key === "alsoImported" || key === CardViewer.format) {
                    continue;
                }
            }
            value = parseStringValue(value);
            if(!el) {
                console.error("Undefined property " + key);
                continue;
            }
            if(el.is("[type='checkbox']")) {
                el.prop("checked", value);
            }
            else {
                el.val(value);
            }
            if(key === "type") {
                type = value;
            }
        }
    }
    
    CardViewer.Elements.autoSearch.change(function () {
        CardViewer.autoSearch = this.checked;
    });
    CardViewer.Elements.autoSearch.change();
    
    CardViewer.setUpTabSearchSwitching();
    CardViewer.setUpArrowToggle();
    
    let allInputs = CardViewer.setUpAllInputs();
    
    // check if any input data
    for(let el of allInputs) {
        let hasValue = false;
        el = $(el);
        if(el.is("select")) {
            if(el.val() != el.children().first().val()) {
                hasValue = true;
            }
        }
        else if(el.is("input[type=checkbox]")) {
            console.log(el.attr("checked"));
            hasValue = el.is(":checked");
        }
        else {
            hasValue = el.val() != "";
        }
        if(hasValue) {
            CardViewer.firstTime = false;
            break;
        }
    }
    
    CardViewer.submit();
    
    let updateBackground = () => {
        if(localStorage.getItem("EXU_REDOX_MODE") === "true") {
            $("html").css("background-image", "url(\"" + getResource("bg", "godzilla") + "\")");
            $("html").css("background-size", "100% 100%");
        }
        else {
            $("html").css("background-image", "");
            $("html").css("background-size", "");
        }
    };
    
    $(window).keydown((ev) => {
        let orig = ev.originalEvent;
        if(ev.altKey && ev.key === "R") {
            let wasActive = localStorage.getItem("EXU_REDOX_MODE") === "true";
            localStorage.setItem("EXU_REDOX_MODE", !wasActive);
            updateBackground();
        }
    });
    
    updateBackground();
    
    const purposeFilter = $("#purposeFilter");
    
    for(let obj of Object.values(CardGroups)) {
        let { id, name, data } = obj;
        let button = $("<button>");
        button.text(name);
        button.click(() => {
            CardViewer.firstTime = false;
            CardViewer.Elements.resultNote.text("This is an incomplete list. You can help by finding new cards in this category that are semi-generic, that is, able to be used by more than 1 particular strategy.");
            CardViewer.demonstrate((card) => data.indexOf(card.id) !== -1);
        });
        button.contextmenu((e) => {
            window.location.search = "group=" + id;
            e.preventDefault();
        });
        button.toggle();
        purposeFilter.append(button);
        obj.button = button;
    }
    
    let match = window.location.search.match(/group=(\w+)/);
    if(match) {
        // console.log(match[1]);
        CardGroups[match[1]].button.click();
    }
    
    $("#expandPurpose, #contractPurpose").click(function () {
        $("#purposeFilter button").toggle();
    });
};

window.addEventListener("load", onLoad);