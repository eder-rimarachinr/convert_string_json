document.addEventListener("DOMContentLoaded", () => {
    const input_string = document.getElementById("input_string");
    const output_string = document.getElementById("output_json");
    const btn_convertir = document.getElementById("btn_convertir");

    if (btn_convertir) {
        btn_convertir.addEventListener("click", (evt) => {
            evt.preventDefault();

            const data = input_string.value.trim();
            if (data.length === 0) {
                return false;
            }
            convertirJSON(data, output_string);
        });
    }
});

function convertirJSON(value_ss, output_string) {
    try {
        value_ss = corregirFormato(value_ss);

        const parsedJSON = JSON.parse(value_ss);
        let formattedJSON = null;
        console.log(typeof parsedJSON)

        if (Array.isArray(parsedJSON) || (typeof parsedJSON === 'object' && parsedJSON !== null)) {
            formattedJSON = JSON.stringify(parsedJSON, undefined, 4);
        } else {
            formattedJSON = JSON.stringify(JSON.parse(parsedJSON), undefined, 4);
        }
        output_string.innerHTML = syntaxHighlight(formattedJSON);
    } catch (error) {
        alert("Error al procesar JSON: " + error.message);
    }
}

function corregirFormato(jsonString) {
    const lastTwoChars = jsonString.slice(-2);
    const invalidLastChars = ['";', '];', '};'];

    if (invalidLastChars.includes(lastTwoChars)) {
        jsonString = jsonString.slice(0, -1);
    }

    return jsonString;
}

function syntaxHighlight(json) {
    const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escapedJSON.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
            const cls = /^"/.test(match)
                ? /:$/.test(match)
                    ? "key"
                    : "string"
                : /true|false/.test(match)
                    ? "boolean"
                    : /null/.test(match)
                        ? "null"
                        : "number";
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

function copyInp() {
    const textarea = document.getElementById("input_string");

    textarea.select();
    document.execCommand("copy");
}

function copyOut() {
    const pre = document.getElementById("output_json");


    const range = document.createRange();
    range.selectNode(pre);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    try {
        document.execCommand("copy");
    } catch (err) {
        console.error("No se pudo copiar el contenido", err);
    }
}

