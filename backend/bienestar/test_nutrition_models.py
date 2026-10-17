from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import ComidaPlan, PlanNutricional, Usuario


class NutritionModelTests(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(nombre='Prueba', email='plan@example.com', password='unused')
        self.plan = PlanNutricional.objects.create(usuario=self.usuario, nombre='Mi plan', objetivo='Organizar comidas')

    def test_persists_plan_and_meals_in_order(self):
        ComidaPlan.objects.create(plan=self.plan, tipo='cena', descripcion='Verduras', orden=1)
        ComidaPlan.objects.create(plan=self.plan, tipo='desayuno', descripcion='Fruta', horario='08:00', orden=0)
        self.plan.refresh_from_db()
        self.assertEqual(self.usuario.plan_nutricional.pk, self.plan.pk)
        self.assertEqual(list(self.plan.comidas.values_list('tipo', flat=True)), ['desayuno', 'cena'])

    def test_only_one_plan_per_user(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            PlanNutricional.objects.create(usuario=self.usuario, nombre='Otro', objetivo='Otro')

    def test_deleting_user_removes_plan_and_meals(self):
        ComidaPlan.objects.create(plan=self.plan, tipo='cena', descripcion='Verduras')
        self.usuario.delete()
        self.assertFalse(PlanNutricional.objects.exists())
        self.assertFalse(ComidaPlan.objects.exists())

    def test_model_validation_rejects_invalid_meals_and_long_notes(self):
        with self.assertRaises(ValidationError):
            ComidaPlan(plan=self.plan, tipo='invalido', descripcion='').full_clean()
        self.plan.notas = 'x' * 2001
        with self.assertRaises(ValidationError):
            self.plan.full_clean()
