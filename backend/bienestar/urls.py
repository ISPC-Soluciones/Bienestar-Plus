from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, PerfilSaludView # Importamos PerfilSaludView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)), 
    
    path('perfil-salud/<int:user_id>/', PerfilSaludView.as_view(), name='perfil-salud'), 
]
