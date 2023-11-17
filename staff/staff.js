const removeLeftPadding = (text) => {
    // Split the text into lines
    const lines = text.split("\n");

    // Find the minimum leading whitespace on non-empty lines
    let minIndent = Infinity;
    for (const line of lines) {
        if (line.trim() !== "") {
            const leadingWhitespace = line.match(/^\s*/)[0].length;
            minIndent = Math.min(minIndent, leadingWhitespace);
        }
    }

    // Remove the minimum indent from each line
    const result = lines.map(line => line.slice(minIndent)).join("\n");

    return result;
};

window.addEventListener("load", function () {
    const ITEM_HANDLE = "item";
    const SECTION_HANDLE = "section";
    for(let md of document.querySelectorAll(".md")) {
        let code = removeLeftPadding(md.textContent);
        
        // obtain header ids
        
        code = code.replace(/§(\d+(?:\.\d+)*)/g, (all, match) => {
            // console.log(match);
            let matchReference = match.includes(".") ? ITEM_HANDLE: SECTION_HANDLE;
            return `[${all}](#${matchReference}-${match})`;
        });
        
        md.innerHTML = marked.parse(code);
        for(let header of md.querySelectorAll("h1")) {
            if(header.textContent.toLowerCase().includes("draft")) {
                header.classList.add("draft");
            }
        }
        // TODO: better consolidation, this assumes just one logical guideline
        // gives each h2 an ID
        for(let header of md.querySelectorAll("h2")) {
            // console.log(header);
            let match = header.textContent.match(/^(\d+)\./)?.[1];
            if(match) {
                header.id = `${SECTION_HANDLE}-${match}`;
                let refLink = document.createElement("a");
                refLink.classList.add("reflink");
                refLink.href = `#${header.id}`;
                refLink.textContent = "#";
                header.appendChild(refLink);
            }
        }
        
        // give item ids to each bulletpoint
        for(let li of md.querySelectorAll("li")) {
            let parentOl = li.parentNode;
            let myIndex = [...parentOl.children].indexOf(li) + 1;
            let parentReference;
            
            if(parentOl.parentNode.tagName === "ARTICLE") {
                parentReference = parentOl
                    .previousElementSibling
                    .id
                    .slice(SECTION_HANDLE.length + 1);
            }
            else {
                parentReference = parentOl
                    .parentNode
                    .id
                    .slice(ITEM_HANDLE.length + 1);
            }
            li.id = `${ITEM_HANDLE}-${parentReference}.${myIndex}`;
        }
        
        // populates table of contents
        let tocHead = [...document.querySelectorAll("h2")].find(header => header.textContent === "TOC");
        if(tocHead) {
            tocHead.id = "TOC";
            tocHead.textContent = "Table of Contents";
            let baseList = document.createElement("ul");
            for(let header of document.querySelectorAll("h2")) {
                if(header.id === "TOC") {
                    continue;
                }
                let li = document.createElement("li");
                let anchor = document.createElement("a");
                anchor.href = `#${header.id}`;
                anchor.textContent = `§${header.childNodes[0].textContent}`;
                li.appendChild(anchor);
                baseList.appendChild(li);
                // let nextOl = header.nextElementSibling;
            }
            tocHead.after(baseList);
        }
    }
    
    // thanks chatgpt
    const highlightElement = (element) => {
        element.classList.add("highlight");
        setTimeout(function () {
            element.classList.remove("highlight");
        }, 2000);
    };
    
    document.addEventListener("click", function (event) {
        if (event.target.tagName === "A" && event.target.hash) {
            // Remove the "#" from the hash
            const targetId = event.target.hash.slice(1); 
            const targetElement = document.getElementById(targetId);

            if(targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
                highlightElement(targetElement);
                event.preventDefault();
                // thanks https://stackoverflow.com/a/14690177/4119004
                if(history.replaceState) {
                    history.replaceState(null, null, event.target.hash);
                }
                else {
                    location.hash = event.target.hash;
                }
            }
        }
    });
});
