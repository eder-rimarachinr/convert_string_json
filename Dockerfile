FROM nginx:alpine

# 1. Instalamos curl y tzdata
RUN apk update && apk upgrade && apk add --no-cache \
    tzdata curl \
    && rm -rf /var/cache/apk/*

ENV TZ=UTC

# Limpieza
RUN rm -rf /usr/share/nginx/html/*

# Copia de configs y archivos
COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/
COPY manifest.json /usr/share/nginx/html/
COPY security.txt /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/

# Ajuste de permisos (Buena práctica)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# 🛑 HE BORRADO "USER nginx" AQUÍ.
# Permitimos que arranque como root para que pueda "escuchar" en el puerto 80.
# La seguridad la gestiona Nginx internamente gracias a tu archivo nginx.conf.

EXPOSE 80

# Healthcheck con curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]