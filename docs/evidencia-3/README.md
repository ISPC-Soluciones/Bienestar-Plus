# Evidencia 3 — Sprint 4: Gestión Ágil del Testing

Paquete de trabajo para las actividades indicadas desde “Sprint 4 - Gestión Ágil del testing”, página 4, hasta la página 8 del PDF de la cátedra (16 de octubre de 2026). Los archivos DOCX y XLSX compartidos del Sprint anterior se consultaron únicamente como contexto; no se actualizaron ni se copiaron como entregables.

## Entregables de Sprint 4

- `Testing.md`: borrador de la Wiki de testing, estrategia, ejecución y estado de las suites.
- `TRAZABILIDAD_SPRINT4.md`: matriz de requisitos, casos, archivos de prueba y evidencia pendiente.
- `CHECKLIST_PROFESORA_SPRINT4.md`: revisión requisito por requisito con estado real y pendientes.
- `APORTES_INTEGRANTES.md`: archivos concretos y comandos de stage/commit propuestos para cada integrante.
- `github/`: borradores de milestone, Issues y organización del tablero Kanban; requieren carga en GitHub.
- `REPORTE_BUGS_SPRINT4.md` y `checklist-accesibilidad.md`: candidatos de revisión y checklist manual; los hallazgos estáticos siguen pendientes de confirmar en navegador.
- `../../backend/bienestar/tests/`: pruebas Django REST Framework con `APITestCase`.
- `../../tests/api/`: colección Postman v2.1, entorno local sin credenciales y configuración Newman.
- `../../tests/e2e/`: Playwright, Page Objects, flujos de negocio y evaluación axe-core.

La rama `develop` contiene rutinas y exportación PDF. El alcance automatizado se basa en esas funciones disponibles. Los resultados se mantienen como pendientes hasta ejecutar las suites contra un entorno QA aislado; no se inventaron reportes ni resultados.

## Estructura solicitada

```text
backend/bienestar/tests/                 # AUT-BE, APITestCase y reverse()
tests/api/                               # AUT-API, Postman 2.1 y entorno parametrizado
tests/e2e/pages/                         # Page Objects
tests/e2e/flows/                         # AUT-E2E, autenticación y flujos críticos
tests/e2e/accessibility/                 # axe-core y ACC-01..05
docs/evidencia-3/                        # Wiki, trazabilidad, bugs y gestión del Sprint 4
```

## Aportes para cinco integrantes

Cada integrante tiene asignados archivos de código o pruebas para revisar y subir. El detalle de archivos, su contenido y comandos de commit está en [APORTES_INTEGRANTES.md](APORTES_INTEGRANTES.md). Cada persona debe usar su propia cuenta; no se crearon commits por el equipo.

En este checkout hay un `.gitignore` local no versionado que ignora `*.md`. Se conservaron sus reglas y se agregó `/entregas-sprint4/` para ignorar los paquetes locales. Para subir los Markdown de evidencia desde este árbol, un integrante debe agregarlos explícitamente con `git add -f docs/evidencia-3/*.md docs/evidencia-3/github/*.md`.
