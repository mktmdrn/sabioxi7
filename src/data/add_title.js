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

    // Add title column to lessons
    await client.query(`
      ALTER TABLE lessons ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Lección sin título';
    `);
    console.log("Added title column to lessons table.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
