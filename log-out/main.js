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
});