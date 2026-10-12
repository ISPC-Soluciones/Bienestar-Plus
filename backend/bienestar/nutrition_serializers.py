from django.db import transaction
from rest_framework import serializers

from .models import ComidaPlan, PlanNutricional


class StrictFieldsMixin:
    def to_internal_value(self, data):
        unknown = set(data) - set(self.fields)
        forbidden = {key for key in data if key in self.fields and self.fields[key].read_only}
        if unknown or forbidden:
            raise serializers.ValidationError({
                key: ['Este campo no se puede enviar.'] for key in unknown | forbidden
            })
        return super().to_internal_value(data)


class ComidaPlanSerializer(StrictFieldsMixin, serializers.ModelSerializer):
    def validate(self, attrs):
        # A provided meals array replaces the collection, even during PATCH.
        missing = {'tipo', 'descripcion'} - set(attrs)
        if missing:
            raise serializers.ValidationError({key: ['Este campo es obligatorio.'] for key in missing})
        return attrs

    class Meta:
        model = ComidaPlan
        fields = ['tipo', 'descripcion', 'horario']


class PlanNutricionalSerializer(StrictFieldsMixin, serializers.ModelSerializer):
    comidas = ComidaPlanSerializer(many=True, allow_empty=False, max_length=20)

    class Meta:
        model = PlanNutricional
        fields = ['id', 'nombre', 'objetivo', 'notas', 'comidas', 'creado', 'actualizado']
        read_only_fields = ['id', 'creado', 'actualizado']

    def _save_meals(self, plan, comidas):
        ComidaPlan.objects.bulk_create([
            ComidaPlan(plan=plan, orden=orden, **comida)
            for orden, comida in enumerate(comidas)
        ])

    @transaction.atomic
    def create(self, validated_data):
        comidas = validated_data.pop('comidas')
        plan = PlanNutricional.objects.create(**validated_data)
        self._save_meals(plan, comidas)
        return plan

    @transaction.atomic
    def update(self, instance, validated_data):
        comidas = validated_data.pop('comidas', None)
        instance = super().update(instance, validated_data)
        if comidas is not None:
            instance.comidas.all().delete()
            self._save_meals(instance, comidas)
        return instance
