# Hallazgos verificados — Evidencia 3, Sprint 4

Ejecución local del 15/10/2026 en dev/SantiagoBustos, commit base 417bab1f, con PostgreSQL de pruebas aislado, Newman y Chromium. Los resultados describen la rama probada; no se modificó la lógica funcional/backend para hacer pasar las pruebas.

## BUG-SEC-01 — Endpoints de rutinas y logout no exigen protección esperada

- **Estado:** reproducido por Django REST Framework y Newman.
- **Severidad propuesta:** alta, requiere revisión del equipo.
- **Evidencia:** la suite DRF registra que logout sin CSRF devuelve 200 en lugar de 403; POST de rutina anónimo devuelve 201 en lugar de 401; GET anónimo de rutinas devuelve 200 en lugar de 401; la descarga de PDF anónima devuelve 200 en lugar de 401. Newman confirma GET anónimo 200 en lugar de 401.
- **Propiedad:** operaciones de lectura, edición y borrado sobre rutina ajena respondieron 200, 200 y 204 en lugar de 403.
- **Archivos:** tests/reports/backend/django-tests.log, tests/api/reports/newman.log y reportes JUnit/HTML.
- **Pruebas relacionadas:** test_authentication_api.py, test_habits_api.py, test_routine_pdf_api.py y colección Postman.

## BUG-API-02 — Rutinas aceptan valores o duplicados que deberían rechazarse

- **Estado:** reproducido por DRF y Newman.
- **Severidad propuesta:** media.
- **Evidencia:** meta_cantidad 0 y -5 no se rechazan; Newman recibe 201 para meta_cantidad=0 en vez de 400. El POST de rutina duplicada devuelve 201 en vez de 400. Editar una rutina completada responde 200 en vez de 400.
- **Archivos:** tests/reports/backend/django-tests.log y tests/api/reports/newman.log.

## BUG-HAB-05 — La tarjeta de ejercicio no refleja que ya se agregó

- **Estado:** reproducido por Playwright. El flujo crea la rutina y espera que aparezca en la lista; la aserción soft del botón Agregado falla. El resto del CRUD continúa y pasa: editar, completar y borrar.
- **Severidad propuesta:** baja/media, confirmar con producto.
- **Hipótesis técnica a verificar:** el serializer expone ejercicio_nombre pero no el ID usado por Habitos.estaEnRutina(). La hipótesis se apoya en el código, no implica que se haya corregido.
- **Evidencia:** e2e/playwright-report/index.html, e2e/test-results/junit.xml y playwright-final.log.

## BUG-ACC-03 — Los errores de campo del login no se asocian al input

- **Estado:** confirmado en revisión de navegador/DOM.
- **Severidad propuesta:** media.
- **Evidencia:** al volver inválido el correo, aparece el mensaje inline, pero el input no recibe aria-invalid ni aria-describedby. Los errores generales de autenticación sí usan role=alert.
- **Archivos:** frontend/src/app/pages/login/login.html y tests/reports/e2e/manual-accessibility-review.json.
- **Pendiente:** vincular el mensaje con el campo y anunciarlo con tecnología de asistencia; no se probó NVDA.

## BUG-ACC-04 — Jerarquía de encabezados salta niveles en Hábitos

- **Estado:** reportado por el audit heading-order de Lighthouse.
- **Severidad propuesta:** baja.
- **Evidencia:** tests/reports/lighthouse/habitos.report.json; score de accesibilidad 98, por encima del mínimo de 90.
- **Pendiente:** ajustar la jerarquía semántica preservando el estilo y volver a ejecutar la auditoría.

## Correcciones locales incluidas

- El idioma principal del documento cambió a español (lang=es).
- Los enlaces de redes sociales del footer tienen nombre accesible.
- Se corrigieron colores de enlaces y encabezados que producían fallos de contraste.
- axe-core pasa en Login, Registro y Hábitos; Lighthouse da 100, 100 y 98 respectivamente.

## Baseline inicial

Las mediciones iniciales de Login y Registro eran 88 antes de los cambios visuales. Se preservan en tests/reports/lighthouse/baseline/. Las mediciones finales se guardan en los nombres principales de tests/reports/lighthouse/.

Los hallazgos para GitHub permanecen como borradores en docs/evidencia-3/github/; no se crearon Issues remotos. La evidencia del Sprint 4 está versionada en dev/SantiagoBustos.
