
import 'dotenv/config';
console.log("Starting debug script...");
try {
    console.log("Importing auth...");
    const { auth } = await import("./src/lib/auth");
    console.log("Auth imported successfully.");

    console.log("Importing posts...");
    const posts = await import("./src/server/fn/posts");
    console.log("Posts imported successfully.");
} catch (error) {
    console.error("FATAL ERROR during import:");
    console.error(error);
}
