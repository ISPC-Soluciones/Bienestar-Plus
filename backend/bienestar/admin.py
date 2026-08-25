from django.contrib import admin
from .models import (
    Usuario,
    PerfilSalud,
    Ejercicio,
    RutinaEjercicio,
    Habito,
    ProgresoDiario,
    ProgresoChecklist,
    Recurso,
    Recomendacion,
    Notificacion,
)

admin.site.register(Usuario)
admin.site.register(PerfilSalud)
admin.site.register(Ejercicio)
admin.site.register(RutinaEjercicio)
admin.site.register(Habito)
admin.site.register(ProgresoDiario)
admin.site.register(ProgresoChecklist)
admin.site.register(Recurso)
admin.site.register(Recomendacion)
admin.site.register(Notificacion)