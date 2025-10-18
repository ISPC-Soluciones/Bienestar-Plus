from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, PerfilSaludView, EstadisticasView, EjercicioViewSet,  RutinaEjercicioViewSet, NotificacionViewSet
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')
router.register(r'rutinas-ejercicio', RutinaEjercicioViewSet, basename='rutina-ejercicio')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')

urlpatterns = [
    path('', include(router.urls)), 
    
    path('perfil-salud/<int:user_id>/', PerfilSaludView.as_view(), name='perfil-salud'), 

    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
]
