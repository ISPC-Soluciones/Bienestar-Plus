from rest_framework import serializers
from .models import (
    ProgresoDiario,
    Habito, 
    Usuario, 
    PerfilSalud, 
    Ejercicio,
    RutinaEjercicio,
    ProgresoChecklist,
    Notificacion
)
from decimal import Decimal
from django.contrib.auth.hashers import make_password

# =========================================================
# SERIALIZADORES DE PERFIL
# =========================================================

class PerfilSaludSerializer(serializers.ModelSerializer):
    imc = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = PerfilSalud
        fields = ['peso', 'altura', 'genero', 'fecha_nacimiento', 'imc', 'recomendacion_enfoque', 'mostrar_modal_imc']
        read_only_fields = ('recomendacion_enfoque', 'mostrar_modal_imc',)

    def create(self, validated_data):
        usuario = self.context.get('usuario')
        if not usuario:
            raise serializers.ValidationError("Usuario no proporcionado")
        return PerfilSalud.objects.create(usuario=usuario, **validated_data)

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        if 'peso' in validated_data or 'altura' in validated_data:
            instance.actualizar_recomendacion()
        instance.save()
        return instance

    def validate_peso(self, value):
        if value is not None and value <= Decimal(0):
            raise serializers.ValidationError("El peso debe ser un valor positivo.")
        return value

    def validate_altura(self, value):
        if value is None:
            return value

        if value <= Decimal(0):
            raise serializers.ValidationError(
                "La altura debe ser un valor positivo."
            )

    # Si llega en centímetros (ej. 180), convertir a metros (1.80)
        if value > Decimal('3'):
            value = value / Decimal('100')

        return value

# =========================================================
# SERIALIZADOR DE REGISTRO DE USUARIO
# =========================================================

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='email')
    perfil_salud = PerfilSaludSerializer(required=False)

    class Meta:
        model = Usuario
        fields = ('id', 'email', 'password', 'nombre', 'perfil_salud')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        perfil_salud_data = validated_data.pop('perfil_salud', {})
        password = validated_data.pop('password')
        
        usuario = Usuario.objects.create(**validated_data, password=make_password(password))
        
        perfil_salud = PerfilSalud.objects.create(usuario=usuario, **perfil_salud_data)
        
        perfil_salud.actualizar_recomendacion()
        perfil_salud.save()

        usuario.perfil_salud = perfil_salud
        return usuario

# =========================================================
# SERIALIZADORES DE USUARIO
# =========================================================

class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()
    perfil_salud = PerfilSaludSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'email', 'rol', 'fecha_registro', 'telefono',
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
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'foto_perfil', 'telefono']

    def validate_email(self, value):
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    def validate_nombre(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres.")
        return value.strip()

# =========================================================
# SERIALIZADORES DE EJERCICIOS Y RUTINA
# =========================================================

class EjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ejercicio
        fields = '__all__' 


class RutinaEjercicioSerializer(serializers.ModelSerializer):
    ejercicio_nombre = serializers.CharField(source='ejercicio.nombre', read_only=True)
    ejercicio = serializers.PrimaryKeyRelatedField(queryset=Ejercicio.objects.all(), write_only=True)
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), write_only=True)
    fecha_registro = serializers.DateField(required=False, read_only=True)

    class Meta:
        model = RutinaEjercicio
        fields = '__all__'
        read_only_fields = ['fecha_registro', 'ejercicio_nombre'] 
      

# =========================================================
# SERIALIZADORES DE HÁBITOS Y PROGRESO
# =========================================================

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

class ProgresoChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgresoChecklist
        fields = '__all__'

class NotificacionSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'usuario',
            'mensaje',
            'estado',
            'estado_display',
            'enviado',
            'leido',
        ]