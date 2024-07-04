const WebSocket = require("ws");
const fs = require("fs");
const FormData = require("form-data");
const nodeCleanup = require("node-cleanup");

// doesn't work since we... don't have a certificate or anything ^^"
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

const clientUri = "wss://duel.duelingbook.com:8443";

const ws = new WebSocket(clientUri, {
    origin: "https://duelingbook.com",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-WebSocket-Version": 13,
        // "Sec-WebSocket-Extensions":
    },
});

const Send = (obj) => {
    // console.log("Our send:", obj.action);
    // console.log(JSON.stringify(obj));
    return ws.send(JSON.stringify(obj));
};


const logout = () => {
    console.log("Logging out...");
    Send({"action":"End all sessions"});
};

nodeCleanup((exitCode, signal) => {
    console.log("Exiting:", exitCode, "/", signal);
    
    logout();
    // waitForMessage().then(() => {
        // process.kill(process.pid, signal);
    // });
    nodeCleanup.uninstall();
    
    return false;
});

const randomHex = function() {
    var str = "";
    var arr = ["a","b","c","d","e","f","g","h","i","j","k","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];
    for (var i = 0; i < 32; i++) {
        str += arr[Math.floor(Math.random() * arr.length)];
    }
    return str;
};
let db_id;
const getDbId = function getDbId() {
    return; // we don't need to go through this error each time
    try {
        if (localStorage.getItem("db_id")) {
            // won't work on node but whatever
            db_id = localStorage.getItem("db_id");
        }
    }
    catch(e) {
        console.error(e);
    }
    return db_id;
};

const AppState = {
    Ready: {
        socketOpen: false,
        loggedIn: false,
    },
    loginToken: null,
    user_id: null,
    misc: {
        db_id: getDbId() || "xvvng9m3vaq8m0zbxw6xng2xtr8o4r3j",
        session_id: '14mgjd2559624ce9d7xy7ycvqv5vory2',//randomHex(),
        VERSION: 785, // 531, // 485, //468
    }
};

// XXX: there is probably some weird caching fuckery
// changing either load key or session_id to be true random doesn't work here
// i probably need to confirm it with the server somehow?
const getLoadKey = () =>
    // randomHex();
    '98d3845dbc88a4db1192c327e162c8e3';
    // "b9735688a9c468f2f6aa6d73a1e9dd39";

const getLoadKeyPart = () => {
  try {
    const t = getLoadKey();
    const r = t[5] + t[26] + t[9] + t[20] + t[15];
    return btoa(r);
  }
  catch (n) {
    return "";
  }
};

const [
    FP1,
    FP2,
    FP3,
    FP4,
    FP5,
    FP6,
    FP7,
    FP8
] = [
    3302761185,
    2360954871,
    3463760292,
    663270988,
    "2665949687",
    "2487974568",
    "392985206",
    "564906810"
];

const sendHeartbeat = (first=false) => {
    // TODO: check if we need Searching check here
    console.log("Sending heartbeat");
    if(first) {
        Send({
            "action":   "Heartbeat",
        });
    }
    else {
        Send({
            "action":   "Heartbeat",
            // actual ping value seems to be much less than getTime() would imply; 132-135
            "ping":     133,//new Date().getTime(),
        });
    }
    setTimeout(sendHeartbeat, 30000);
};

const waitDelay = time => new Promise((resolve, reject) => {
    setTimeout(resolve, time);
});

const cards_fingerprint = 598;

const onAppStateReadyChange = async () => {
    if(AppState.Ready.socketOpen && AppState.Ready.loggedIn) {
        console.log("Starting!", AppState.Ready);
        let { username, password } = AppState.loginToken;
        // console.log(username, password);
        let { db_id, session_id, VERSION } = AppState.misc;
        
        /*
        // first, log in
        console.log("Sending Logged in", AppState.user_id);
        Send({
            "action":       "Logged in",
            "user_id":      AppState.user_id,
            "username":     username,
            "password":     password,
            "admin":        false,
            "firstLogin":   false,
            "logins":       null,
        });
        
        // wait a tad
        await waitDelay(500);
        */
        
        // then, connect
        console.log("Sending Connect");
        let connectAction = {
            "action":       "Connect",
            "username":     username,
            "password":     password,
            "db_id":        db_id,
            "session":      session_id,
            "loadkey":      getLoadKey(),
            "part":         getLoadKeyPart(),
            "administrate": false,
            "version":      VERSION,
            "capabilities": "", 
            "remember_me":  0,
            "connect_time": 0,
            "fingerprint":  cards_fingerprint,
            "html_client":  true,
            "mobile":       false,
            "browser":      "Firefox",
            "platform":     "PC",
            "degenerate":   false,
            "revamped":     true,
            "zoom":         125,
            "url":          "https://www.duelingbook.com/",
            fp1: FP1.toString(),
            fp2: FP2.toString(),
            fp3: FP3.toString(),
            fp4: FP4.toString(),
            fp5: FP5,
            fp6: FP6,
            fp7: FP7,
            fp8: FP8,
        };
        
        Send(connectAction);
        
        
        
        /*
        Send();
        */
        // sendHeartbeat(true);
    }
    else {
        console.log("Still waiting to start:", AppState.Ready);
    }
};

const startProcess = () => {
    const credentials = fs.readFileSync("credentials.txt")
        .toString()
        .split(/\r?\n/);
    
    let username = credentials[0];
    let password = credentials[1];
    let user_id = +credentials[2];
    AppState.user_id = user_id;
    
    const URL_START = "https://www.duelingbook.com/";
    
    let fd = new FormData();
    fd.append("username", username);
    fd.append("password", password);
    fd.append("remember_me", "false");
    fd.append("db_id", AppState.misc.db_id);
    fd.append("session_id", AppState.misc.session_id);
    fd.append("browser", "Firefox");
    fd.append("fp1", FP1);
    fd.append("fp2", FP2);
    fd.append("fp3", FP3);
    fd.append("fp4", FP4);
    FP5 && fd.append("fp5", FP5);
    FP6 && fd.append("fp6", FP6);
    FP7 && fd.append("fp7", FP7);
    FP8 && fd.append("fp8", FP8);
    
    console.log("About to submit form");
    fd.submit(URL_START + "php-scripts/login-user.php", function(err, res) {
        // console.log("Hmm", res);
        if(err) {
            console.error("Error on attempt to submit fd:", err);
        }
        res.resume();
        
        let body = "";
        res.on("readable", function () {
            let data = res.read();
            if(data) {
                body += data;
            }
        });
        res.on("end", function () {
            console.log("Received login token");
            AppState.Ready.loggedIn = true;
            console.log("!!!", body);
            AppState.loginToken = JSON.parse(body);
            onAppStateReadyChange();
        });
        res.on("error", function (...args) {
            console.error("Error while reading data:", args);
        });
    });
};

ws.on('open', async function open() {
    console.log("Opened websocket connection!");
    AppState.Ready.socketOpen = true;
    await onAppStateReadyChange();
    startProcess();
});

let userSearch = process.argv[2] || "LimitlessSocks";
console.log(">>>>>>>>>>>>>>>>>>>", userSearch);
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
    collected: {},
};
const end = () => {
    console.log("Starting to end process");
    let json = JSON.stringify(stateInfo.collected);
    fs.writeFileSync("users/" + userSearch + ".json", json);
    console.log("Wrote JSON!");
    
    logout();
    
    console.log("Terminating...");
};
const TYPE_REPLACE = /\(.*?This (?:card|monster)'s original Type is treated as (.+?) rather than (.+?)[,.].*?\)/;
const ARCHETYPE_TREATMENT = /\(.*This card is always treated as an? "(.+?)" card.*\)/;
const CUSTOM_PICS_START = "https://www.duelingbook.com/./images/custom-pics/";
const CARD_IMAGES_START = "https://www.duelingbook.com//images/low-res/";
const appendCards = (cards) => {
    for(let card of cards) {
        let matchType = card.effect.match(TYPE_REPLACE);
        if(matchType) {
            card.type = matchType[1];
        }
        
        let matchArchetype = card.effect.match(ARCHETYPE_TREATMENT);
        card.also_archetype = matchArchetype ? matchArchetype[1] : null;
        
        let src = card.custom > 0 ? CUSTOM_PICS_START : CARD_IMAGES_START;
        let id = card.id;
        if(card.custom > 0) {
            let idMod = id - id % 100000;
            src += idMod + "/";
        }
        src += id + ".jpg";
        card.src = src;
        // card.src[20310123] += 3;
        stateInfo.collected[card.id] = card;
        // stateInfo.collected.push(card);
    }
};
const collectCards = (data) => {
    // console.log(data);
    if(!stateInfo.initialized) {
        stateInfo.total = data.total;
        stateInfo.maxPages = Math.ceil(stateInfo.total / 20)
        stateInfo.initialized = true;
    }
    console.log("Collected page " + customSearch.page + " of " + stateInfo.maxPages);
    appendCards(data.cards);
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
    // logout();
};

ws.on('close', function close() {
    console.log("Disconnected");
    // console.log(ws);
    // process.exit(0);
    process.kill(process.pid);
});

ws.on('message', function incoming(data) {
    // console.log(data);
    try {
        data = JSON.parse(data);
    }
    catch(e) {
        console.error("Problem parsing incoming JSON");
        console.log(">> " + e);
        return;
    }
    console.log("Server impulse : " + data.action);
    if(data.action === "Connected") {
        console.log("Connected to DuelingBook server!");
        main();
    }
    else if(data.action === "Search cards") {
        collectCards(data);
    }
    else if(data.action === "Rejected") {
        console.log(data);
    }
    else {
        // console.error("Unknown error received from socket:", data);
    }
});
