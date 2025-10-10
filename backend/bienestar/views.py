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