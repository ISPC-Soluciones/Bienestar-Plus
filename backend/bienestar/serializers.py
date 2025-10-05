from rest_framework import serializers
from .models import ProgresoDiario

class ProgresoDiarioSerializer(serializers.ModelSerializer):
    habito_nombre = serializers.CharField(source="habito.nombre", read_only=True)

    class Meta:
        model = ProgresoDiario
        fields = ["id", "fecha", "habito", "habito_nombre", "usuario", "completado"]
        read_only_fields = ["usuario", "fecha"]
