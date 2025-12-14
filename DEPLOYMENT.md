# 🚀 Guía Rápida de Despliegue

## Opción 1: GitHub + Cloudflare Pages (Recomendado - Más Fácil)

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/json-converter.git
git push -u origin main
```

### Paso 2: Conectar con Cloudflare Pages
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Workers & Pages** > **Create Application** > **Pages**
3. Conecta tu repositorio de GitHub
4. Configuración de build:
   - **Build command**: (dejar vacío)
   - **Build output directory**: `/`
   - **Root directory**: `/`
5. Click en **Save and Deploy**

✅ ¡Listo! Tu app estará en: `https://tu-proyecto.pages.dev`

### Configurar Dominio Personalizado
1. En Cloudflare Pages, ve a tu proyecto
2. Click en **Custom domains** > **Set up a custom domain**
3. Sigue las instrucciones para configurar tu dominio

---

## Opción 2: Docker + Docker Hub + Servidor VPS

### Paso 1: Construir y Publicar en Docker Hub
```bash
# Login en Docker Hub
docker login

# Construir imagen
docker build -t tu-usuario/json-converter:latest .

# Publicar en Docker Hub
docker push tu-usuario/json-converter:latest
```

### Paso 2: Desplegar en VPS
```bash
# Conectar a tu VPS
ssh user@tu-servidor.com

# Descargar y ejecutar el contenedor
docker pull tu-usuario/json-converter:latest
docker run -d -p 80:80 --name json-converter tu-usuario/json-converter:latest
```

### Paso 3: Configurar Cloudflare como Proxy
1. Apunta tu dominio a la IP de tu VPS en Cloudflare DNS
2. Activa el proxy de Cloudflare (nube naranja)
3. Configura SSL/TLS en modo "Full"

---

## Opción 3: Docker Local con Cloudflare Tunnel

### Paso 1: Ejecutar contenedor localmente
```bash
# Windows PowerShell
.\deploy.ps1
# Selecciona opción 7 (Deploy completo)

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
# Selecciona opción 7 (Deploy completo)
```

### Paso 2: Configurar Cloudflare Tunnel
```bash
# Instalar cloudflared
# Windows: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

# Login
cloudflared tunnel login

# Crear tunnel
cloudflared tunnel create json-converter

# Configurar tunnel
cloudflared tunnel route dns json-converter tudominio.com

# Ejecutar tunnel
cloudflared tunnel run json-converter --url http://localhost:8080
```

---

## Opción 4: GitHub Actions + Docker Hub (CI/CD Automático)

### Configuración Inicial
1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Añade estos secrets:
   - `DOCKER_USERNAME`: Tu usuario de Docker Hub
   - `DOCKER_PASSWORD`: Tu token de Docker Hub

### Uso
Cada vez que hagas push a `main`, GitHub Actions:
1. Construirá automáticamente la imagen Docker
2. La publicará en Docker Hub
3. Etiquetará con versión y SHA del commit

```bash
# Hacer cambios y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# GitHub Actions se encarga del resto automáticamente
```

---

## Verificación Post-Despliegue

Verifica que todo funcione correctamente:

### Checklist de Seguridad
- [ ] Headers de seguridad activos (usa https://securityheaders.com)
- [ ] SSL/TLS configurado correctamente
- [ ] robots.txt accesible
- [ ] sitemap.xml accesible
- [ ] No hay errores en la consola del navegador

### Checklist de Funcionalidad
- [ ] Conversión de JSON válido funciona
- [ ] Manejo de errores muestra mensajes claros
- [ ] Collapse/expand funciona correctamente
- [ ] Copiar al portapapeles funciona
- [ ] Responsive design en móvil funciona
- [ ] Reparación automática de JSON funciona

### Herramientas de Prueba
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## Mantenimiento

### Actualizar contenido
```bash
# Hacer cambios
git add .
git commit -m "update: descripción del cambio"
git push origin main

# Si usas Docker:
docker pull tu-usuario/json-converter:latest
docker stop json-converter
docker rm json-converter
docker run -d -p 80:80 --name json-converter tu-usuario/json-converter:latest
```

### Ver logs
```bash
# Docker
docker logs -f json-converter

# Cloudflare Pages
# Ve al dashboard > tu proyecto > Deployment logs
```

### Rollback (volver a versión anterior)
```bash
# Docker
docker pull tu-usuario/json-converter:tag-anterior
docker stop json-converter
docker rm json-converter
docker run -d -p 80:80 --name json-converter tu-usuario/json-converter:tag-anterior

# Cloudflare Pages
# Dashboard > Deployments > Rollback to previous deployment
```

---

## Solución de Problemas Comunes

### Error: "Cannot connect to Docker daemon"
```bash
# Windows: Asegúrate de que Docker Desktop esté ejecutándose
# Linux:
sudo systemctl start docker
```

### Error: "Port already in use"
```bash
# Cambiar el puerto
docker run -d -p 8080:80 --name json-converter tu-usuario/json-converter:latest
```

### Error: "Permission denied" al ejecutar deploy.sh
```bash
chmod +x deploy.sh
```

### Headers de seguridad no aparecen
- Si usas Cloudflare, verifica que las Page Rules no las estén sobrescribiendo
- Verifica la configuración de nginx.conf

---

## Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/json-converter/issues)
- **Documentación**: [README.md](README.md)
- **Contribuir**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

¡Feliz despliegue! 🎉
