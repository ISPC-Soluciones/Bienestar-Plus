from django.db import models
from django.utils.translation import gettext_lazy as _

# ==========================================================
# NOTA: Los ENUMS de PostgreSQL se replican con
# TextChoices en Django para mantener la integridad de datos
# ==========================================================

class Usuario(models.Model):
    """
    Modelo para la tabla Usuario.
    Representa a los usuarios del sistema.
    """
    class Roles(models.TextChoices):
        ESTANDAR = 'estandar', _('Estándar')
        ADMIN = 'admin', _('Administrador')

    nombre = models.CharField(max_length=100)
    mail = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    
    rol = models.CharField(
        max_length=50,
        choices=Roles.choices,
        default=Roles.ESTANDAR,
    )
    
    fecha_registro = models.DateTimeField(auto_now_add=True) 
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Usuarios"


class PerfilSalud(models.Model):
    """
    Modelo para la tabla Perfil Salud. 
    Relación 1:1 con Usuario.
    """
    class Generos(models.TextChoices):
        MASCULINO = 'M', _('Masculino')
        FEMENINO = 'F', _('Femenino')
        OTRO = 'Otro', _('Otro')

    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE,
        primary_key=True 
    )
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    altura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    genero = models.CharField(
        max_length=10, 
        choices=Generos.choices, 
        null=True, blank=True
    )
    fecha_nacimiento = models.DateField(null=True, blank=True)
    imc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Perfil de {self.usuario.nombre}"


class Recurso(models.Model):
    """
    Modelo para la tabla Recursos. 
    Relación N:1 (Muchos recursos para un Usuario).
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='recursos')
    descripcion = models.TextField()
    tipo = models.CharField(max_length=50)
    enlace = models.URLField(max_length=255)

    def __str__(self):
        return self.tipo + ": " + self.descripcion[:20]


class Recomendacion(models.Model):
    """
    Modelo para la tabla Recomendacion. 
    Relación N:1 (Muchas recomendaciones para un Usuario).
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='recomendaciones')
    mensaje = models.TextField()
    tipo_usuario = models.CharField(max_length=50) 

    def __str__(self):
        return f"Recomendación para {self.usuario.nombre}"


class Notificacion(models.Model):
    """
    Modelo para la tabla Notificaciones.
    """
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', _('Pendiente')
        ENVIADO = 'enviado', _('Enviado')
        LEIDO = 'leido', _('Leído')

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.TextField()
    
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    
    enviado = models.DateTimeField(null=True, blank=True)
    leido = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Notificación: {self.mensaje[:30]}"
