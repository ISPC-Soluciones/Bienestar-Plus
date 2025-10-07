from rest_framework import serializers
from .models import ProgresoDiario, Usuario


class ProgresoDiarioSerializer(serializers.ModelSerializer):
    habito_nombre = serializers.CharField(source="habito.nombre", read_only=True)

    class Meta:
        model = ProgresoDiario
        fields = ["id", "fecha", "habito", "habito_nombre", "usuario", "completado"]
        read_only_fields = ["usuario", "fecha"]


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para visualización completa del usuario"""
    foto_perfil_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'mail', 'rol', 'fecha_registro', 'telefono', 'foto_perfil', 'foto_perfil_url']
        read_only_fields = ['id', 'fecha_registro', 'rol']
    
    def get_foto_perfil_url(self, obj):
        """Retorna la URL completa de la foto de perfil"""
        if obj.foto_perfil:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualización de datos del usuario"""
    foto_perfil = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Usuario
        fields = ['nombre', 'mail', 'foto_perfil']
    
    def validate_mail(self, value):
        """Validación para evitar emails duplicados"""
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(mail=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value
    
    def validate_nombre(self, value):
        """Validación básica del nombre"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres.")
        return value.strip()