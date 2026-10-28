# Gestión de Stock — Soporte Técnico

Sistema de stock para una oficina de soporte técnico: tóners, impresoras,
artículos varios, dependencias, oficinas e historial de movimientos.

- **Frontend:** React 19 + Material UI + Vite
- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL 17

## Inicio rápido

```powershell
npm install
npm run dev:all
```

- Front: <http://localhost:5173>
- API: <http://localhost:3000>
- Salud: <http://localhost:3000/api/salud>

`dev:all` arranca PostgreSQL (portable), la API con recarga automática y Vite.
También se pueden usar dos terminales:

```powershell
npm run dev:server
npm run dev
```

El login es único: usuario `admin` y la contraseña definida en `server/.env`
(archivo local, no versionado). La API queda protegida con una cookie `httpOnly`.

## Estado

- [x] Interfaz completa con datos mock
- [x] Servidor Express + PostgreSQL
- [x] Esquema, migraciones y base vacía (3 categorías base)
- [x] API CRUD con validaciones y transacciones de stock
- [x] Login de administrador
- [ ] Conectar el front a la API (próxima fase)
- [ ] Puesta en producción y respaldos

> Mientras el front siga usando los datos mock, los cambios hechos en la
> interfaz no se guardan en PostgreSQL. La integración es la próxima etapa.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev:all` | API + PostgreSQL + Vite en un solo comando |
| `npm run dev` | Solo el frontend (Vite) |
| `npm run dev:server` | PostgreSQL + API con `--watch` |
| `npm run start` | Producción: Express sirve `dist/` + API |
| `npm run build` | Compila el frontend |
| `npm run lint` | Oxlint |
| `npm run db:start` / `db:stop` / `db:status` | PostgreSQL portable |
| `npm run db:migrate` | Aplica el esquema SQL |
| `npm run db:check` | Verifica la conexión |

## Estructura

```
gestion-stock/
├── src/                 React: páginas, componentes, datos mock
├── server/              Express + PostgreSQL
│   ├── routes/          Endpoints de la API
│   ├── middleware/      Autenticación y errores
│   ├── db/              Pool, esquema y migraciones
│   ├── lib/             Utilidades (env, validación, transacciones)
│   └── README.md        Detalle del backend y de la API
├── public/
└── package.json
```

## Base de datos

En este equipo hay un PostgreSQL portable en
`%LOCALAPPDATA%\gestion-stock\pgsql` (no requiere administrador).
Credenciales: `%LOCALAPPDATA%\gestion-stock\pgsql\CREDENCIALES.txt`.

```powershell
npm run db:start
npm run db:status
npm run db:stop
```

`npm run dev:server` ejecuta `db:start` automáticamente.

Para producción conviene instalar PostgreSQL como servicio de Windows,
detener el portable y migrar los datos con `pg_dump` / `psql`.
Los detalles están en [`server/README.md`](server/README.md).

## Seguridad

- `.env` y `server/.env` están en `.gitignore`: nunca subir credenciales.
- Las consultas usan parámetros (`$1, $2...`), no concatenación de strings.
- Los movimientos y el stock se actualizan en una misma transacción.
- La API exige sesión; la salud y el login son las únicas rutas públicas.
