# Gestión de Stock — Soporte Técnico

Sistema de stock pensado para una oficina de soporte técnico: tóners, impresoras,
artículos varios, dependencias (edificios), oficinas e historial de movimientos.

- **Frontend:** React 19 + Material UI + Vite
- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL 16/17
- **Autenticación:** un único usuario administrador con cookie `httpOnly`

> **Estado actual:** el backend está completo y probado, pero la interfaz React
> **todavía usa datos de demostración (mock)**. La pantalla de login y la
> conexión del front con la API son la próxima fase. Hasta terminarla, no cargues
> stock real desde la interfaz: esos cambios no se guardan en PostgreSQL.

---

## Índice

1. [Qué hace el sistema](#1-qué-hace-el-sistema)
2. [Arquitectura](#2-arquitectura)
3. [Requisitos](#3-requisitos)
4. [Instalación en una PC nueva](#4-instalación-en-una-pc-nueva)
5. [Configurar la base de datos](#5-configurar-la-base-de-datos)
6. [Configurar `server/.env`](#6-configurar-serverenv)
7. [Ejecutar en desarrollo](#7-ejecutar-en-desarrollo)
8. [Ejecutar en producción](#8-ejecutar-en-producción)
9. [Acceso desde la red local](#9-acceso-desde-la-red-local)
10. [Uso del sistema](#10-uso-del-sistema)
11. [Reglas de negocio](#11-reglas-de-negocio)
12. [Modelo de datos](#12-modelo-de-datos)
13. [API](#13-api)
14. [Operación y mantenimiento](#14-operación-y-mantenimiento)
15. [Seguridad](#15-seguridad)
16. [Problemas comunes](#16-problemas-comunes)
17. [Estado y próximas fases](#17-estado-y-próximas-fases)
18. [Flujo de trabajo con Git](#18-flujo-de-trabajo-con-git)
19. [Archivos importantes](#19-archivos-importantes)

---

## 1. Qué hace el sistema

| Módulo | Para qué sirve |
|---|---|
| **Dashboard** | KPIs de stock, artículos bajo mínimo, actividad de los últimos 6 meses, alertas, últimos movimientos y distribución por dependencia. |
| **Tóners** | Stock de tóners, compatibilidad con modelos de impresora, edición y baja. |
| **Impresoras** | Modelos de impresora y unidades físicas asignadas a oficinas, con IP y estado. |
| **Artículos** | Artículos del depósito (periféricos, cables, etc.), stock, stock mínimo y estado activo/inactivo. |
| **Dependencias** | Edificios o dependencias, con sus oficinas. Al expandir una oficina se ven sus impresoras y el historial de salidas. |
| **Historial** | Entradas y salidas de stock, con fecha, artículo, cantidad y oficina de destino. |
| **Nuevo movimiento** | Botón `+` para registrar una entrada al depósito o una salida a una oficina. |

La idea central es que **el stock no se edita a mano**: cambia únicamente al
registrar una entrada o una salida. Así el historial y el stock siempre coinciden.

---

## 2. Arquitectura

```
Navegador
   │
   │  HTTP (LAN)
   ▼
React + Material UI
   │  /api/...  (en desarrollo, proxy de Vite)
   ▼
Express 5  ──────────►  PostgreSQL
   │                     (solo localhost)
   └── en producción también sirve dist/ (React compilado)
```

- **Desarrollo:** Vite corre en el puerto `5173` y hace proxy de `/api` hacia
  `http://localhost:3000`. El navegador ve un solo origen y no hace falta CORS.
- **Producción:** `npm run build` genera `dist/`; Express sirve el front compilado
  y la API en el puerto `3000`. Los compañeros entran a `http://IP-DEL-SERVIDOR:3000`.
- **Base de datos:** PostgreSQL escucha solo en `localhost`; nunca se expone a la red.
  La única puerta de entrada es la API.

Puertos por defecto:

| Servicio | Puerto |
|---|---|
| React en desarrollo (Vite) | 5173 |
| API Express | 3000 |
| PostgreSQL | 5432 |

---

## 3. Requisitos

Para la PC que va a correr el sistema:

- Windows 10/11 (la automatización de PostgreSQL portable es PowerShell).
- **Node.js 22 LTS o superior** (probado con Node 24). Vite 8 no funciona con
  versiones muy viejas de Node.
- **PostgreSQL 16 o 17**.
- Git.
- npm (viene con Node).

Para las PCs de los compañeros: solo un navegador actualizado. No necesitan
Node, PostgreSQL ni el código.

---

## 4. Instalación en una PC nueva

### 4.1 Traer el código

En la PC de desarrollo, primero hay que subir los commits pendientes:

```powershell
git status
git push origin main
```

En la PC que va a correr el sistema:

```powershell
git clone https://github.com/marcos-delvalle/sistema-stock.git
cd sistema-stock
```

O, si ya existe el repositorio:

```powershell
git pull origin main
```

> `git pull` trae **solo el código**. No trae `node_modules`, ni `server/.env`,
> ni la base de datos, ni la carpeta `dist/`. Esos cuatro puntos se preparan
> en cada PC.

### 4.2 Instalar dependencias

```powershell
npm ci
```

Si `npm ci` falla porque el `package-lock.json` no coincide:

```powershell
npm install
```

### 4.3 Instalar PostgreSQL

Hay dos caminos.

#### Opción A — PostgreSQL como servicio de Windows (recomendado para producción)

1. Descargar el instalador desde <https://www.postgresql.org/download/windows/>
   o instalar con winget:

   ```powershell
   winget install --id PostgreSQL.PostgreSQL.17 -e
   ```

2. Durante la instalación:
   - Anotar la contraseña del superusuario `postgres`.
   - Dejar el puerto `5432`.
   - Desmarcar Stack Builder si no se va a usar.

3. Verificar el servicio:

   ```powershell
   Get-Service *postgres*
   ```

   El servicio suele llamarse `postgresql-x64-17` (puede variar).

#### Opción B — PostgreSQL portable (desarrollo)

En la PC de desarrollo actual existe una instalación portable en:

```
%LOCALAPPDATA%\gestion-stock\pgsql
```

No requiere permisos de administrador. **No está incluida en el repositorio**:
si se quiere replicar en otra PC hay que copiar esa carpeta o usar la opción A.

```powershell
npm run db:start
npm run db:status
npm run db:stop
```

> `npm run dev:server` y `npm run dev:all` ejecutan `db:start` automáticamente.
> Si no hay PostgreSQL portable pero hay un servicio escuchando en el puerto
> 5432, el script usa el servicio y no intenta arrancar otra instancia.

Para producción conviene el servicio de Windows y **no** usar el portable, para
evitar que dos instancias compitan por el puerto 5432.

---

## 5. Configurar la base de datos

Abrir `psql` como superusuario (o usar pgAdmin):

```powershell
psql -U postgres -h localhost -p 5432
```

Ejecutar:

```sql
CREATE ROLE stock_app LOGIN PASSWORD 'TU_CLAVE_DE_BASE';
CREATE DATABASE gestion_stock OWNER stock_app;
\q
```

- Se usa un usuario dedicado (`stock_app`), no el superusuario `postgres`.
- La contraseña debe ser larga y no debe ir al repositorio.
- Si la base ya existe, no ejecutar el `CREATE DATABASE` de nuevo.

Probar la conexión:

```powershell
psql "postgresql://stock_app:TU_CLAVE_DE_BASE@localhost:5432/gestion_stock" -c "SELECT 1;"
```

### Crear las tablas

Con `server/.env` ya configurado (ver la sección siguiente):

```powershell
npm run db:migrate
npm run db:check
```

`db:migrate` aplica `server/db/esquema.sql` y crea las 7 tablas, índices y
restricciones. Es idempotente para las tablas (`IF NOT EXISTS`). La base queda
vacía, salvo las 3 categorías base: **Tóner**, **Periféricos** y **Cable**.

---

## 6. Configurar `server/.env`

El archivo `server/.env` **no se versiona**. Crearlo a partir de la plantilla:

```powershell
Copy-Item server/.env.example server/.env
```

Completar:

```env
PORT=3000
DATABASE_URL=postgresql://stock_app:TU_CLAVE_DE_BASE@localhost:5432/gestion_stock
ADMIN_USER=admin
ADMIN_PASSWORD=ELEGI_UNA_CLAVE_LARGA_Y_UNICA
JWT_SECRET=GENERA_UN_SECRETO_ALEATORIO
```

Generar el secreto de sesión:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Notas:

- Si la contraseña de la base tiene `@`, `:`, `/`, `#` u otros caracteres
  especiales, hay que codificarla en la URL (por ejemplo `@` → `%40`).
- `ADMIN_USER` y `ADMIN_PASSWORD` son las credenciales del **único** login.
  Todos los compañeros usan la misma cuenta.
- La sesión dura 12 horas y viaja en una cookie `httpOnly`.
- No copiar `server/.env` a GitHub ni a chats. Cada PC tiene el suyo.
- Si cambiás `PORT`, actualizá también el proxy de `vite.config.js` (por defecto
  apunta a `http://localhost:3000`).

---

## 7. Ejecutar en desarrollo

Con un solo comando:

```powershell
npm run dev:all
```

Eso arranca:

- PostgreSQL portable (si está instalado y no hay otro en 5432).
- La API Express en <http://localhost:3000>.
- Vite en <http://localhost:5173>.

También se puede separar en dos terminales:

```powershell
npm run dev:server   # PostgreSQL + API con recarga automática
npm run dev          # Solo React
```

Comprobar la API:

```powershell
curl.exe http://localhost:3000/api/salud
```

Respuesta esperada:

```json
{
  "ok": true,
  "servicio": "gestion-stock-api",
  "baseDeDatos": "conectada",
  "fecha": "2026-10-28T..."
}
```

Si `ok` es `false`, la API está viva pero no puede conectarse a PostgreSQL:
revisar que la base esté corriendo y que `DATABASE_URL` sea correcta.

> Recordatorio: en desarrollo, la interfaz todavía muestra datos mock. Para
> probar el backend hay que usar la API (ver [API](#13-api)).

---

## 8. Ejecutar en producción

En la PC servidor:

```powershell
npm run build
npm start
```

- `npm run build` genera `dist/`.
- `npm start` usa `NODE_ENV=production`: Express sirve `dist/` y la API en el
  puerto `3000`.
- Abrir <http://localhost:3000>.
- Los compañeros usan `http://IP-DEL-SERVIDOR:3000`.

`npm start` **no** arranca PostgreSQL y **no** compila el front. Antes hay que:

1. Tener PostgreSQL corriendo (servicio de Windows o portable).
2. Haber ejecutado `npm run db:migrate` al menos una vez.
3. Haber ejecutado `npm run build` después de cada cambio del front.

Si `dist/` no existe, el servidor avisa y la API funciona, pero el front no se
sirve. En ese caso ejecutar `npm run build`.

---

## 9. Acceso desde la red local

### 9.1 Obtener la IP del servidor

```powershell
ipconfig
```

Buscar la IPv4 de la conexión por la que se conectan los compañeros, por ejemplo
`192.168.0.50`.

### 9.2 Abrir el puerto en el Firewall de Windows

En una PowerShell **como administrador**:

```powershell
New-NetFirewallRule `
  -DisplayName "Gestion Stock 3000" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 3000 `
  -Action Allow `
  -Profile Private
```

- La red debe estar marcada como **Privada** en Windows. Si está como Pública,
  el firewall puede bloquear la regla.
- No abrir el puerto 5432 (PostgreSQL) a la red. Solo la API debe ser accesible.
- Si se usa Vite en modo desarrollo desde otra PC, también hay que abrir el
  puerto 5173 y ejecutar Vite con `--host`. Para uso real es preferible
  `npm run build` + `npm start`.

### 9.3 IP fija o reservada

Conviene que el servidor tenga siempre la misma IP:

- Reservar la IP por MAC en el router (DHCP reservation), o
- Configurar una IP estática en Windows.

Si la IP cambia, los compañeros tienen que usar la nueva URL.

### 9.4 Probar desde otra PC

```powershell
curl.exe http://192.168.0.50:3000/api/salud
```

Luego abrir en el navegador:

```
http://192.168.0.50:3000
```

---

## 10. Uso del sistema

> La interfaz actual es una demo funcional con datos mock. Los flujos de abajo
> describen cómo está pensada la aplicación y cómo funcionará cuando el front
> esté conectado a la API. El backend ya implementa todas las reglas.

### 10.1 Ingreso

El login es único:

- Usuario: `admin`
- Contraseña: la definida en `ADMIN_PASSWORD` dentro de `server/.env`.

Hoy el login existe en la API (`POST /api/auth/login`), pero **la pantalla de
login de React todavía no está implementada**. Es parte de la próxima fase.

### 10.2 Dashboard

Muestra:

- Total de artículos y unidades de stock.
- Artículos por debajo del stock mínimo.
- Movimientos de los últimos 6 meses.
- Alertas de stock bajo.
- Últimos movimientos.
- Distribución de stock por dependencia.

### 10.3 Tóners

- Lista de tóners con stock actual y mínimo.
- Compatibilidad: cada modelo de impresora puede tener asignado un tóner.
- Edición y baja lógica.
- Al dar de baja un tóner, los modelos que lo usaban quedan sin tóner asignado
  (no se rompe el historial).

### 10.4 Impresoras

Dos niveles:

1. **Modelo:** marca + modelo (por ejemplo HP M605). Es el que se asocia a un tóner.
2. **Unidad física:** una impresora concreta, con nombre, IP, estado y oficina.

Una unidad siempre pertenece a un modelo y a una oficina.

### 10.5 Artículos

- Categorías: Tóner, Periféricos, Cable (se pueden crear más por API).
- Stock actual, stock mínimo y estado activo/inactivo.
- Búsqueda y ordenamiento.
- Alta, edición y baja lógica.
- El stock **no** se edita en el formulario de edición: se cambia con movimientos.

### 10.6 Dependencias y oficinas

- Una dependencia es un edificio o área (por ejemplo, Palacio).
- Cada dependencia tiene oficinas.
- Al expandir una oficina se ven:
  - Sus impresoras asignadas.
  - Su historial de salidas (entregas).
- El buscador filtra por dependencia u oficina.
- “Agregar oficina” está dentro del diálogo de edición de la dependencia.
- No se puede dar de baja una dependencia con oficinas activas.
- No se puede dar de baja una oficina con impresoras asignadas.

### 10.7 Historial

- Entradas y salidas ordenadas por fecha.
- Muestra artículo, tipo, cantidad, fecha y oficina de destino.
- Las entradas no tienen oficina (van al depósito).
- Las salidas sí tienen oficina.

### 10.8 Nuevo movimiento

El botón `+` del menú lateral abre el diálogo para registrar:

- **Entrada:** suma stock al depósito; no lleva oficina.
- **Salida:** descuenta stock y exige una oficina activa.

El backend valida el stock y actualiza todo en una transacción. Si no alcanza,
devuelve `409` y no modifica nada.

---

## 11. Reglas de negocio

1. **El stock cambia solo con movimientos.**
   Editar un artículo no permite cambiar `stock_actual`; solo nombre, categoría,
   stock mínimo y estado.

2. **Entrada = depósito.**
   `tipo = 'entrada'` no lleva `oficina_id`.

3. **Salida = oficina.**
   `tipo = 'salida'` exige `oficina_id` y que la oficina esté activa.

4. **No se puede sacar más de lo que hay.**
   La API responde `409` con el stock disponible. La operación es atómica:
   no queda stock descontado sin movimiento.

5. **Alta con stock inicial.**
   Si se crea un artículo con `stock_actual > 0`, el backend genera
   automáticamente una entrada en el historial. Así el stock tiene respaldo.

6. **Compatibilidad tóner-modelo.**
   `modelos.articulo_id` apunta al tóner compatible. Un modelo tiene un solo
   tóner. Al dar de baja el tóner, los modelos quedan con `articulo_id = NULL`.

7. **Bajas lógicas.**
   Artículos, dependencias y oficinas usan `activo = false`.
   Los modelos y las unidades físicas se eliminan de verdad (con restricciones).

8. **Restricciones de baja.**
   - Dependencia con oficinas activas: bloqueada.
   - Oficina con impresoras asignadas: bloqueada.
   - Modelo con unidades: bloqueado.
   - Categoría con artículos: bloqueada.
   - Artículo con movimientos: no se borra físicamente; se da de baja lógica.

9. **Fechas.**
   La columna `fecha` es `DATE` y se devuelve como texto `YYYY-MM-DD` para evitar
   corrimientos de zona horaria. Si no se envía, se usa la fecha actual.

10. **Sin usuarios por trabajador.**
    Todos usan la misma cuenta `admin`; los movimientos no registran quién los
    hizo. Si en el futuro se necesita auditoría por persona, hay que agregar una
    tabla de usuarios y `usuario_id` en `movimientos`.

---

## 12. Modelo de datos

7 tablas:

```
categorias 1 ──── N articulos
dependencias 1 ── N oficinas
modelos N ─────── 1 articulos        (compatibilidad tóner)
unidades N ────── 1 modelos
unidades N ────── 1 oficinas
movimientos N ─── 1 articulos
movimientos N ─── 0..1 oficinas      (entrada = NULL, salida = oficina)
```

| Tabla | Campos principales | Notas |
|---|---|---|
| `categorias` | `id`, `nombre` | Única por nombre. Base: Tóner, Periféricos, Cable. |
| `articulos` | `id`, `nombre`, `categoria_id`, `stock_actual`, `stock_minimo`, `activo` | `stock_actual >= 0`; baja lógica. |
| `dependencias` | `id`, `nombre`, `activo` | Edificios/áreas; baja lógica. |
| `oficinas` | `id`, `nombre`, `dependencia_id`, `activo` | Única por dependencia + nombre. |
| `modelos` | `id`, `marca`, `modelo`, `articulo_id` | Único por marca + modelo; `articulo_id` es el tóner. |
| `unidades` | `id`, `modelo_id`, `nombre`, `oficina_id`, `ip`, `estado` | `estado`: `activa` o `inactiva`. |
| `movimientos` | `id`, `articulo_id`, `tipo`, `cantidad`, `oficina_id`, `fecha` | `tipo`: `entrada` o `salida`; `cantidad > 0`. |

Restricción importante en `movimientos`:

```sql
CHECK (
  (tipo = 'entrada' AND oficina_id IS NULL)
  OR
  (tipo = 'salida' AND oficina_id IS NOT NULL)
)
```

---

## 13. API

Base: `http://localhost:3000/api` (o `http://IP:3000/api` en la red).

### 13.1 Autenticación

Todas las rutas `/api` requieren sesión, excepto:

- `GET /api/salud`
- `POST /api/auth/login`

La sesión se guarda en una cookie `sesion` con `httpOnly`, `SameSite=Lax` y una
duración de 12 horas. El navegador la envía automáticamente si el front se sirve
desde el mismo origen (o a través del proxy de Vite).

Login con PowerShell:

```powershell
$cuerpo = @{ usuario = 'admin'; password = 'TU_CLAVE_DE_SERVER_ENV' } | ConvertTo-Json
$sesion = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-RestMethod -Uri http://localhost:3000/api/auth/login `
  -Method Post -ContentType 'application/json' -Body $cuerpo -WebSession $sesion

Invoke-RestMethod -Uri http://localhost:3000/api/categorias -WebSession $sesion
```

### 13.2 Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/salud` | Estado de la API y de la base (pública) |
| POST | `/api/auth/login` | Inicia sesión (pública) |
| POST | `/api/auth/logout` | Cierra sesión |
| GET | `/api/auth/me` | Usuario de la sesión |
| GET/POST | `/api/categorias` | Lista / alta |
| PUT/DELETE | `/api/categorias/:id` | Edición / baja |
| GET/POST | `/api/articulos` | Lista / alta (`stock_actual > 0` genera entrada) |
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

Filtros:

- `GET /api/articulos?categoria_id=1&activo=true`
- `GET /api/movimientos?articulo_id=1&oficina_id=2&tipo=salida&desde=2026-01-01&hasta=2026-12-31`
- `GET /api/dependencias?activo=true`
- `GET /api/oficinas?dependencia_id=1&activo=true`
- `GET /api/unidades?oficina_id=1&modelo_id=2`

### 13.3 Ejemplos

Crear un artículo con stock inicial (genera una entrada):

```powershell
$articulo = @{
  nombre = 'Toner HP 26A'
  categoria_id = 1
  stock_actual = 10
  stock_minimo = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/articulos `
  -Method Post -ContentType 'application/json' -Body $articulo -WebSession $sesion
```

Registrar una salida:

```powershell
$salida = @{
  articulo_id = 1
  tipo = 'salida'
  cantidad = 2
  oficina_id = 1
  fecha = '2026-10-28'
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/movimientos `
  -Method Post -ContentType 'application/json' -Body $salida -WebSession $sesion
```

### 13.4 Códigos de error

| Código | Significado |
|---|---|
| `400` | Datos inválidos, falta un campo, oficina inactiva, etc. |
| `401` | No hay sesión o la cookie expiró. |
| `404` | El recurso no existe. |
| `409` | Conflicto: stock insuficiente, duplicado, registro relacionado. |
| `500` | Error interno (revisar la consola del servidor). |

---

## 14. Operación y mantenimiento

### 14.1 PostgreSQL portable

```powershell
npm run db:start
npm run db:status
npm run db:stop
```

- `db:start` no hace nada si ya hay un PostgreSQL en 5432.
- `db:stop` solo detiene el portable; no detiene un servicio de Windows.
- `db:status` informa si el portable está corriendo o si hay otro PostgreSQL
  escuchando en 5432.

### 14.2 PostgreSQL como servicio

```powershell
Get-Service *postgres*
Start-Service postgresql-x64-17
Stop-Service postgresql-x64-17
```

El nombre exacto del servicio puede variar. Usar el que muestre `Get-Service`.

### 14.3 Logs

La API escribe en la consola:

```
[server] API escuchando en http://localhost:3000
[db] Conexión establecida con PostgreSQL
[GET] /api/articulos -> 200 (12 ms)
```

Si se ejecuta con `npm start` en una ventana de PowerShell, esos mensajes quedan
ahí. Para producción se puede redirigir la salida a un archivo, o usar un
administrador de servicios (por ejemplo, NSSM o una tarea programada).

### 14.4 Respaldos

Con PostgreSQL corriendo, desde una terminal:

```powershell
pg_dump -h localhost -U stock_app -d gestion_stock -Fc -f gestion_stock.dump
```

Restaurar (detener la app antes):

```powershell
pg_restore -h localhost -U stock_app -d gestion_stock --clean --if-exists gestion_stock.dump
```

- `-Fc` genera un formato comprimido y portable.
- Guardar los respaldos fuera del repositorio y con acceso restringido.
- Probar la restauración en una base de prueba antes de confiar en el respaldo.
- Si se usa el PostgreSQL portable, `pg_dump.exe` está en
  `%LOCALAPPDATA%\gestion-stock\pgsql\pgsql\bin`.

### 14.5 Actualizar el sistema

En la PC servidor:

```powershell
git pull origin main
npm ci
npm run db:migrate
npm run build
npm start
```

> `db:migrate` es seguro para las tablas actuales porque usa `IF NOT EXISTS`.
> Si en el futuro se agregan columnas a tablas existentes, habrá que crear
> migraciones incrementales; no alcanza con `CREATE TABLE IF NOT EXISTS`.

---

## 15. Seguridad

- **Cambiar la contraseña de administrador** antes de usar el sistema en la red.
  La clave debe ser larga y única.
- **Cambiar `JWT_SECRET`** en cada instalación. Si se filtra, se pueden firmar
  cookies falsas.
- **No subir `server/.env`** ni `CREDENCIALES.txt` al repositorio.
- **PostgreSQL solo en localhost.** No abrir el puerto 5432 al firewall.
- **Firewall:** permitir el puerto 3000 solo en la red privada.
- **HTTP en LAN:** la cookie tiene `httpOnly` y `SameSite=Lax`, pero el tráfico
  no va cifrado. Para mayor seguridad, se puede poner un proxy con HTTPS
  (IIS, Caddy, Nginx) y cambiar la cookie a `secure: true`.
- **Sin rate limiting:** el login no tiene límite de intentos. Si el sistema se
  expone fuera de la red local, agregar un límite o un proxy con protección.
- **Un solo usuario:** no hay auditoría por trabajador. Si se necesita, agregar
  usuarios y registrar `usuario_id` en los movimientos.
- **Consultas parametrizadas:** el backend usa `$1, $2...`; no concatena datos
  del usuario en el SQL.
- **Helmet:** agrega headers de seguridad. HSTS y `upgrade-insecure-requests`
  están desactivados a propósito porque la app se usa por HTTP en la LAN.
- **Si una contraseña se publicó por error:** cambiarla de inmediato. Rotarla es
  más importante que borrar el archivo, porque el historial de Git conserva
  versiones anteriores.

---

## 16. Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `No se encontró PostgreSQL portable...` | No está instalado el portable y no hay nada en 5432 | Instalar el servicio de PostgreSQL o crear el portable; verificar `npm run db:status`. |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL no está corriendo | `npm run db:start` o iniciar el servicio. |
| `password authentication failed` | `DATABASE_URL` incorrecta | Revisar usuario, contraseña y nombre de la base en `server/.env`. |
| `database "gestion_stock" does not exist` | Falta crear la base | Ejecutar el `CREATE DATABASE`. |
| `relation "..." does not exist` | Falta migrar | `npm run db:migrate`. |
| `401 No autenticado` | No se hizo login o la cookie expiró | `POST /api/auth/login`; en el front, incluir credenciales. |
| `409 Stock insuficiente` | La salida supera el stock | Reponer stock con una entrada o ajustar la cantidad. |
| El puerto 3000 está ocupado | Otro proceso lo usa | `netstat -ano | findstr :3000`; cambiar `PORT` y el proxy de Vite. |
| En producción se ve la API pero no el front | Falta `dist/` | `npm run build` y reiniciar `npm start`. |
| Desde otra PC no abre | Firewall, IP o red pública | Abrir el puerto 3000 en red privada; probar `/api/salud`. |
| `npm run dev:all` falla al arrancar la base | Servicio en otro puerto o sin PostgreSQL | Usar `npm run server` + `npm run dev`, o ajustar la conexión. |
| La consola muestra caracteres raros | Codificación de PowerShell | No afecta el funcionamiento; se puede ajustar la fuente/encoding. |
| El stock del dashboard no coincide | El front sigue usando datos mock | Es la limitación actual; se resuelve al integrar la API. |

---

## 17. Estado y próximas fases

### Completado

- [x] Interfaz React con todos los módulos (datos mock).
- [x] Servidor Express + PostgreSQL.
- [x] Esquema de 7 tablas, índices y restricciones.
- [x] API CRUD completa.
- [x] Validaciones y transacciones de stock con `FOR UPDATE`.
- [x] Login único de administrador con cookie `httpOnly`.
- [x] Servido del front compilado en producción.
- [x] Scripts de PostgreSQL portable y documentación.

### Próxima fase: conectar el front

1. Crear `src/api/client.js` con `fetch`, manejo de errores y credenciales.
2. Pantalla de login y verificación de sesión con `GET /api/auth/me`.
3. Reemplazar `src/data/mockData.js` por datos de la API al iniciar.
4. Migrar cada diálogo (artículos, movimientos, impresoras, dependencias,
   oficinas, tóners) a las llamadas `POST/PUT/PATCH/DELETE`.
5. Agregar Snackbar global para errores y confirmaciones.
6. Estados de carga y vacío.
7. Probar el flujo completo: alta de artículo → entrada → salida → historial.

### Después

- Endpoint de resumen del dashboard (opcional; hoy se puede calcular en el front).
- Paginación y filtros avanzados del historial.
- Pruebas automatizadas de API.
- PostgreSQL como servicio de Windows, respaldos programados.
- HTTPS opcional y rate limiting si se expone fuera de la LAN.

---

## 18. Flujo de trabajo con Git

Antes de empezar:

```powershell
git status
git pull origin main
```

Después de un cambio:

```powershell
git status
git add .
git commit -m "docs: manual completo de instalación, uso y funcionamiento"
git push origin main
```

Sugerencias de mensajes:

| Cambio | Mensaje |
|---|---|
| Documentación | `docs: manual completo de instalación, uso y funcionamiento` |
| Integración del front | `feat: conectar frontend con api y login de administrador` |
| Cliente API y sesión | `feat: cliente api y sesión de administrador` |
| CRUD de artículos | `feat: artículos contra la api con validaciones` |
| Movimientos | `feat: entradas y salidas con actualización de stock` |
| Despliegue | `chore: configuración de producción y respaldos` |

> No commitear `server/.env`, `node_modules`, `dist` ni archivos de respaldo.
> El `.gitignore` ya los excluye.

---

## 19. Archivos importantes

| Archivo | Qué contiene |
|---|---|
| `src/App.jsx` | Rutas, layout y estado global (hoy con mock). |
| `src/pages/` | Dashboard, Tóners, Impresoras, Artículos, Dependencias, Historial. |
| `src/components/` | Diálogos de alta/edición y detalle de oficina. |
| `src/data/mockData.js` | Datos de demostración (se reemplazan en la integración). |
| `server/index.js` | Arranque en `0.0.0.0` y apagado ordenado. |
| `server/app.js` | Middlewares, rutas y servido de `dist/`. |
| `server/db/esquema.sql` | Tablas, CHECKs, FKs, índices y categorías base. |
| `server/db/pool.js` | Pool de PostgreSQL y parser de fechas. |
| `server/routes/` | Endpoints de la API. |
| `server/middleware/auth.js` | Verificación de la cookie JWT. |
| `server/lib/transaccion.js` | `BEGIN / COMMIT / ROLLBACK`. |
| `server/scripts/postgres-local.ps1` | Arranque/detención del PostgreSQL portable. |
| `server/.env.example` | Plantilla de configuración (sin credenciales reales). |
| `server/README.md` | Detalle técnico del backend y de la API. |
| `vite.config.js` | Proxy `/api` → `http://localhost:3000`. |

---

## Resumen para arrancar en otra PC

1. `git push origin main` en la PC de desarrollo.
2. En la PC servidor: instalar Node 22+, PostgreSQL 17 y Git.
3. `git clone` / `git pull`.
4. `npm ci`.
5. Crear el rol `stock_app` y la base `gestion_stock`.
6. `Copy-Item server/.env.example server/.env` y completar credenciales.
7. `npm run db:migrate` y `npm run db:check`.
8. `npm run build` y `npm start`.
9. Abrir el puerto 3000 en el firewall (red privada) y reservar la IP.
10. Probar `http://IP:3000/api/salud` desde otra PC.

Y recordar: **hasta que se integre el front, la interfaz sigue mostrando datos
mock**. El backend ya está listo para recibir los datos reales.
