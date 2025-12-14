FROM nginx:alpine

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache tzdata && rm -rf /var/cache/apk/*

ENV TZ=UTC

# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy configs and code
COPY nginx.conf /etc/nginx/nginx.conf
# Asegúrate de que estas carpetas existen en tu GitHub
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
# COPY assets/ /usr/share/nginx/html/assets/  <-- Descomenta si tienes assets
# COPY robots.txt /usr/share/nginx/html/      <-- Descomenta si tienes robots
# COPY sitemap.xml /usr/share/nginx/html/     <-- Descomenta si tienes sitemap

# PERMISOS CRÍTICOS para usuario no-root
# Damos permisos al usuario nginx sobre html, logs y cache
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Run as non-root user
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]