# Bienestar-Plus/backend/wsgi.py

import os
from django.core.wsgi import get_wsgi_application

# IMPORTANTE: Apunta al settings.py dentro de tu carpeta de proyecto Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bienestar_plus_api.settings')

application = get_wsgi_application()

# Importa el manejo de archivos estáticos y envuelve la aplicación
from django.contrib.staticfiles.handlers import StaticFilesHandler
application = StaticFilesHandler(application)