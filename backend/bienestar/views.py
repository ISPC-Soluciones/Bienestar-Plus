from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import date
from .models import ProgresoDiario
from .serializers import ProgresoDiarioSerializer

class ProgresoDiarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Devuelve los hábitos del día actual para el usuario autenticado"""
        usuario = request.user
        hoy = date.today()

        ProgresoDiario.objects.asegurar_progresos_para_usuario(usuario, hoy)

        progresos = ProgresoDiario.objects.filter(usuario=usuario, fecha=hoy)
        serializer = ProgresoDiarioSerializer(progresos, many=True)

        completados = progresos.filter(completado=True).count()

        return Response({
            "fecha": hoy,
            "total_habitos": progresos.count(),
            "completados": completados,
            "progresos": serializer.data
        })

    def patch(self, request):
        """
        Permite marcar o desmarcar un hábito como completado.
        Espera un JSON como:
        {
            "progreso_id": 1,
            "completado": true
        }
        """
        progreso_id = request.data.get("progreso_id")
        completado = request.data.get("completado")

        try:
            progreso = ProgresoDiario.objects.get(id=progreso_id, usuario=request.user)
        except ProgresoDiario.DoesNotExist:
            return Response({"error": "Progreso no encontrado o no pertenece al usuario."},
                            status=status.HTTP_404_NOT_FOUND)

        progreso.completado = completado
        progreso.save()

        return Response({
            "mensaje": "Progreso actualizado correctamente.",
            "progreso_id": progreso.id,
            "completado": progreso.completado
        }, status=status.HTTP_200_OK)

