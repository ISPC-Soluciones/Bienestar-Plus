# Destinos de código para los cinco integrantes — Evidencia 3, Sprint 4

Cada ruta de destino es exclusiva y comienza en Test/. Las copias de trabajo locales están bajo entregas-sprint4/<integrante>/repo/Test/; esa carpeta está ignorada por Git. No se asignan archivos Markdown ni reportes generados. Revisar cada archivo antes de copiarlo/subirlo y registrar el commit con la cuenta propia.

## Nahir Ñañez — autenticación y reproducibilidad de dependencias

- Test/backend/bienestar/tests/__init__.py
- Test/backend/bienestar/tests/test_authentication_api.py
- Test/tests/api/package-lock.json
- Test/tests/e2e/package-lock.json

Comando sugerido: git add Test/backend/bienestar/tests/__init__.py Test/backend/bienestar/tests/test_authentication_api.py Test/tests/api/package-lock.json Test/tests/e2e/package-lock.json

## Eric Heredia — hábitos, perfil y Lighthouse autenticado

- Test/backend/bienestar/tests/test_habits_api.py
- Test/backend/bienestar/tests/test_profile_api.py
- Test/tests/e2e/accessibility/lighthouse-authenticated.mjs

Comando sugerido: git add Test/backend/bienestar/tests/test_habits_api.py Test/backend/bienestar/tests/test_profile_api.py Test/tests/e2e/accessibility/lighthouse-authenticated.mjs

## Franco Miranda — API y exportación PDF

- Test/backend/bienestar/tests/test_routine_pdf_api.py
- Test/tests/api/bienestar-plus-sprint4.postman_collection.json
- Test/tests/api/local.postman_environment.json
- Test/tests/api/package.json

Comando sugerido: git add Test/backend/bienestar/tests/test_routine_pdf_api.py Test/tests/api/bienestar-plus-sprint4.postman_collection.json Test/tests/api/local.postman_environment.json Test/tests/api/package.json

## Santiago Bustos — configuración y flujos E2E

- Test/backend/bienestar/tests/test_news.py
- Test/backend/bienestar_plus_api/settings_test.py
- Test/backend/requirements-test.txt
- Test/frontend/src/app/pages/login/login.html
- Test/frontend/src/app/pages/habitos/habitos.html
- Test/tests/e2e/pages/login.page.ts
- Test/tests/e2e/pages/habits.page.ts
- Test/tests/e2e/flows/critical-flows.spec.ts
- Test/tests/e2e/playwright.config.ts
- Test/tests/e2e/package.json
- Test/tests/e2e/tsconfig.json

Comando sugerido: git add Test/backend/bienestar/tests/test_news.py Test/backend/bienestar_plus_api/settings_test.py Test/backend/requirements-test.txt Test/frontend/src/app/pages/login/login.html Test/frontend/src/app/pages/habitos/habitos.html Test/tests/e2e/pages/login.page.ts Test/tests/e2e/pages/habits.page.ts Test/tests/e2e/flows/critical-flows.spec.ts Test/tests/e2e/playwright.config.ts Test/tests/e2e/package.json Test/tests/e2e/tsconfig.json

## Cristian Vellio — auditoría axe y correcciones de accesibilidad visual

- Test/tests/e2e/accessibility/accessibility.spec.ts
- Test/tests/e2e/pages/profile.page.ts
- Test/frontend/src/index.html
- Test/frontend/src/app/shared/footer/footer.html
- Test/frontend/src/app/pages/login/login.css
- Test/frontend/src/app/pages/registro/registro.css
- Test/frontend/src/app/pages/habitos/habitos.css

Comando sugerido: git add Test/tests/e2e/accessibility/accessibility.spec.ts Test/tests/e2e/pages/profile.page.ts Test/frontend/src/index.html Test/frontend/src/app/shared/footer/footer.html Test/frontend/src/app/pages/login/login.css Test/frontend/src/app/pages/registro/registro.css Test/frontend/src/app/pages/habitos/habitos.css

Los archivos asignados para subir no deben duplicarse entre integrantes. Las bandejas son paquetes locales de trabajo, no commits; ningún integrante queda acreditado hasta que registre su propio commit en el repositorio.
