(function() {
    if(!window.scrapeReady) {
        let error = false;
        try {
            let message = document.getElementById("msg");
            error = message.children[1].textContent === "Deck does not exist";
        }
        catch(e) {
            // pass
        }
        return {
            success: false,
            error: error,
        };
    }
    let results = [];
    for(let a of [deck_arr, side_arr, extra_arr].flat()) {
        let { width, height } = a.find("img.pic").css(["width", "height"]);
        let data = a.data();
        let src = data.custom > 0 ? CUSTOM_PICS_START : CARD_IMAGES_START;
        let id = data.id;
        if(data.custom > 0) {
            let idMod = id - id % 100000;
            src += idMod + "/";
        }
        src += id + ".jpg" + (data.pic != "1" ? "?version=" + a.pic : "");
        data.src = src;
        data.width = width;
        data.height = height;
        results.push(data);
    }
    return {
        success: true,
        results: results,
    };
})();