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
    NotificacionesViewSet,
    ProgresoDiarioView,
    NoticiasView,
    ResumenRendimientoView,
    RecursoViewSet,
)
from .password_reset_views import PasswordResetConfirmView, PasswordResetRequestView
from .nutrition_views import PlanNutricionalView
from .export_views import ExportarDatosView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')
router.register(r'rutinas-ejercicio', RutinaEjercicioViewSet, basename='rutina-ejercicio')
router.register(r'notificaciones', NotificacionesViewSet, basename='notificacion') 
router.register(r'recursos', RecursoViewSet, basename='recurso') 

urlpatterns = [
    path('usuarios/<int:user_id>/resumen-rendimiento/', ResumenRendimientoView.as_view(), name='resumen-rendimiento'),
    path('plan-nutricional/', PlanNutricionalView.as_view(), name='plan-nutricional'),
    path('exportar-datos/', ExportarDatosView.as_view(), name='exportar-datos'),
    path('', include(router.urls)), 
    path('perfil-salud/<int:user_id>/', PerfilSaludView.as_view(), name='perfil-salud'), 
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('progreso/', ProgresoDiarioView.as_view(), name='progreso-lista'),
    path('progreso/<int:pk>/', ProgresoDiarioView.as_view(), name='progreso-detalle'),
    path('noticias/', NoticiasView.as_view(), name='noticias'),
    path(
        'password-reset/request/',
        PasswordResetRequestView.as_view(),
        name='password-reset-request',
    ),
    path(
        'password-reset/confirm/',
        PasswordResetConfirmView.as_view(),
        name='password-reset-confirm',
    ),
]
