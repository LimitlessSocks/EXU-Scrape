const focusMenu = (selector) => {
    $("#menu-container > div").toggle(false);
    $(selector).toggle(true);
};

const showStart = () => {
    let j = JSON.parse(localStorage.EXU_CON_BESTS);
    let table = $("<table>");
    table.append($("<tr>").append(
        $("<th>").text("Question count"),
        $("<th>").text("Record"),
    ));
    let rows = [];
    for(let [ key, time ] of Object.entries(j)) {
        let [ count, correct ] = key.split(",");
        rows.push([
            `${count}`,
            `${correct}/${count} in ${time}s`,
            count,
            correct,
            time
        ]);
    }
    rows.sort((a, b) => {
        return (b[2] - a[2]) || (b[3] - a[3]) || (b[4] - a[4]);
    });
    let map = new Map();
    for(let data of rows) {
        let arr = map.get(data[2]) ?? [];
        arr.push(data);
        map.set(data[2], arr);
    }
    for(let [ key, entries ] of map) {
        let display = entries.map(e => e[1]).join("; ");
        table.append($("<tr>").append(
            $("<td>").text(key),
            $("<td>").text(display),
        ));
    }
    $("#run-history").empty().append(table);
    focusMenu("#menu-start");
};

const getLetterGrade = (ratio) => {
    if(ratio < 0.6) {
        return "d";
    }
    else if(ratio < 0.7) {
        return "c";
    }
    else if(ratio < 0.8) {
        return "b";
    }
    else if(ratio < 0.9) {
        return "a";
    }
    else if(ratio < 1) {
        return "s";
    }
    else {
        return "ss";
    }
};

const showStats = (stats) => {
    const description = $("#description");
    const grade = $("#grade");
    // const share = $("#share");
    
    let { correct, time, count } = stats;
    let ratio = correct / count;
    let displayPercent = (correct / count * 100).toFixed(2);
    
    let letter = getLetterGrade(ratio);
    grade.empty()
    .append(
        $("<span class=letter>").text(letter.toUpperCase()),
        " " + displayPercent + "%"
    ).attr("class", letter + "-grade");
    description.text(`${correct} correct of ${count} total in ${time} seconds.`);
    
    focusMenu("#menu-stats");
    
    let j = JSON.parse(localStorage.EXU_CON_BESTS);
    let key = count + "," + correct;
    j[key] = j[key] ?? Infinity;
    j[key] = Math.min(+j[key], +time).toString();
    localStorage.EXU_CON_BESTS = JSON.stringify(j);
    
    $("#back").off().click(() => {
        // focusMenu("#menu-start");
        showStart();
    });
};

const getRandomCard = () => {
    let ids = Object.keys(CardViewer.Database.cards);
    let id = ids[Math.floor(Math.random() * ids.length)];
    let card = CardViewer.Database.cards[id];
    card.src = card.src || (
        "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
    );
    return card;
};

const startGame = async (options = {}) => {
    $("#menu-game button").attr("disabled", true);
    
    const custom = $("#choose-custom");
    const notCustom = $("#choose-not-custom");
    const message = $("#message");
    const timer = $("#timer");
    const progress = $("#progress");
    const guessImage = $("#guess-image");
    
    guessImage.attr("src", "https://www.duelingbook.com/images/low-res/0.jpg");
    timer.text("----");
    progress.text("Loading...");
    message.empty();
    
    focusMenu("#menu-game");
    
    let { count=10 } = options;
    let current = 1;
    let correct = 0;
    let finalTime = null;
    let running = true;
    
    let choice = {
        custom: true,
        id: 0,
    };
    
    let randomCards = [];
    while(randomCards.length < count) {
        let r = getRandomCard();
        if(r.rush) {
            continue;
        }
        randomCards.push(r);
    }
    
    let preLoadImages = () => new Promise(async (resolve, reject) => {
        Promise.all(randomCards.map(card => new Promise((resolve, reject) => {
            let img = new Image();
            img.src = card.src;
            img.onload = () => {
                resolve();
            }
        }))).then(resolve);
    });
    
    let updateGuessImage = () => {
        let idx = current - 1;
        let card = randomCards[idx];
        choice.custom = !!card.custom;
        choice.id = card.id;
        guessImage.attr("src", card.src);
        console.log(choice);
    };
    
    let timeStart;
    let updatePromises = [];
    let updateTimer = () => {
        let now = new Date().valueOf();
        let delta = now - timeStart;
        let timerText = (delta / 1000).toFixed(2);
        if(running) {
            timer.text(timerText);
            requestAnimationFrame(updateTimer);
        }
        else {
            finalTime = timerText;
            for(let resolve of updatePromises) {
                resolve(finalTime);
            }
            updatePromises.splice(0);
        }
    };
    let startTimer = () => {
        timeStart = new Date().valueOf()
        updateTimer();
    };
    let waitForTimeValue = () => new Promise((resolve, reject) => {
        if(finalTime !== null) {
            resolve(finalTime);
        }
        else {
            updatePromises.push(resolve);
        }
    });
    let updateProgress = () => {
        progress.text(`${current}/${count} (${correct}/${current - 1} correct)`);
    };
    
    const sendMessage = (content, style={}) => {
        // message.empty();
        let m = $("<p class=new-message>").text(content).css(style);
        message.append(m);
        setTimeout(() => m.remove(), 400);
    };
    
    const onButtonClick = function (isCustom) {
        let answeredRight = isCustom === choice.custom;
        if(answeredRight) {
            correct++;
            sendMessage("Correct!", { color: "green" });
        }
        else {
            sendMessage("Incorrect", { color: "red" });
        }
        if(current >= count) {
            running = false;
            waitForTimeValue().then((time) => {
                cleanUp();
                showStats({
                    time, correct, count,
                });
            }).catch(console.error);
        }
        else {
            current++;
            updateGuessImage();
            updateProgress();
        }
    };
    let liftedKey = true;
    let onKeyDown = ({ key }) => {
        if(!liftedKey) return;
        liftedKey = false;
        if(key === "a" || key === "ArrowLeft") {
            onButtonClick(true);
        }
        else if(key === "d" || key === "ArrowRight") {
            onButtonClick(false);
        }
        else {
            // we don't care about other keys
            liftedKey = true;
        }
    };
    let onKeyUp = ({ key }) => {
        liftedKey = true;
    };
    
    const cleanUp = function () {
        custom.off();
        notCustom.off();
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
    };
    
    await preLoadImages();
    custom.click(() => {
        onButtonClick(true);
    });
    notCustom.click(() => {
        onButtonClick(false);
    });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    $("#menu-game button").attr("disabled", false);
    updateProgress();
    updateGuessImage();
    startTimer();
};

window.addEventListener("load", async function () {
    localStorage.EXU_CON_BESTS = localStorage.EXU_CON_BESTS || "{}";
    showStart();
    
    $("#start").attr("disabled", true);
    await CardViewer.Database.initialReadAll("./db.json");
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    $("#start").attr("disabled", false);
    
    $("#start").click(() => {
        let count = $("#number-questions").val();
        if(count && count >= 1) {
            startGame({
                count: count,
            });
        }
    });
    window.addEventListener("keydown", ({ key }) => {
        // console.log(key);
        if(key === " ") {
            let anyButton = $("#back:visible, #start:visible")[0];
            if(anyButton) {
                anyButton.click();
            }
        }
    });
});