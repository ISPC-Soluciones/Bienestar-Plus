# Plan Nutricional — US18 / TK105–108

Cada usuario puede crear, consultar y editar un único plan personal desde **Hábitos → Alimentación**. Su perfil muestra un resumen con acceso a la gestión. El plan contiene nombre, objetivo, notas opcionales y entre 1 y 20 comidas. Cada comida tiene tipo, descripción y horario opcional; el orden del formulario se conserva.

Se reutiliza `Usuario` y su sesión existente, tanto para login con contraseña como para Google. El cliente no selecciona el propietario mediante URL, query string ni cuerpo. El plan organiza comidas ingresadas por el usuario; no calcula calorías ni genera recomendaciones.

## Persistencia

`PlanNutricional.usuario` es una relación única. `ComidaPlan` depende del plan y mantiene su posición. Eliminar un usuario elimina su plan y sus comidas. Reemplazar comidas se realiza en una transacción; una falla revierte también los cambios del plan.

La migración `0020_plan_nutricional` depende de `0019_merge_20260916_2100`. Aplicar en el entorno de destino antes de usar la funcionalidad:

```sh
cd backend
python manage.py migrate
```

## API

Ruta: `/api/plan-nutricional/`. Todas las operaciones requieren una sesión válida del modelo `Usuario`.

| Método | Resultado |
| --- | --- |
| GET | 200 con `{ "plan": objeto o null, "csrf_token": "..." }`. |
| POST | 201 con `{ "plan": objeto }`; 409 si el usuario ya tiene un plan. |
| PATCH | 200 con `{ "plan": objeto }`; 404 si todavía no existe. Los campos omitidos se conservan. |

POST y PATCH requieren la cookie de sesión y `X-CSRFToken`, obtenido mediante un GET previo. Angular usa `withCredentials` y obtiene un token actualizado antes de cada escritura. Las respuestas son privadas y no se almacenan en caché. Sin sesión se devuelve 401; una validación CSRF fallida devuelve 403. No hay rutas para consultar planes por ID ni acceso administrativo a planes ajenos.

Ejemplo de cuerpo para crear un plan:

```json
{
  "nombre": "Mi organización semanal",
  "objetivo": "Organizar mis comidas",
  "notas": "",
  "comidas": [
    { "tipo": "desayuno", "descripcion": "Mi desayuno", "horario": "08:30" },
    { "tipo": "cena", "descripcion": "Mi cena", "horario": null }
  ]
}
```

Nombre (100 caracteres), objetivo (300) y descripción de cada comida (500) son obligatorios y no admiten texto vacío. Notas admite hasta 2000 caracteres. Los tipos válidos son `desayuno`, `almuerzo`, `merienda`, `cena` y `colacion`. La respuesta normaliza los horarios a `HH:MM:SS`. El arreglo `comidas`, si se envía en PATCH, reemplaza completamente la colección y requiere comidas completas. Los campos desconocidos y de solo lectura se rechazan con 400, al igual que tipos, tamaños y horarios inválidos.

## Verificación automatizada

Con el entorno Python del proyecto activado:

```sh
cd backend
python manage.py test bienestar.test_nutrition_models bienestar.test_nutrition_api
python manage.py check
python manage.py makemigrations --check --dry-run
```

Desde `frontend`, con Chrome instalado (definir `CHROME_BIN` si no se detecta):

```sh
npm run test:nutrition
npm run build
```

La suite nutricional usa un tsconfig específico porque varios specs históricos de otras funcionalidades importan clases o métodos que ya no existen y bloquean la compilación del `npm test` general. Esta configuración conserva la comprobación estricta de tipos y ejecuta los specs del servicio y formulario sin modificar las suites ajenas.

Las pruebas de backend cubren persistencia, restricción única, CRUD, campos inválidos, aislamiento entre usuarios, sesión, CSRF y rollback. Las pruebas de Angular cubren credenciales y CSRF, estados de carga/error/sin plan, creación, edición, cancelación, validaciones y bloqueo de envíos duplicados.

## Verificación del flujo y despliegue

1. Iniciar sesión y abrir Alimentación sin plan: debe ofrecer creación.
2. Crear un plan con comidas y horarios; recargar y comprobar persistencia.
3. Editar nombre y comidas; cancelar debe conservar los datos guardados. Guardar y recargar debe mostrar los cambios.
4. Revisar el resumen en el perfil propio y su enlace a Alimentación.
5. Probar campos vacíos, límite de comidas y fallas HTTP: el formulario conserva los cambios ante un error de escritura.
6. Usar dos usuarios: cada uno consulta y modifica exclusivamente su propio plan.
7. Cerrar sesión: la API debe devolver 401.
8. Revisar el formulario a 320, 390, 768 y 1280 píxeles, incluyendo navegación por teclado y etiquetas de campos.

En producción, aplicar la migración y verificar cookies de sesión/CSRF, HTTPS y orígenes CORS/CSRF permitidos. Los navegadores pueden restringir cookies entre dominios; validar el flujo real en los dominios desplegados. No se agregan dependencias de producción.

## Resultado local — 2026-10-12

Se validaron en Chrome el login real, estado sin plan, creación y edición con recarga, y revocación de acceso tras logout, usando un backend con SQLite aislado y datos ficticios. El formulario no presentó desbordes en los cuatro anchos indicados y se revisó su captura móvil. La suite específica Angular pasó 15 pruebas. El build de producción pasó, con advertencias por el tamaño del bundle inicial y dos avisos de plantillas existentes.

La suite completa de backend pasó 29 pruebas; Django check y la comprobación de migraciones no reportaron problemas. La migración 0020 se aplicó a la SQLite local del proyecto después de verificar que su ubicación estaba dentro de backend.

El despliegue remoto y sus migraciones quedan pendientes: estas verificaciones locales no prueban el comportamiento de cookies en los dominios productivos.
