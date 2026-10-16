# Borradores de Issues — Evidencia 3, Sprint 4

Estado remoto: no se cargaron Issues. Estos borradores se actualizan con evidencia local del 15/10/2026 en dev/SantiagoBustos, commit base 417bab1f. Usar etiquetas automatizacion/accesibilidad y vincular reportes al crear los Issues.

## Requisitos de automatización

| Issue | Criterio verificable | Estado local |
| --- | --- | --- |
| AUT-BE-01 | APITestCase, reverse() y pruebas por recurso | Preparado y ejecutado |
| AUT-BE-02 | PostgreSQL de prueba aislado | Ejecutado localmente |
| AUT-BE-03/04 | Verbos permitidos y 405 para no permitidos | Incluido; suite ejecutada |
| AUT-BE-05 | Sesión, autorización, propiedad y CSRF | Hay respuestas que no cumplen; ver BUG-SEC-01 |
| AUT-BE-06 | Payload inválido responde 400 sin efectos parciales | Ejecutado; fallan validación/duplicados, ver BUG-API-02 |
| AUT-API-01/02/03 | Postman v2.1; CRUD encadenado de dos recursos y contratos | Newman ejecutó 11 requests, 19 aserciones |
| AUT-API-04 | Payloads inválidos responden 400 | meta_cantidad=0 recibe 201, ver BUG-API-02 |
| AUT-API-05 | GET anónimo de recurso protegido devuelve 401 | Recibe 200, ver BUG-SEC-01 |
| AUT-E2E-01 | Page Object Model y selectores accesibles/data-testid | Preparado y ejecutado |
| AUT-E2E-02/03 | Login válido y cuatro entradas inválidas | Casos pasan |
| AUT-E2E-04 | Alta, edición, completar y borrar rutina | CRUD pasa; indicador de tarjeta falla, ver BUG-HAB-05 |
| AUT-E2E-05 | Descarga PDF desde la UI | Pasa y comprueba nombre del archivo |
| AUT-E2E-06/07 | Selectores de prueba y reportes de ejecución | Preparado; HTML/JUnit/adjuntos locales |

## Accesibilidad

| Issue | Criterio verificable | Estado local |
| --- | --- | --- |
| ACC-01 | axe WCAG 2.2 AA sin critical/serious en Login, Registro y Hábitos | Pasa en las tres pantallas |
| ACC-02 | Lighthouse ≥90 y capturas | Login 100, Registro 100, Hábitos 98; reportes y capturas locales |
| ACC-03 | Tab, Shift+Tab, Enter, Espacio, Escape; foco visible | Tab/Shift+Tab y foco probados; faltan Enter/Espacio/Escape exhaustivos |
| ACC-04 | Labels, errores anunciados, contraste y nombres/alt | Labels del registro y contraste revisados; falta asociar los errores inline de login |
| ACC-05 | Idioma, título, encabezados, landmarks, 200%, 320 px y lector | lang, landmarks, 320/640 probados; heading-order falla en Hábitos. 200% real y lector pendientes |

## Bugs reproducidos o confirmados localmente

### BUG-SEC-01 — Falta exigir sesión, propiedad o CSRF en operaciones sensibles

DRF confirma: logout sin CSRF 200/esperado 403; POST anónimo de rutina 201/401; GET anónimo de rutinas 200/401; PDF anónimo 200/401; acceso de usuario ajeno a rutina devuelve lectura 200, edición 200 y borrado 204 frente a 403. Newman confirma GET anónimo 200/401. Reportes en tests/reports/backend/ y tests/api/reports/.

### BUG-API-02 — Validación de rutinas incompleta

DRF/Newman reproducen aceptación de meta_cantidad 0 y -5, creación duplicada con 201 en vez de 400 y edición de rutina completada con 200 en vez de 400. Evidencia en django-tests.log y newman.log.

### BUG-HAB-05 — La tarjeta no muestra el estado agregado

Playwright crea la rutina, observa el elemento en la lista y completa edición, finalización y baja; la aserción soft de que la tarjeta cambie a Agregado falla. Ver reporte Playwright y test-results/junit.xml.

### BUG-ACC-03 — Error de campo login sin asociación programática

En la revisión del DOM aparece el error inline pero el campo no expone aria-invalid/aria-describedby. Falta comprobación con lector de pantalla. Evidencia en manual-accessibility-review.json.

### BUG-ACC-04 — Salto en jerarquía de encabezados de Hábitos

Lighthouse detecta audit heading-order; la puntuación general de accesibilidad sigue siendo 98. Reporte en tests/reports/lighthouse/habitos.report.json.

La corrección local de lang="en" a lang="es" ya está hecha y no se mantiene como bug abierto. El título global Bienestar Plus es genérico; requiere decisión de producto antes de crear un Issue de título por ruta.

## Kanban pedido

Columnas: Product Backlog, To Do (Sprint Backlog), In Progress Testing (QA) y Done. Mantener en QA los requisitos con pruebas fallidas y mover a Done solo después de corrección integrada por PR revisado y ejecución verde. El tablero y los Issues remotos no se modificaron.
