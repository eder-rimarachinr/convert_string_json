FROM nginx:alpine

# 1️⃣ CAMBIO AQUÍ: Añadimos 'curl' a la lista de instalación
RUN apk update && apk upgrade && apk add --no-cache \
    tzdata curl \
    && rm -rf /var/cache/apk/*

ENV TZ=UTC

# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copia de archivos (Esto déjalo igual que lo tenías, asegúrate de que coincida con tus carpetas)
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
COPY manifest.json /usr/share/nginx/html/
COPY security.txt /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/

# Permisos
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

EXPOSE 80

# 2️⃣ CAMBIO AQUÍ: Usamos 'curl' que es más robusto para verificar si la web responde
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]