import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

export const createConnection = (connectionString: string) =>
  drizzle({ client: neon(connectionString) })
