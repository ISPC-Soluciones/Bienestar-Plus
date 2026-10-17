from django.contrib.auth.hashers import make_password
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from bienestar.models import Ejercicio, Roles, RutinaEjercicio, Tipos, Usuario


class ExerciseRoutineApiTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(
            nombre="Cuenta de QA",
            email="qa.habits@example.test",
            password=make_password("solo-pruebas"),
            rol=Roles.ESTANDAR,
        )
        self.otro_usuario = Usuario.objects.create(
            nombre="Otra cuenta de QA",
            email="qa.habits.other@example.test",
            password=make_password("solo-pruebas"),
            rol=Roles.ESTANDAR,
        )
        self.ejercicio = Ejercicio.objects.create(
            nombre="Sentadillas QA",
            descripcion="Ejercicio creado por la suite de pruebas.",
            tipo=Tipos.FUERZA,
        )
        self.list_url = reverse("rutina-ejercicio-list")

    def payload(self, **changes):
        return {
            "usuario": self.usuario.pk,
            "ejercicio": self.ejercicio.pk,
            "meta_cantidad": 20,
            **changes,
        }

    def create_routine(self, **changes):
        return self.client.post(self.list_url, self.payload(**changes), format="json")
    
    def authenticate(self, usuario=None):
        usuario = usuario or self.usuario
        session = self.client.session
        session["usuario_id"] = usuario.pk
        session.save()
    
    def test_aut_be_03_create_routine_persists_the_requested_exercise(self):
        # Arrange: use an existing user and exercise from this test database.
        self.authenticate()
        payload = self.payload()

        # Act: create the routine through the named DRF route.
        response = self.client.post(self.list_url, payload, format="json")

        # Assert: a routine is created with the submitted target.
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            RutinaEjercicio.objects.filter(
                usuario=self.usuario,
                ejercicio=self.ejercicio,
                meta_cantidad=20,
            ).exists()
        )

    def test_aut_be_03_list_can_filter_routines_by_user_id(self):
        # Arrange: create one routine for each user.
        self.authenticate()
        first = RutinaEjercicio.objects.create(usuario=self.usuario, ejercicio=self.ejercicio)
        other_exercise = Ejercicio.objects.create(nombre="Flexiones QA", tipo=Tipos.FUERZA)
        RutinaEjercicio.objects.create(usuario=self.otro_usuario, ejercicio=other_exercise)

        # Act: request the first user's records using the supported query parameter.
        response = self.client.get(self.list_url, {"usuario_id": self.usuario.pk})

        # Assert: the filtered result contains only that user's routine.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data["results"]], [first.pk])

    def test_aut_be_03_update_pending_routine_accepts_a_positive_target(self):
        # Arrange: create a pending routine.
        self.authenticate()
        routine = RutinaEjercicio.objects.create(usuario=self.usuario, ejercicio=self.ejercicio)
        detail_url = reverse("rutina-ejercicio-detail", args=[routine.pk])

        # Act: update its target through PATCH.
        response = self.client.patch(
            detail_url,
            {"meta_cantidad": 35},
            format="json",
        )

        # Assert: the new positive target is persisted.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        routine.refresh_from_db()
        self.assertEqual(routine.meta_cantidad, 35)

    def test_aut_be_03_delete_routine_returns_no_content(self):
        # Arrange: create a routine for the test user.
        self.authenticate()
        routine = RutinaEjercicio.objects.create(usuario=self.usuario, ejercicio=self.ejercicio)
        detail_url = reverse("rutina-ejercicio-detail", args=[routine.pk])

        # Act: delete the resource.
        response = self.client.delete(detail_url)

        # Assert: the API removes the record and returns the HTTP contract.
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(RutinaEjercicio.objects.filter(pk=routine.pk).exists())

    def test_aut_be_06_duplicate_user_exercise_day_is_rejected(self):
        # Arrange: the user already has the exercise on the current date.
        self.authenticate()
        existing = RutinaEjercicio.objects.create(
            usuario=self.usuario,
            ejercicio=self.ejercicio,
            meta_cantidad=20,
        )

        # Act: submit the same user, exercise and date again.
        response = self.create_routine()

        # Assert: a duplicate is rejected and the existing target is unchanged.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RutinaEjercicio.objects.count(), 1)
        existing.refresh_from_db()
        self.assertEqual(existing.meta_cantidad, 20)

    def test_aut_be_06_non_positive_target_is_rejected_by_the_api(self):
        # Arrange: prepare invalid values that the server must reject.
        self.authenticate()
        invalid_targets = (0, -5)

        # Act: submit each invalid target to the API.
        responses = [self.create_routine(meta_cantidad=value) for value in invalid_targets]

        # Assert: invalid values never create or update stored routines.
        self.assertTrue(
            all(response.status_code == status.HTTP_400_BAD_REQUEST for response in responses)
        )
        self.assertFalse(RutinaEjercicio.objects.exists())

    def test_aut_be_05_anonymous_client_cannot_create_a_routine(self):
        # Arrange: start with an anonymous API client.
        payload = self.payload()

        # Act: attempt a protected write without starting a user session.
        response = self.client.post(self.list_url, payload, format="json")

        # Assert: the API rejects writes without authentication.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(RutinaEjercicio.objects.exists())

    def test_aut_be_05_user_cannot_read_update_or_delete_another_users_routine(self):
        # Arrange: create another user's routine and start this user's session.
        routine = RutinaEjercicio.objects.create(
            usuario=self.otro_usuario,
            ejercicio=self.ejercicio,
            meta_cantidad=20,
        )
        session = self.client.session
        session["usuario_id"] = self.usuario.pk
        session.save()
        detail_url = reverse("rutina-ejercicio-detail", args=[routine.pk])

        # Act: try every operation against the other user's resource.
        responses = (
            self.client.get(detail_url),
            self.client.patch(detail_url, {"meta_cantidad": 50}, format="json"),
            self.client.delete(detail_url),
        )

        # Assert: another user's routine is forbidden and remains unchanged.
        self.assertEqual(
            [response.status_code for response in responses],
            [status.HTTP_403_FORBIDDEN] * 3,
        )
        self.assertTrue(RutinaEjercicio.objects.filter(pk=routine.pk).exists())
        routine.refresh_from_db()
        self.assertEqual(routine.meta_cantidad, 20)

    def test_aut_be_05_completed_routine_cannot_be_edited(self):
    # Arrange: authenticate and create a routine that is already complete.
        self.authenticate()

        routine = RutinaEjercicio.objects.create(
            usuario=self.usuario,
            ejercicio=self.ejercicio,
            completado=True,
        )
        detail_url = reverse("rutina-ejercicio-detail", args=[routine.pk])

        # Act: attempt to change the completed routine's target.
        response = self.client.patch(
            detail_url,
            {"meta_cantidad": 40},
            format="json",
        )

        # Assert: completed work is immutable and remains unchanged.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        routine.refresh_from_db()
        self.assertEqual(routine.meta_cantidad, 1)