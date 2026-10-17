from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from bienestar.models import Ejercicio, Roles, RutinaEjercicio, Tipos, Usuario


class RoutinePdfApiTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            nombre="Cuenta QA de rutina",
            email="qa.routine.pdf@example.test",
            password=make_password("solo-pruebas"),
            rol=Roles.ESTANDAR,
        )
        self.otro_usuario = Usuario.objects.create(
            nombre="Otra cuenta QA",
            email="qa.routine.pdf.other@example.test",
            password=make_password("solo-pruebas"),
            rol=Roles.ESTANDAR,
        )
        self.ejercicio = Ejercicio.objects.create(
            nombre="Caminata QA PDF",
            descripcion="Registro ficticio para validar la descarga.",
            tipo=Tipos.CARDIO,
        )
        self.url = reverse("rutina-ejercicio-descargar-pdf")
        
    def authenticate(self, usuario=None):
        usuario = usuario or self.usuario
        session = self.client.session
        session["usuario_id"] = usuario.pk
        session.save()

    def add_routine(self, usuario=None):
        return RutinaEjercicio.objects.create(
            usuario=usuario or self.usuario,
            ejercicio=self.ejercicio,
            meta_cantidad=30,
        )

    def test_aut_be_03_pdf_export_returns_a_pdf_for_the_requested_user(self):
        # Arrange: create one routine entry for the QA user.
        self.authenticate()
        self.add_routine()

        # Act: request the routine export for that user.
        response = self.client.get(self.url, {"usuario_id": self.usuario.pk})

        # Assert: the endpoint returns a PDF document.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        pdf_bytes = (
            b"".join(response.streaming_content)
            if response.streaming
            else response.content
        )
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_aut_be_06_pdf_export_requires_the_user_id_parameter(self):
        # Arrange: do not provide the user filter required by the endpoint.
        self.authenticate()

        # Act: request the download without query parameters.
        response = self.client.get(self.url)

        # Assert: the API reports a structured client error.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_aut_be_03_pdf_export_returns_404_when_the_user_has_no_routine(self):
        # Arrange: keep the QA user without a routine entry.
        self.authenticate()

        # Act: request the export for that user.
        response = self.client.get(self.url, {"usuario_id": self.usuario.pk})

        # Assert: there is no empty PDF presented as a successful export.
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_aut_be_03_pdf_export_filters_entries_by_user(self):
        # Arrange: create a routine for another user only.
        self.authenticate()
        self.add_routine(usuario=self.otro_usuario)

        # Act: request an export for the QA user.
        response = self.client.get(self.url, {"usuario_id": self.usuario.pk})

        # Assert: another user's routine is not included in this export.
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_aut_be_04_pdf_export_rejects_unsupported_methods(self):
        # Arrange: use the named read-only download action.
        self.authenticate()

        # Act: submit a POST to the GET-only action.
        response = self.client.post(self.url, {"usuario_id": self.usuario.pk}, format="json")

        # Assert: unsupported methods receive HTTP 405.
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_aut_be_05_pdf_export_requires_an_authenticated_session(self):
        # Arrange: create private routine data but keep this client anonymous.
        self.add_routine()

        # Act: request the private PDF without logging in.
        response = self.client.get(self.url, {"usuario_id": self.usuario.pk})

        # Assert: private routine exports must not be public.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
