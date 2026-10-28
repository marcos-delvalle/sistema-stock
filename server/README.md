# Backend — Gestión de Stock

Servidor Express + PostgreSQL del sistema de stock. En desarrollo, Vite hace de proxy
hacia este servidor; en producción, Express también entrega el React compilado.

## Requisitos

- Node.js 20 o superior (probado con Node 24)
- PostgreSQL 16 o 17

## 1. PostgreSQL

### Opción A: servicio instalado (recomendado para producción)

Descargar el instalador desde <https://www.postgresql.org/download/windows/>
o instalarlo con winget:

```powershell
winget install --id PostgreSQL.PostgreSQL.17 -e
```

Durante la instalación:
- Anotá la contraseña del superusuario `postgres`.
- Dejá el puerto `5432`.
- Podés desmarcar Stack Builder.

### Opción B: PostgreSQL portable (desarrollo en este equipo)

En esta máquina hay un PostgreSQL 17 portable en:

```
%LOCALAPPDATA%\gestion-stock\pgsql
```

No requiere permisos de administrador ni instala un servicio. Las credenciales
están en `%LOCALAPPDATA%\gestion-stock\pgsql\CREDENCIALES.txt`.

```powershell
npm run db:start    # arranca PostgreSQL (si no está corriendo)
npm run db:stop     # lo detiene
npm run db:status   # muestra si está activo
```

`npm run dev:server` ejecuta `db:start` automáticamente.

> Para producción conviene instalar el servicio de la opción A y detener el
> portable (`npm run db:stop`) para que no compitan por el puerto 5432.
> Los datos se migran con `pg_dump` / `psql`.

## 2. Crear el usuario y la base

Abrir **pgAdmin** (viene con el instalador) o `psql` y ejecutar como superusuario:

```sql
CREATE ROLE stock_app LOGIN PASSWORD 'una_clave_segura';
CREATE DATABASE gestion_stock OWNER stock_app;
```

> Se usa un usuario dedicado (`stock_app`) y no el superusuario `postgres`.
> PostgreSQL escucha solo en `localhost`: la base nunca se expone a la red,
> solo la API de Express la consulta.

## 3. Configurar `server/.env`

El archivo ya existe (no se versiona). Ajustar la contraseña de `DATABASE_URL`:

```env
PORT=3000
DATABASE_URL=postgresql://stock_app:una_clave_segura@localhost:5432/gestion_stock
ADMIN_USER=admin
ADMIN_PASSWORD=Admin-bae87e3a
JWT_SECRET=...
```

`server/.env.example` sirve como plantilla para otra máquina.

## 4. Crear las tablas

```powershell
npm run db:migrate
```

Verificar la conexión:

```powershell
npm run db:check
```

## 5. Levantar el proyecto

Con un solo comando (API + PostgreSQL + React):

```powershell
npm run dev:all
```

O en dos terminales:

```powershell
npm run dev:server   # API en http://localhost:3000
npm run dev          # React en http://localhost:5173
```

Probar la salud del servidor:

```powershell
curl.exe http://localhost:3000/api/salud
```

Respuesta esperada:

```json
{
  "ok": true,
  "servicio": "gestion-stock-api",
  "baseDeDatos": "conectada",
  "fecha": "2026-10-27T..."
}
```

Si `ok` es `false`, la API está viva pero no puede conectarse a PostgreSQL:
revisar que el servicio esté corriendo y que `DATABASE_URL` sea correcta.

## 6. API y autenticación

Todas las rutas `/api` requieren sesión, excepto `/api/salud` y `/api/auth/login`.

### Login

```powershell
$cuerpo = @{ usuario = 'admin'; password = 'TU_CLAVE_DE_SERVER_ENV' } | ConvertTo-Json
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-RestMethod -Uri http://localhost:3000/api/auth/login `
  -Method Post -ContentType 'application/json' -Body $cuerpo -WebSession $sesion

Invoke-RestMethod -Uri http://localhost:3000/api/articulos -WebSession $sesion
```

La sesión dura 12 horas y viaja en una cookie `httpOnly` (JavaScript no puede leerla).
`POST /api/auth/logout` borra la cookie y `GET /api/auth/me` devuelve el usuario actual.

### Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/salud` | Estado del servidor y de la base (pública) |
| POST | `/api/auth/login` | Inicia sesión (pública) |
| POST | `/api/auth/logout` | Cierra sesión |
| GET | `/api/auth/me` | Usuario de la sesión |
| GET/POST | `/api/categorias` | Lista / alta |
| PUT/DELETE | `/api/categorias/:id` | Edición / baja |
| GET/POST | `/api/articulos` | Lista / alta (`stock_actual > 0` genera una entrada) |
| PUT | `/api/articulos/:id` | Edita nombre, categoría y stock mínimo (no el stock) |
| PATCH | `/api/articulos/:id/activo` | Activa / desactiva |
| DELETE | `/api/articulos/:id` | Baja lógica y desasigna modelos |
| GET/POST | `/api/modelos` | Lista / alta |
| PUT | `/api/modelos/:id` | Edición completa |
| PUT | `/api/modelos/:id/compatibilidad` | Asigna / quita el tóner |
| DELETE | `/api/modelos/:id` | Baja (bloqueada si tiene unidades) |
| GET/POST | `/api/unidades` | Lista / alta |
| PUT/DELETE | `/api/unidades/:id` | Edición / baja |
| GET/POST | `/api/dependencias` | Lista / alta |
| PUT | `/api/dependencias/:id` | Edición |
| PATCH | `/api/dependencias/:id/activo` | Activa / desactiva |
| DELETE | `/api/dependencias/:id` | Baja lógica (bloqueada con oficinas activas) |
| GET/POST | `/api/oficinas` | Lista / alta |
| PUT | `/api/oficinas/:id` | Edición |
| PATCH | `/api/oficinas/:id/activo` | Activa / desactiva |
| DELETE | `/api/oficinas/:id` | Baja lógica (bloqueada con impresoras) |
| GET | `/api/oficinas/:id/unidades` | Impresoras de la oficina |
| GET | `/api/oficinas/:id/movimientos` | Solo salidas de la oficina |
| GET | `/api/movimientos` | Historial con filtros |
| POST | `/api/movimientos` | Alta con transacción de stock |

Filtros de `GET /api/movimientos`: `articulo_id`, `oficina_id`, `tipo`,
`desde`, `hasta` (formato `YYYY-MM-DD`).
Filtros de artículos: `categoria_id`, `activo`.

### Reglas de negocio

- **Stock atómico**: el movimiento y el cambio de stock van en una transacción.
  Si no hay stock, responde `409` y no modifica nada.
- **Entrada**: no lleva oficina (va al depósito).
- **Salida**: debe indicar una oficina activa.
- **Alta de artículo con stock**: genera automáticamente una entrada en el historial.
- **Bajas**: artículos, dependencias y oficinas usan `activo = false`.
  Los modelos y las unidades se eliminan físicamente.
- **Errores**: `400` datos inválidos, `401` sin sesión, `404` no existe,
  `409` conflicto (stock, duplicados, registros relacionados).

## 7. Estado actual

- [x] PostgreSQL, esquema y migraciones
- [x] API de lectura y escritura
- [x] Login único de administrador con cookie `httpOnly`
- [x] Validaciones y transacciones
- [ ] Conectar el front (hoy sigue usando datos mock)
- [ ] Endpoint de resumen del dashboard y paginación del historial
- [ ] Servicio de Windows, respaldos y puesta en producción

> La base arranca vacía, con las 3 categorías base: Tóner, Periféricos y Cable.

## 8. Uso desde la red local

- El servidor escucha en `0.0.0.0`, así que acepta conexiones de la red.
- La URL para los compañeros será `http://<IP-de-tu-PC>:3000`.
- En el Firewall de Windows hay que permitir el puerto 3000 en redes privadas.
- Conviene reservar una IP fija para esta PC en el router.

En producción:

```powershell
npm run build
npm start            # NODE_ENV=production: Express sirve dist/ + API en el puerto 3000
```

## Estructura

```
server/
├── index.js            Arranque y apagado ordenado
├── app.js              Middlewares, rutas y front compilado
├── lib/
│   ├── env.js          Carga server/.env
│   └── http.js         ErrorHttp + asyncHandler
├── db/
│   ├── pool.js         Pool de conexiones (consultas parametrizadas)
│   ├── esquema.sql     Tablas, CHECKs e índices
│   ├── migrar.js       npm run db:migrate
│   └── estado.js       npm run db:check
├── routes/
│   └── salud.js        GET /api/salud
├── middleware/
│   └── errores.js      404 y manejo centralizado de errores
├── scripts/
│   └── postgres-local.ps1  Arranque/detención del PostgreSQL portable
└── .env                Credenciales locales (ignorado por git)
```

## Conceptos usados

- **Pool**: grupo reutilizable de conexiones a PostgreSQL.
- **Consulta parametrizada**: `$1, $2...` evita inyección SQL.
- **Middleware**: función que procesa la petición antes de la ruta (JSON, cookies, logs, auth).
- **Transacción**: en la próxima fase, el alta de un movimiento y el descuento de stock se
  ejecutan juntos con `BEGIN / COMMIT / ROLLBACK`.
- **Fecha `date` como string**: `pool.js` configura el parser para que `YYYY-MM-DD`
  llegue al front sin corrimientos de zona horaria.

## Próximas fases

1. Rutas de lectura (`GET`) e integración con el front.
2. Escritura de artículos y movimientos con transacción de stock.
3. Dependencias, oficinas, impresoras y compatibilidad.
4. Dashboard agregado e historial paginado.
5. Login único de administrador (cookie httpOnly).
6. Puesta en producción y respaldos.
