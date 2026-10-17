import json
from unittest.mock import Mock, patch

from django.test import SimpleTestCase, override_settings

from .services.email import send_password_reset_email, send_welcome_email


@override_settings(
    EMAIL_PROVIDER='brevo',
    BREVO_API_KEY='test-api-key',
    DEFAULT_FROM_EMAIL='no-reply@example.com',
    DEFAULT_FROM_NAME='Bienestar Plus',
    FRONTEND_URL='https://bienestar.example',
    EMAIL_REQUEST_TIMEOUT=8,
)
class EmailServiceTests(SimpleTestCase):
    def setUp(self):
        self.usuario = Mock(
            nombre='Santiago',
            email='santiago@example.com',
        )

    @patch('bienestar.services.email.urlopen')
    def test_sends_personalized_welcome_email_with_brevo(self, urlopen):
        urlopen.return_value.__enter__.return_value.status = 201

        send_welcome_email(self.usuario)

        request = urlopen.call_args.args[0]
        payload = json.loads(request.data.decode('utf-8'))
        self.assertEqual(payload['to'], [{'email': 'santiago@example.com'}])
        self.assertIn('bienvenida', payload['subject'].lower())
        self.assertIn('Santiago', payload['htmlContent'])
        self.assertIn('https://bienestar.example/login', payload['htmlContent'])
        self.assertNotIn('test-api-key', str(payload))

    @patch('bienestar.services.email.urlopen')
    def test_sends_single_use_reset_link(self, urlopen):
        urlopen.return_value.__enter__.return_value.status = 201

        send_password_reset_email(self.usuario, 'token+seguro')

        request = urlopen.call_args.args[0]
        payload = json.loads(request.data.decode('utf-8'))
        self.assertIn(
            'https://bienestar.example/restablecer-contrasena?token=token%2Bseguro',
            payload['htmlContent'],
        )
        self.assertIn('30 minutos', payload['textContent'])
        self.assertNotIn('contraseña nueva es', payload['textContent'].lower())
