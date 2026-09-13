import hashlib
import json
import logging
import re
import unicodedata
from datetime import datetime, timezone as datetime_timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from django.core.cache import cache
from django.utils import timezone


logger = logging.getLogger(__name__)

NEWS_CACHE_KEY = "bienestar:news:v2"
NEWS_CACHE_SECONDS = 60 * 60
FALLBACK_CACHE_SECONDS = 5 * 60
NEWS_LIMIT = 6
REQUEST_TIMEOUT_SECONDS = 8
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
GDELT_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# GDELT actúa como API de búsqueda, pero solo aceptamos resultados cuyos enlaces
# pertenecen a estas organizaciones oficiales.
NEWS_SOURCES = (
    ("OPS", "paho.org"),
    ("OMS", "who.int"),
)

SEARCH_TERMS = (
    "health",
    "wellness",
    "nutrition",
    "exercise",
    '"physical activity"',
    '"mental health"',
    "sleep",
)

RELEVANT_KEYWORDS = (
    "actividad fisica",
    "alimentacion",
    "bienestar",
    "descanso",
    "ejercicio",
    "habito",
    "hidratacion",
    "nutricion",
    "prevencion",
    "salud",
    "sueno",
)

CATEGORY_KEYWORDS = {
    "salud-mental": ("ansiedad", "estres", "salud mental", "depresion", "suicid"),
    "nutricion": ("alimentacion", "alimento", "dieta", "nutricion"),
    "actividad-fisica": ("actividad fisica", "deporte", "ejercicio", "movimiento"),
    "descanso": ("descanso", "dormir", "sueno"),
    "prevencion": ("prevencion", "prevenir", "vacuna", "vacunacion"),
}

CATEGORY_SUMMARIES = {
    "salud-mental": "Información oficial para cuidar la salud mental y el bienestar emocional.",
    "nutricion": "Información oficial para acompañar una alimentación equilibrada.",
    "actividad-fisica": "Información oficial para incorporar movimiento y reducir el sedentarismo.",
    "descanso": "Información oficial para mejorar el descanso y sostener hábitos saludables.",
    "prevencion": "Información oficial para prevenir enfermedades y cuidar la salud.",
    "bienestar": "Información oficial para acompañar hábitos saludables y mejorar el bienestar.",
}

FALLBACK_ARTICLES = (
    {
        "id": "ops-actividad-fisica",
        "title": "Actividad física para una vida saludable",
        "summary": "Conocé las recomendaciones de la OPS para incorporar movimiento y reducir el sedentarismo.",
        "url": "https://www.paho.org/es/temas/actividad-fisica",
        "image": None,
        "source": "OPS",
        "publishedAt": None,
        "category": "actividad-fisica",
    },
    {
        "id": "ops-alimentacion-saludable",
        "title": "Claves para una alimentación saludable",
        "summary": "Información oficial para elegir alimentos que acompañen una vida activa y saludable.",
        "url": "https://www.paho.org/es/temas/alimentacion-saludable",
        "image": None,
        "source": "OPS",
        "publishedAt": None,
        "category": "nutricion",
    },
    {
        "id": "oms-salud-mental",
        "title": "Cómo fortalecer la salud mental",
        "summary": "Orientaciones de la OMS para cuidar el bienestar emocional y afrontar el estrés cotidiano.",
        "url": "https://www.who.int/es/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
        "image": None,
        "source": "OMS",
        "publishedAt": None,
        "category": "salud-mental",
    },
)


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def _normalize_text(value):
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(character for character in value if not unicodedata.combining(character))
    return value.casefold()


def _clean_html(value, max_length=220):
    parser = _TextExtractor()
    parser.feed(value if isinstance(value, str) else "")
    text = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    if len(text) <= max_length:
        return text
    return f"{text[: max_length - 1].rstrip()}…"


def _valid_http_url(value):
    if not isinstance(value, str) or not value:
        return None
    cleaned_value = value.strip()
    parsed = urlparse(cleaned_value)
    return cleaned_value if parsed.scheme in {"http", "https"} and parsed.netloc else None


def _official_source(value):
    valid_url = _valid_http_url(value)
    if not valid_url:
        return None, None
    hostname = (urlparse(valid_url).hostname or "").lower()
    for source, domain in NEWS_SOURCES:
        if hostname == domain or hostname.endswith(f".{domain}"):
            return valid_url, source
    return None, None


def _published_at(value):
    if not isinstance(value, str) or not value:
        return None

    try:
        if re.fullmatch(r"\d{8}T\d{6}Z", value):
            parsed = datetime.strptime(value, "%Y%m%dT%H%M%SZ").replace(
                tzinfo=datetime_timezone.utc
            )
        else:
            parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=datetime_timezone.utc)
    return parsed.astimezone(datetime_timezone.utc).isoformat().replace("+00:00", "Z")


def _is_relevant(title):
    normalized_title = _normalize_text(title)
    return any(keyword in normalized_title for keyword in RELEVANT_KEYWORDS)


def _category_for(title):
    normalized_title = _normalize_text(title)
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized_title for keyword in keywords):
            return category
    return "bienestar"


def parse_news_response(payload):
    if not isinstance(payload, dict):
        raise ValueError("La API de noticias devolvió un formato inesperado")

    articles = []

    for item in payload.get("articles") or []:
        if not isinstance(item, dict):
            continue
        title = _clean_html(item.get("title"), max_length=140)
        url, source = _official_source(item.get("url"))
        if not title or not url or not _is_relevant(title):
            continue

        category = _category_for(title)
        articles.append(
            {
                "id": hashlib.sha256(url.encode("utf-8")).hexdigest()[:16],
                "title": title,
                "summary": CATEGORY_SUMMARIES[category],
                "url": url,
                "image": _valid_http_url(item.get("socialimage")),
                "source": source,
                "publishedAt": _published_at(item.get("seendate")),
                "category": category,
            }
        )

    return articles


def _download_news():
    domains = " OR ".join(f"domain:{domain}" for _, domain in NEWS_SOURCES)
    query = f"({' OR '.join(SEARCH_TERMS)}) ({domains}) sourcelang:spanish"
    parameters = urlencode(
        {
            "query": query,
            "mode": "artlist",
            "maxrecords": 25,
            "timespan": "3months",
            "sort": "datedesc",
            "format": "json",
        }
    )
    request = Request(
        f"{GDELT_API_URL}?{parameters}",
        headers={
            "Accept": "application/json",
            "User-Agent": "BienestarPlus/1.0 (+https://bienestar-plus.vercel.app)",
        },
    )

    with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        content = response.read(MAX_RESPONSE_BYTES + 1)
        if len(content) > MAX_RESPONSE_BYTES:
            raise ValueError("La respuesta de noticias supera el tamaño máximo permitido")
    return json.loads(content.decode("utf-8"))


def _external_articles():
    articles_by_url = {}

    try:
        payload = _download_news()
        for article in parse_news_response(payload):
            articles_by_url.setdefault(article["url"], article)
    except (HTTPError, json.JSONDecodeError, OSError, TimeoutError, URLError, ValueError) as error:
        logger.warning("No se pudieron obtener noticias externas: %s", error)

    return sorted(
        articles_by_url.values(),
        key=lambda article: article["publishedAt"] or "",
        reverse=True,
    )[:NEWS_LIMIT]


def get_news_payload():
    cached_payload = cache.get(NEWS_CACHE_KEY)
    if cached_payload is not None:
        return cached_payload

    articles = _external_articles()
    is_fallback = not articles
    payload = {
        "articles": articles or [dict(article) for article in FALLBACK_ARTICLES],
        "isFallback": is_fallback,
        "updatedAt": timezone.now().isoformat(),
    }
    cache.set(
        NEWS_CACHE_KEY,
        payload,
        FALLBACK_CACHE_SECONDS if is_fallback else NEWS_CACHE_SECONDS,
    )
    return payload
