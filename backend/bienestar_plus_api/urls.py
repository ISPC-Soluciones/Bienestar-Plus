from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from bienestar.views import ProgresoDiarioView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("progreso/", ProgresoDiarioView.as_view(), name="progreso-diario"),
    path('api/', include('bienestar.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)