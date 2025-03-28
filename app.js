const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

// Servir la carpeta "assets" como estática
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir el archivo index.html
app.use(express.static(__dirname));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
