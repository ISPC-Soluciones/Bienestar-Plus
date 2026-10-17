"""
ASGI config for bienestar_plus_api project.
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from bienestar.routing import websocket_urlpatterns


os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'bienestar_plus_api.settings'
)


django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({

    'http': django_asgi_app,

    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})