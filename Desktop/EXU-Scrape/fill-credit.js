//

window.addEventListener("load", function () {
    const status = document.getElementById("status");
    const toggleStatus = document.getElementById("toggleStatus");
    
    const updateStatus = () => {
        let isArtFinder = CardViewer.SaveData.get("credit").isArtFinder;
        status.textContent =
            `You ${isArtFinder ? "are" : "are not"} in art finder mode ${isArtFinder ? "✔️" : "❌"}.`;
        toggleStatus.textContent = isArtFinder ? "Stop being an art finder" : "Become an art finder";
    };
    
    CardViewer.SaveData.init();
    if(!CardViewer.SaveData.get("credit")) {
        CardViewer.SaveData.set("credit", {
            isArtFinder: false,
        });
    }
    
    updateStatus();
    
    toggleStatus.addEventListener("click", function () {
        let data = CardViewer.SaveData.get("credit");
        data.isArtFinder = !data.isArtFinder;
        CardViewer.SaveData.set("credit", data);
        updateStatus();
    });
});

