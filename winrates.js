const Winrates = {
    DataFiles: [
        "ladder_season_1.json",
        "ladder_season_3.json",
        "battleground_1.json",
        "battleground_2.json",
        "battleground_3.json",
        "battleground_4.json",
        "battleground_5.json",
        "battleground_6.json",
        "battleground_7.json",
        "battleground_8.json",
        "battleground_9.json",
    ],
    ArchetypeMatch: {
        "Yurei": {
            match: /Yurei/i,
            thumb: 1646199,
        },
        "Rowa Control": {
            match: /Elusive Power|Rowa, the Elusive Whisperer/i,
            thumb: 1756632,
        },
        "Time Thief": {
            match: /Time Thief|Chrono-Thief's Clock Tower|The Time Thieves/i,
            thumb: 9915,
        },
        "Chaos Performer": {
            match: /Chaos Performer/i,
            thumb: 1515101,
        },
        "Unchained": {
            match: /Unchained|Abomination's Prison/i,
            thumb: 10237,
        },
        "Conflagrant": {
            match: /Conflagrant|Ignite Gear|Ignescent/i,
            thumb: 2305803,
        },
        "Salamangreat": {
            match: /Salamangreat|Fury of Fire|Burning Draw|Fusion of Fire|Rising Fire/i,
            thumb: 9693,
        },
        "Powerpuff": {
            match: /Powerpuff|The City of Townsville/i,
            thumb: 1968946,
        },
        "Orcust": {
            match: /Orcust/i,
            thumb: 9481,
        },
        "Vendedda": {
            match: /Vendedda/i,
            src: "https://cdn.discordapp.com/attachments/678723223940104212/923418248987430962/2638391.png"
        },
        "PSY-Frame": {
            match: /PSY-Frame/i,
            thumb: 7590,
        },
        "Goo-T": {
            match: /Goo-T/i,
            thumb: 1119567,
        },
        "Fishin'": {
            match: /Fishin'/i,
            thumb: 2029468,
        },
        "Darkwater": {
            match: /Darkwater|Drowned Secrets of the Abyss|Omen of the Depths|Watery Grave/i,
            thumb: 1610982,
        },
        "Thunder Dragon": {
            match: /Thunder Dragon/i,
            thumb: 4382,
        },
        "Boehstoic": {
            match: /Boehstoic/i,
            thumb: 934840,
        },
        "Voltron": {
            match: /Voltron/i,
            thumb: 1182404,
        },
        "Contraption": {
            match: /Contraption/i,
            thumb: 2283949,
        },
        "Conqueror": {
            match: /Conqueror/i,
            thumb: 123829,
        },
        "Anti-Goo": {
            match: /Anti-Goo/i,
            thumb: 2159530,
        },
        "Phantom Knight": {
            match: /Phantom Knight/i,
            thumb: 1976423,
        },
        "Mekk-Knight": {
            match: /Mekk-Knight/i,
            thumb: 8957,
        },
        "Altergeist": {
            match: /Altergeist|Personal Spoofing/i,
            thumb: 9138,
        },
        "Skull Servant": {
            match: /Wight|Skull Servant/i,
            thumb: 2436,
        },
        "Forge Breaker": {
            match: /Forge Breaker/i,
            thumb: 2404101,
        },
        "Tacticore": {
            match: /Tacticore/i,
            thumb: 1582420,
        },
        "Generaider": {
            match: /Generaider/i,
            thumb: 10322,
        },
        "Nebulline": {
            match: /Nebulline/i,
            thumb: 1943901,
        },
        "Nemesin": {
            match: /Nemesin|Chaos Anticipation/i,
            thumb: 2672611,
        },
        "Chirurgeon": {
            match: /Chirurgeon|The Mad Doctor/i,
            thumb: 2451780,
        },
        "Dusk Brigade": {
            match: /Dusk Brigade/i,
            thumb: 2280731,
        },
        "Malicevorous": {
            match: /Malicevorous/i,
            thumb: 6076,
        },
        "Malevolessence": {
            match: /Malevolessence|Malevolessent|Jindoken/i,
            thumb: 1228067,
        },
        "Traptrix": {
            match: /Traptrix/i,
            thumb: 5953,
        },
        "Daemon Engine": {
            match: /Daemon Engine/i,
            thumb: 1536652,
        },
        "Megalith": {
            match: /Megalith/i,
            thumb: 10839,
        },
        "Erwormwood": {
            match: /Erwormwood/i,
            thumb: 2094554,
        },
        "Paleofrog": {
            match: /Paleozoic|Frog|Toad/i,
            thumb: 8231,
        },
        "Danger!": {
            match: /Danger!/i,
            thumb: 9550,
        },
        "Crystron": {
            match: /Crystron/i,
            thumb: 8195,
        },
        "Melodious": {
            match: /Melodious/i,
            thumb: 10511,
        },
        "EARTH Machine": {
            match: /Machina|Deus Ex|Infinitrack|Train/i,
            thumb: 9951,
        },
        "Mathmech": {
            match: /Mathmech/i,
            thumb: 10296,
        },
        "Kuuroma": {
            match: /Kuuroma/i,
            thumb: 1691740,
        },
        "Tri-Brigade": {
            match: /Tri-Brigade/i,
            thumb: 11051,
        },
        "Entropy Beast": {
            match: /Entropy Beast|Entropy King/i,
            thumb: 1573072,
        },
        "Adamancipator": {
            match: /Adamancipator/i,
            thumb: 10669,
        },
        "Drytron": {
            match: /Drytron/i,
            thumb: 11169,
        },
        "Straw Hat": {
            match: /Straw Hat/i,
            src: "https://cdn.discordapp.com/attachments/688189758135861257/923425766778241044/unknown.png",
        },
        "Cloudian": {
            match: /Cloudian/i,
            thumb: 9886,
        },
        "Cheezbeast": {
            match: /Cheezbeast/i,
            thumb: 2439168,
        },
        "Moira": {
            match: /Moira/i,
            thumb: 1974339,
        },
        "Tokyo Terror": {
            match: /Tokyo Terror/i,
            thumb: 1607455,
        },
    },
};

//let baseURL = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
let baseURL = "./";
window.ycgDatabase = baseURL + "ycg.json";
window.exuDatabase = baseURL + "db.json";
    
// column IDs
const ID_COLUMN = 0;
const NAME_COLUMN = 1;
const WINS_COLUMN = 2;
const TOTAL_COLUMN = 3;
const PERCENT_COLUMN = 4;

const showResultsForDataFile = async name => {
    $("#matched").empty();
    if(name === "") {
        $("#datafile-title").text("");
        return;
    }
    $("#datafile-title").text(name);
    
    let data = await fetch("./data/" + name);
    
    if(!data.ok) {
        $("#matched").text("Could not load file: ./data/" + name);
        return;
    }
    
    let json = await data.json();
    let ids = Object.keys(json);
    
    let matched = {};
    for(let name of Object.keys(Winrates.ArchetypeMatch)) {
        matched[name] = new Set();
    }
    
    let missingIds = new Set();
    
    for(let id of ids) {
        let card = CardViewer.Database.cards[id];
        if(!card) {
            // create a pseudo entry
            missingIds.add(id);
            card = CardViewer.Database.cards[id] = {
                name: json[id][NAME_COLUMN],
                id: id,
            };
            // continue;
        }
        for(let [name, { match }] of Object.entries(Winrates.ArchetypeMatch)) {
            if(match.test(card.name)) {
                matched[name].add(id);
                break;
            }
        }
    }
    
    for(let [name, { thumb, src }] of Object.entries(Winrates.ArchetypeMatch)) {
        let matches = [...matched[name]];
        
        let [ wins, total ] = matches
            .map(id => json[id])
            .reduce(
                ([ runningWins, runningTotal ], data) =>
                    [
                        runningWins + data[WINS_COLUMN],
                        runningTotal + data[TOTAL_COLUMN]
                    ],
                [ 0, 0 ]
            );
        
        // not played
        if(total === 0) {
            continue;
        }
        
        let rate = wins / total;
        let displayRate = Math.round(rate * 10000) / 100;
        displayRate = displayRate.toFixed(2) + "%";
        
        let outer = $("<div>");
        let div = $("<div class=\"unselectable deck-link\">");
        let inner = $("<div class=\"description\">");
        inner.toggle();
        outer.append(div, inner);
        
        outer.data("wins", wins);
        outer.data("total", total);
        outer.data("rate", rate);
        
        if(total < 30) {
            div.addClass("dubious");
        }
        
        // outer.text([...matches].map(id => CardViewer.Database.cards[id].name).join(";; "));
        if(!src) {
            let card = CardViewer.Database.cards[thumb] || {};
            src = card.src;
            if(!src) {
                src = "https://images.duelingbook.com/card-pics/" + card.id + ".jpg";
            }
        }
        
        let list = $("<ul>");
        for(let id of matches) {
            list.append($("<li>").text(
                [
                    CardViewer.Database.cards[id].name,
                    json[id][PERCENT_COLUMN]
                ].join(" ")
            ));
        }
        inner.append(list);
        
        /*
        inner.append(
            $("<p>").text(
                [...matches].map(id => [
                    CardViewer.Database.cards[id].name,
                    json[id][PERCENT_COLUMN]
                ].join(" ")).join("\n")
            )
        );*/
        
        div.append($("<img class=thumb>").attr("src", src));
        div.append($("<div>").append(
            $("<p>").text(`${name}`),
            $("<p class=subheading>").text(`${wins} \u00B7 ${total} \u00B7 ${displayRate}`)
        ));
        div.click(() => {
            inner.toggle();
            div.parent().toggleClass("expanded");
        });
        
        $("#matched").append(outer);
    }
    $("#matched > *")
        .sort((a, b) => $(b).data("rate") - $(a).data("rate"))
        .appendTo("#matched");
    
    console.warn("Missing ids:", missingIds);
};

window.addEventListener("load", async function () {
    let dfInput = $("#datafile-input");
    // for(let name of Winrates.DataFiles) {
        // dfInput.append($("<option>").text(name));
    // }
    
    await CardViewer.Database.initialReadAll(ycgDatabase, exuDatabase);
    CardViewer.excludeTcg = false;
    CardViewer.showImported = true;
    
    let onChange = function () {
        showResultsForDataFile(this.value);
    };
    
    dfInput.change(onChange);
    onChange.call(dfInput[0]);
});