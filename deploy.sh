#!/bin/bash

# JSON Converter Deployment Script
# Este script facilita el despliegue de la aplicación

set -e

echo "🚀 JSON Converter Deployment Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_NAME="json-converter"
IMAGE_NAME="json-converter"
CONTAINER_NAME="json-converter-app"
PORT="8080"

# Functions
function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

function print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

print_success "Docker está instalado"

# Menu
echo ""
echo "Selecciona una opción:"
echo "1) Construir imagen Docker"
echo "2) Ejecutar contenedor"
echo "3) Detener contenedor"
echo "4) Ver logs"
echo "5) Reconstruir y ejecutar"
echo "6) Limpiar (remove container e imagen)"
echo "7) Deploy completo (build + run)"
echo "8) Salir"
echo ""
read -p "Opción: " option

case $option in
    1)
        print_info "Construyendo imagen Docker..."
        docker build -t $IMAGE_NAME:latest .
        print_success "Imagen construida exitosamente"
        ;;
    2)
        print_info "Ejecutando contenedor..."
        docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME:latest
        print_success "Contenedor ejecutándose en http://localhost:$PORT"
        ;;
    3)
        print_info "Deteniendo contenedor..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        print_success "Contenedor detenido y eliminado"
        ;;
    4)
        print_info "Mostrando logs..."
        docker logs -f $CONTAINER_NAME
        ;;
    5)
        print_info "Reconstruyendo y ejecutando..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker build -t $IMAGE_NAME:latest .
        docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME:latest
        print_success "Aplicación reconstruida y ejecutándose en http://localhost:$PORT"
        ;;
    6)
        print_info "Limpiando..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker rmi $IMAGE_NAME:latest 2>/dev/null || true
        print_success "Limpieza completada"
        ;;
    7)
        print_info "Deploy completo..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker build -t $IMAGE_NAME:latest .
        docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME:latest
        echo ""
        print_success "✅ Deploy completado exitosamente!"
        print_info "Aplicación disponible en: http://localhost:$PORT"
        echo ""
        echo "Comandos útiles:"
        echo "  - Ver logs: docker logs -f $CONTAINER_NAME"
        echo "  - Detener: docker stop $CONTAINER_NAME"
        echo "  - Reiniciar: docker restart $CONTAINER_NAME"
        ;;
    8)
        print_info "Saliendo..."
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_success "Operación completada!"
