from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.hashers import check_password, make_password
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from .models import TokenRecuperacionPassword, Usuario
from .password_reset_views import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
)
from .services.password_reset import create_password_reset_token


class PasswordResetEndpointTests(TestCase):
    def setUp(self):
        cache.clear()
        self.usuario = Usuario.objects.create(
            nombre='Santiago',
            email='santiago@example.com',
            password=make_password('Password123'),
        )
        self.factory = APIRequestFactory()

    def tearDown(self):
        cache.clear()

    @patch('bienestar.password_reset_views.send_password_reset_email_safely')
    def test_request_creates_token_and_sends_email_for_known_user(self, send_email):
        with self.captureOnCommitCallbacks(execute=True):
            request = self.factory.post(
                '/api/password-reset/request/',
                {'email': 'SANTIAGO@example.com'},
                format='json',
            )
            response = PasswordResetRequestView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['message'],
            PasswordResetRequestView.response_message,
        )
        self.assertEqual(TokenRecuperacionPassword.objects.count(), 1)
        send_email.assert_called_once()
        self.assertEqual(send_email.call_args.args[0], self.usuario.pk)

    @patch('bienestar.password_reset_views.send_password_reset_email_safely')
    def test_request_does_not_reveal_unknown_email(self, send_email):
        request = self.factory.post(
            '/api/password-reset/request/',
            {'email': 'nadie@example.com'},
            format='json',
        )
        response = PasswordResetRequestView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(TokenRecuperacionPassword.objects.count(), 0)
        send_email.assert_not_called()

    def test_confirm_changes_password_and_consumes_token(self):
        raw_token = create_password_reset_token(self.usuario)

        request = self.factory.post(
            '/api/password-reset/confirm/',
            {
                'token': raw_token,
                'password': 'NuevaPassword123',
                'confirmar_password': 'NuevaPassword123',
            },
            format='json',
        )
        response = PasswordResetConfirmView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.usuario.refresh_from_db()
        self.assertTrue(check_password('NuevaPassword123', self.usuario.password))
        self.assertIsNotNone(
            TokenRecuperacionPassword.objects.get().utilizado
        )

    def test_confirm_rejects_reused_token(self):
        raw_token = create_password_reset_token(self.usuario)
        payload = {
            'token': raw_token,
            'password': 'NuevaPassword123',
            'confirmar_password': 'NuevaPassword123',
        }

        first_request = self.factory.post(
            '/api/password-reset/confirm/', payload, format='json'
        )
        first_response = PasswordResetConfirmView.as_view()(first_request)
        second_request = self.factory.post(
            '/api/password-reset/confirm/', payload, format='json'
        )
        second_response = PasswordResetConfirmView.as_view()(second_request)

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 400)

    def test_confirm_rejects_expired_token(self):
        raw_token = create_password_reset_token(self.usuario)
        TokenRecuperacionPassword.objects.update(
            expira=timezone.now() - timedelta(minutes=1)
        )

        request = self.factory.post(
            '/api/password-reset/confirm/',
            {
                'token': raw_token,
                'password': 'NuevaPassword123',
                'confirmar_password': 'NuevaPassword123',
            },
            format='json',
        )
        response = PasswordResetConfirmView.as_view()(request)

        self.assertEqual(response.status_code, 400)

    def test_confirm_validates_matching_passwords(self):
        raw_token = create_password_reset_token(self.usuario)

        request = self.factory.post(
            '/api/password-reset/confirm/',
            {
                'token': raw_token,
                'password': 'NuevaPassword123',
                'confirmar_password': 'OtraPassword123',
            },
            format='json',
        )
        response = PasswordResetConfirmView.as_view()(request)

        self.assertEqual(response.status_code, 400)
        self.usuario.refresh_from_db()
        self.assertTrue(check_password('Password123', self.usuario.password))
