import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// El archivo .env vive en server/.env, no en la raíz del proyecto.
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true })

export const env = {
  nodoEnv: process.env.NODE_ENV || 'development',
  puerto: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || '',
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
}
