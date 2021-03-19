window.addEventListener("load", function () {
    let roster = document.getElementById("roster");
    let changes = document.getElementById("changes");
    let output = document.getElementById("output");
    let notice = document.getElementById("notice");
    document.getElementById("submit").addEventListener("click", function () {
        let calc = new PlayerCalculations();
        calc.parsePlayerList(roster.value);
        let battles = calc.battlePlayers(changes.value);
        output.value = calc.toString();
        notice.textContent = "Performed " + battles + " calculation" + (battles === 1 ? "" : "s") + ".";
    });
});