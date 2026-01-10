import { neon } from '@neondatabase/serverless'
import { Resource } from "sst";

let client: ReturnType<typeof neon>

export async function getClient() {
  let dbUrl: string | undefined;
  try {
    dbUrl = Resource?.VITE_DATABASE_URL_POOLER?.value;
  } catch (e) {
    // Ignore SST error
  }
  dbUrl = dbUrl || process.env.VITE_DATABASE_URL_POOLER || process.env.DATABASE_URL;

  if (!dbUrl) {
    return undefined
  }
  if (!client) {
    client = await neon(dbUrl)
  }
  return client
}
