from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .models import Usuario
from .views import RegistroUsuarioView


class WelcomeEmailRegistrationTests(TestCase):
    @patch('bienestar.views.send_welcome_email_safely', return_value=False)
    def test_registration_succeeds_and_schedules_welcome_email(self, send_email):
        with self.captureOnCommitCallbacks(execute=True):
            request = APIRequestFactory().post(
                '/api/registro/',
                {
                    'nombre': 'Nuevo Usuario',
                    'email': 'nuevo@example.com',
                    'password': 'Password123',
                    'telefono': '3510000000',
                },
                format='json',
            )
            response = RegistroUsuarioView.as_view()(request)

        self.assertEqual(response.status_code, 201)
        usuario = Usuario.objects.get(email='nuevo@example.com')
        send_email.assert_called_once_with(usuario.pk)
