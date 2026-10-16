# Checklist manual WCAG 2.2 AA — Sprint 4

Revisión local del 15/10/2026 en Chromium. Rama dev/SantiagoBustos, commit base 417bab1f. Métricas de ejecución en tests/reports/e2e/manual-accessibility-review.json; capturas en tests/reports/lighthouse/.

| ID | Revisión | Resultado | Evidencia / pendiente |
| --- | --- | --- | --- |
| ACC-01 | axe-core en Login, Registro y Hábitos | Cumplido: 3/3 pasan sin violaciones critical/serious | Playwright HTML/JUnit y capturas. |
| ACC-02 | Lighthouse | Cumplido: Login 100, Registro 100, Hábitos 98 | Reportes HTML/JSON. El 98 de Hábitos señala el audit heading-order. |
| ACC-03 | Teclado y foco | Parcial: Tab/Shift+Tab muestran foco y recorrido inverso; Enter envía Login y activa Sueño; Space activa Hidratación; Escape no deja diálogo abierto. No se recorrieron exhaustivamente todos los controles | JSON de revisión; falta recorrer el resto del sitio y modales si se agregan. |
| ACC-04 | Formularios, etiquetas, errores, contraste e iconos | Parcial: etiquetas del registro apuntan a sus campos; axe/Lighthouse no reporta fallos serios de contraste o nombres. Login muestra error inline sin aria-invalid ni aria-describedby | Hallazgo BUG-ACC-03 para triage; falta anunciar/asociar errores y validarlo con lector de pantalla. |
| ACC-05 | Idioma, estructura, reflow y lector | Parcial: lang=es, un h1, main y nav en las tres vistas. A 320 y 640 px no hay overflow horizontal. Hábitos tiene un salto en niveles de encabezado. No se probó zoom real al 200% ni NVDA/otro lector | manual-accessibility-review.json, reporte Lighthouse de Hábitos y capturas 320/640. |

## Registro de capturas

- Login: tests/reports/lighthouse/login.png; login-320.png; login-640.png.
- Registro: tests/reports/lighthouse/registration.png; registration-320.png; registration-640.png.
- Hábitos con cuenta de QA sintética: tests/reports/lighthouse/habitos.png; habitos-320.png; habitos-640.png.

Las pruebas responsive usaron viewport de 320 y 640 CSS px. 640 px sirve como comprobación de reflow, pero no sustituye la prueba de zoom de navegador al 200%. No se simuló una sesión de lector de pantalla.
