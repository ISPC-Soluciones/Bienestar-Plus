#!/bin/bash

# 1. Construir el Frontend
npm run build --prefix frontend

# 2. Navegar al Backend, instalar dependencias y recolectar estáticos
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput