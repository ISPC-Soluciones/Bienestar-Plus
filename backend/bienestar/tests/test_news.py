from unittest.mock import patch
from urllib.error import URLError

from django.core.cache import cache
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from bienestar.services.news import FALLBACK_ARTICLES, get_news_payload, parse_news_response
from bienestar.views import NoticiasView


NEWS_SAMPLE = {
    "articles": [
        {
            "title": "Actividad física y salud mental",
            "url": "https://www.paho.org/es/noticias/actividad-fisica",
            "seendate": "20260912T100000Z",
            "socialimage": "https://www.paho.org/sites/default/files/image.jpg",
        },
        {
            "title": "Resultados de un torneo profesional",
            "url": "https://www.paho.org/es/deportes/torneo",
            "seendate": "20260912T090000Z",
        },
        {
            "title": "Consejos para cuidar la salud",
            "url": "https://sitio-no-oficial.example/noticia",
            "seendate": "20260912T080000Z",
        },
    ]
}


class NewsServiceTests(SimpleTestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_parse_response_normalizes_and_filters_articles(self):
        # Arrange: provide official and non-official news entries.
        payload = NEWS_SAMPLE

        # Act: normalize and filter the provider response.
        articles = parse_news_response(payload)

        # Assert: only the official health article remains in the public format.
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0]["title"], "Actividad física y salud mental")
        self.assertEqual(
            articles[0]["summary"],
            "Información oficial para cuidar la salud mental y el bienestar emocional.",
        )
        self.assertEqual(
            articles[0]["image"],
            "https://www.paho.org/sites/default/files/image.jpg",
        )
        self.assertEqual(articles[0]["category"], "salud-mental")
        self.assertEqual(articles[0]["publishedAt"], "2026-09-12T10:00:00Z")

    @patch("bienestar.services.news._download_news", side_effect=URLError("offline"))
    def test_uses_official_fallback_when_providers_fail(self, download_news):
        # Arrange: simulate the external provider being unavailable.

        # Act: request the news payload.
        payload = get_news_payload()

        # Assert: a safe official fallback is returned without retrying the provider.
        self.assertTrue(payload["isFallback"])
        self.assertEqual(payload["articles"], list(FALLBACK_ARTICLES))
        download_news.assert_called_once_with()

    @patch("bienestar.services.news._download_news", return_value=NEWS_SAMPLE)
    def test_caches_successful_response(self, download_news):
        # Arrange: simulate a stable provider response.

        # Act: request the same payload twice.
        first_payload = get_news_payload()
        second_payload = get_news_payload()

        # Assert: the provider is called once and the cached payload is reused.
        self.assertFalse(first_payload["isFallback"])
        self.assertEqual(first_payload, second_payload)
        download_news.assert_called_once_with()


class NewsEndpointTests(SimpleTestCase):
    @patch("bienestar.views.get_news_payload")
    def test_returns_normalized_news_payload(self, get_payload):
        # Arrange: provide the normalized service contract.
        get_payload.return_value = {
            "articles": [dict(FALLBACK_ARTICLES[0])],
            "isFallback": False,
            "updatedAt": "2026-09-12T10:00:00Z",
        }

        # Act: call the endpoint through its DRF view.
        request = APIRequestFactory().get("/api/noticias/")
        response = NoticiasView.as_view()(request)

        # Assert: the response matches the service payload.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, get_payload.return_value)
