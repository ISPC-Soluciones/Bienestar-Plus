import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'default-key-local-only')

DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = ['.vercel.app', 'localhost', '127.0.0.1', 'bienestar-plus-backend.vercel.app']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'bienestar'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bienestar_plus_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bienestar_plus_api.wsgi.application'

# -----------------------------------------------
# Database Configuration (Robusta para Vercel)
# -----------------------------------------------

# Obtener la URL de la base de datos.
db_url_env = os.getenv('DATABASE_URL')

# Si la variable está vacía o None (como ocurre en Vercel con valores nulos), 
# la eliminamos del entorno de Python. Esto fuerza a dj_database_url a usar 'default'.
if not db_url_env:
    # Elimina DATABASE_URL del entorno de Python si existe
    if 'DATABASE_URL' in os.environ:
        del os.environ['DATABASE_URL']
    
    # Elimina POSTGRES_URL por limpieza (aunque no debería estar en Vercel)
    if 'POSTGRES_URL' in os.environ:
        del os.environ['POSTGRES_URL']

# Llama a dj_database_url.config():
# - Si DATABASE_URL tiene un valor (Supabase), lo usa.
# - Si no está en el entorno (porque lo eliminamos arriba), usa el 'default' (SQLite).
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///local_db.sqlite3',
        conn_max_age=600,
        ssl_require=True
    )
}

# -----------------------------------------------

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'backend', 'media')

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://bienestar-plus.vercel.app",
    "https://bienestar-plus-git-main-chris-projects-be539ae8.vercel.app",
]

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# Trailing slash
APPEND_SLASH = True