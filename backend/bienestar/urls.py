from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet,
    PerfilSaludViewSet,
    HabitoViewSet,
    ProgresoDiarioViewSet,
    EjercicioViewSet,
    RutinaEjercicioViewSet
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'perfil-salud', PerfilSaludViewSet, basename='perfil-salud')
router.register(r'habitos', HabitoViewSet, basename='habitos')
router.register(r'progresoschecklist', ProgresoDiarioViewSet, basename='progresoschecklist')
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicios')
router.register(r'rutinas', RutinaEjercicioViewSet, basename='rutinas')

urlpatterns = router.urls

