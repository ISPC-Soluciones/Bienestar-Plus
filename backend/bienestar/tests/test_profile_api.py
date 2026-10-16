from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from bienestar.models import PerfilSalud, Usuario


class HealthProfileApiTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            nombre="Perfil de QA",
            email="qa.profile@example.test",
            password=make_password("solo-pruebas"),
        )
        self.perfil = PerfilSalud.objects.create(
            usuario=self.usuario,
            peso="70.00",
            altura="1.75",
        )
        self.url = reverse("perfil-salud", args=[self.usuario.pk])

    def test_gcb_001_health_profile_returns_the_calculated_bmi(self):
        # Arrange: use deterministic weight and height in the project's model units.

        # Act: request the profile through its named URL.
        response = self.client.get(self.url)

        # Assert: BMI is serialized to two decimal places.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["imc"], "22.86")

    def test_aut_be_03_profile_update_recalculates_the_recommendation(self):
        # Arrange: prepare valid weight and height values.
        payload = {"peso": "82.00", "altura": "1.75"}

        # Act: update the profile with PUT.
        response = self.client.put(self.url, payload, format="json")

        # Assert: the API returns the updated profile and calculated BMI.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["imc"], "26.78")

    def test_aut_be_06_non_positive_weight_returns_field_validation_error(self):
        # Arrange: prepare a payload that violates the positive-weight rule.
        payload = {"peso": "0", "altura": "1.75"}

        # Act: submit the invalid profile update.
        response = self.client.put(self.url, payload, format="json")

        # Assert: the serializer returns a field error without changing the model.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("peso", response.data)
        self.perfil.refresh_from_db()
        self.assertEqual(str(self.perfil.peso), "70.00")
