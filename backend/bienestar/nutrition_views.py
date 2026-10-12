from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from django.utils.cache import patch_cache_control, patch_vary_headers
from rest_framework.authentication import BaseAuthentication, SessionAuthentication
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PlanNutricional, Usuario
from .nutrition_serializers import PlanNutricionalSerializer


class UsuarioSessionAuthentication(BaseAuthentication):
    """Authenticate the existing custom Usuario session and enforce CSRF on writes."""

    def authenticate(self, request):
        usuario = Usuario.objects.filter(pk=request.session.get('usuario_id')).first()
        if usuario is None:
            raise NotAuthenticated('Iniciá sesión para gestionar tu plan.')
        SessionAuthentication().enforce_csrf(request)
        return usuario, None

    def authenticate_header(self, request):
        return 'Session'


class PlanNutricionalView(APIView):
    authentication_classes = [UsuarioSessionAuthentication]

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        patch_cache_control(response, no_store=True, private=True)
        patch_vary_headers(response, ['Cookie'])
        return response

    def get(self, request):
        plan = PlanNutricional.objects.filter(usuario=request.user).first()
        return Response({
            'plan': PlanNutricionalSerializer(plan).data if plan else None,
            'csrf_token': get_token(request),
        })

    def post(self, request):
        serializer = PlanNutricionalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                serializer.save(usuario=request.user)
        except IntegrityError:
            return Response({'detail': 'Ya tenés un plan. Podés editarlo.'}, status=409)
        return Response({'plan': serializer.data}, status=201)

    def patch(self, request):
        with transaction.atomic():
            plan = PlanNutricional.objects.select_for_update().filter(usuario=request.user).first()
            if plan is None:
                return Response({'detail': 'Todavía no creaste un plan.'}, status=404)
            serializer = PlanNutricionalSerializer(plan, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response({'plan': serializer.data})
