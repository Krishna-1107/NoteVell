import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from './generated/client'

// 1. Setup the connection string
const connectionString = process.env.DATABASE_URL!

// 2. Define a global variable to hold the client during "Hot Reload"
// This prevents Next.js from creating 100+ connections when you save files.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 3. The "Loader" Function
// This checks: "Do we already have a client? If no, make one."
const createPrismaClient = () => {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ adapter })
}

// 4. Export the single instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 5. Save it to global in development mode
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma