# ✅ Checklist Pre-Despliegue

Usa este checklist antes de subir a producción.

## 📝 Configuración Básica

- [ ] **Actualizar sitemap.xml** con tu dominio real
  ```xml
  <loc>https://tudominio.com/</loc>
  ```

- [ ] **Actualizar robots.txt** con tu dominio
  ```
  Sitemap: https://tudominio.com/sitemap.xml
  ```

- [ ] **Actualizar security.txt** con tu email de contacto
  ```
  Contact: security@tudominio.com
  ```

- [ ] **Actualizar index.html** meta tags con tu dominio
  - Open Graph URL
  - Twitter Card image URL
  - Canonical URL
  - Favicon URL

- [ ] **Actualizar README.md** con tu información
  - URL del demo
  - Tu nombre/organización
  - URLs de imágenes

## 🔒 Seguridad

- [ ] Headers de seguridad configurados en `nginx.conf`
- [ ] CSP (Content Security Policy) configurado
- [ ] SSL/TLS listo para producción
- [ ] Email de contacto de seguridad actualizado
- [ ] Sin credenciales hardcodeadas en el código
- [ ] `.env` en `.gitignore` (no subir a Git)

## 🐳 Docker

- [ ] `Dockerfile` optimizado y funcionando
- [ ] Prueba local: `docker build -t json-converter .`
- [ ] Prueba ejecución: `docker run -p 8080:80 json-converter`
- [ ] Verifica que funcione en `http://localhost:8080`
- [ ] `docker-compose.yml` configurado correctamente
- [ ] Healthcheck funcionando

## 🔧 GitHub

- [ ] Repositorio creado en GitHub
- [ ] README.md con instrucciones claras
- [ ] LICENSE file incluido
- [ ] .gitignore configurado
- [ ] CONTRIBUTING.md para colaboradores
- [ ] GitHub Actions configurado (opcional)
  - Secrets de Docker Hub añadidos
  - Workflow probado

## 🌐 Cloudflare

- [ ] Cuenta de Cloudflare creada
- [ ] Dominio agregado a Cloudflare
- [ ] DNS configurado
- [ ] SSL/TLS en modo "Full" o "Full (strict)"
- [ ] Page Rules configuradas (si necesario)
- [ ] Caching configurado

## 📱 Testing

### Funcionalidad
- [ ] Conversión de JSON válido ✓
- [ ] Manejo de JSON con errores ✓
- [ ] Reparación automática de JSON ✓
- [ ] Collapse/expand funciona ✓
- [ ] Copiar al portapapeles ✓
- [ ] Limpiar campos ✓
- [ ] Atajos de teclado (Ctrl+Enter) ✓

### Navegadores
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (si tienes Mac)
- [ ] Mobile browsers

### Responsive
- [ ] Desktop (>968px)
- [ ] Tablet (640px-968px)
- [ ] Mobile (<640px)

### Accesibilidad
- [ ] Navegación por teclado funciona
- [ ] Focus visible en todos los elementos
- [ ] ARIA labels presentes
- [ ] Contraste de colores adecuado

## 🚀 Performance

- [ ] Lighthouse score > 90
- [ ] Gzip habilitado (nginx.conf)
- [ ] Assets estáticos cacheados
- [ ] No hay errores en consola
- [ ] Tiempo de carga < 2 segundos

## 📊 SEO

- [ ] Title tag optimizado
- [ ] Meta description presente
- [ ] Open Graph tags configurados
- [ ] Twitter Card tags configurados
- [ ] Canonical URL configurado
- [ ] robots.txt accesible
- [ ] sitemap.xml accesible
- [ ] Favicon presente

## 📦 Deployment Final

### Opción 1: Cloudflare Pages
- [ ] Repositorio conectado a Cloudflare Pages
- [ ] Build exitoso
- [ ] Deploy funcionando
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL activo

### Opción 2: Docker + VPS
- [ ] Imagen publicada en Docker Hub
- [ ] VPS configurado y accesible
- [ ] Contenedor ejecutándose
- [ ] Puerto 80/443 abierto
- [ ] Dominio apuntando a VPS
- [ ] Cloudflare proxy activo
- [ ] SSL activo

### Opción 3: Docker Local + Cloudflare Tunnel
- [ ] Contenedor ejecutándose localmente
- [ ] Cloudflare Tunnel instalado
- [ ] Tunnel creado y configurado
- [ ] Dominio conectado al tunnel
- [ ] Tunnel ejecutándose

## 🔍 Post-Deployment

- [ ] Sitio accesible desde URL pública
- [ ] Headers de seguridad verificados: https://securityheaders.com
- [ ] SSL verificado: https://www.ssllabs.com/ssltest/
- [ ] Performance verificado: https://pagespeed.web.dev/
- [ ] Todas las funcionalidades probadas en producción
- [ ] No hay errores en consola de producción

## 📝 Documentación

- [ ] README actualizado con URL de producción
- [ ] DEPLOYMENT.md revisado
- [ ] Comentarios del código actualizados
- [ ] Changelog creado (opcional)

## 🎉 Promoción (Opcional)

- [ ] Compartir en redes sociales
- [ ] Añadir a portafolio personal
- [ ] Publicar en Product Hunt / Dev.to
- [ ] Añadir a GitHub Topics

---

## ⚠️ Último Paso Importante

**¡Haz un backup antes de deployar!**

```bash
# Backup del código
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Backup de Docker image
docker save json-converter:latest | gzip > json-converter-backup.tar.gz
```

---

## 🎊 ¡Todo Listo!

Si todos los items están marcados, ¡estás listo para production!

```bash
# Deploy final
git add .
git commit -m "chore: production ready"
git push origin main
```

¡Felicidades! 🚀
