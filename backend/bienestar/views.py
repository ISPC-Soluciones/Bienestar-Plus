from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario, ProgresoDiario, PerfilSalud


from .models import Usuario, ProgresoDiario
from .serializers import (
    UsuarioSerializer, 
    UsuarioUpdateSerializer,
    ProgresoDiarioSerializer
)

class RegistroUsuarioView(APIView):
    def post(self, request):
        nombre = request.data.get('nombre')
        mail = request.data.get('email')
        password = request.data.get('password')
        telefono = request.data.get('telefono', '')
         # Campos del perfil salud
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


class ProgresoDiarioView(APIView):
    """
    Vista para obtener el checklist del usuario.
    GET /progreso/?usuario_id=<id>
    """
    def get(self, request):
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



class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar el perfil de usuario.
    
    Endpoints:
    - GET /api/usuarios/{id}/ - Obtener datos del usuario
    - PUT /api/usuarios/{id}/ - Actualizar datos completos
    - PATCH /api/usuarios/{id}/ - Actualizar datos parciales
    """
    queryset = Usuario.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        """Usa diferentes serializers según la acción"""
        if self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer
    
    def retrieve(self, request, pk=None):
        """
        Obtiene los datos completos del usuario.
        GET /api/usuarios/{id}/
        """
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioSerializer(usuario)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, pk=None):
        """
        Actualiza completamente los datos del usuario (PUT).
        PUT /api/usuarios/{id}/
        """
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioUpdateSerializer(usuario, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = UsuarioSerializer(usuario)
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
        """
        Actualiza parcialmente los datos del usuario (PATCH).
        PATCH /api/usuarios/{id}/
        
        Permite actualizar solo los campos enviados.
        """
        usuario = get_object_or_404(Usuario, pk=pk)
        serializer = UsuarioUpdateSerializer(
            usuario, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = UsuarioSerializer(usuario)
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
    Calcula métricas clave de la aplicación...
    Endpoint: /api/estadisticas/
    """
    
    def get(self, request):
        """
        Calcula y devuelve las métricas.
        """
        
        # ----------------------------------------------------------------------
        # PASO 0: Definir el rango de tiempo (Últimos 30 días para todas las métricas de actividad)
        # ----------------------------------------------------------------------
        hoy = timezone.localdate()
        fecha_hace_30_dias = hoy - timedelta(days=30)
        
        # Filtro de registros de rutinas en el último mes
        rutinas_del_mes = RutinaEjercicio.objects.filter(
            fecha_registro__gte=fecha_hace_30_dias
        )
        
        # 1. Total de Usuarios (siempre global)
        total_usuarios = Usuario.objects.count()
        
        # 2. Total de Rutinas Registradas (FILTRADO POR EL ÚLTIMO MES)
        total_rutinas_registradas = rutinas_del_mes.count()
        
        # 3. Ejercicios Más Populares (Top 5 - FILTRADO POR EL ÚLTIMO MES)
        # Usamos el filtro de rutinas_del_mes para calcular la popularidad
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

        # 4. Total de Progreso Diario Completo (FILTRADO POR EL ÚLTIMO MES)
        # Cuenta la actividad reciente de checklists completados.
        progresos_completados = ProgresoDiario.objects.filter(
            completado=True,
            fecha__gte=fecha_hace_30_dias
        ).count()
        
        # Construcción de la respuesta
        metrics = {
            "total_usuarios": total_usuarios,
            "total_rutinas_registradas": total_rutinas_registradas,
            "progresos_diarios_completados": progresos_completados,
            "ejercicios_mas_populares": list(ejercicios_populares) 
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
    # Se recomienda añadir un filtro para que los usuarios solo vean sus propias rutinas.