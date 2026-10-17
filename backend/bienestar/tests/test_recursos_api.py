from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from bienestar.models import Recurso, Roles, Usuario


class RecursosApiTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            nombre="Usuario Test",
            email="usuario.test@example.com",
            password=make_password("password-segura"),
            rol=Roles.ESTANDAR,
        )
        self.list_url = reverse("recurso-list")

    def get_results(self, data):
        return data["results"] if isinstance(data, dict) and "results" in data else data

    def test_listar_recursos_vacio(self):
        """Si no existen recursos, la API devuelve una lista vacía y HTTP 200."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.get_results(response.data), [])

    def test_listar_recursos_con_datos(self):
        """Los recursos existentes se consultan correctamente con descripción, tipo y enlace."""
        recurso = Recurso.objects.create(
            usuario=self.usuario,
            descripcion="Guía práctica de respiración diafragmática para reducir la ansiedad.",
            tipo="Bienestar Psicológico",
            enlace="https://ejemplo.com/recursos/respiracion",
        )

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_results(response.data)
        self.assertEqual(len(results), 1)
        item = results[0]
        self.assertEqual(item["id"], recurso.id)
        self.assertEqual(item["descripcion"], recurso.descripcion)
        self.assertEqual(item["tipo"], "Bienestar Psicológico")
        self.assertEqual(item["enlace"], "https://ejemplo.com/recursos/respiracion")

    def test_recurso_con_enlace_opcional_o_vacio(self):
        """Permite crear y listar recursos sin enlace obligatorio."""
        recurso = Recurso.objects.create(
            usuario=self.usuario,
            descripcion="Técnica de grounding 5-4-3-2-1 para momentos de estrés.",
            tipo="Material de Apoyo",
            enlace="",
        )

        response = self.client.get(reverse("recurso-detail", kwargs={"pk": recurso.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["enlace"], "")

    def test_filtrar_recursos_por_tipo(self):
        """Permite filtrar recursos por el parámetro de consulta ?tipo=..."""
        Recurso.objects.create(
            usuario=self.usuario,
            descripcion="Meditación guiada nocturna",
            tipo="Mindfulness",
            enlace="https://ejemplo.com/meditacion",
        )
        Recurso.objects.create(
            usuario=self.usuario,
            descripcion="Línea de contención y apoyo psicológico 24h",
            tipo="Bienestar Psicológico",
            enlace="https://ejemplo.com/ayuda",
        )

        response = self.client.get(self.list_url, {"tipo": "Bienestar Psicológico"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_results(response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["tipo"], "Bienestar Psicológico")
