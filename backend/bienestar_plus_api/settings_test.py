"""Settings for tests that must use a dedicated PostgreSQL test database."""

import os

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .settings import *  # noqa: F403


test_database_url = os.environ.get("TEST_DATABASE_URL", "").strip()
if not test_database_url:
    raise ImproperlyConfigured(
        "Set TEST_DATABASE_URL to a dedicated PostgreSQL database ending in _test."
    )

test_database = dj_database_url.parse(test_database_url, conn_max_age=0)
if test_database.get("ENGINE") != "django.db.backends.postgresql":
    raise ImproperlyConfigured("TEST_DATABASE_URL must use PostgreSQL.")

database_name = str(test_database.get("NAME", ""))
if not database_name.lower().endswith("_test"):
    raise ImproperlyConfigured(
        "The database name in TEST_DATABASE_URL must end in _test; Django creates a separate test_ database."
    )

test_database["TEST"] = {"NAME": f"test_{database_name}"}
test_database["CONN_MAX_AGE"] = 0
DATABASES = {"default": test_database}  # noqa: F405

ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
