// https://stackoverflow.com/a/30810322/4119004
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

const MAX_CHUNK_SIZE = 1900;//2000 doesn't work for some reason
const formatIntoChunks = function* (iter) {
    let currentChunk = "";
    for(let k of iter) {
        if(k.length > MAX_CHUNK_SIZE) {
            console.error("Entry too big, skipping");
            continue;
        }
        if(currentChunk.length) {
            k = "\n" + k;
        }
        if(currentChunk.length + k.length > MAX_CHUNK_SIZE) {
            yield currentChunk;
            currentChunk = k.slice(1);
        }
        else {
            currentChunk += k;
        }
    }
    yield currentChunk;
};

const getChanges = function* () {
    const changes = document.querySelector("#changedCards ~ .minimizable");
    const allChanges = changes.querySelectorAll(".deck-changes");
    
    let formatLine = (name, props) =>
        ":grey_question: `" + name + "` (" + props.join(", ") + ")";
    
    for(let block of allChanges) {
        let name;
        let props = [];
        for(let diff of block.querySelectorAll(".diff-whole")) {
            let h3 = diff.querySelector("h3");
            if(h3) {
                if(name && props.length) {
                    // lines.push(formatLine(name, props));
                    yield formatLine(name, props);
                }
                name = h3.textContent.slice(2);
                props.splice(0);
            }
            props.push(diff.querySelector("h4").textContent.slice(10));
        }
        if(name && props.length) {
            yield formatLine(name, props);
        }
    }
};

window.addEventListener("load", function () {
    for(let link of document.querySelectorAll("a.toplink")) {
        link.addEventListener("click", function () {
            copyTextToClipboard(link.href);
        });
    }
    for(let minim of document.querySelectorAll(".minimizable")) {
        let k = document.createElement("button");
        k.textContent = "Minimize";
        k.addEventListener("click", function () {
            let isMinimized = minim.classList.toggle("minimized");
            k.textContent = isMinimized ? "Maximize" : "Minimize";
        });
        minim.parentNode.insertBefore(k, minim);
    }
    
    let showChangeList = document.createElement("button");
    showChangeList.textContent = "Show change list";
    
    showChangeList.addEventListener("click", function () {
        let chunks = document.createElement("div");
        chunks.classList.add("chunks");
        for(let chunk of formatIntoChunks(getChanges())) {
            let pre = document.createElement("div");
            pre.classList.add("display");
            pre.textContent = chunk;
            chunks.appendChild(pre);
        }
        document.body.insertBefore(chunks, showChangeList.nextSibling);
    });
    
    let toc = document.getElementById("toc");
    document.body.insertBefore(showChangeList, toc.nextSibling);
    
    showChangeList.click();
});