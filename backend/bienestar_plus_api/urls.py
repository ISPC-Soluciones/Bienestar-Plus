from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from bienestar.views import RegistroUsuarioView, LoginUsuarioView 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bienestar.urls')),
    path('api/registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('api/login/', LoginUsuarioView.as_view(), name='login'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)