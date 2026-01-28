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
    // dbUrl = "postgresql://neondb_owner:npg_BPwieQq9GIJ0@ep-noisy-haze-ahn9uwsd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

    if (!dbUrl) {
        return undefined
    }
    if (!client) {
        client = await neon(dbUrl)
    }
    return client
}
