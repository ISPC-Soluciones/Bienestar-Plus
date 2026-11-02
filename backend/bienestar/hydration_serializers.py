from django.utils import timezone
from rest_framework import serializers

from .models import RegistroHidratacion


class RegistroHidratacionSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    hora = serializers.SerializerMethodField()

    class Meta:
        model = RegistroHidratacion
        fields = ['id', 'tipo', 'tipo_display', 'cantidad_ml', 'fecha', 'hora']
        read_only_fields = ['id', 'cantidad_ml', 'fecha']

    def get_hora(self, obj):
        # Hora local del registro, por ejemplo "16:20".
        return timezone.localtime(obj.creado).strftime('%H:%M')