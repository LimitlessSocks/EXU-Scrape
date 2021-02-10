const WebSocket = require("ws");
const fs = require("fs");

// doesn't work since we... don't have a certificate or anything ^^"
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

const clientUri = "wss://duel.duelingbook.com:8443";

const ws = new WebSocket(clientUri, {
    origin: "https://duelingbook.com"
});

const Send = (obj) => 
    ws.send(JSON.stringify(obj));

const logout = () => 
    Send({"action":"End all sessions"});

// defaults
    const credentials = fs.readFileSync("credentials.txt")
        .toString()
        .split(/\r?\n/);

    function randomHex() {
        var str = "";
        var arr = ["a","b","c","d","e","f","g","h","i","j","k","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];
        for (var i = 0; i < 32; i++) {
            str += arr[Math.floor(Math.random() * arr.length)];
        }
        return str;
    };
    let db_id;
    function getDbId() {
        try {
            if (localStorage.getItem("db_id")) {
                db_id = localStorage.getItem("db_id");
            }
        }
        catch(e) {
            console.error(e);
        }
        return db_id;
    };


    let username = credentials[0];
    let password = credentials[1];
    db_id = getDbId() ||
        "yub4vzgoi51dwe1vvryou6tg1e1ar0xu";
    let session_id = randomHex();
    let VERSION = 468;

ws.on('open', function open() {
    console.log("Opened websocket connection!");
    Send({
        "action":       "Connect",
        "username":     username,
        "password":     password,
        "db_id":        db_id,
        "session":      session_id,
        "administrate": false,
        "version":      VERSION,
        "capabilities": "", 
        "remember_me":  0,
        "connect_time": 0,
        "fingerprint":  0,
        "html_client":  true,
        "mobile":       false,
        "browser":      "Firefox",
        "platform":     "PC",
    });
});

let userSearch = "LimitlessSocks";
let saved_search = {
    "name": "",
    "effect": userSearch,
    "card_type": "",
    "monster_color": "",
    "type": "",
    "ability": "",
    "attribute": "",
    "level_low": "",
    "level_high": "",
    "atk_low": "",
    "atk_high": "",
    "def_low": "",
    "def_high": "",
    "limit": "",
    "order": "New First",
    "pendulum": 0,
    "scale_low": "",
    "scale_high": "",
    "tcg": 0,
    "ocg": 0,
    "ocg_list": 0,
    "arrows": "00000000",
    "custom": 1,
};
let customSearch = {
    action: "Search cards",
    search: saved_search,
    page: 1
};
let stateInfo = {
    maxPages: null,
    initialized: false,
    collected: [],
};
const end = () => {
    console.log("Starting to end process");
    let json = JSON.stringify(stateInfo.collected);
    fs.writeFileSync("users/" + userSearch + ".json", json);
    console.log("Wrote JSON!");
    
    console.log("Terminating...");
    process.exit(0);
};
const collectCards = (data) => {
    // console.log(data);
    if(!stateInfo.initialized) {
        stateInfo.total = data.total;
        stateInfo.maxPages = Math.ceil(stateInfo.total / 20)
        stateInfo.initialized = true;
    }
    console.log("Collected page " + customSearch.page + " of " + stateInfo.maxPages);
    stateInfo.collected.push(...data.cards);
    customSearch.page++;
    if(customSearch.page <= stateInfo.maxPages) {
        Send(customSearch);
    }
    else {
        end();
    }
};
const main = () => {
    Send(customSearch);
};

ws.on('close', function close() {
    console.log('Disconnected');
});

ws.on('message', function incoming(data) {
    // console.log(data);
    try {
        data = JSON.parse(data);
        console.log("Server impulse : " + data.action);
        if(data.action === "Connected") {
            console.log("Connected to DuelingBook server!");
            main();
        }
        if(data.action === "Search cards") {
            collectCards(data);
        }
    }
    catch(e) {
        console.error("Problem parsing incoming JSON");
    }
});
