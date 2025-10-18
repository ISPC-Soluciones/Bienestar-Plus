from rest_framework import serializers
from .models import (
    ProgresoDiario,
    Habito, 
    Usuario, 
    PerfilSalud, 
    Ejercicio,
    RutinaEjercicio,
    ProgresoChecklist
)
from decimal import Decimal
from rest_framework import serializers
from .models import Notificacion

class HabitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habito
        fields = ["id", "nombre", "descripcion"]
        
class ProgresoDiarioSerializer(serializers.ModelSerializer):
    habito = HabitoSerializer(read_only=True)

    class Meta:
        model = ProgresoDiario
        fields = ["id", "fecha", "habito", "usuario", "completado"]
        read_only_fields = ["usuario", "fecha"]
        
class PerfilSaludSerializer(serializers.ModelSerializer):
    imc = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = PerfilSalud
        fields = ['peso', 'altura', 'genero', 'fecha_nacimiento', 'imc']

    def create(self, validated_data):
        usuario = self.context.get('usuario')
        if not usuario:
            raise serializers.ValidationError("Usuario no proporcionado")
        return PerfilSalud.objects.create(usuario=usuario, **validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


    def validate_peso(self, value):
        """Asegura que el peso es un valor positivo."""
        if value is not None and value <= Decimal(0):
            raise serializers.ValidationError("El peso debe ser un valor positivo.")
        return value

    def validate_altura(self, value):
        """Asegura que la altura es un valor positivo."""
        if value is not None and value <= Decimal(0):
            raise serializers.ValidationError("La altura debe ser un valor positivo.")
        return value

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para visualización completa del usuario"""
    foto_perfil_url = serializers.SerializerMethodField()
    perfil_salud = PerfilSaludSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'mail', 'rol', 'fecha_registro', 'telefono',
            'foto_perfil', 'foto_perfil_url', 'perfil_salud'
        ]
        read_only_fields = ['id', 'fecha_registro', 'rol']


    def get_foto_perfil_url(self, obj):
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



class EjercicioSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Ejercicio (CRUD por el administrador)."""
    class Meta:
        model = Ejercicio
        fields = '__all__'

class RutinaEjercicioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo RutinaEjercicio (registro de actividad del usuario).
    """
    ejercicio_nombre = serializers.CharField(source='ejercicio.nombre', read_only=True)
    
    fecha_registro = serializers.DateField(required=False)

    class Meta:
        model = RutinaEjercicio
        fields = '__all__'
        read_only_fields = ['fecha_registro']




class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'
        
class ProgresoChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgresoChecklist
        fields = '__all__'
