from unittest.mock import patch

from bson import ObjectId
from django.contrib.auth.hashers import make_password
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from bienestar.models import Ejercicio, Roles, Tipos, Usuario

PNG_1X1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02"
    b"\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
    b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


class GridFSEnMemoria:
    """Reemplazo mínimo de gridfs.GridFS para no depender de MongoDB en los tests."""

    class _Archivo:
        def __init__(self, data, content_type):
            self._data = data
            self.content_type = content_type

        def read(self):
            return self._data

    def __init__(self):
        self.archivos = {}

    def put(self, data, content_type=None, **_):
        archivo_id = ObjectId()
        self.archivos[archivo_id] = self._Archivo(data, content_type)
        return archivo_id

    def get(self, archivo_id):
        return self.archivos[archivo_id]

    def delete(self, archivo_id):
        self.archivos.pop(archivo_id, None)


class ExerciseImageApiTests(TestCase):
    def setUp(self):
        self.fs = GridFSEnMemoria()
        patcher = patch("bienestar.views.obtener_gridfs", return_value=self.fs)
        patcher.start()
        self.addCleanup(patcher.stop)

        self.admin = Usuario.objects.create(
            nombre="Admin QA", email="admin.img@example.test",
            password=make_password("clave-admin"), rol=Roles.ADMIN,
        )
        self.estandar = Usuario.objects.create(
            nombre="Usuario QA", email="user.img@example.test",
            password=make_password("clave-user"), rol=Roles.ESTANDAR,
        )
        self.ejercicio = Ejercicio.objects.create(nombre="Plancha QA", tipo=Tipos.FUERZA)
        self.url = reverse("ejercicio-imagen", args=[self.ejercicio.pk])
        self.client = APIClient()

    def login(self, usuario, clave):
        response = self.client.post("/api/login/", {"email": usuario.email, "password": clave}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def subir(self, nombre="plancha.png", contenido=PNG_1X1, tipo="image/png"):
        archivo = SimpleUploadedFile(nombre, contenido, content_type=tipo)
        return self.client.post(self.url, {"imagen": archivo}, format="multipart")

    def test_admin_sube_imagen_y_la_api_expone_la_url(self):
        self.login(self.admin, "clave-admin")

        response = self.subir()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ejercicio.refresh_from_db()
        self.assertIsNotNone(self.ejercicio.imagen_id)
        self.assertIn(f"/api/ejercicios/{self.ejercicio.pk}/imagen/?v=", response.data["imagen_url"])
        listado = self.client.get(reverse("ejercicio-list"))
        self.assertIsNotNone(listado.data["results"][0]["imagen_url"])

    def test_cualquiera_puede_ver_la_imagen(self):
        self.login(self.admin, "clave-admin")
        self.subir()
        self.client.post("/api/auth/logout/")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "image/png")
        self.assertEqual(response.content, PNG_1X1)

    def test_reemplazar_imagen_borra_la_anterior(self):
        self.login(self.admin, "clave-admin")
        self.subir()
        anterior = self.ejercicio.__class__.objects.get(pk=self.ejercicio.pk).imagen_id

        self.subir(nombre="nueva.png")

        self.ejercicio.refresh_from_db()
        self.assertNotEqual(self.ejercicio.imagen_id, anterior)
        self.assertEqual(len(self.fs.archivos), 1)

    def test_usuario_sin_permisos_no_puede_modificar_la_imagen(self):
        anonimo = self.subir()
        self.login(self.estandar, "clave-user")
        estandar = self.subir()
        borrar = self.client.delete(self.url)

        self.assertEqual(anonimo.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(estandar.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(borrar.status_code, status.HTTP_403_FORBIDDEN)
        self.ejercicio.refresh_from_db()
        self.assertIsNone(self.ejercicio.imagen_id)

    def test_rechaza_archivos_que_no_son_imagen(self):
        self.login(self.admin, "clave-admin")

        response = self.subir(nombre="virus.txt", contenido=b"hola", tipo="text/plain")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("imagen", response.data)

    def test_ejercicio_sin_imagen_responde_404_y_url_nula(self):
        response = self.client.get(self.url)
        detalle = self.client.get(reverse("ejercicio-detail", args=[self.ejercicio.pk]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIsNone(detalle.data["imagen_url"])

    def test_admin_quita_la_imagen(self):
        self.login(self.admin, "clave-admin")
        self.subir()

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.ejercicio.refresh_from_db()
        self.assertIsNone(self.ejercicio.imagen_id)
        self.assertEqual(self.fs.archivos, {})