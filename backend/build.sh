#!/bin/bash

# --- 1. CONFIGURACIÓN ---
# DIRECTORIO DE ESTÁTICOS DE DJANGO REST FRAMEWORK (DRF)
# Usamos 'find' para localizar el directorio de DRF dentro del entorno virtual
DRF_STATIC_DIR=$(find . -type d -path '*/rest_framework/static/rest_framework' -print -quit)

# DIRECTORIO DE DESTINO DE VERCEL (donde collectstatic recoge todo)
DEST_DIR="staticfiles/rest_framework"

echo "Directorio de estáticos de DRF encontrado: $DRF_STATIC_DIR"
echo "Copiando a: $DEST_DIR"

# --- 2. COPIA MANUAL ---
# Crea el directorio de destino si no existe
mkdir -p "$DEST_DIR"

# Copia los archivos de DRF al directorio estático de Vercel
if [ -d "$DRF_STATIC_DIR" ]; then
    cp -r "$DRF_STATIC_DIR"/* "$DEST_DIR"
    echo "Copia de estáticos de DRF completada."
else
    echo "ADVERTENCIA: No se encontró el directorio estático de DRF ($DRF_STATIC_DIR). El API Browser podría fallar."
fi

# --- 3. RECOLECCIÓN ESTÁTICA DE DJANGO ---
python manage.py collectstatic --noinput

# --- 4. CONFIGURACIÓN DE PERMISOS (necesario en algunos entornos Vercel) ---
chmod +x wsgi.py