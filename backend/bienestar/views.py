from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.db.models import Count, Sum, F 
from datetime import timedelta 
from .models import Usuario, ProgresoDiario, PerfilSalud, Ejercicio, RutinaEjercicio, Roles, Habito, ProgresoChecklist, Notificacion 
from .serializers import (
    ProgresoDiarioSerializer, 
    UsuarioSerializer, 
    UsuarioUpdateSerializer,
    PerfilSaludSerializer, 
    EjercicioSerializer, 
    RutinaEjercicioSerializer,
    HabitoSerializer, 
    ProgresoChecklistSerializer,
    NotificacionSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# =========================================================
# VISTAS DE AUTENTICACIÓN (REINTRODUCIDAS PARA CORREGIR IMPORTERROR)
# =========================================================

class RegistroUsuarioView(APIView):
    def post(self, request):
        nombre = request.data.get('nombre')
        mail = request.data.get('email')
        password = request.data.get('password')
        telefono = request.data.get('telefono', '')
        genero = request.data.get('genero')
        fecha_nacimiento = request.data.get('fecha_nacimiento')

        if not nombre or not mail or not password:
            return Response({"error": "Faltan campos obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
        if Usuario.objects.filter(mail=mail).exists():
            return Response({"error": "Correo ya registrado"}, status=status.HTTP_400_BAD_REQUEST)

        usuario = Usuario.objects.create(
            nombre=nombre,
            mail=mail,
            password=make_password(password),
            telefono=telefono
        )
        
        PerfilSalud.objects.create(
            usuario=usuario,
            genero=genero,
            fecha_nacimiento=fecha_nacimiento
        )

        serializer = UsuarioSerializer(usuario)
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
# VIEWSETS ESPECÍFICOS (Modificados)
# =========================================================

class EjercicioViewSet(viewsets.ModelViewSet):
    """CRUD de Ejercicios base (Administrador)."""
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
    # Nota: Si tu frontend espera { results: [] }, esto es manejado por la paginación de DRF.


class RutinaEjercicioViewSet(viewsets.ModelViewSet):
    """Gestiona la adición (POST) y listado (GET) de ejercicios a la rutina del usuario."""
    queryset = RutinaEjercicio.objects.all().select_related('ejercicio')
    serializer_class = RutinaEjercicioSerializer

    def get_queryset(self):
        """Filtra la lista por el usuario solicitado (Query Param 'usuario_id') para la fecha de hoy."""
        queryset = self.queryset
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id is not None:
            # Filtra por el ID del usuario y forzamos la fecha de hoy
            queryset = queryset.filter(usuario_id=usuario_id, fecha_registro=timezone.localdate())
        return queryset

    def list(self, request, *args, **kwargs):
        """Devuelve la rutina de ejercicios del usuario para hoy."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Permite al usuario agregar un ejercicio a su rutina diaria, evitando duplicados."""
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rutina_ejercicio, created = RutinaEjercicio.objects.get_or_create(
                usuario=serializer.validated_data['usuario'],
                ejercicio=serializer.validated_data['ejercicio'],
                fecha_registro=timezone.localdate(), # Forzar la fecha de hoy
                defaults={
                    'meta_cantidad': serializer.validated_data.get('meta_cantidad', 1),
                    'completado': False
                }
            )
            
            if created:
                return Response(
                    RutinaEjercicioSerializer(rutina_ejercicio).data, 
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "message": "Este ejercicio ya está en tu rutina para hoy.",
                        "rutina": RutinaEjercicioSerializer(rutina_ejercicio).data
                    }, 
                    status=status.HTTP_200_OK
                )
                
        except Exception as e:
            print(f"Error al intentar crear rutina: {e}")
            return Response({"error": "Error interno al procesar la rutina. Asegúrate que Usuario/Ejercicio existan."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================================================
# VIEWSETS GENERALES (Inalterados, pero mantenidos)
# =========================================================

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = UsuarioSerializer

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer
    
    # ... (métodos retrieve, update, partial_update, etc.)

class PerfilSaludViewSet(viewsets.ModelViewSet):
    queryset = PerfilSalud.objects.all()
    serializer_class = PerfilSaludSerializer
    # ... (métodos put, patch, get)

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all().order_by('-enviado')
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            return self.queryset.filter(usuario_id=usuario_id)
        return self.queryset

class HabitoViewSet(viewsets.ModelViewSet):
    queryset = Habito.objects.all()
    serializer_class = HabitoSerializer

class ProgresoDiarioViewSet(viewsets.ModelViewSet):
    queryset = ProgresoDiario.objects.all()
    serializer_class = ProgresoDiarioSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id is not None:
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
