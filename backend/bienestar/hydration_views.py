from django.db.models import Sum
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.cache import patch_cache_control, patch_vary_headers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .hydration_serializers import RegistroHidratacionSerializer
from .models import Habito, ProgresoDiario, RegistroHidratacion
from .nutrition_views import UsuarioSessionAuthentication

NOMBRE_HABITO = 'Hidratación'


def resumen_del_dia(request):
    """Registros de hoy del usuario, con el total y si alcanzó la meta."""
    hoy = timezone.localdate()
    registros = RegistroHidratacion.objects.filter(usuario=request.user, fecha=hoy)
    total_ml = registros.aggregate(total=Sum('cantidad_ml'))['total'] or 0
    meta_ml = RegistroHidratacion.META_DIARIA_ML
    return {
        'fecha': hoy,
        'meta_ml': meta_ml,
        'total_ml': total_ml,
        'completado': total_ml >= meta_ml,
        'registros': RegistroHidratacionSerializer(registros, many=True).data,
    }


def actualizar_habito(usuario, completado):
    """Mantiene el hábito "Hidratación" de ProgresoDiario en sintonía con los registros."""
    habito = Habito.objects.filter(nombre=NOMBRE_HABITO).first()
    if habito is None:
        return
    progreso, _ = ProgresoDiario.objects.get_or_create(
        usuario=usuario, habito=habito, fecha=timezone.localdate()
    )
    if progreso.completado != completado:
        progreso.completado = completado
        progreso.save(update_fields=['completado'])


class HidratacionBaseView(APIView):
    authentication_classes = [UsuarioSessionAuthentication]

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        patch_cache_control(response, no_store=True, private=True)
        patch_vary_headers(response, ['Cookie'])
        return response


class HidratacionView(HidratacionBaseView):
    def get(self, request):
        return Response({**resumen_del_dia(request), 'csrf_token': get_token(request)})

    def post(self, request):
        serializer = RegistroHidratacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=request.user)

        resumen = resumen_del_dia(request)
        actualizar_habito(request.user, resumen['completado'])
        return Response(resumen, status=status.HTTP_201_CREATED)


class HidratacionDetalleView(HidratacionBaseView):
    def delete(self, request, pk):
        # Solo se buscan registros del usuario en sesión: uno ajeno responde 404.
        registro = RegistroHidratacion.objects.filter(pk=pk, usuario=request.user).first()
        if registro is None:
            return Response({'detail': 'Registro no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if registro.fecha != timezone.localdate():
            return Response(
                {'detail': 'Solo se pueden eliminar registros del día de hoy.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registro.delete()
        resumen = resumen_del_dia(request)
        actualizar_habito(request.user, resumen['completado'])
        return Response(resumen, status=status.HTTP_200_OK)