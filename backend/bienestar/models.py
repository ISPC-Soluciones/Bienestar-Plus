from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings

# =========================================================
# NOTA: Los ENUMS de PostgreSQL se replican con
# TextChoices en Django para mantener la integridad de datos
# =========================================================

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
    password = models.CharField(max_length=255) # Almacenará el hash de la contraseña.
    
    rol = models.CharField(
        max_length=50,
        choices=Roles.choices,
        default=Roles.ESTANDAR,
    )
    
    fecha_registro = models.DateTimeField(auto_now_add=True) 
    telefono = models.CharField(max_length=20, blank=True, null=True)
    foto_perfil = models.ImageField(upload_to='perfiles/', blank=True, null=True)  

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Usuarios"


# =========================================================
# MODELOS DE CONTENIDO EJERCICIOS
# =========================================================

class Ejercicio(models.Model):
    """
    Define los ejercicios base que el administrador puede gestionar (CRUD).
    Ejemplos: Flexiones, Sentadillas, Correr.
    """
    class Tipos(models.TextChoices):
        FUERZA = 'fuerza', _('Fuerza')
        CARDIO = 'cardio', _('Cardio')
        FLEXIBILIDAD = 'flexibilidad', _('Flexibilidad')

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    
    tipo = models.CharField(
        max_length=20,
        choices=Tipos.choices,
        default=Tipos.FUERZA,
    )

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Ejercicios"


class RutinaEjercicio(models.Model):
    """
    Representa el registro de un hábito de ejercicio de un usuario.
    Esto es el historial de lo que el usuario HIZO.
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='rutinas_ejercicio')
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE, related_name='registros_rutina')
    
    fecha_registro = models.DateField(auto_now_add=True)
    completado = models.BooleanField(default=False)
    
    # Meta (ej: 10 repeticiones, 30 minutos)
    meta_cantidad = models.IntegerField(help_text="Cantidad objetivo (repeticiones, minutos, etc.)")

    def __str__(self):
        return f"{self.usuario.nombre} - {self.ejercicio.nombre} ({self.fecha_registro})"

    class Meta:
        verbose_name_plural = "Rutinas de Ejercicio"
        unique_together = ('usuario', 'ejercicio', 'fecha_registro') # Evita duplicados en el mismo día


# =========================================================
# MODELOS EXISTENTES (RELACIONES)
# =========================================================

class PerfilSalud(models.Model):
    """
    Modelo para la tabla Perfil Salud. Relación 1:1 con Usuario.
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
    

# =========================================================
# MODELOS DE HÁBITOS Y PROGRESO DIARIO
# =========================================================

class Habito(models.Model):
    """
    Define los hábitos base que forman parte del bienestar.
    Ejemplos: Hidratación, Ejercicio, Sueño, Alimentación, Meditación.
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Hábitos"
        
class ProgresoDiarioManager(models.Manager):
    def asegurar_progresos_para_usuario(self, usuario, fecha=None):
        """
        Crea registros (si faltan) para cada Habito existente
        para el usuario y la fecha indicada (por defecto hoy).
        Devuelve la lista de objetos creados (puede estar vacía).
        """
        if fecha is None:
            fecha = timezone.localdate()
        created = []
        for habito in Habito.objects.all():
            obj, creado = self.get_or_create(
                usuario=usuario,
                habito=habito,
                fecha=fecha,
                defaults={'completado': False}
            )
            if creado:
                created.append(obj)
        return created

    def obtener_checklist_para_usuario(self, usuario, fecha=None):
        """
        Asegura que existan los registros del día y devuelve el queryset
        con los ProgresoDiario del usuario para esa fecha (incluye habito).
        """
        if fecha is None:
            fecha = timezone.localdate()
        self.asegurar_progresos_para_usuario(usuario, fecha)
        return self.filter(usuario=usuario, fecha=fecha).select_related('habito')


class ProgresoDiario(models.Model):
    """
    Representa el progreso de un hábito en un día específico por usuario.
    """
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progresos")
    habito = models.ForeignKey(Habito, on_delete=models.CASCADE, related_name="progresos")
    fecha = models.DateField(auto_now_add=True)
    completado = models.BooleanField(default=False)
    
    objects = ProgresoDiarioManager()

    def __str__(self):
        estado = "✔️" if self.completado else "❌"
        return f"{self.usuario.nombre} - {self.habito.nombre} ({self.fecha}) {estado}"

    class Meta:
        verbose_name_plural = "Progresos Diarios"
        unique_together = ("usuario", "habito", "fecha")  # Un hábito por usuario por día