import hashlib
from functools import partial

from django.core.cache import cache
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Usuario
from .serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from .services.email import send_password_reset_email_safely
from .services.password_reset import (
    InvalidResetToken,
    create_password_reset_token,
    reset_password_with_token,
)


class PasswordResetRequestView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'
    response_message = (
        'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.'
    )

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        usuario = Usuario.objects.filter(email__iexact=email).first()

        if usuario:
            email_hash = hashlib.sha256(email.encode('utf-8')).hexdigest()
            cooldown_key = f'password-reset-email:{email_hash}'
            if cache.add(cooldown_key, True, timeout=120):
                with transaction.atomic():
                    raw_token = create_password_reset_token(usuario)
                    transaction.on_commit(
                        partial(
                            send_password_reset_email_safely,
                            usuario.pk,
                            raw_token,
                        )
                    )

        return Response({'message': self.response_message}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reset_password_with_token(
                serializer.validated_data['token'],
                serializer.validated_data['password'],
            )
        except InvalidResetToken:
            return Response(
                {'error': 'El enlace de recuperación es inválido o ha expirado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'message': 'Tu contraseña se actualizó correctamente.'},
            status=status.HTTP_200_OK,
        )
