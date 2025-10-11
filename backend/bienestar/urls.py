from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import UsuarioViewSet, PerfilSaludView, EstadisticasView, EjercicioViewSet,  RutinaEjercicioViewSet
=======
from .views import UsuarioViewSet, RegistroUsuarioView, LoginUsuarioView, PerfilSaludView, EstadisticasView, EjercicioViewSet, RutinaEjercicioViewSet
>>>>>>> a906cd896ad10e13520aeaf5f16b7e2036c0fa71
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')
router.register(r'rutinas-ejercicio', RutinaEjercicioViewSet, basename='rutina-ejercicio')

urlpatterns = [
    path('', include(router.urls)), 
    
    path('perfil-salud/<int:user_id>/', PerfilSaludView.as_view(), name='perfil-salud'), 

    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
]
