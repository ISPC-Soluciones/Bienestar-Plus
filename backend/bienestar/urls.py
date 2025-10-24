from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Import your views, including the missing NotificacionesViewSet
from .views import (
    UsuarioViewSet, 
    RegistroUsuarioView, 
    LoginUsuarioView, 
    PerfilSaludView, 
    EstadisticasView, 
    EjercicioViewSet, 
    RutinaEjercicioViewSet,
    NotificacionesViewSet  # <--- NEW IMPORT: You MUST ensure this view class exists
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')
router.register(r'rutinas-ejercicio', RutinaEjercicioViewSet, basename='rutina-ejercicio')
router.register(r'notificaciones', NotificacionesViewSet, basename='notificacion') 

urlpatterns = [
    path('', include(router.urls)), 
    
    path('perfil-salud/<int:user_id>/', PerfilSaludView.as_view(), name='perfil-salud'), 
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
]