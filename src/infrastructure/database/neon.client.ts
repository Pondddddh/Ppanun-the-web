import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export function getSqlClient() {
  if (!sqlClient) {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('NEON_DATABASE_URL environment variable is not set');
    }
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}
