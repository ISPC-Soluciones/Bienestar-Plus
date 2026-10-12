from copy import deepcopy
from unittest.mock import patch

from django.contrib.auth.hashers import make_password
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import ComidaPlan, PlanNutricional, Usuario


@override_settings(ALLOWED_HOSTS=['testserver'], SESSION_COOKIE_SECURE=False, CSRF_COOKIE_SECURE=False)
class NutritionApiTests(TestCase):
    url = '/api/plan-nutricional/'

    def setUp(self):
        self.usuario = Usuario.objects.create(nombre='Uno', email='uno@example.com', password=make_password('test-pass'))
        self.otro = Usuario.objects.create(nombre='Dos', email='dos@example.com', password='unused')
        self.client = APIClient(enforce_csrf_checks=True)
        self.payload = {
            'nombre': 'Mi plan', 'objetivo': 'Organizar comidas', 'notas': '',
            'comidas': [{'tipo': 'desayuno', 'descripcion': 'Fruta', 'horario': '08:30'}],
        }

    def login(self, usuario=None):
        session = self.client.session
        session['usuario_id'] = (usuario or self.usuario).pk
        session.save()
        return self.client.get(self.url).data['csrf_token']

    def create(self):
        return self.client.post(self.url, self.payload, format='json', HTTP_X_CSRFTOKEN=self.login())

    def test_requires_real_session_for_all_operations(self):
        for method in ['get', 'post', 'patch']:
            response = getattr(self.client, method)(self.url, {}, format='json')
            self.assertEqual(response.status_code, 401)
        session = self.client.session
        session['usuario_id'] = 999999
        session.save()
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_password_login_session_can_create_plan(self):
        response = self.client.post('/api/login/', {'email': self.usuario.email, 'password': 'test-pass'}, format='json')
        self.assertEqual(response.status_code, 200)
        token = self.client.get(self.url).data['csrf_token']
        self.assertEqual(self.client.post(self.url, self.payload, format='json', HTTP_X_CSRFTOKEN=token).status_code, 201)
        self.client.post('/api/auth/logout/')
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_empty_state_and_private_cache_headers(self):
        self.login()
        response = self.client.get(self.url)
        self.assertIsNone(response.data['plan'])
        self.assertIn('no-store', response['Cache-Control'])
        self.assertIn('Cookie', response['Vary'])

    def test_creation_query_update_and_persistence(self):
        response = self.create()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['plan']['comidas'][0]['horario'], '08:30:00')
        token = self.client.get(self.url).data['csrf_token']
        meals = [{'tipo': 'cena', 'descripcion': 'Verduras', 'horario': None}]
        response = self.client.patch(self.url, {'nombre': 'Actualizado', 'comidas': meals}, format='json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(response.status_code, 200)
        plan = PlanNutricional.objects.get(usuario=self.usuario)
        self.assertEqual(plan.nombre, 'Actualizado')
        self.assertEqual(list(plan.comidas.values_list('tipo', flat=True)), ['cena'])
        self.assertEqual(self.client.get(self.url).data['plan']['nombre'], 'Actualizado')
        self.assertEqual(self.client.patch(self.url, {'notas': 'Nota'}, format='json', HTTP_X_CSRFTOKEN=token).status_code, 200)
        self.assertEqual(plan.comidas.count(), 1)

    def test_duplicate_plan_and_edit_without_plan(self):
        token = self.login()
        self.assertEqual(self.client.patch(self.url, {'nombre': 'Nada'}, format='json', HTTP_X_CSRFTOKEN=token).status_code, 404)
        self.assertEqual(self.create().status_code, 201)
        self.assertEqual(self.create().status_code, 409)
        self.assertEqual(PlanNutricional.objects.count(), 1)

    def test_csrf_rejects_missing_invalid_and_untrusted_origin(self):
        token = self.login()
        for headers in [{}, {'HTTP_X_CSRFTOKEN': 'invalid'}, {'HTTP_X_CSRFTOKEN': token, 'HTTP_ORIGIN': 'https://attacker.example'}]:
            self.assertEqual(self.client.post(self.url, self.payload, format='json', **headers).status_code, 403)
        self.assertFalse(PlanNutricional.objects.exists())

    def test_user_cannot_read_modify_or_reassign_another_plan(self):
        self.create()
        token = self.login(self.otro)
        self.assertIsNone(self.client.get(self.url + f'?usuario_id={self.usuario.pk}').data['plan'])
        self.assertEqual(self.client.patch(self.url, {'nombre': 'Ajeno'}, format='json', HTTP_X_CSRFTOKEN=token).status_code, 404)
        payload = dict(self.payload, usuario=self.usuario.pk)
        self.assertEqual(self.client.post(self.url, payload, format='json', HTTP_X_CSRFTOKEN=token).status_code, 400)
        self.assertEqual(PlanNutricional.objects.get(usuario=self.usuario).nombre, 'Mi plan')
        self.assertEqual(self.client.get(self.url + '1/').status_code, 404)

    def test_invalid_payloads_leave_database_unchanged(self):
        self.create()
        token = self.login()
        cases = [
            {'nombre': '  '}, {'nombre': 'x' * 101}, {'objetivo': ''}, {'objetivo': 'x' * 301},
            {'notas': 'x' * 2001}, {'comidas': []}, {'comidas': self.payload['comidas'] * 21},
            {'comidas': [{'tipo': 'invalid', 'descripcion': 'Algo'}]},
            {'comidas': [{'tipo': 'cena'}]}, {'comidas': [{'descripcion': 'Algo'}]},
            {'comidas': [{'tipo': 'cena', 'descripcion': '  '}]},
            {'comidas': [{'tipo': 'cena', 'descripcion': 'x' * 501}]},
            {'comidas': [{'tipo': 'cena', 'descripcion': 'Algo', 'horario': '25:00'}]},
            {'id': 123}, {'usuario_id': self.otro.pk}, {'comidas': None},
        ]
        for data in cases:
            with self.subTest(data=data):
                response = self.client.patch(self.url, data, format='json', HTTP_X_CSRFTOKEN=token)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(PlanNutricional.objects.get(usuario=self.usuario).nombre, 'Mi plan')
                self.assertEqual(ComidaPlan.objects.get().tipo, 'desayuno')

    def test_creation_requires_complete_plan(self):
        token = self.login()
        for key in ['nombre', 'objetivo', 'comidas']:
            payload = deepcopy(self.payload)
            del payload[key]
            self.assertEqual(self.client.post(self.url, payload, format='json', HTTP_X_CSRFTOKEN=token).status_code, 400)

    def test_failed_meal_replacement_rolls_back_entire_update(self):
        self.create()
        token = self.login()
        with patch('bienestar.nutrition_serializers.ComidaPlan.objects.bulk_create', side_effect=RuntimeError('storage failure')):
            with self.assertRaises(RuntimeError):
                self.client.patch(self.url, {'nombre': 'Cambio', 'comidas': self.payload['comidas']}, format='json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(PlanNutricional.objects.get().nombre, 'Mi plan')
        self.assertEqual(ComidaPlan.objects.get().tipo, 'desayuno')
