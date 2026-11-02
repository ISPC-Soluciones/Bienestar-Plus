from django.db import migrations, models
import django.db.models.deletion


RECURSOS_INICIALES = [
    (
        'Orientación y apoyo en una urgencia de salud mental: línea nacional gratuita y confidencial, disponible las 24 horas, todos los días.',
        'Bienestar Psicológico',
        'https://www.argentina.gob.ar/node/513585',
    ),
    (
        'Guía ilustrada de la OMS con habilidades prácticas y ejercicios breves para afrontar el estrés.',
        'Material de Apoyo',
        'https://www.who.int/es/publications/b/53604',
    ),
]


def crear_recursos_iniciales(apps, schema_editor):
    Recurso = apps.get_model('bienestar', 'Recurso')
    recursos = Recurso.objects.using(schema_editor.connection.alias)

    for descripcion, tipo, enlace in RECURSOS_INICIALES:
        if not recursos.filter(descripcion=descripcion, tipo=tipo, enlace=enlace).exists():
            recursos.create(
                usuario=None,
                descripcion=descripcion,
                tipo=tipo,
                enlace=enlace,
            )


def eliminar_recursos_iniciales(apps, schema_editor):
    Recurso = apps.get_model('bienestar', 'Recurso')
    recursos = Recurso.objects.using(schema_editor.connection.alias)

    for descripcion, tipo, enlace in RECURSOS_INICIALES:
        recursos.filter(
            usuario__isnull=True,
            descripcion=descripcion,
            tipo=tipo,
            enlace=enlace,
        ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('bienestar', '0023_registrohidratacion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recurso',
            name='usuario',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='recursos',
                to='bienestar.usuario',
            ),
        ),
        migrations.RunPython(crear_recursos_iniciales, eliminar_recursos_iniciales),
    ]
