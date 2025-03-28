$(document).ready(function () {
    const inputString = $("#input_string");

    let jsnFina = null;

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
            const formattedJSON = JSON.stringify(parsedJSON, null, 4);
            outputString.html(syntaxHighlight(formattedJSON));
        } catch (error) {
            alert(`Error al procesar JSON: ${error.message}`);
        }
    }

    // function corregirFormato(jsonString) {
    //     const lastTwoChars = jsonString.slice(-2);
    //     const invalidLastChars = ['";', '];', '};', '},'];

    //     // Corregimos formato si es necesario
    //     if (invalidLastChars.includes(lastTwoChars)) {
    //         jsonString = jsonString.slice(0, -1);
    //     }

    //     return jsonString;
    // }

    function corregirFormato(jsonString) {
        // Eliminar las comillas exteriores si el string empieza y termina con comillas (simples o dobles)
        if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
            (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
            jsonString = jsonString.slice(1, -1);  // Eliminar las comillas exteriores
        }

        // Reemplazar las comillas escapadas (\\") por comillas normales
        jsonString = jsonString.replace(/\\"/g, '"');  // Reemplazar \" por comillas normales

        // Eliminar cualquier secuencia de escape innecesaria (por ejemplo, eliminar \ antes de comillas dobles)
        jsonString = jsonString.replace(/\\(.)/g, '$1'); // Elimina cualquier \ innecesario

        // Eliminar la coma extra al final del JSON si existe
        // Eliminar la coma antes de cerrar un objeto o array
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');  // Reemplazar la coma antes de } o ]


        if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
            (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
            jsonString = jsonString.slice(1, -1);  // Eliminar las comillas exteriores
        }
        return jsonString;
    }



    function syntaxHighlight(json) {
        // Escapar los caracteres especiales para evitar inyecciones
        const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        let result = "";

        // Dividir el JSON por líneas para procesar cada línea
        const lines = escapedJSON.split(/\n/);
        lines.forEach((line, index) => {
            // Añadir la numeración como primer carácter de la línea
            const hasToggle = /[\{\[]/.test(line);
            const toggleHTML = hasToggle ? `<span class="toggle toggleIcon">▶</span>` : "";
            const lineNumber = `<span class="line-number" data-line="${index}">${index + 1}</span> `;

            // Resaltar claves y valores según el tipo
            const highlightedLine = line.replace(
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
                    return `<span class="${cls} json_data" data-line-index="${index}">${match}</span>`;
                }
            );

            // Combinar la numeración con la línea resaltada
            result += lineNumber + highlightedLine + "<br />"; // Añadir salto de línea
        });

        result = result.replace(/,/g, function () {
            return `<span class="comma">,</span>`;
        });

        result = result.replace(/[\{\[]/g, function (match) {
            const cls = match == "{" ? "curly-brace-open" : "square-brace-open";
            return `<span class="${cls}">${match}</span>`;
        });

        result = result.replace(/[\}\]]/g, function (match) {
            const cls = match == "}" ? "curly-brace-close" : "square-brace-close";
            return `<span class="${cls}">${match}</span>`;
        });

        return result;
    }

    function findJsonBlock(index, jsonString) {
        // Dividir el JSON por líneas
        const jsonLines = jsonString.split(/\n/);

        let currentLine = 0;
        let startBlockIndex = -1;
        let endBlockIndex = -1;
        let stack = 0; // Seguimiento de aperturas y cierres

        for (let i = 0; i < jsonLines.length; i++) {
            if (i === index) {
                startBlockIndex = i; // Línea donde comienza el bloque
            }

            if (startBlockIndex !== -1) {
                // Contar aperturas y cierres
                stack += (jsonLines[i].match(/[\{\[]/g) || []).length; // Sumar `{` o `[`
                stack -= (jsonLines[i].match(/[\}\]]/g) || []).length; // Restar `}` o `]`

                // Bloque está completo cuando el stack llega a 0
                if (stack === 0) {
                    endBlockIndex = i;
                    break;
                }
            }
        }

        return [startBlockIndex, endBlockIndex]; // Retornar las líneas de inicio y fin del bloque
    }


    // Usamos delegación de eventos en el documento para manejar los clics
    $(document).on('click', '.toggleIcon', function () {

        // Obtener el contenido actual del ícono
        const currentIcon = $(this).html();

        // Cambiar entre ▶ y ▼
        $(this).html(currentIcon === "▶" ? "▼" : "▶");

        // Encontrar el bloque de JSON al que pertenece el índice actual
        const index = $(this).closest('span.line-number').text().split(' ')[0]; // Obtener el índice de la línea



        if (jsnFina !== null) {
            const index0 = parseInt(index) - 1;

            const block = findJsonBlock(index0, jsnFina); // Llamar a la función que busca el bloque

            // Usar la función findJsonBlock para obtener los índices de inicio y fin del bloque
            const [startBlockIndex, endBlockIndex] = findJsonBlock(index0, jsnFina);

            // Seleccionar todas las líneas dentro del bloque
            for (let i = startBlockIndex + 1; i < endBlockIndex; i++) {
                const lineSelector = `.json_data[data-line-index="${i}"]`; // Selector para identificar la línea por índice
                const lineElement = $(lineSelector);

                if (lineElement.length) {
                    // Seleccionar también el índice asociado a la línea actual
                    const lineNumberSelector = `.line-number[data-line="${i}"]`; // Selector para el índice (número de línea)
                    const lineNumberElement = $(lineNumberSelector);

                    const toggleState = currentIcon === "▶" ? "addClass" : "removeClass"; // Determinamos si se debe ocultar o mostrar

                    // Ocultar o mostrar el contenido y el número de línea
                    lineElement[toggleState]("hidden");
                    lineNumberElement[toggleState]("hidden");

                    // Función para manejar la ocultación de las comas y llaves/corchetes
                    const toggleBracesAndCommas = (element, action) => {
                        const bracesAndCommas = [
                            ".comma", ".curly-brace-open", ".square-brace-open",
                            ".curly-brace-close", ".square-brace-close"
                        ];

                        bracesAndCommas.forEach(className => {
                            const nextElement = element.next(className);
                            if (nextElement.length) {
                                nextElement[action]("hidden");
                            }
                        });
                    };

                    // Ocultar o mostrar las comas y llaves/corchetes según el estado
                    toggleBracesAndCommas(lineElement, toggleState);
                }
            }

        }

    });


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
                alert("Texto copiado al portapapeles");
            })
            .catch((err) => {
                console.error("No se pudo copiar al portapapeles", err);
                alert("No se pudo copiar al portapapeles");

            });
    }


    // Asigna el evento de clic al ícono de copiar
    $("#copy_output").on("click", function () {
        copyOut(); // Llama a tu función copyInp
    });

    function copyOut() {
        const outputElement = $("#output_json"); // Seleccionar el elemento que contiene el JSON resaltado

        // Clonar el contenido para manipularlo sin afectar el DOM
        const clonedContent = outputElement.clone();

        // Remover las numeraciones de línea al buscar y eliminar todas las clases `line-number`
        clonedContent.find(".line-number").remove();

        // Obtener solo el texto limpio (sin números de línea)
        const cleanedContent = clonedContent.text();

        // Usar la Clipboard API para copiar el texto al portapapeles
        navigator.clipboard.writeText(cleanedContent)
            .then(() => {
                console.log("Contenido copiado al portapapeles sin numeración");
                alert("Contenido copiado al portapapeles sin numeración");
            })
            .catch((err) => {
                console.error("No se pudo copiar el contenido al portapapeles", err);
                alert("No se pudo copiar el contenido al portapapeles");
            });
    }


});
