
import { Client } from 'pg';
import "dotenv/config";

const dbUrl = process.env.VITE_DATABASE_URL_POOLER;

if (!dbUrl) {
    console.error("No VITE_DATABASE_URL_POOLER found in environment");
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
    ssl: true // Neon usually requires SSL
});

async function main() {
    await client.connect();
    console.log("Connected to database");

    const userId = "dev-user-id";

    // Check if user exists
    const checkRes = await client.query('SELECT id FROM "user" WHERE id = $1', [userId]);
    if (checkRes.rows.length > 0) {
        console.log(`User ${userId} already exists.`);
    } else {
        console.log(`Inserting user ${userId}...`);

        // Insert user
        await client.query(`
            INSERT INTO "user" (
                id, name, display_name, email, email_verified, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            )
        `, [
            userId,
            "Developer",
            "dev_user",
            "dev@local.com",
            true,
            new Date(),
            new Date()
        ]);
        console.log("User inserted successfully");
    }

    await client.end();
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
