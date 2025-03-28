const express = require('express');
const path = require('path');

const app = express();
const PORT = 8081;

// Servir archivos estáticos (como CSS, JS, imágenes)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
