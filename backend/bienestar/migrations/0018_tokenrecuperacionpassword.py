from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bienestar', '0017_rename_mail_usuario_email'),
    ]

    operations = [
        migrations.CreateModel(
            name='TokenRecuperacionPassword',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_hash', models.CharField(max_length=64, unique=True)),
                ('creado', models.DateTimeField(auto_now_add=True)),
                ('expira', models.DateTimeField(db_index=True)),
                ('utilizado', models.DateTimeField(blank=True, null=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tokens_recuperacion_password', to='bienestar.usuario')),
            ],
            options={
                'verbose_name': 'Token de recuperación de contraseña',
                'verbose_name_plural': 'Tokens de recuperación de contraseña',
                'ordering': ['-creado'],
            },
        ),
    ]
