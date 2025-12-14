FROM nginx:alpine

# Install security updates & timezone
RUN apk update && apk upgrade && apk add --no-cache tzdata && rm -rf /var/cache/apk/*
ENV TZ=UTC

# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# --- COPIA DE ARCHIVOS DE LA WEB ---

# 1. Archivos base (HTML, CSS, JS)
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# 2. Assets (Imágenes, iconos, logos)
# ¡IMPORTANTE! Descomentado porque tu HTML nuevo usa muchos iconos de aquí
COPY assets/ /usr/share/nginx/html/assets/

# 3. Archivos Meta y SEO (Nuevos)
# Has añadido un link a manifest.json en el head
COPY manifest.json /usr/share/nginx/html/
# Has añadido un link a security.txt en el footer
COPY security.txt /usr/share/nginx/html/
# Descomentados para SEO
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/

# --- PERMISOS Y SEGURIDAD ---

# Permisos para usuario no-root (nginx)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]