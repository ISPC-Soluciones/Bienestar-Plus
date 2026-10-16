# Destinos de código para los cinco integrantes — Evidencia 3, Sprint 4

Cada ruta de destino es exclusiva y sigue la estructura del repositorio indicada por la profesora. Las copias de trabajo locales están bajo entregas-sprint4/<integrante>/repo/; esa carpeta está ignorada por Git. No se asignan archivos Markdown ni reportes generados. Revisar cada archivo antes de copiarlo/subirlo y registrar el commit con la cuenta propia.

## Nahir Ñañez — autenticación y reproducibilidad de dependencias

- backend/bienestar/tests/__init__.py
- backend/bienestar/tests/test_authentication_api.py
- tests/api/package-lock.json
- e2e/package-lock.json

Comando sugerido: git add backend/bienestar/tests/__init__.py backend/bienestar/tests/test_authentication_api.py tests/api/package-lock.json e2e/package-lock.json

## Eric Heredia — hábitos, perfil y Lighthouse autenticado

- backend/bienestar/tests/test_habits_api.py
- backend/bienestar/tests/test_profile_api.py
- e2e/accessibility/lighthouse-authenticated.mjs

Comando sugerido: git add backend/bienestar/tests/test_habits_api.py backend/bienestar/tests/test_profile_api.py e2e/accessibility/lighthouse-authenticated.mjs

## Franco Miranda — API y exportación PDF

- backend/bienestar/tests/test_routine_pdf_api.py
- tests/api/bienestar-plus-sprint4.postman_collection.json
- tests/api/local.postman_environment.json
- tests/api/package.json

Comando sugerido: git add backend/bienestar/tests/test_routine_pdf_api.py tests/api/bienestar-plus-sprint4.postman_collection.json tests/api/local.postman_environment.json tests/api/package.json

## Santiago Bustos — configuración y flujos E2E

- backend/bienestar/tests/test_news.py
- backend/bienestar_plus_api/settings_test.py
- backend/requirements-test.txt
- frontend/src/app/pages/login/login.html
- frontend/src/app/pages/habitos/habitos.html
- e2e/pages/login.page.ts
- e2e/pages/habits.page.ts
- e2e/flows/critical-flows.spec.ts
- e2e/playwright.config.ts
- e2e/package.json
- e2e/tsconfig.json

Comando sugerido: git add backend/bienestar/tests/test_news.py backend/bienestar_plus_api/settings_test.py backend/requirements-test.txt frontend/src/app/pages/login/login.html frontend/src/app/pages/habitos/habitos.html e2e/pages/login.page.ts e2e/pages/habits.page.ts e2e/flows/critical-flows.spec.ts e2e/playwright.config.ts e2e/package.json e2e/tsconfig.json

## Cristian Vellio — auditoría axe y correcciones de accesibilidad visual

- e2e/accessibility/accessibility.spec.ts
- e2e/pages/profile.page.ts
- frontend/src/index.html
- frontend/src/app/shared/footer/footer.html
- frontend/src/app/pages/login/login.css
- frontend/src/app/pages/registro/registro.css
- frontend/src/app/pages/habitos/habitos.css

Comando sugerido: git add e2e/accessibility/accessibility.spec.ts e2e/pages/profile.page.ts frontend/src/index.html frontend/src/app/shared/footer/footer.html frontend/src/app/pages/login/login.css frontend/src/app/pages/registro/registro.css frontend/src/app/pages/habitos/habitos.css

Los archivos asignados para subir no deben duplicarse entre integrantes. Las bandejas son paquetes locales de trabajo, no commits; ningún integrante queda acreditado hasta que registre su propio commit en el repositorio.
