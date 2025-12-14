# JSON Converter Deployment Script (PowerShell)
# Este script facilita el despliegue de la aplicación en Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 JSON Converter Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$APP_NAME = "json-converter"
$IMAGE_NAME = "json-converter"
$CONTAINER_NAME = "json-converter-app"
$PORT = "8080"

# Functions
function Print-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Info {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

# Check if Docker is installed
try {
    $null = docker --version
    Print-Success "Docker está instalado"
} catch {
    Print-Error "Docker no está instalado. Por favor instala Docker Desktop primero."
    exit 1
}

# Menu
Write-Host ""
Write-Host "Selecciona una opción:"
Write-Host "1) Construir imagen Docker"
Write-Host "2) Ejecutar contenedor"
Write-Host "3) Detener contenedor"
Write-Host "4) Ver logs"
Write-Host "5) Reconstruir y ejecutar"
Write-Host "6) Limpiar (remove container e imagen)"
Write-Host "7) Deploy completo (build + run)"
Write-Host "8) Salir"
Write-Host ""
$option = Read-Host "Opción"

switch ($option) {
    "1" {
        Print-Info "Construyendo imagen Docker..."
        docker build -t ${IMAGE_NAME}:latest .
        Print-Success "Imagen construida exitosamente"
    }
    "2" {
        Print-Info "Ejecutando contenedor..."
        docker run -d -p "${PORT}:80" --name $CONTAINER_NAME "${IMAGE_NAME}:latest"
        Print-Success "Contenedor ejecutándose en http://localhost:$PORT"
    }
    "3" {
        Print-Info "Deteniendo contenedor..."
        try {
            docker stop $CONTAINER_NAME 2>$null
            docker rm $CONTAINER_NAME 2>$null
        } catch {}
        Print-Success "Contenedor detenido y eliminado"
    }
    "4" {
        Print-Info "Mostrando logs..."
        docker logs -f $CONTAINER_NAME
    }
    "5" {
        Print-Info "Reconstruyendo y ejecutando..."
        try {
            docker stop $CONTAINER_NAME 2>$null
            docker rm $CONTAINER_NAME 2>$null
        } catch {}
        docker build -t ${IMAGE_NAME}:latest .
        docker run -d -p "${PORT}:80" --name $CONTAINER_NAME "${IMAGE_NAME}:latest"
        Print-Success "Aplicación reconstruida y ejecutándose en http://localhost:$PORT"
    }
    "6" {
        Print-Info "Limpiando..."
        try {
            docker stop $CONTAINER_NAME 2>$null
            docker rm $CONTAINER_NAME 2>$null
            docker rmi "${IMAGE_NAME}:latest" 2>$null
        } catch {}
        Print-Success "Limpieza completada"
    }
    "7" {
        Print-Info "Deploy completo..."
        try {
            docker stop $CONTAINER_NAME 2>$null
            docker rm $CONTAINER_NAME 2>$null
        } catch {}
        docker build -t ${IMAGE_NAME}:latest .
        docker run -d -p "${PORT}:80" --name $CONTAINER_NAME "${IMAGE_NAME}:latest"
        Write-Host ""
        Print-Success "✅ Deploy completado exitosamente!"
        Print-Info "Aplicación disponible en: http://localhost:$PORT"
        Write-Host ""
        Write-Host "Comandos útiles:"
        Write-Host "  - Ver logs: docker logs -f $CONTAINER_NAME"
        Write-Host "  - Detener: docker stop $CONTAINER_NAME"
        Write-Host "  - Reiniciar: docker restart $CONTAINER_NAME"
    }
    "8" {
        Print-Info "Saliendo..."
        exit 0
    }
    default {
        Print-Error "Opción inválida"
        exit 1
    }
}

Write-Host ""
Print-Success "Operación completada!"
