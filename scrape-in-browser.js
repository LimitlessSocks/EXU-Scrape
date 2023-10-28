const exuBrowserScraper = {
    totalComposite: {},
    workingComposite: {},
    antiMashDelay: 500, //ms
    restartDelay: 10000, //ms
    timeout: null, //timeout id
    resolutionQueue: [],
    bootstrap() {
        if(window.oldDeckResponse) {
            // if already bootstrapping, just reset the hook
            window.loadDeckResponse = window.oldDeckResponse;
        }
        else {
            // otherwise, save a copy of the old function so we
            // can still call it
            window.oldDeckResponse = window.loadDeckResponse;
        }
        window.loadDeckResponse = (data) => {
            // hook in all active listeners
            // and deactivate them
            console.log("Received data:", data);
            this.deckLoaded(data);
            // continue with the old responder
            window.oldDeckResponse(data);
        };
    },
    deckLoaded(data) {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.resolutionQueue.splice(0).forEach(({ resolve }) => resolve(data));
    },
    rejectTimeout() {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.resolutionQueue.splice(0).forEach(({ reject }) => reject("Timeout"));
    },
    waitForDeckLoaded(maxTimeout = null) {
        maxTimeout ??= this.restartDelay;
        this.timeout ??= setTimeout(() => this.rejectTimeout(), maxTimeout);
        return new Promise((resolve, reject) => {
            this.resolutionQueue.push({ resolve, reject });
        });
    },
    waitDuration(duration) {
        console.log("Waiting", duration, "ms...");
        return new Promise((resolve, reject) => setTimeout(resolve, duration));
    },
    getAllDecks() {
        return [...document.getElementById("decklist_cb").children]
            .map(option => option.value);
    },
    async scrapeSingle(deckId, maxRetry = 5) {
        console.log("Scraping deck id", deckId);
        
        // line below taken directly from db's code lol
        Send({"action":"Load deck", "deck":~~deckId});
        
        let deckData = null;
        for(let i = 0; !deckData && i < maxRetry; i++) {
            try {
                deckData = await this.waitForDeckLoaded();
            }
            catch(e) {
                console.error("Error while scraping", deckId);
                console.error(e);
                console.log("Retrying...", i + 2, "/", maxRetry);
            }
        }
        
        this.workingComposite[deckId] = deckData;
    },
    async scrapeAll(ids = null) {
        ids ??= this.getAllDecks();
        
        let j = 0;
        for(let deckId of ids) {
            console.log(j, "/", ids.length);
            await this.scrapeSingle(deckId);
            // todo: test without anti mash but with restart on hangup?
            await this.waitDuration(this.antiMashDelay);
            j++;
        }
        
        // todo: better conflict resolution between conflicting entries in totalComposite
        Object.assign(this.totalComposite, this.workingComposite);
    },
    async scrapeMissing() {
        let missingIds = this.getAllDecks()
            .filter(id => !this.totalComposite[id]);
        
        return await scrapeAll(missingIds);
    },
    saveComposite(composite = null) {
        composite ??= this.totalComposite;
        const jsonString = JSON.stringify(this.totalComposite);
        const blob = new Blob([jsonString], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "totalComposite.json";
        a.click();
    },
    async usual() {
        await this.scrapeAll();
        this.saveComposite();
        console.log("Done, composite saved");
        return this.totalComposite;
    },
};
exuBrowserScraper.bootstrap();
