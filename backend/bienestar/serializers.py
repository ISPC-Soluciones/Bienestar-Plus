from rest_framework import serializers
from .models import (
    ProgresoDiario,
    Habito, 
    Usuario, 
    PerfilSalud, 
    Ejercicio,
    RutinaEjercicio,
    ProgresoChecklist,
    Notificacion,
    Recurso,
)
from decimal import Decimal
from django.contrib.auth.hashers import make_password
from django.urls import reverse
from django.utils import timezone

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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=150)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=20, max_length=255, trim_whitespace=True)
    password = serializers.CharField(
        min_length=8,
        max_length=128,
        write_only=True,
        trim_whitespace=False,
    )
    confirmar_password = serializers.CharField(
        min_length=8,
        max_length=128,
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmar_password']:
            raise serializers.ValidationError(
                {'confirmar_password': 'Las contraseñas no coinciden.'}
            )
        return attrs

# =========================================================
# SERIALIZADORES DE USUARIO
# =========================================================

class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()

    perfil_salud = PerfilSaludSerializer(
        source='perfilsalud',
        read_only=True
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'email', 'rol', 'fecha_registro', 'telefono',
            'foto_perfil', 'foto_perfil_url', 'perfil_salud'
        ]
        read_only_fields = ['id', 'fecha_registro', 'rol']

    def get_foto_perfil_url(self, obj):
        if obj.foto_perfil_id:
            request = self.context.get('request')
            url = f'/api/usuarios/{obj.id}/foto-perfil/'
            if request:
                return request.build_absolute_uri(url)
            return obj.foto_perfil.url
        return None

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'telefono']

    def validate_email(self, value):
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    def validate_nombre(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres.")
        return value.strip()

class UsuarioAdminSerializer(serializers.ModelSerializer):

    perfil_salud = PerfilSaludSerializer(source='perfilsalud', required=False)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'telefono', 'rol', 'perfil_salud']

    def validate_email(self, value):
        usuario = self.instance
        if Usuario.objects.exclude(pk=usuario.pk).filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfilsalud', None)
        instance = super().update(instance, validated_data)

        if perfil_data is not None:
            perfil, _ = PerfilSalud.objects.get_or_create(usuario=instance)
            for campo, valor in perfil_data.items():
                setattr(perfil, campo, valor)
            perfil.actualizar_recomendacion()
            perfil.save()

        return instance

# =========================================================
# SERIALIZADORES DE EJERCICIOS Y RUTINA
# =========================================================

class EjercicioSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Ejercicio
        fields = ['id', 'nombre', 'descripcion', 'tipo', 'imagen_url']

    def get_imagen_url(self, obj):
        if not obj.imagen_id:
            return None
        # ?v= cambia cuando se reemplaza la imagen, así el navegador no muestra la vieja.
        url = f"{reverse('ejercicio-imagen', args=[obj.pk])}?v={obj.imagen_id}"
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url


class RutinaEjercicioSerializer(serializers.ModelSerializer):
    MENSAJE_DUPLICADO = 'Este ejercicio ya está en tu rutina de hoy.'
    ejercicio_nombre = serializers.CharField(source='ejercicio.nombre', read_only=True)
    ejercicio = serializers.PrimaryKeyRelatedField(queryset=Ejercicio.objects.all())
    es_de_hoy = serializers.SerializerMethodField()
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), write_only=True)
    fecha_registro = serializers.DateField(required=False, read_only=True)

    class Meta:
        model = RutinaEjercicio
        fields = '__all__'
        read_only_fields = ['fecha_registro', 'ejercicio_nombre']

        def get_es_de_hoy(self, obj):
        # La fecha "de hoy" la define el servidor, no el navegador del usuario.
            return obj.fecha_registro == timezone.localdate()
    
    def validate_meta_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError('La meta debe ser un número mayor que cero.')
        return value
    
    def validate(self, attrs):
        if self.instance is None:
            ya_existe = RutinaEjercicio.objects.filter(
                usuario=attrs['usuario'],
                ejercicio=attrs['ejercicio'],
                fecha_registro=timezone.localdate(),
            ).exists()
            if ya_existe:
                raise serializers.ValidationError({'ejercicio': self.MENSAJE_DUPLICADO})
        elif self.instance.completado:
            raise serializers.ValidationError(
                {'detail': 'Un ejercicio completado no puede modificarse.'}
            )
        return attrs
      

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
        fields = ["id", "fecha", "habito", "usuario", "completado", "valor"]
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


# =========================================================
# SERIALIZADOR DE RECURSOS
# =========================================================

class RecursoSerializer(serializers.ModelSerializer):
    enlace = serializers.URLField(required=False, allow_blank=True, default='')
    usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Recurso
        fields = ['id', 'usuario', 'descripcion', 'tipo', 'enlace']

    def create(self, validated_data):
        if 'usuario' not in validated_data or validated_data.get('usuario') is None:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False) and hasattr(request.user, 'id'):
                try:
                    validated_data['usuario'] = Usuario.objects.get(pk=request.user.id)
                except Usuario.DoesNotExist:
                    pass
            if 'usuario' not in validated_data or validated_data.get('usuario') is None:
                usuario_default = Usuario.objects.first()
                if usuario_default:
                    validated_data['usuario'] = usuario_default
        return super().create(validated_data)

