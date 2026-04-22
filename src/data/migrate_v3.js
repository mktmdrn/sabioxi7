const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Add type and duration to lessons
    await client.query(`
      ALTER TABLE lessons 
        ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'lesson',
        ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
    `);
    console.log("Updated lessons table with type and duration.");

    console.log("Migration v3 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
