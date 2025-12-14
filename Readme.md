# 🔄 JSON String to JSON Converter

![Preview](https://jsonconverter.eder-rimarachin.com/assets/preview-image.png)

Convierte cadenas JSON en objetos JSON formateados en línea de manera elegante y eficiente. **Totalmente renovado en 2025** con tecnologías modernas.

## 🌍 Demo en Vivo

[JSON String to JSON Converter](https://jsonconverter.eder-rimarachin.com)

## ✨ Características

### 🎨 **Diseño Moderno**
- Interfaz oscura con gradientes vibrantes (púrpura/azul)
- Animaciones suaves y transiciones fluidas
- Diseño completamente responsive para móviles y tablets
- Tema profesional con resaltado de sintaxis mejorado

### 🚀 **Funcionalidades Avanzadas**
- ✅ Conversión instantánea de JSON strings con validación inteligente
- ✅ Resaltado de sintaxis con colores diferenciados
- ✅ Colapsar/Expandir bloques JSON de manera interactiva
- ✅ Copiar al portapapeles con un solo clic
- ✅ Limpiar campos rápidamente
- ✅ Corrección automática de formatos comunes
- ✅ Reparación inteligente de JSON (balanceo de llaves, comas)
- ✅ Notificaciones toast elegantes (sin alertas molestas)
- ✅ Atajos de teclado (Ctrl+Enter para convertir)
- ✅ Numeración de líneas para mejor legibilidad

### ⚡ **Rendimiento y Calidad**
- **Sin dependencias externas** - JavaScript Vanilla moderno (ES6+)
- **100% sin jQuery** - Código limpio y optimizado
- Arquitectura modular con clases ES6
- Carga rápida y ligero
- Compatible con navegadores modernos

### 🔒 **Seguridad**
- Headers de seguridad configurados (CSP, X-Frame-Options, etc.)
- Sin vulnerabilidades conocidas
- Procesamiento local del JSON (no se envía a servidores)
- Dockerfile optimizado con usuario no-root
- Nginx con configuración de seguridad robusta

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS, Grid, Flexbox, Animaciones
- **JavaScript ES6+** - Clases, Async/Await, Modules
- **Nginx** - Servidor web de producción
- **Docker** - Containerización
- **Sin frameworks** - Vanilla JS puro

## 📦 Estructura del Proyecto

```
convert_string_json/
├── index.html           # Estructura HTML mejorada
├── robots.txt           # SEO - Control de bots
├── sitemap.xml          # SEO - Mapa del sitio
├── security.txt         # Política de seguridad
├── Dockerfile           # Imagen Docker optimizada
├── docker-compose.yml   # Orquestación de contenedores
├── nginx.conf           # Configuración Nginx con seguridad
├── .dockerignore        # Archivos a excluir del build
├── .gitignore           # Archivos a excluir de Git
├── css/
│   └── index.css       # Estilos modernos con variables CSS
├── js/
│   └── index.js        # JavaScript modular (ES6+)
├── assets/
│   └── ...             # Imágenes y recursos
└── Readme.md           # Este archivo
```

## 🎯 Mejoras Implementadas (2025)

### Código
- ❌ **Eliminado jQuery** → ✅ JavaScript Vanilla moderno
- ✅ Arquitectura basada en clases (OOP)
- ✅ Sistema de notificaciones Toast personalizado
- ✅ Manejo robusto de errores
- ✅ Clipboard API moderna

### Diseño
- ✅ Paleta de colores profesional con gradientes
- ✅ Iconos SVG en lugar de fuentes
- ✅ Mejoras de accesibilidad (ARIA labels, focus visible)
- ✅ Diseño responsive mejorado
- ✅ Animaciones y transiciones suaves

### UX/UI
- ✅ Notificaciones toast en lugar de alertas nativas
- ✅ Botones de acción adicionales (limpiar, colapsar todo, expandir todo)
- ✅ Feedback visual mejorado
- ✅ Carga con indicador de estado
- ✅ Placeholder con ejemplos útiles

## 🚀 Cómo Usar

1. **Pegar** tu cadena JSON en el área INPUT
2. **Hacer clic** en "Convert JSON" (o presionar Ctrl+Enter)
3. **Ver** el resultado formateado con resaltado de sintaxis
4. **Copiar** el resultado con un clic
5. **Colapsar/Expandir** bloques según necesites

## 📱 Responsive Design

- **Desktop** (>968px): Layout de dos columnas
- **Tablet** (640px - 968px): Layout adaptativo
- **Mobile** (<640px): Layout vertical optimizado

## ♿ Accesibilidad

- Soporte completo de navegación por teclado
- ARIA labels en todos los controles
- Focus visible para navegación sin mouse
- Soporte para `prefers-reduced-motion`

## 🔧 Para Desarrolladores

### Ejecutar localmente

```bash
# Clonar el repositorio
git clone [tu-repositorio]

# Abrir index.html en tu navegador
# O usar un servidor local
python -m http.server 8000
# Luego abrir http://localhost:8000
```

### Despliegue con Docker

#### Construcción local

```bash
# Construir la imagen
docker build -t json-converter:latest .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name json-converter json-converter:latest

# Acceder a http://localhost:8080
```

#### Usando Docker Compose

```bash
# Iniciar los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

#### Publicar en Docker Hub

```bash
# Login en Docker Hub
docker login

# Tag de la imagen
docker tag json-converter:latest yourusername/json-converter:latest

# Push a Docker Hub
docker push yourusername/json-converter:latest
```

### Integración con Cloudflare

1. **Subir a GitHub**: Haz push de tu código a GitHub
2. **Conectar con Cloudflare Pages**:
   - Ve a Cloudflare Dashboard > Pages
   - Conecta tu repositorio de GitHub
   - Configura el build (no necesita build, es estático)
   - Deploy automático en cada push

3. **Alternativa con Docker + Cloudflare Tunnel**:
   ```bash
   # Instalar cloudflared
   # Windows: descarga desde https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

   # Login
   cloudflared tunnel login

   # Crear tunnel
   cloudflared tunnel create json-converter

   # Ruta del contenedor Docker
   cloudflared tunnel route dns json-converter yourdomain.com

   # Ejecutar
   cloudflared tunnel run json-converter --url http://localhost:8080
   ```

### GitHub Actions CI/CD

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/docker-build.yml`) que:
- Construye la imagen Docker automáticamente
- La sube a Docker Hub en cada push a main
- Usa cache para builds más rápidos

**Configuración necesaria:**
1. Ve a Settings > Secrets en tu repositorio de GitHub
2. Añade estos secrets:
   - `DOCKER_USERNAME`: Tu usuario de Docker Hub
   - `DOCKER_PASSWORD`: Tu token de acceso de Docker Hub

### Personalizar

Las variables CSS están en `:root` para fácil personalización:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --bg-dark: #0f1419;
  /* ... más variables */
}
```

## 🔒 Seguridad

### Headers de Seguridad Implementados

- **Content-Security-Policy**: Previene XSS
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing
- **Referrer-Policy**: Control de información de referencia
- **Permissions-Policy**: Control de APIs del navegador

### Configuración en Nginx

El archivo `nginx.conf` incluye todas las configuraciones de seguridad necesarias, incluyendo:
- Headers de seguridad
- Compresión gzip
- Cache de assets estáticos
- Protección contra archivos ocultos

### SEO

- ✅ `robots.txt` configurado
- ✅ `sitemap.xml` incluido
- ✅ Meta tags Open Graph para redes sociales
- ✅ Meta tags Twitter Cards
- ✅ Canonical URL
- ✅ `security.txt` para reportes de seguridad

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 👨‍💻 Autor

**Eder Rimarachin**

---

# 🔄 JSON String to JSON Converter (English)

![Preview](https://jsonconverter.eder-rimarachin.com/assets/preview-image.png)

Convert JSON strings into beautifully formatted JSON objects online. **Completely rebuilt in 2025** with modern technologies.

## 🌍 Live Demo

[JSON String to JSON Converter](https://jsonconverter.eder-rimarachin.com)

## ✨ Features

### 🎨 **Modern Design**
- Dark interface with vibrant gradients (purple/blue)
- Smooth animations and fluid transitions
- Fully responsive design for mobile and tablets
- Professional theme with enhanced syntax highlighting

### 🚀 **Advanced Functionality**
- ✅ Instant JSON string conversion with smart validation
- ✅ Syntax highlighting with differentiated colors
- ✅ Interactive collapse/expand JSON blocks
- ✅ One-click copy to clipboard
- ✅ Quick field clearing
- ✅ Automatic correction of common formats
- ✅ Elegant toast notifications (no annoying alerts)
- ✅ Keyboard shortcuts (Ctrl+Enter to convert)
- ✅ Line numbering for better readability

### ⚡ **Performance and Quality**
- **No external dependencies** - Modern Vanilla JavaScript (ES6+)
- **100% jQuery-free** - Clean and optimized code
- Modular architecture with ES6 classes
- Fast loading and lightweight
- Compatible with modern browsers

## 🎯 Improvements Implemented (2025)

### Code
- ❌ **Removed jQuery** → ✅ Modern Vanilla JavaScript
- ✅ Class-based architecture (OOP)
- ✅ Custom Toast notification system
- ✅ Robust error handling
- ✅ Modern Clipboard API

### Design
- ✅ Professional color palette with gradients
- ✅ SVG icons instead of fonts
- ✅ Accessibility improvements (ARIA labels, focus visible)
- ✅ Enhanced responsive design
- ✅ Smooth animations and transitions

### UX/UI
- ✅ Toast notifications instead of native alerts
- ✅ Additional action buttons (clear, collapse all, expand all)
- ✅ Improved visual feedback
- ✅ Loading with state indicator
- ✅ Placeholder with useful examples

## 📜 License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.

## 👨‍💻 Author

**Eder Rimarachin**
