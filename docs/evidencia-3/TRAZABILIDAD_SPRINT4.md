# Trazabilidad — Evidencia 3, Sprint 4

Matriz de los requisitos del Sprint 4 indicados en las páginas 4–8 del PDF de la cátedra. Los DOCX y XLSX del Sprint anterior sirven como contexto y no se modificaron ni forman parte de esta evidencia. La ejecución local del 15/10/2026 quedó registrada en `Testing.md`, los reportes y el checklist de la profesora.

## Pruebas de backend

| Requisito | Caso asociado | Implementación / evidencia | Estado |
| --- | --- | --- | --- |
| AUT-BE-01 — Organizar pruebas por recurso con `APITestCase` y `reverse()` | TC-AUT-BE-01 | `backend/bienestar/tests/` (`test_authentication_api.py`, `test_habits_api.py`, `test_profile_api.py`, `test_routine_pdf_api.py`) | Ejecutado; 29 casos, 22 pasan y 7 fallan |
| AUT-BE-02 — Usar PostgreSQL de prueba aislado | TC-AUT-BE-02 | `backend/bienestar_plus_api/settings_test.py`; PostgreSQL temporal aislado y `TEST_DATABASE_URL` terminado en `_test` | Ejecutado contra base aislada |
| AUT-BE-03 — Cubrir operaciones válidas y exportación | TC-AUT-BE-03 | `test_habits_api.py`, `test_profile_api.py`, `test_routine_pdf_api.py` | Parcial; ver resultados y fallos en `Testing.md` y `REPORTE_BUGS_SPRINT4.md` |
| AUT-BE-04 — Comprobar métodos no permitidos (405) | TC-AUT-BE-04 | `test_routine_pdf_api.py` | Ejecutado; resultado incluido en el log Django |
| AUT-BE-05 — Comprobar sesión, permisos, propiedad y CSRF | TC-AUT-BE-05 | `test_authentication_api.py`, `test_habits_api.py` (`test_aut_be_05_user_cannot_read_update_or_delete_another_users_routine`), `test_routine_pdf_api.py` | Parcial; fallos reproducidos y documentados en `BUG-SEC-01` |
| AUT-BE-06 — Rechazar payloads inválidos (400) | TC-AUT-BE-06 | Validaciones cubiertas en `test_habits_api.py` y `test_profile_api.py` | Parcial; rechazos ausentes documentados en `BUG-API-02` |

## Pruebas de API

| Requisito | Caso asociado | Implementación / evidencia | Estado |
| --- | --- | --- | --- |
| AUT-API-01 — Colección Postman v2.1 y entorno parametrizado | TC-AUT-API-01 | `tests/api/bienestar-plus-sprint4.postman_collection.json`, `tests/api/local.postman_environment.json` | Ejecutado con Newman |
| AUT-API-02 — CRUD de dos recursos con POST → GET → PATCH → DELETE | TC-AUT-API-02 | Flujos de ejercicios y rutinas en la colección | Ejecutado; resultados incluidos en el reporte Newman |
| AUT-API-03 — Verificar estados y contratos de respuesta | TC-AUT-API-03 | Aserciones Postman de estados, campos y tipos en la colección | Parcial; 17/19 aserciones pasan |
| AUT-API-04 — Incluir payload negativo por recurso | TC-AUT-API-04 | Payload incompleto para ejercicio y meta no positiva para rutina | Parcial; la meta cero devuelve 201 en vez de 400 |
| AUT-API-05 — Verificar rechazo sin sesión (401) | TC-AUT-API-05 | Request protegido sin credenciales en la colección | Falla reproducida; GET anónimo devuelve 200 |

## Pruebas de interfaz

| Requisito | Caso asociado | Implementación / evidencia | Estado |
| --- | --- | --- | --- |
| AUT-E2E-01 — Usar Page Object Model y selectores estables | TC-AUT-E2E-01 | `e2e/pages/`; prioridad `data-testid`, rol accesible y luego texto/etiqueta | Implementado y ejecutado |
| AUT-E2E-02 — Login válido y navegación al perfil | TC-AUT-E2E-02 | `e2e/flows/critical-flows.spec.ts` | Ejecutado; pasa |
| AUT-E2E-03 — Rechazar al menos cuatro combinaciones inválidas | TC-AUT-E2E-03 | Escenarios inválidos del flujo crítico | Ejecutado; cuatro escenarios pasan |
| AUT-E2E-04 — CRUD del módulo principal | TC-AUT-E2E-04 / TC-HAB-01..05 | Alta, edición, completar y quitar ejercicio en rutina desde la UI | Parcial; falla la actualización visual tras el alta (`BUG-HAB-05`) |
| AUT-E2E-05 — Completar flujo de negocio de descarga PDF | TC-AUT-E2E-05 | Descarga de rutina desde la interfaz y aserción del archivo PDF | Ejecutado; pasa |
| AUT-E2E-06 — Preferir selectores accesibles y `data-testid` | TC-AUT-E2E-06 | `data-testid` en Login y Hábitos; POMs en `e2e/pages/` | Implementado y ejecutado |
| AUT-E2E-07 — Guardar reporte y evidencia cuando falla | TC-AUT-E2E-07 | `e2e/playwright.config.ts`: HTML/JUnit, screenshot, video y trace | Ejecutado; reportes y adjuntos guardados |

## Accesibilidad

| Requisito | Caso asociado | Implementación / evidencia | Estado |
| --- | --- | --- | --- |
| ACC-01 — axe-core, WCAG 2.2 AA, cero violaciones critical/serious | TC-ACC-01 | `e2e/accessibility/accessibility.spec.ts` en Login, Registro y Hábitos | Ejecutado; sin violaciones critical/serious en las tres vistas |
| ACC-02 — Lighthouse con puntuación de accesibilidad ≥ 90 | TC-ACC-02 | Reportes y capturas en `tests/reports/lighthouse/` | Ejecutado; Login 100, Registro 100, Hábitos 98 |
| ACC-03 — Navegación con teclado y foco visible | TC-ACC-03 | `checklist-accesibilidad.md` y reporte manual | Parcial; controles principales revisados, quedan interacciones y zoom por completar |
| ACC-04 — Formularios, errores, etiquetas, contraste y alternativas | TC-ACC-04 | `checklist-accesibilidad.md` y `REPORTE_BUGS_SPRINT4.md` | Parcial; error de login sin asociar confirmado como `BUG-ACC-03` |
| ACC-05 — Idioma, título, encabezados, landmarks, zoom y lector | TC-ACC-05 | `checklist-accesibilidad.md` y reportes Lighthouse | Parcial; idioma/título/landmarks revisados, quedan zoom real y lector de pantalla |

## Gestión del Sprint y participación

| Requisito | Artefacto | Estado |
| --- | --- | --- |
| Milestone del Sprint 4 | `github/MILESTONE_SPRINT_4.md` | Borrador; falta crearlo en GitHub |
| Issues por requisito y por bug candidato | `github/ISSUES_SPRINT4.md` | Borrador; falta crearlos y asignar responsables |
| Tablero con columnas `Product Backlog`, `To Do (Sprint Backlog)`, `In Progress Testing (QA)`, `Done` | `github/ISSUES_SPRINT4.md` | Organización documentada; falta configurar en GitHub |
| Cinco integrantes con al menos un test automatizado o Issue de accesibilidad y commit propio | `README.md` | Archivos propuestos; cada integrante debe revisar y subir su propio commit |

## Evidencia requerida para cerrar

- Los reportes de coverage, Newman, Playwright, axe-core y Lighthouse están guardados en las rutas indicadas en `Testing.md`.
- Completar la revisión manual pendiente de zoom real al 200% y lector de pantalla; corregir o aceptar los hallazgos documentados.
- Crear en GitHub los Issues y el milestone a partir de los borradores, con responsables y evidencia reproducible.
- Cada integrante debe revisar su aporte y registrar su propio commit; la asignación de archivos no reemplaza ese requisito.
