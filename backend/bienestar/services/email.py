import json
import logging
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string

from bienestar.models import Usuario


logger = logging.getLogger(__name__)

BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email"


def _send_with_console(recipient, subject, text_content, html_content):
    connection = get_connection(
        backend='django.core.mail.backends.console.EmailBackend'
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
        connection=connection,
    )
    message.attach_alternative(html_content, 'text/html')
    message.send(fail_silently=False)


def _send_with_brevo(recipient, subject, text_content, html_content):
    if not settings.BREVO_API_KEY:
        raise ImproperlyConfigured('Falta configurar BREVO_API_KEY')

    payload = json.dumps({
        'sender': {
            'name': settings.DEFAULT_FROM_NAME,
            'email': settings.DEFAULT_FROM_EMAIL,
        },
        'to': [{'email': recipient}],
        'subject': subject,
        'textContent': text_content,
        'htmlContent': html_content,
    }).encode('utf-8')
    request = Request(
        BREVO_EMAIL_ENDPOINT,
        data=payload,
        method='POST',
        headers={
            'accept': 'application/json',
            'api-key': settings.BREVO_API_KEY,
            'content-type': 'application/json',
        },
    )
    try:
        with urlopen(request, timeout=settings.EMAIL_REQUEST_TIMEOUT) as response:
            if response.status >= 400:
                raise RuntimeError(
                    f'Brevo rechazó el correo con estado {response.status}'
                )
    except (HTTPError, URLError) as error:
        raise RuntimeError('No se pudo entregar el correo mediante Brevo') from error


def send_transactional_email(recipient, subject, template_name, context):
    text_content = render_to_string(f'emails/{template_name}.txt', context)
    html_content = render_to_string(f'emails/{template_name}.html', context)

    if settings.EMAIL_PROVIDER == 'console':
        _send_with_console(recipient, subject, text_content, html_content)
        return
    if settings.EMAIL_PROVIDER == 'brevo':
        _send_with_brevo(recipient, subject, text_content, html_content)
        return
    raise ImproperlyConfigured(
        f'Proveedor de correo no soportado: {settings.EMAIL_PROVIDER}'
    )


def send_welcome_email(usuario):
    send_transactional_email(
        recipient=usuario.email,
        subject='¡Te damos la bienvenida a Bienestar Plus!',
        template_name='welcome',
        context={
            'nombre': usuario.nombre,
            'login_url': f'{settings.FRONTEND_URL}/login',
        },
    )


def send_password_reset_email(usuario, raw_token):
    query = urlencode({'token': raw_token})
    send_transactional_email(
        recipient=usuario.email,
        subject='Recuperá tu contraseña de Bienestar Plus',
        template_name='password_reset',
        context={
            'nombre': usuario.nombre,
            'reset_url': f'{settings.FRONTEND_URL}/restablecer-contrasena?{query}',
            'expiration_minutes': 30,
        },
    )


def send_welcome_email_safely(usuario_id):
    try:
        send_welcome_email(Usuario.objects.get(pk=usuario_id))
        return True
    except Exception:
        logger.exception(
            'No se pudo enviar el correo de bienvenida al usuario %s',
            usuario_id,
        )
        return False


def send_password_reset_email_safely(usuario_id, raw_token):
    try:
        send_password_reset_email(Usuario.objects.get(pk=usuario_id), raw_token)
        return True
    except Exception:
        logger.exception(
            'No se pudo enviar el correo de recuperación al usuario %s',
            usuario_id,
        )
        return False
