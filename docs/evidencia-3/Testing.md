# Testing — Bienestar Plus, Sprint 4

Wiki local preparada para la Evidencia 3 desde la página 4 hasta la página 8 del PDF. Los documentos DOCX y XLSX del Sprint anterior solo se usaron como contexto y no se editaron.

## Estado de ejecución

Ejecución local del 15/10/2026 en dev/SantiagoBustos, commit base 417bab1f. Se instalaron las dependencias Python/Node y Chromium; PostgreSQL de pruebas y la cuenta de QA fueron aislados del servicio y de datos reales.

| Capa | Resultado más reciente | Reportes |
| --- | --- | --- |
| Build frontend | npm run build pasa; quedan advertencias existentes de bundle inicial sobre presupuesto, RouterLink no usado y optional chaining. | Salida de npm run build en frontend/. |
| Django + PostgreSQL | 29 casos; 22 pasan y 7 fallan por contratos/controles que la rama no cumple. Cobertura total: 70%. | tests/reports/backend/django-tests.log, coverage-summary.txt, coverage.xml y htmlcov/ |
| Newman | 11 requests, 19 aserciones; 17 pasan, 2 fallan: meta 0 recibe 201 en vez de 400 y GET anónimo recibe 200 en vez de 401. | tests/api/reports/newman-report.html, newman-junit.xml, newman.log |
| Playwright | 10 casos; 9 pasan, 1 falla en BUG-HAB-05. Login válido, cuatro rechazos, axe y PDF pasan; el resto del CRUD también termina correctamente. | tests/e2e/playwright-report/index.html, test-results/junit.xml, tests/reports/e2e/playwright-final.log |
| axe-core | Login, Registro y Hábitos: 3/3 sin violaciones critical/serious. | Reporte Playwright, junit.xml y capturas en tests/reports/lighthouse/ |
| Lighthouse accesibilidad | Login 100, Registro 100, Hábitos 98; todos superan 90. | Reportes HTML/JSON por pantalla en tests/reports/lighthouse/ |
| Revisión manual | Parcial: Tab/Shift+Tab, Enter, Espacio y Escape en controles principales; labels, estructura y reflow documentados. Quedan errores de login sin asociar, heading-order en Hábitos, zoom real al 200% y lector de pantalla. | tests/reports/e2e/manual-accessibility-review.json y docs/evidencia-3/checklist-accesibilidad.md |

No se han marcado fallos del producto como corregidos. El detalle está en [reporte de hallazgos](REPORTE_BUGS_SPRINT4.md). Las mediciones iniciales de Lighthouse de Login y Registro (88) están preservadas en tests/reports/lighthouse/baseline/; los reportes principales son las mediciones finales.

## Estructura de pruebas

- backend/bienestar/tests/: casos DRF con APITestCase y reverse().
- backend/bienestar_plus_api/settings_test.py y backend/requirements-test.txt: PostgreSQL de pruebas y dependencias de QA.
- tests/api/: colección Postman 2.1, entorno, Newman y reportes.
- tests/e2e/pages/: Page Objects.
- tests/e2e/flows/: flujos de login, CRUD de rutina y descarga PDF.
- tests/e2e/accessibility/: axe-core y ejecución autenticada de Lighthouse para Hábitos.
- tests/reports/: cobertura, revisión manual y capturas Lighthouse.

## Ejecución reproducible

### Backend Django REST Framework

Instalar backend/requirements-test.txt, configurar TEST_DATABASE_URL con una base PostgreSQL local aislada cuyo nombre termine en _test, y desde backend ejecutar python manage.py check y python -m coverage run manage.py test bienestar.tests --settings=bienestar_plus_api.settings_test. Luego generar coverage report --include='bienestar/*'. No apuntar a producción.

### API Postman/Newman

Desde tests/api ejecutar npm ci y npm test. La prueba consume baseUrl y usuarioId parametrizados en local.postman_environment.json. Usar únicamente una API y datos QA.

### Playwright + Page Object Model + axe

Desde tests/e2e ejecutar npm ci y npx playwright install chromium. Configurar E2E_BASE_URL, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, E2E_TEST_EXERCISE_ID y E2E_TEST_EXERCISE_NAME con valores locales sintéticos; después ejecutar npm test. No guardar credenciales en archivos del repositorio.

El reporte HTML/JUnit y los adjuntos de fallo se regeneran en tests/e2e/playwright-report/ y tests/e2e/test-results/. La auditoría axe captura Login, Registro y Hábitos en tests/reports/lighthouse/.

### Lighthouse

Login y Registro se midieron con Lighthouse sobre la app local; sus reportes finales HTML/JSON y capturas quedan en tests/reports/lighthouse/. Hábitos requiere sesión: desde tests/e2e configurar E2E_BASE_URL, E2E_TEST_EMAIL y E2E_TEST_PASSWORD, y ejecutar npm run lighthouse:habits. El script accessibility/lighthouse-authenticated.mjs guarda habitos.report.html, habitos.report.json y habitos.png. El puerto CDP puede cambiarse con LIGHTHOUSE_REMOTE_DEBUGGING_PORT.

### Revisión manual WCAG 2.2 AA

Seguir docs/evidencia-3/checklist-accesibilidad.md. La revisión actual verificó Tab/Shift+Tab, Enter, Espacio y Escape en los controles principales; foco visible, idioma, un h1, landmarks, asociaciones de labels de Registro y reflow en 320/640 px. No sustituye el zoom real del navegador ni el recorrido con NVDA/otro lector; esos pasos siguen pendientes.

## Gestión y entregas

Los borradores de milestone, Issues y tablero están en docs/evidencia-3/github/ y no se han creado remotamente. Los cinco paquetes locales e instrucciones están en entregas-sprint4/, ruta ignorada por Git. Cada integrante debe copiar sus destinos exclusivos bajo Test/ y registrar su propio commit. No se atribuyen commits ajenos. No se hizo commit ni push durante esta actividad.
