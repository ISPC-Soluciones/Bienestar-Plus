from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from importlib import import_module

try:
    spectacular_views = import_module('drf_spectacular.views')
except ModuleNotFoundError:
    spectacular_views = None
from bienestar.views import (
    RegistroUsuarioView,
    LoginUsuarioView,
    GoogleLoginView,
    GoogleCallbackView,
    SesionUsuarioView,
    LogoutUsuarioView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bienestar.urls')),
    path('api/registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('api/login/', LoginUsuarioView.as_view(), name='login'),
    path(
    'api/auth/google/',
    GoogleLoginView.as_view(),
    name='google-login'
    ),
    path(
    'api/auth/google/callback/',
    GoogleCallbackView.as_view(),
    name='google-callback'
    ),
    path(
    'api/auth/me/',
    SesionUsuarioView.as_view(),
    name='auth-me'
    ),
    path(
    'api/auth/logout/',
    LogoutUsuarioView.as_view(),
    name='auth-logout'
    ),
]

if spectacular_views:
    urlpatterns += [
        path('api/schema/', spectacular_views.SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', spectacular_views.SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', spectacular_views.SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)