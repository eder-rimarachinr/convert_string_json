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

    // function syntaxHighlight(json) {
    //     // Escapar los caracteres especiales para evitar inyecciones
    //     const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //     // Resaltar las claves y valores según el tipo
    //     return escapedJSON.replace(
    //         /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    //         function (match) {
    //             const cls = /^"/.test(match)
    //                 ? /:$/.test(match)
    //                     ? "key"
    //                     : "string"
    //                 : /true|false/.test(match)
    //                     ? "boolean"
    //                     : /null/.test(match)
    //                         ? "null"
    //                         : "number";
    //             return `<span class="${cls}">${match}</span>`;
    //         }
    //     );
    // }



    // function syntaxHighlight(json) {
    //     let depth = 0; // Control de la profundidad de anidación

    //     // Función para generar clases únicas en base a la profundidad
    //     function getNestedClass(depth) {
    //         return `nested-depth-${depth}`;
    //     }

    //     // Escapar caracteres especiales
    //     const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //     // Resaltar claves, valores y manejar aperturas/cierres de objetos/arreglos
    //     let highlightedJSON = escapedJSON.replace(
    //         /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[\{\[]|[\}\]])/g,
    //         function (match) {
    //             if (/[\{\[]/.test(match)) {
    //                 // Detectar apertura de objeto o arreglo
    //                 const nestedClass = getNestedClass(depth);
    //                 const icon = `<span class="toggle">▶</span>`;
    //                 depth++;
    //                 return `<span class="toggle-container">${icon} <span class="${nestedClass}">${match}</span>
    //                             <div class="${nestedClass} nested-content" style="display:block;">`;
    //             } else if (/[\}\]]/.test(match)) {
    //                 // Detectar cierre de objeto o arreglo
    //                 depth--;
    //                 const nestedClass = getNestedClass(depth);
    //                 return `</div><span class="${nestedClass}">${match}</span></span>`;
    //             } else {
    //                 // Resaltar claves y valores
    //                 const cls = /^"/.test(match)
    //                     ? /:$/.test(match)
    //                         ? "key"
    //                         : "string"
    //                     : /true|false/.test(match)
    //                         ? "boolean"
    //                         : /null/.test(match)
    //                             ? "null"
    //                             : "number";
    //                 return `<span class="${cls}">${match}</span>`;
    //             }
    //         }
    //     );

    //     // Añadir las clases para las comas
    //     highlightedJSON = highlightedJSON.replace(
    //         /,/g, function () {
    //             return `<span class="comma">,</span>`;
    //         }
    //     );

    //     return highlightedJSON;
    // }


    // $(document).on("click", ".toggle", function () {
    //     const container = $(this).closest(".toggle-container"); // Encuentra el contenedor raíz
    //     const nestedContent = container.find("> .nested-content"); // Encuentra el contenido interno

    //     // Alternar visibilidad con lógica ajustada
    //     if (nestedContent.css("display") === "none") {
    //         nestedContent.css("display", "block"); // Mostrar contenido interno
    //         $(this).text("▼"); // Cambiar el ícono a colapsar
    //     } else {
    //         nestedContent.css("display", "none"); // Ocultar contenido interno
    //         $(this).text("▶"); // Cambiar el ícono a expandir
    //     }
    // });


    function syntaxHighlight(json) {
        // Escapar los caracteres especiales para evitar inyecciones
        const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        let result = ""; // Acumulador para el JSON resaltado con numeración

        // Dividir el JSON por líneas para procesar cada línea
        const lines = escapedJSON.split(/\n/);
        lines.forEach((line, index) => {
            // Añadir la numeración como primer carácter de la línea
            const lineNumber = `<span class="line-number">${index + 1}</span> `;

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
                    return `<span class="${cls}">${match}</span>`;
                }
            );

            // Combinar la numeración con la línea resaltada
            result += lineNumber + highlightedLine + "<br />"; // Añadir salto de línea
        });

        return result; // Retornar el JSON resaltado con numeración
    }




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
        const outputContent = $("#output_json").text(); // Obtener el texto del elemento

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
