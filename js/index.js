$(document).ready(function () {
    const inputString = $("#input_string");

    inputString.empty();

    listenClickBtnConverter();

    function listenClickBtnConverter() {
        const outputString = $("#output_json");
        const btnConvertir = $("#btn_convertir");

        // Verifica que el botón y el campo de entrada existen
        if (btnConvertir.length && inputString.length && outputString.length) {
            btnConvertir.on("click", function (evt) {
                evt.preventDefault();

                const data = inputString.val().trim(); // Actualiza el valor aquí

                if (data.length === 0) {
                    return; // Si no hay datos, no hacer nada
                }

                convertirJSON(data, outputString); // Procesa el JSON

                $(this).blur();
            });
        }
    }

    function convertirJSON(value, outputString) {
        try {
            value = corregirFormato(value);

            const parsedJSON = JSON.parse(value);
            let formattedJSON = JSON.stringify(parsedJSON, null, 4);

            outputString.html(syntaxHighlight(formattedJSON));
        } catch (error) {
            alert(`Error al procesar JSON: ${error.message}`);
        }
    }

    function corregirFormato(jsonString) {
        const lastTwoChars = jsonString.slice(-2);
        const invalidLastChars = ['";', '];', '};', '},'];

        // Corregimos formato si es necesario
        if (invalidLastChars.includes(lastTwoChars)) {
            jsonString = jsonString.slice(0, -1);
        }

        return jsonString;
    }

    function syntaxHighlight(json) {
        // Escapar los caracteres especiales para evitar inyecciones
        const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Resaltar las claves y valores según el tipo
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

    // Asigna el evento de clic al ícono de copiar
    $("#copy_input").on("click", function () {
        copyInp(); // Llama a tu función copyInp
    });


    // Función para copiar contenido de input al portapapeles usando la Clipboard API
    function copyInp() {
        const textarea = $("#input_string");

        // Asegúrate de que el campo de texto tiene el foco antes de copiar
        textarea.select();

        // Usa la Clipboard API para copiar el texto
        navigator.clipboard.writeText(textarea.val())
            .then(() => {
                console.log("Texto copiado al portapapeles");
            })
            .catch((err) => {
                console.error("No se pudo copiar al portapapeles", err);
            });
    }


    // Asigna el evento de clic al ícono de copiar
    $("#copy_output").on("click", function () {
        copyOut(); // Llama a tu función copyInp
    });

    // Función para copiar contenido del output al portapapeles usando la Clipboard API
    function copyOut() {
        const outputContent = $("#output_json").html(); // Obtener el texto del elemento

        // Usa la Clipboard API para copiar el texto al portapapeles
        navigator.clipboard.writeText(outputContent)
            .then(() => {
                console.log("Contenido copiado al portapapeles");
            })
            .catch((err) => {
                console.error("No se pudo copiar el contenido al portapapeles", err);
            });
    }

});
