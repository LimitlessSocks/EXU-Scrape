const UserInfo = {
    guests: [],
    targetHost: null,
    myId: null,
    conn: null,
    handlePayload(payload, exclude = []) {
        if(UserInfo.guests.length) {
            // host: disseminate to all guests
            for(let guest of UserInfo.guests) {
                if(exclude.includes(guest)) {
                    continue;
                }
                let { conn } = guest;
                conn.send(payload);
            }
        }
        if(UserInfo.targetHost) {
            // guest: notify host
            UserInfo.conn.send(payload);
        }
    },
};

const Chat = {
    chatMessages: null,
    showMessage(from, content) {
        let message = document.createElement("div");
        message.className = "message";
        message.textContent = `${from}: ${content}`;
        this.chatMessages.appendChild(message);
        // scroll to bottom of pane when message shown
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },
    sendSystemMessage(content) {
        this.showMessage("[SYSTEM]", content);
    },
    sendMessage(content, alias, exclude = []) {
        let payload = {
            type: "chatMessage",
            from: alias,
            content,
        };
        this.showMessage(alias, content);
        UserInfo.handlePayload(payload, exclude);
    },
    transSystemMessage(message, ...args) {
        this.sendMessage(message, "[SYSTEM]", ...args);
    },
};

const Reactions = {
    propogateReaction(gid, reaction, exclude=[]) {
        let payload = {
            type: "updateReaction",
            gid,
            reaction,
        };
        console.log("Signaling once", payload);
        UserInfo.handlePayload(payload, exclude);
    },
    propogateAllReactions(reactions, exclude) {
        let payload = {
            type: "updateReactionMulti",
            reactions,
        };
        console.log("Signaling all", payload);
        UserInfo.handlePayload(payload, exclude);
    },
};

const VERDICT_ORDER = ["accept", "reject", "remove", "claim", "clear"];
const getVerdict = button =>
    VERDICT_ORDER
        .find(candidateClass => button.classList.contains(candidateClass));

const downloadAsJson = (name, data) => {
    let jsonString = JSON.stringify(data);
    let blob = new Blob([jsonString], { type: "application/json" });
    let downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = name;
    downloadLink.innerHTML = "Download " + name;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

window.addEventListener("load", function () {
    let myIdElement = document.getElementById("my-peer-id");
    let myAliasElement = document.getElementById("my-alias");
    Chat.chatMessages = document.getElementById("chat-messages");
    let chatInput = document.getElementById("chat-input");
    
    document.getElementById("save-reactions").addEventListener("click", function () {
        let result = {};
        let unselected = [];
        for(let verdict of document.querySelectorAll(".verdict")) {
            if(verdict.classList.contains("overall")) {
                continue;
            }
            let gid = verdict.parentElement.dataset.gid;
            let selected = verdict.querySelector(".emoji-button.selected");
            if(!selected) {
                console.warn("Unselected entry:", gid);
                unselected.push(gid);
                continue;
            }
            result[gid] = getVerdict(selected);
        }
        let baseName = window.scrapeIdentifier ?? "scrape";
        downloadAsJson("verdict-" + baseName + ".json", result);
    });
    document.getElementById("load-reactions").addEventListener("click", function () {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.addEventListener("change", function(event) {
            let file = event.target.files[0];
            
            if(file) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    let content = e.target.result;
                    try {
                        let jsonData = JSON.parse(content);
                        
                        let propogations = [];
                        for(let [ gid, reaction ] of Object.entries(jsonData)) {
                            updateVerdict(gid, reaction);
                            propogations.push({ gid, reaction });
                        }
                        Reactions.propogateAllReactions(propogations);
                    }
                    catch(error) {
                        console.error("Error parsing JSON:", error);
                    }
                };
                reader.readAsText(file);
            }
        });
        
        input.click();
    });
    
    const myAlias = () => myAliasElement.value || "(unknown)";
    
    // TODO: signal username change to all participants
    // TODO: host forwarding (if you try to connect to someone connected to a host, connect to their host instead)
    
    chatInput.addEventListener("keydown", ev => {
        if(!chatInput.value.trim()) {
            return;
        }
        if(ev.key === "Enter") {
            Chat.sendMessage(chatInput.value, myAlias());
            chatInput.value = "";
        }
    });
    
    /** GUEST CODE
     **/
    let hostPeerIdInput = document.getElementById("host-peer-id");
    const handleHostChange = () => {
        let hostPeerId = hostPeerIdInput.value;
        if(hostPeerId === UserInfo.myId) {
            // TODO: do not use alert
            alert("Cannot connect to yourself!");
            return;
        }
        
        if(!hostPeerId.trim()) {
            return;
        }
        
        console.log("Attempting host connect:", hostPeerId);
        let conn = peer.connect(hostPeerId);
        conn.on("open", () => {
            console.log("Connected to host:", hostPeerId);
            if(UserInfo.conn) {
                UserInfo.conn.close();
            }
            UserInfo.conn = conn;
            UserInfo.targetHost = hostPeerId;
            conn.on("data", data => {
                // received data from the host
                console.log("Received data from host:", data);
                if(data.type === "success") {
                    let { alias } = data;
                    Chat.sendSystemMessage(`Connected to host ${alias}.`);
                }
                else if(data.type === "chatMessage") {
                    let { from, content } = data;
                    Chat.showMessage(from, content);
                }
                else if(data.type === "updateReaction") {
                    let { gid, reaction } = data;
                    updateVerdict(gid, reaction);
                }
                else if(data.type === "updateReactionMulti") {
                    for(let { gid, reaction } of data.reactions) {
                        updateVerdict(gid, reaction);
                    }
                }
                else {
                    console.warn("Unhandled message type", data.type);
                }
            });
            conn.on("close", data => {
                // host has closed the connection
                Chat.sendSystemMessage("Host has terminated session.");
            });
            
            // initializing info
            conn.send({
                type: "aliasNotify",
                alias: myAlias(),
            });
        });
        // UserInfo.targetHost = hostPeerId;
    };
    hostPeerIdInput.addEventListener("change", handleHostChange);
    
    // let peer = new Peer(undefined, { debug: 2 });
    let peer = new Peer();
    peer.on("open", id => {
        myIdElement.textContent = UserInfo.myId = id;
        handleHostChange();
    });
    
    /** HOST CODE
     **/
    peer.on("connection", conn => {
        let connData = {
            conn,
            alias: null,
            connectNotificationSent: false,
        };
        
        setTimeout(() => {
            if(connData.connectNotificationSent) {
                return;
            }
            connData.connectNotificationSent = true;
            Chat.transSystemMessage(`Received unnamed guest connection.`);
        }, 3000);
        
        conn.on("open", () => {
            // let the user they connected successfully to our protocol
            conn.send({
                type: "success",
                alias: myAlias(),
            });
            // and give them the information we have collected
            let propogations = [];
            for(let verdict of document.querySelectorAll(".verdict")) {
                let selected = verdict.querySelector(".emoji-button.selected");
                if(!selected) {
                    continue;
                }
                let gid = verdict.parentElement.dataset.gid;
                let reaction = getVerdict(selected);
                propogations.push({ gid, reaction });
            }
            conn.send({
                type: "updateReactionMulti",
                reactions: propogations,
            });
        });
        
        conn.on("close", () => {
            UserInfo.guests = UserInfo.guests.filter(guest => guest !== connData);
            Chat.transSystemMessage(`User ${connData.alias} has disconnected.`);
        });
        
        conn.on("data", data => {
            // received data from a guest
            console.log("Data received:", data);
            if(data.type === "chatMessage") {
                // we do not use connData.alias here since users can broadcast system information
                let { content, from } = data;
                Chat.showMessage(from, content);
                // send to all other users
                for(let guest of UserInfo.guests) {
                    if(guest === connData) {
                        continue;
                    }
                    let { conn } = guest;
                    console.log("Sending to guest", guest.alias);
                    conn.send({
                        type: "chatMessage",
                        from,
                        content,
                    });
                }
            }
            else if(data.type === "aliasNotify") {
                let { alias } = data;
                if(!connData.connectNotificationSent) {
                    connData.connectNotificationSent = true;
                    // exclude ourselves
                    Chat.transSystemMessage(`User ${alias} has connected.`, [ connData ]);
                }
                connData.alias = alias;
            }
            else if(data.type === "updateReaction") {
                let { gid, reaction } = data;
                updateVerdict(gid, reaction);
                Reactions.propogateReaction(gid, reaction, [ connData ]);
            }
            else if(data.type === "updateReactionMulti") {
                let { reactions } = data;
                for(let { gid, reaction } of reactions) {
                    updateVerdict(gid, reaction);
                }
                Reactions.propogateAllReactions(reactions, [ connData ]);
            }
            else {
                console.warn("Unhandled message type", data.type);
            }
        });
        
        UserInfo.guests.push(connData);
    });
    peer.on("error", err => {
        console.error("Error for peer:", err);
        if(err.type === "peer-unavailable") {
            alert("Could not find peer " + hostPeerIdInput.value);
            UserInfo.conn = null;
        }
    });
    
    // update our verdicts
    const updateVerdict = (gid, reaction) => {
        let parent = document.querySelector(`[data-gid="${gid}"]`);
        
        if(!parent) {
            console.error("Could not find parent with gid", gid);
            return;
        }
        
        if(reaction === "clear") {
            parent.style.order = "";
        }
        else {
            parent.style.order = VERDICT_ORDER.indexOf(reaction);
        }
        
        let verdict = parent.querySelector(`.verdict`);
        let buttons = [...verdict.querySelectorAll(".emoji-button")];
        let button = buttons.find(b => b.classList.contains(reaction));
        let oldButton = buttons.find(b => b.classList.contains("selected"));
        let totalEmoji = verdict.querySelector(".total-emoji");
        
        let replaceWith = button.textContent;
        if(reaction === "clear") {
            replaceWith = "";
        }
        if(oldButton) {
            oldButton.classList.remove("selected");
            if(totalEmoji) {
                totalEmoji.textContent = totalEmoji
                    .textContent
                    .replace(oldButton.textContent, replaceWith);
            }
        }
        else {
            if(totalEmoji) {
                totalEmoji.textContent += replaceWith;
            }
        }
        
        if(reaction !== "clear") {
            button.classList.add("selected");
        }
    };
    for(let verdict of document.querySelectorAll(".verdict")) {
        let isGlobal = verdict.classList.contains("overall");
        
        verdict.querySelectorAll(".emoji-button").forEach((button, idx) => {
            button.addEventListener("click", ev => {
                let reaction = getVerdict(button);
                if(isGlobal) {
                    let domain = verdict.nextElementSibling;
                    
                    let propogations = [];
                    
                    for(let otherVerdict of domain.querySelectorAll(".verdict")) {
                        let theirGid = otherVerdict.parentElement.dataset.gid;
                        // console.log(theirGid, reaction);
                        updateVerdict(theirGid, reaction);
                        // Reactions.propogateReaction(theirGid, reaction);
                        propogations.push({
                            gid: theirGid,
                            reaction
                        });
                    }
                    Reactions.propogateAllReactions(propogations);
                }
                else {
                    let myGid = verdict.parentElement.dataset.gid;
                    updateVerdict(myGid, reaction);
                    Reactions.propogateReaction(myGid, reaction);
                }
            });
        });
    }
});
