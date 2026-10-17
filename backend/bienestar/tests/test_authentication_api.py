from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from bienestar.models import Usuario


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            nombre="Usuario de prueba",
            email="qa.login@example.test",
            password=make_password("Prueba-solo-local-123!"),
        )

    def test_aut_be_01_auth_routes_resolve_by_name(self):
        # Arrange: use named routes so the test follows the URL configuration.
        names = ("login", "auth-me", "auth-logout")

        # Act: resolve each named route.
        urls = [reverse(name) for name in names]

        # Assert: no literal endpoint path is embedded in this test.
        self.assertEqual(len(urls), 3)
        self.assertTrue(all(url.startswith("/") for url in urls))

    def test_aut_be_03_valid_login_starts_a_user_session(self):
        # Arrange: the test user has a Django-compatible password hash.
        payload = {
            "email": self.usuario.email,
            "password": "Prueba-solo-local-123!",
        }

        # Act: authenticate through the public login API.
        response = self.client.post(reverse("login"), payload, format="json")

        # Assert: the response identifies the user and records the session owner.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["id"], self.usuario.pk)
        self.assertEqual(self.client.session.get("usuario_id"), self.usuario.pk)

    def test_aut_be_06_invalid_password_returns_a_structured_401(self):
        # Arrange: the email exists but the password is incorrect.
        payload = {"email": self.usuario.email, "password": "incorrecta"}

        # Act: submit the invalid credentials.
        response = self.client.post(reverse("login"), payload, format="json")

        # Assert: the API denies authentication without disclosing account details.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    def test_aut_be_06_unknown_email_returns_the_same_authentication_error(self):
        # Arrange: use an email that is not registered.
        payload = {"email": "missing@example.test", "password": "incorrecta"}

        # Act: submit the unknown account.
        response = self.client.post(reverse("login"), payload, format="json")

        # Assert: the response does not reveal whether the email exists.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    def test_aut_be_06_missing_credentials_return_400(self):
        # Arrange: prepare requests missing one or both required fields.
        payloads = ({}, {"email": self.usuario.email}, {"password": "anything"})

        # Act: submit each incomplete request.
        responses = [
            self.client.post(reverse("login"), payload, format="json")
            for payload in payloads
        ]

        # Assert: each request is rejected as invalid input.
        self.assertTrue(
            all(response.status_code == status.HTTP_400_BAD_REQUEST for response in responses)
        )

    def test_aut_be_05_session_endpoint_requires_and_returns_a_session(self):
        # Arrange: start without a session.
        session_url = reverse("auth-me")

        # Act: inspect the anonymous and authenticated responses.
        anonymous = self.client.get(session_url)
        self.client.post(
            reverse("login"),
            {"email": self.usuario.email, "password": "Prueba-solo-local-123!"},
            format="json",
        )
        authenticated = self.client.get(session_url)

        # Assert: session access reflects the current authentication state.
        self.assertEqual(anonymous.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(authenticated.status_code, status.HTTP_200_OK)
        self.assertEqual(authenticated.data["data"]["id"], self.usuario.pk)

    def test_aut_be_05_logout_rejects_a_session_mutation_without_csrf(self):
        # Arrange: keep a custom Usuario session but enforce browser CSRF checks.
        client = APIClient(enforce_csrf_checks=True)
        session = client.session
        session["usuario_id"] = self.usuario.pk
        session.save()

        # Act: attempt to flush the session without a CSRF token.
        response = client.post(reverse("auth-logout"), {}, format="json")

        # Assert: unsafe authenticated actions require CSRF protection.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
