import hashlib
import secrets
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone

from bienestar.models import TokenRecuperacionPassword


TOKEN_EXPIRATION_MINUTES = 30


class InvalidResetToken(Exception):
    pass


def token_digest(raw_token):
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()


def create_password_reset_token(usuario):
    now = timezone.now()
    TokenRecuperacionPassword.objects.filter(
        usuario=usuario,
        utilizado__isnull=True,
    ).update(utilizado=now)

    raw_token = secrets.token_urlsafe(32)
    TokenRecuperacionPassword.objects.create(
        usuario=usuario,
        token_hash=token_digest(raw_token),
        expira=now + timedelta(minutes=TOKEN_EXPIRATION_MINUTES),
    )
    return raw_token


@transaction.atomic
def reset_password_with_token(raw_token, new_password):
    try:
        reset_token = (
            TokenRecuperacionPassword.objects
            .select_for_update()
            .select_related('usuario')
            .get(token_hash=token_digest(raw_token))
        )
    except TokenRecuperacionPassword.DoesNotExist as error:
        raise InvalidResetToken from error

    now = timezone.now()
    if reset_token.utilizado is not None or reset_token.expira <= now:
        raise InvalidResetToken

    usuario = reset_token.usuario
    usuario.password = make_password(new_password)
    usuario.save(update_fields=['password'])
    TokenRecuperacionPassword.objects.filter(
        usuario=usuario,
        utilizado__isnull=True,
    ).update(utilizado=now)

    return usuario
