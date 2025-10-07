from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Usuario, ProgresoDiario
from .serializers import (
    UsuarioSerializer, 
    UsuarioUpdateSerializer,
    ProgresoDiarioSerializer
)


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