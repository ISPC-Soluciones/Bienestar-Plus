from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from django.contrib.auth import login  

from .models import Usuario, ProgresoDiario, PerfilSalud, Ejercicio, RutinaEjercicio, Habito, ProgresoChecklist, Notificacion, Estado
from .serializers import (
    ProgresoDiarioSerializer,
    UsuarioSerializer,
    UsuarioUpdateSerializer,
    PerfilSaludSerializer,
    EjercicioSerializer,
    RutinaEjercicioSerializer,
    HabitoSerializer,
    ProgresoChecklistSerializer,
    NotificacionSerializer,
    RegistroUsuarioSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# =========================================================
# REGISTRO Y LOGIN
# =========================================================

class RegistroUsuarioView(APIView):
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            usuario_creado = serializer.save()
            try:
                perfil_salud = usuario_creado.perfil_salud
            except PerfilSalud.DoesNotExist:
                perfil_salud = None

            if perfil_salud:
                Notificacion.objects.create(
                    usuario=usuario_creado,
                    mensaje=perfil_salud.recomendacion_enfoque or "Tu recomendación será calculada luego",
                    estado=Estado.PENDIENTE.value,
                    enviado=timezone.now()
                )

            return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

class LoginUsuarioView(APIView):
    def post(self, request):
        mail = request.data.get('email')
        password = request.data.get('password')
        if not mail or not password:
            return Response({"error": "Faltan email o password"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            usuario = Usuario.objects.get(mail=mail)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario o contraseña incorrectos"}, status=status.HTTP_401_UNAUTHORIZED)
        if not check_password(password, usuario.password):
            return Response({"error": "Usuario o contraseña incorrectos"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = UsuarioSerializer(usuario)


        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

# =========================================================
# VIEWSETS
# =========================================================

class EjercicioViewSet(viewsets.ModelViewSet):
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer

class RutinaEjercicioViewSet(viewsets.ModelViewSet):
    queryset = RutinaEjercicio.objects.all().select_related('ejercicio')
    serializer_class = RutinaEjercicioSerializer

    def get_queryset(self):
        queryset = self.queryset
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id, fecha_registro=timezone.localdate())
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            rutina_ejercicio, created = RutinaEjercicio.objects.get_or_create(
                usuario=serializer.validated_data['usuario'],
                ejercicio=serializer.validated_data['ejercicio'],
                fecha_registro=timezone.localdate(),
                defaults={'meta_cantidad': serializer.validated_data.get('meta_cantidad', 1), 'completado': False}
            )
            if created:
                return Response(RutinaEjercicioSerializer(rutina_ejercicio).data, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Este ejercicio ya está en tu rutina para hoy.", "rutina": RutinaEjercicioSerializer(rutina_ejercicio).data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =========================================================
# USUARIO
# =========================================================

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer

class PerfilSaludViewSet(viewsets.ModelViewSet):
    queryset = PerfilSalud.objects.all()
    serializer_class = PerfilSaludSerializer

# =========================================================
# NOTIFICACIONES
# =========================================================

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all().order_by('-enviado')
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list':
            usuario_id = self.request.query_params.get('usuario', None)
            if usuario_id:
                queryset = queryset.filter(usuario_id=usuario_id)
            else:
                queryset = queryset.none()
        return queryset


    @action(detail=False, methods=['post'], url_path='crear-recomendacion')
    def crear_notificacion_recomendacion(self, request):
        mensaje = request.data.get('mensaje')
        if not mensaje:
            return Response({"detail": "El campo 'mensaje' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)
        usuario_a_usar = request.user if request.user and request.user.is_authenticated else Usuario.objects.filter(pk=1).first()
        if not usuario_a_usar:
            return Response({"detail": "No hay usuario autenticado ni usuario de prueba (ID 1)."}, status=status.HTTP_401_UNAUTHORIZED)
        notificacion = Notificacion.objects.create(usuario=usuario_a_usar, mensaje=mensaje, estado=Estado.PENDIENTE, enviado=timezone.now())
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        instance = self.get_object()
        if 'estado' in request.data:
            estado_val = request.data['estado']
            if estado_val not in [Estado.PENDIENTE, Estado.ENVIADO, Estado.LEIDO]:
                return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)
            instance.estado = estado_val
            instance.save()
            return Response(self.get_serializer(instance).data)
        return super().partial_update(request, pk)

# =========================================================
# HÁBITOS Y PROGRESO
# =========================================================

class HabitoViewSet(viewsets.ModelViewSet):
    queryset = Habito.objects.all()
    serializer_class = HabitoSerializer

class ProgresoDiarioViewSet(viewsets.ModelViewSet):
    queryset = ProgresoDiario.objects.all()
    serializer_class = ProgresoDiarioSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id, fecha=timezone.localdate())
        return queryset

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        progreso = get_object_or_404(ProgresoDiario, pk=pk)
        progreso.completado = not progreso.completado
        progreso.save()
        return Response({'id': progreso.id, 'completado': progreso.completado})

class ProgresoChecklistViewSet(viewsets.ModelViewSet):
    queryset = ProgresoChecklist.objects.all()
    serializer_class = ProgresoChecklistSerializer
