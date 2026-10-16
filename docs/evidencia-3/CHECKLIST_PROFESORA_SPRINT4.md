# Checklist de la consigna — Evidencia 3, Sprint 4

Revisión de las actividades desde Sprint 4 — Gestión Ágil del Testing (página 4) hasta la página 8 del PDF. La ejecución registrada es del 15/10/2026, originalmente sobre 417bab1f. La evidencia y la reorganización de carpetas se publicaron en dev/SantiagoBustos.

Estados: Cumplido local = artefacto o ejecución comprobable; Parcial = hay evidencia, pero quedan fallos o pasos de revisión; Pendiente = requiere acción externa o herramienta no ejecutada.

## Estructura y preparación

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Separar pruebas backend en backend/bienestar/tests/ | Cumplido local | Casos DRF y paquete de pruebas. |
| Crear tests/api/ para Postman/Newman | Cumplido local | Colección, entorno de ejemplo, manifiestos y reportes Newman. |
| Crear e2e/ con pages, flows y accessibility | Cumplido | Page Objects, flujos y auditorías axe. |
| Preparar aportes de cinco integrantes sin rutas repetidas | Cumplido local | Paquetes e instrucciones en entregas-sprint4/, ignorada por Git. Los paquetes contienen código/configuración; los reportes quedan en tests/reports/. |

## Backend — AUT-BE

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Usar APITestCase y reverse() por recurso | Cumplido local | Pruebas en backend/bienestar/tests/. |
| Usar PostgreSQL de pruebas aislado | Cumplido local | Se instaló el entorno y la suite se ejecutó contra una instancia PostgreSQL temporal local con DB separada terminada en _test. |
| Cubrir CRUD, métodos permitidos, sesión, propiedad, CSRF y payloads | Ejecutado, parcial | 29 pruebas: 22 pasan y 7 fallan por respuestas reales de la rama bajo prueba. Ver django-tests.log. |
| Generar cobertura | Cumplido local | Cobertura total 70%; coverage.xml, coverage-summary.txt y htmlcov/index.html. |
| Corregir defectos detectados | Pendiente | No se cambió la lógica del backend. Los fallos se documentan para triage y Issues. |

## API — AUT-API

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Colección Postman 2.1 y entorno parametrizado | Cumplido local | tests/api/bienestar-plus-sprint4.postman_collection.json y local.postman_environment.json. |
| Encadenar CRUD de ejercicios y rutinas con variables | Ejecutado | Newman ejecutó 11 requests y 19 aserciones. |
| Validar estados, campos y escenarios negativos | Ejecutado, parcial | 17 aserciones pasan y 2 fallan: meta_cantidad=0 recibió 201 en vez de 400 y GET anónimo recibió 200 en vez de 401. |
| Guardar HTML/JUnit | Cumplido local | tests/api/reports/newman-report.html y newman-junit.xml. |

## Interfaz — AUT-E2E

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Usar Page Object Model y selectores estables | Cumplido local | e2e/pages/ y data-testid en las vistas cubiertas. |
| Automatizar login válido y cuatro combinaciones inválidas | Ejecutado, cumplido | Los cinco escenarios pasan. |
| Cubrir CRUD de rutina y descarga PDF | Ejecutado, parcial | La edición, finalización, eliminación y descarga PDF pasan. El test registra un fallo soft: la tarjeta de ejercicio no cambia a Agregado. |
| Guardar HTML/JUnit y adjuntos | Cumplido local | e2e/playwright-report, e2e/test-results/junit.xml, captura, video y trace del caso fallido. |
| Resultado total E2E | Parcial | 9/10 pruebas pasan. El único fallo está identificado como BUG-HAB-05. |

## Accesibilidad — ACC

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Ejecutar axe-core en login, registro y hábitos sin impactos critical/serious | Cumplido local | Las 3 auditorías pasan en el último Playwright: 0 violaciones critical/serious. |
| Lighthouse ≥90 en las pantallas revisadas | Cumplido local | Login 100, Registro 100, Hábitos 98. Reportes HTML/JSON en tests/reports/lighthouse/. |
| Guardar capturas | Cumplido local | login.png, registration.png y habitos.png; también vistas responsive 320 y 640 px. |
| Revisar teclado y foco | Parcial | Tab/Shift+Tab visibles; Enter envía Login; Espacio activa Hidratación; Enter activa Sueño; Escape no deja diálogo abierto. No se recorrieron exhaustivamente todos los controles. |
| Revisar viewport y reflow | Cumplido para 320/640 px | Login, Registro y Hábitos sin overflow horizontal; evidencia y métricas en manual-accessibility-review.json. No equivale a verificar zoom real del navegador al 200%. |
| Revisar formularios, errores, labels, contraste e iconos | Parcial | Labels del registro asociados; contrastes y nombres de enlaces superan axe/Lighthouse tras ajustes. El error inline de correo en Login no tiene aria-invalid ni aria-describedby. |
| Revisar idioma, títulos, encabezados, landmarks y lector | Parcial | lang=es, un h1, main y nav por vista. Lighthouse señala salto de nivel de encabezado en Hábitos (score global 98). No se recorrió con NVDA/lector de pantalla. |

## Gestión ágil y participación

| Requisito | Estado | Evidencia / pendiente |
| --- | --- | --- |
| Preparar Wiki de testing | Cumplido local | docs/evidencia-3/Testing.md; no se publicó. |
| Crear milestone, Issues y tablero pedidos | Preparado local, pendiente remoto | Borradores en docs/evidencia-3/github/. No se modificó GitHub. |
| Contar con cinco commits personales reales | Pendiente | Cada persona tiene archivos únicos e instrucciones locales; los commits deben hacerlos los integrantes con sus cuentas. |

## Reportes reproducibles

- Backend: tests/reports/backend/django-tests.log, coverage-summary.txt, coverage.xml y htmlcov/.
- API: tests/api/reports/newman-report.html, newman-junit.xml y newman.log.
- E2E: e2e/playwright-report/index.html, e2e/test-results/junit.xml y tests/reports/e2e/playwright-final.log.
- Axe/manual: tests/reports/e2e/manual-accessibility-review.json.
- Lighthouse y capturas: tests/reports/lighthouse/.

Los DOCX y XLSX del Sprint anterior se usaron solo como contexto y no se actualizaron. La rama publicada es dev/SantiagoBustos; no se publicaron cambios en develop ni main.
