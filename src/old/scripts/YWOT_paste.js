// If you spam with this I will set fire to your house

(function() {
    var a = document.querySelector('textarea#world-input');
    var b = document.createElement('input');
    b.type = 'file';
    b.accept = '.txt,text/plain';
    b.style.display = 'none';
    b.onchange = function(c) {
        var d = c.target.files[0];
        if (!d) return;

        var e = new FileReader();
        e.onload = function(f) {
            var g = f.target.result;
            b.remove();
            a.focus();
            let h = 0;

            function i_j() {
                const k = g[h];
                h++;

                if (k === '\n' || k === '\r') {
                    if (k === '\r' && g[h] === '\n') {
                        h++;
                    }
                    a.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: "Enter" }));
                } else {
                    a.value = k;
                    a.dispatchEvent(new InputEvent('input', {
                        bubbles: true,
                        cancelable: true,
                        inputType: 'insertText',
                        data: k
                    }));
                }

                //keep it above 15 otherwise it gets kind of jumbled
                setTimeout(i_j, 15);
            }

            i_j();
        };
        e.readAsText(d);
    };
    document.body.appendChild(b);
    b.click();
})();
