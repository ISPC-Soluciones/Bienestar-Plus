import csv
import io
from datetime import time
from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from bienestar.models import (
    ComidaPlan, Ejercicio, Habito, PlanNutricional, ProgresoDiario,
    Roles, RutinaEjercicio, Tipos, Usuario,
)


class ExportarDatosApiTests(TestCase):
    def setUp(self):
        self.url = reverse('exportar-datos')
        self.client = APIClient()
        self.usuario = Usuario.objects.create(
            nombre='Ana QA', email='ana.export@example.test',
            password=make_password('clave-ana'), rol=Roles.ESTANDAR,
        )
        self.otro = Usuario.objects.create(
            nombre='Otro QA', email='otro.export@example.test',
            password=make_password('clave-otro'), rol=Roles.ESTANDAR,
        )

    def login(self, usuario, clave):
        response = self.client.post('/api/login/', {'email': usuario.email, 'password': clave}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def filas(self, response):
        texto = response.content.decode('utf-8-sig')
        return list(csv.reader(io.StringIO(texto), delimiter=';'))

    def cargar_datos(self, usuario, plan='Plan de Ana'):
        plan_obj = PlanNutricional.objects.create(usuario=usuario, nombre=plan, objetivo='Comer más verduras')
        ComidaPlan.objects.create(plan=plan_obj, tipo='desayuno', descripcion='Avena con fruta', horario=time(8, 30))
        sueno, _ = Habito.objects.get_or_create(nombre='Horas de sueño')
        agua, _ = Habito.objects.get_or_create(nombre='Hidratación')
        hoy = timezone.localdate()
        ProgresoDiario.objects.create(usuario=usuario, habito=sueno, fecha=hoy, valor=Decimal('7.5'), completado=True)
        ProgresoDiario.objects.create(usuario=usuario, habito=agua, fecha=hoy, completado=True)
        ejercicio = Ejercicio.objects.create(nombre=f'Sentadillas {usuario.pk}', tipo=Tipos.FUERZA)
        RutinaEjercicio.objects.create(usuario=usuario, ejercicio=ejercicio, meta_cantidad=20, completado=True)

    def test_requiere_sesion(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_descarga_csv_con_encabezados_y_nombre_de_archivo(self):
        self.login(self.usuario, 'clave-ana')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response['Content-Type'].startswith('text/csv'))
        self.assertIn('attachment; filename="bienestar_mis_datos_', response['Content-Disposition'])
        self.assertTrue(response.content.startswith('\ufeff'.encode('utf-8')))  # BOM para Excel
        self.assertIn(['Sección', 'Fecha', 'Concepto', 'Detalle', 'Valor', 'Unidad'], self.filas(response))

    def test_incluye_datos_nutricionales_habitos_y_estadisticas_con_fechas(self):
        self.cargar_datos(self.usuario)
        self.login(self.usuario, 'clave-ana')

        filas = self.filas(self.client.get(self.url))

        hoy = timezone.localdate().strftime('%d/%m/%Y')
        self.assertIn(['Plan nutricional', '', 'Desayuno', 'Avena con fruta', '08:30', 'hora'], filas)
        self.assertIn(['Hábitos diarios', hoy, 'Horas de sueño', '', '7,5', 'horas'], filas)
        self.assertIn(['Hábitos diarios', hoy, 'Hidratación', '', 'Sí', 'cumplido'], filas)
        self.assertIn(['Estadísticas', '', 'Cumplimiento', '', '100', '%'], filas)

    def test_solo_exporta_los_datos_del_usuario_en_sesion(self):
        self.cargar_datos(self.usuario, plan='Plan de Ana')
        self.cargar_datos(self.otro, plan='Plan del otro')
        self.login(self.usuario, 'clave-ana')

        contenido = self.client.get(self.url).content.decode('utf-8-sig')

        self.assertIn('Plan de Ana', contenido)
        self.assertNotIn('Plan del otro', contenido)
        self.assertNotIn(f'Sentadillas {self.otro.pk}', contenido)

    def test_caso_sin_datos(self):
        self.login(self.usuario, 'clave-ana')

        filas = self.filas(self.client.get(self.url))

        for seccion in ('Plan nutricional', 'Hábitos diarios', 'Rutina de ejercicios'):
            self.assertIn([seccion, '', 'Sin datos registrados', '', '', ''], filas)

    def test_neutraliza_formulas_en_textos_del_usuario(self):
        PlanNutricional.objects.create(usuario=self.usuario, nombre='=HYPERLINK("http://x")', objetivo='ok')
        self.login(self.usuario, 'clave-ana')

        contenido = self.client.get(self.url).content.decode('utf-8-sig')

        self.assertIn('\'=HYPERLINK', contenido)