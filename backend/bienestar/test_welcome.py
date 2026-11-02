from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Usuario


class WelcomeEmailRegistrationTests(TestCase):
    @patch('bienestar.views.send_welcome_email_safely', return_value=False)
    def test_registration_starts_session_and_schedules_welcome_email(self, send_email):
        client = APIClient()
        with self.captureOnCommitCallbacks(execute=True):
            response = client.post(
                '/api/registro/',
                {
                    'nombre': 'Nuevo Usuario',
                    'email': 'nuevo@example.com',
                    'password': 'Password123',
                    'telefono': '3510000000',
                },
                format='json',
                secure=True,
            )

        self.assertEqual(response.status_code, 201)
        usuario = Usuario.objects.get(email='nuevo@example.com')
        self.assertEqual(client.session.get('usuario_id'), usuario.pk)

        session_response = client.get('/api/auth/me/', secure=True)
        self.assertEqual(session_response.status_code, 200)
        self.assertEqual(session_response.data['data']['id'], usuario.pk)
        send_email.assert_called_once_with(usuario.pk)
