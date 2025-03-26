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
        let depth = 0; // Control de la profundidad de anidación

        // Función para generar clases únicas en base a la profundidad
        function getNestedClass(depth) {
            return `nested-depth-${depth}`;
        }

        // Escapar caracteres especiales
        const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Resaltar claves y valores
        let highlightedJSON = escapedJSON.replace(
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

        // Añadir clases y contenedores de apertura para objetos y arreglos
        highlightedJSON = highlightedJSON.replace(
            /(\{|\[)/g, // Detectar apertura
            function (match) {
                depth++;
                const nestedClass = getNestedClass(depth);
                return `<span class="toggle-container">
                            <span class="toggle">▶</span> <span> ${match} </span>
                            <div class="${nestedClass} nested-content" style="display:block;">`;
            }
        );

        // Añadir clases y contenedores de cierre para objetos y arreglos
        highlightedJSON = highlightedJSON.replace(
            /(\}|\])/g, // Detectar cierre
            function (match) {
                const nestedClass = getNestedClass(depth);
                depth--;
                return `</div><span class="${nestedClass}" style="display:block;">${match}</span>`;
            }
        );

        // Envolver las comas
        highlightedJSON = highlightedJSON.replace(
            /,/g, // Detectar comas
            function () {
                return `<span class="comma">,</span>`;
            }
        );

        return highlightedJSON;
    }

    
    $(document).on("click", ".toggle", function () {
        const container = $(this).closest(".toggle-container"); // Encuentra el contenedor raíz
        const nestedContent = container.find("> .nested-content"); // Encuentra el contenido interno

        // Alternar visibilidad con lógica ajustada
        if (nestedContent.css("display") === "none") {
            nestedContent.css("display", "block"); // Mostrar contenido interno
            $(this).text("▼"); // Cambiar el ícono a colapsar
        } else {
            nestedContent.css("display", "none"); // Ocultar contenido interno
            $(this).text("▶"); // Cambiar el ícono a expandir
        }
    });



    // function syntaxHighlight(json) {
    //     let depth = 0; // Variable para controlar la profundidad de la anidación

    //     // Función para agregar clases únicas en contenedores `nested`
    //     function getNestedClass(depth) {
    //         return `nested-depth-${depth}`;
    //     }

    //     // Escapar los caracteres especiales para evitar inyecciones
    //     const escapedJSON = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //     // Resaltar las claves y valores según el tipo
    //     let highlightedJSON = escapedJSON.replace(
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

    //             // Agregar un span para la clave y valor con clases de color
    //             return `<span class="${cls}">${match}</span>`;
    //         }
    //     );

    //     // Ahora añadimos la interactividad a las claves
    //     highlightedJSON = highlightedJSON.replace(
    //         /"([^"]+)":/g, // Buscar las claves en los objetos
    //         function (match, p1) {
    //             return `<span class="toggle-key" data-key="${p1}">${match}</span>`;
    //         }
    //     );

    //     // Agregar los íconos de expandir/colapsar en los objetos y arrays
    //     highlightedJSON = highlightedJSON.replace(
    //         /(\{|\[)/g, // Detecta la apertura de objetos o arrays
    //         function (match) {
    //             depth++; // Aumentar la profundidad con cada apertura de objeto/array
    //             const nestedClass = getNestedClass(depth); // Obtener una clase única para el contenedor
    //             return `<span class="toggle-container"><span class="toggle">▶</span>${match}<span class="toggle-container ${nestedClass}" style="display:none;"></span></span>`;
    //         }
    //     );

    //     // Envolver las comas dentro de un span con clase 'comma'
    //     highlightedJSON = highlightedJSON.replace(
    //         /,/g, // Busca todas las comas en el JSON
    //         function () {
    //             return `<span class="comma">,</span>`;
    //         }
    //     );

    //     // Agregar el cierre adecuado para los objetos y arrays
    //     highlightedJSON = highlightedJSON.replace(
    //         /(\}|\])/g, // Detecta el cierre de objetos o arrays
    //         function (match) {
    //             const nestedClass = getNestedClass(depth); // Obtener una clase única para el contenedor
    //             depth--; // Reducir la profundidad al cerrar un objeto/array
    //             return `${match} <span class="toggle-container ${nestedClass}" style="display:none;"></span>`;
    //         }
    //     );

    //     return highlightedJSON;
    // }

    // $(document).on("click", ".toggle", function () {
    //     const container = $(this).closest(".toggle-container"); // Encuentra el contenedor raíz
    //     const nestedClass = container.find(".toggle-container").last().attr("class").split(" ")[1]; // Obtener la clase única
    //     console.log({ nestedClass });

    //     const nextContainer = container.nextAll(`.${nestedClass}`).first(); // Buscar el siguiente contenedor con la misma clase

    //     if (nextContainer.length) {
    //         // Verificar si el contenedor está visible o no
    //         const isVisible = !nextContainer.hasClass("hidden");

    //         // Mostrar u ocultar todos los elementos entre toggle-container y nextContainer
    //         let currentElement = container.next(); // Comenzar desde el siguiente elemento
    //         while (currentElement.length && currentElement[0] !== nextContainer[0]) {
    //             if (isVisible) {
    //                 currentElement.addClass("hidden"); // Ocultar cada elemento
    //             } else {
    //                 currentElement.removeClass("hidden"); // Mostrar cada elemento
    //             }
    //             currentElement = currentElement.next(); // Avanzar al siguiente elemento
    //         }

    //         // Cambiar el estado del último contenedor
    //         if (isVisible) {
    //             nextContainer.addClass("hidden"); // Ocultar el último contenedor
    //             $(this).text("▶"); // Cambiar el ícono a expandir
    //         } else {
    //             nextContainer.removeClass("hidden"); // Mostrar el último contenedor
    //             $(this).text("▼"); // Cambiar el ícono a colapsar
    //         }
    //     }
    // });


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
