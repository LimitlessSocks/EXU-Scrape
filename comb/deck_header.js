(function(obj) {
    window.scrapeReady = false;
    let promises = [];
    for(let [name, fn] of Object.entries(obj)) {
        promises.push(new Promise((resolve, reject) => {
            window[name] = function() {
                let res = fn();
                resolve();
                return res;
            }
        }));
    }
    Promise.all(promises).then(() => {
        window.scrapeReady = true;
    });
    setTimeout(() => {
        window.scrapeReady = true;
    }, 10000);
})({ countMain: countMain, countSide: countSide, countExtra: countExtra });