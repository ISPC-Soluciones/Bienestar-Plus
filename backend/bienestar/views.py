from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Sum, F 
from datetime import timedelta 
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario, ProgresoDiario, PerfilSalud


from .models import Usuario, ProgresoDiario, PerfilSalud, Ejercicio, RutinaEjercicio, Roles, Notificacion 
from .serializers import (
    UsuarioSerializer, 
    UsuarioUpdateSerializer,
    ProgresoDiarioSerializer,
    PerfilSaludSerializer,
    EjercicioSerializer, 
    RutinaEjercicioSerializer,
    NotificacionSerializer
)

class NotificacionesViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        queryset = Notificacion.objects.all()
        usuario_id = self.request.query_params.get('usuario_id')

        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)

        return queryset

class RegistroUsuarioView(APIView):
    def post(self, request):
        nombre = request.data.get('nombre')
        email = request.data.get('email')
        password = request.data.get('password')
        telefono = request.data.get('telefono', '')

        if not nombre or not email or not password:
            return Response(
                {"error": "Faltan campos obligatorios"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Usuario.objects.filter(email=email).exists():
            return Response(
                {"error": "Correo ya registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Datos del perfil de salud enviados desde Angular
        perfil_data = request.data.get('perfil_salud', {}) or {}

        # Permitimos también el formato viejo por compatibilidad
        genero = perfil_data.get('genero', request.data.get('genero'))
        fecha_nacimiento = perfil_data.get(
            'fecha_nacimiento',
            request.data.get('fecha_nacimiento')
        )
        peso = perfil_data.get('peso')
        altura = perfil_data.get('altura')

        usuario = Usuario.objects.create(
            nombre=nombre,
            email=email,
            password=make_password(password),
            telefono=telefono
        )

        perfil_salud = PerfilSalud.objects.create(
        usuario=usuario,
        genero=genero,
        fecha_nacimiento=fecha_nacimiento,
        peso=peso,
        altura=altura
            )

        perfil_salud.actualizar_recomendacion()
        perfil_salud.save()

        serializer = UsuarioSerializer(
            usuario,
            context={'request': request}
        )

        return Response(
            {
                "success": True,
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

class LoginUsuarioView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({"error": "Faltan email o password"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario o contraseña incorrectos"}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, usuario.password):
            return Response({"error": "Usuario o contraseña incorrectos"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UsuarioSerializer(usuario)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class ProgresoDiarioView(APIView):
    """
    Vista para obtener y actualizar el checklist del usuario.
    GET   /api/progreso/?usuario_id=<id>
    PATCH /api/progreso/<id>/           -> marcarCompletado(id, completado)
    PATCH /api/progreso/                -> actualizarProgreso(progreso_id, completado)
    """
    def get(self, request, pk=None):
        usuario_id = request.query_params.get("usuario_id")

        if not usuario_id:
            return Response(
                {"error": "Falta el parámetro 'usuario_id'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            usuario = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        fecha = timezone.localdate()
        progresos = ProgresoDiario.objects.obtener_checklist_para_usuario(usuario, fecha)
        serializer = ProgresoDiarioSerializer(progresos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        progreso_id = pk or request.data.get("progreso_id")
        completado = request.data.get("completado")

        if progreso_id is None or completado is None:
            return Response(
                {"error": "Faltan datos: se necesita el id del progreso y 'completado'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            progreso = ProgresoDiario.objects.get(pk=progreso_id)
        except ProgresoDiario.DoesNotExist:
            return Response(
                {"error": "Progreso no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        progreso.completado = completado
        progreso.save()
        serializer = ProgresoDiarioSerializer(progreso)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar el perfil de usuario.
    """
    queryset = Usuario.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Usa diferentes serializers según la acción"""
        if self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer

    def retrieve(self, request, pk=None):
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario, context={'request': request}) # Añadir context para foto_perfil_url
        return Response({
            'success': True,
            'data': serializer.data
        })

    def update(self, request, pk=None):
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioUpdateSerializer(usuario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            response_serializer = UsuarioSerializer(usuario, context={'request': request})
            return Response({
                'success': True,
                'message': 'Perfil actualizado exitosamente',
                'data': response_serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioUpdateSerializer(
            usuario, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            response_serializer = UsuarioSerializer(usuario, context={'request': request})
            return Response({
                'success': True,
                'message': 'Perfil actualizado exitosamente',
                'data': response_serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PerfilSaludView(APIView):
    """
    Gestiona el perfil de salud (relación 1:1 con Usuario).
    Endpoint: /api/perfil-salud/<user_id>/
    """
    # permission_classes = [IsAuthenticated] # Asumimos autenticación para producción
    
    def get(self, request, user_id):
        """Obtiene el perfil de salud para un usuario dado."""
        # Nota: En un sistema real, user_id debería venir de request.user.id
        usuario = get_object_or_404(Usuario, pk=user_id)
        
        try:
            perfil = usuario.perfilsalud
            serializer = PerfilSaludSerializer(perfil)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PerfilSalud.DoesNotExist:
            return Response(
                {"message": "Perfil de salud no encontrado. Use PUT para crearlo."},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, user_id):
        """
        Crea un nuevo perfil o actualiza uno existente (actualización completa).
        Endpoint: /api/perfil-salud/<user_id>/
        """
        usuario = get_object_or_404(Usuario, pk=user_id)
        
        try:
            perfil = usuario.perfilsalud # Obtener si existe
        except PerfilSalud.DoesNotExist:
            perfil = None # Si no existe, se creará
            
        data = request.data.copy()
        # Se requiere asignar el usuario, aunque el serializador lo maneja al guardar
        # data['usuario'] = usuario.pk 

        serializer = PerfilSaludSerializer(perfil, data=data)
        
        if serializer.is_valid():
            # Al guardar, aseguramos la asignación del usuario para la relación 1:1
            instance = serializer.save(usuario=usuario) 
            return Response(
                PerfilSaludSerializer(instance).data, 
                status=status.HTTP_201_CREATED if perfil is None else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, user_id):
        """Actualización parcial del perfil de salud (PATCH)."""
        usuario = get_object_or_404(Usuario, pk=user_id)
        
        try:
            perfil = usuario.perfilsalud
        except PerfilSalud.DoesNotExist:
            return Response(
                {"error": "El perfil de salud no existe para actualizar. Use PUT para crearlo primero."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PerfilSaludSerializer(perfil, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(PerfilSaludSerializer(perfil).data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EstadisticasView(APIView):
    """
    API de solo lectura para el Dashboard Administrativo.
    Endpoint: /api/estadisticas/
    """
    def get(self, request):
        hoy = timezone.localdate()
        fecha_hace_30_dias = hoy - timedelta(days=30)

        # 1. Obtener y limpiar el usuario_id
        usuario_id_str = request.query_params.get('usuario_id') 
        
        # Convierte 'null' (string) a None, y se asegura de que sea un valor válido
        usuario_id = None
        if usuario_id_str and usuario_id_str not in ['null', 'undefined']:
            try:
                # Intenta convertir a entero, que es el tipo esperado por Django
                usuario_id = int(usuario_id_str)
            except ValueError:
                # Si no es un entero válido, puedes devolver un 400 o ignorar el filtro
                pass # Ignoramos el filtro si el valor es inválido

        
        # --- Lógica de Rutinas ---
        rutinas_del_mes = RutinaEjercicio.objects.filter(
            fecha_registro__gte=fecha_hace_30_dias
        )
        
        # Aplica el filtro solo si usuario_id es un entero válido
        if usuario_id is not None:
            # Ahora usuario_id es un entero, por lo que el filtro es seguro.
            rutinas_del_mes = rutinas_del_mes.filter(usuario_id=usuario_id)
          
        # --- Lógica de Usuarios (siempre global) ---
        # Si esta API se usa para el panel de usuario individual,
        # 'total_usuarios' debería ser 1 si hay filtro, o total si no lo hay.
        # Asumo que esta métrica es GLOBAL, independientemente del filtro.
        total_usuarios = Usuario.objects.count()
        total_rutinas_registradas = rutinas_del_mes.count()

        ejercicios_populares = rutinas_del_mes.values(
            'ejercicio__nombre', 
            'ejercicio__tipo'
        ).annotate(
            conteo_rutinas=Count('ejercicio__nombre')
        ).order_by('-conteo_rutinas')[:5].values(
            nombre=F('ejercicio__nombre'), 
            tipo=F('ejercicio__tipo'), 
            conteo_rutinas=F('conteo_rutinas')
        )

        # --- Lógica de Progresos Completados ---
        progresos_completados = ProgresoDiario.objects.filter(
            completado=True,
            fecha__gte=fecha_hace_30_dias
        )
        
        # Aplica el filtro solo si usuario_id es un entero válido
        if usuario_id is not None:
            progresos_completados = progresos_completados.filter(usuario_id=usuario_id)

        metrics = {
            "total_usuarios": total_usuarios,
            "total_rutinas_registradas": total_rutinas_registradas,
            "progresos_diarios_completados": progresos_completados.count(),
            "ejercicios_mas_populares": list(ejercicios_populares),
        }

        return Response(metrics, status=status.HTTP_200_OK)

class EjercicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el CRUD de Ejercicios base (gestionado por el Administrador).
    Ruta generada: /api/ejercicios/
    """
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
    # Se recomienda añadir permisos: permission_classes = [IsAdminUser]

class RutinaEjercicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el CRUD de RutinaEjercicio (registro de actividad de los usuarios).
    Ruta generada: /api/rutinas-ejercicio/
    """
    queryset = RutinaEjercicio.objects.all()
    serializer_class = RutinaEjercicioSerializer

    def get_queryset(self):
        queryset = RutinaEjercicio.objects.all()
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id is not None:
            queryset = queryset.filter(usuario_id=usuario_id)
        return queryset

    def perform_create(self, serializer):
        """
        Si ya existe un registro con el mismo usuario, ejercicio y fecha_registro,
        se actualiza la cantidad en lugar de crear un duplicado.
        """
        usuario = serializer.validated_data.get('usuario')
        ejercicio = serializer.validated_data.get('ejercicio')
        fecha_registro = serializer.validated_data.get('fecha_registro', timezone.localdate())

        existente = RutinaEjercicio.objects.filter(
            usuario=usuario,
            ejercicio=ejercicio,
            fecha_registro=fecha_registro
        ).first()

        if existente:
            existente.meta_cantidad += serializer.validated_data.get('meta_cantidad', 1)
            existente.save()
        else:
            serializer.save()