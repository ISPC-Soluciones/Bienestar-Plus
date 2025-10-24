from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import IntegrityError, transaction

# =========================================================
# ENUMS
# =========================================================

class Roles(models.TextChoices):
    ESTANDAR = 'estandar', _('Estándar')
    ADMIN = 'admin', _('Administrador')

class Tipos(models.TextChoices):
    FUERZA = 'fuerza', _('Fuerza')
    CARDIO = 'cardio', _('Cardio')
    FLEXIBILIDAD = 'flexibilidad', _('Flexibilidad')

class Generos(models.TextChoices):
    MASCULINO = 'M', _('Masculino')
    FEMENINO = 'F', _('Femenino')
    OTRO = 'Otro', _('Otro')

class Estado(models.TextChoices):
    PENDIENTE = 'pendiente', _('Pendiente')
    ENVIADO = 'enviado', _('Enviado')
    LEIDO = 'leido', _('Leído')

# =========================================================
# MODELOS DE USUARIO Y PERFIL
# =========================================================

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=255)  # hash
    rol = models.CharField(max_length=50, choices=Roles.choices, default=Roles.ESTANDAR)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    foto_perfil = models.ImageField(upload_to='perfiles/', blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Usuarios"


RECOMENDACION_CHOICES = [
    ('FUERZA_CARDIO', 'Fuerza y Cardio'),
    ('FLEXIBILIDAD_MANTENIMIENTO', 'Flexibilidad y Mantenimiento'),
]

class PerfilSalud(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    peso = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    altura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    genero = models.CharField(max_length=10, choices=Generos.choices, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)

    recomendacion_enfoque = models.CharField(
        max_length=50,
        choices=RECOMENDACION_CHOICES,
        null=True,
        blank=True,
        help_text="Recomendación de enfoque de ejercicio basada en el IMC"
    )

    mostrar_modal_imc = models.BooleanField(
        default=True,
        help_text="Indica si el modal de recomendación inicial debe ser mostrado al usuario."
    )

    def calcular_imc(self):
        if self.peso and self.altura and self.altura > 0:
            imc_value = self.peso / (self.altura * self.altura)
            return round(imc_value, 2)
        return None

    @property
    def imc(self):
        return self.calcular_imc()
    
    def mapear_recomendacion(self, imc_value):
        """Mapea el valor del IMC a una recomendación de enfoque."""
        if imc_value is None:
            return None
        if imc_value < 18.5:  
            return 'FUERZA_CARDIO'
        elif 18.5 <= imc_value <= 24.9:  
            return 'FLEXIBILIDAD_MANTENIMIENTO'
        elif imc_value > 24.9:  
            return 'FUERZA_CARDIO'
        
        return None
    
    def actualizar_recomendacion(self):
        """Calcula el IMC y actualiza el campo de recomendación."""
        imc = self.calcular_imc()
        self.recomendacion_enfoque = self.mapear_recomendacion(imc)

    def __str__(self):
        return f"Perfil de {self.usuario.nombre}"

    class Meta:
        verbose_name_plural = "Perfiles de Salud"


# =========================================================
# MODELOS DE CONTENIDO Y EJERCICIOS (NUESTRA SECCIÓN)
# =========================================================

class Ejercicio(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=Tipos.choices, default=Tipos.FUERZA)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Ejercicios"


class RutinaEjercicio(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='rutinas_ejercicio')
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE, related_name='registros_rutina')
    meta_cantidad = models.IntegerField(default=1)
    completado = models.BooleanField(default=False)
    fecha_registro = models.DateField(default=timezone.localdate) 

    class Meta:
        verbose_name = "Registro de Rutina"
        verbose_name_plural = "Registros de Rutinas"
        unique_together = ('usuario', 'ejercicio', 'fecha_registro') 
        ordering = ['-fecha_registro']

    def __str__(self):
        return f"{self.ejercicio.nombre} - {self.usuario.nombre} ({self.fecha_registro})"


# =========================================================
# MODELOS DE HÁBITOS Y PROGRESO DIARIO (INALTERADOS)
# =========================================================

class Habito(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name_plural = "Hábitos"


class ProgresoDiarioManager(models.Manager):
    def asegurar_progresos_para_usuario(self, usuario, fecha):
        habitos = Habito.objects.all() 

        for habito in habitos:
            try:
                with transaction.atomic():
                    self.get_or_create(
                        usuario=usuario,
                        habito=habito,
                        fecha=fecha,
                        defaults={'completado': False}
                    )
            except IntegrityError:
                continue

    def obtener_checklist_para_usuario(self, usuario, fecha=None):
        if fecha is None:
            fecha = timezone.localdate()
        self.asegurar_progresos_para_usuario(usuario, fecha)
        return self.filter(usuario=usuario, fecha=fecha).select_related('habito')


class ProgresoDiario(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="progresos")
    habito = models.ForeignKey(Habito, on_delete=models.CASCADE, related_name="progresos")
    fecha = models.DateField(default=timezone.localdate)
    completado = models.BooleanField(default=False)

    objects = ProgresoDiarioManager()

    def __str__(self):
        estado = "[✅]" if self.completado else "[❌]"
        return f"{self.usuario.nombre} - {self.habito.nombre} ({self.fecha}) {estado}"

    class Meta:
        verbose_name_plural = "Progresos Diarios"
        unique_together = ("usuario", "habito", "fecha")


# =========================================================
# OTROS MODELOS (Inalterados)
# =========================================================

class Recurso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='recursos')
    descripcion = models.TextField()
    tipo = models.CharField(max_length=50)
    enlace = models.URLField(max_length=255)

    def __str__(self):
        return f"{self.tipo}: {self.descripcion[:20]}"

    class Meta:
        verbose_name_plural = "Recursos"


class Recomendacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='recomendaciones')
    mensaje = models.TextField()
    tipo_usuario = models.CharField(max_length=50)

    def __str__(self):
        return f"Recomendación para {self.usuario.nombre}"

    class Meta:
        verbose_name_plural = "Recomendaciones"


class Notificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.TextField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    enviado = models.DateTimeField(null=True, blank=True)
    leido = models.DateTimeField(null=True, blank=True)

    def marcar_como_enviado(self):
        self.estado = Estado.ENVIADO
        self.enviado = timezone.now()
        self.save()

    def marcar_como_leido(self):
        self.estado = Estado.LEIDO
        self.leido = timezone.now()
        self.save()

    def __str__(self):
        return f"Notificación: {self.mensaje[:30]}"

    class Meta:
        verbose_name_plural = "Notificaciones"
        
        
class ProgresoChecklist(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="checklists")
    fecha = models.DateField(default=timezone.localdate)
    progresos = models.ManyToManyField(ProgresoDiario, related_name="checklists")
    completado = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Progresos Checklist"
        unique_together = ("usuario", "fecha")
        ordering = ['-fecha']

    def __str__(self):
        return f"Checklist de {self.usuario.nombre} - {self.fecha}"

    def actualizar_estado(self):
        if self.progresos.exists():
            self.completado = all(p.completado for p in self.progresos.all())
            self.save()
