import { neon } from '@neondatabase/serverless'
import { Resource } from "sst";

let client: ReturnType<typeof neon>

export async function getClient() {
  if (!Resource.VITE_DATABASE_URL_POOLER.value) {
    return undefined
  }
  if (!client) {
    client = await neon(Resource.VITE_DATABASE_URL_POOLER.value)
  }
  return client
}
