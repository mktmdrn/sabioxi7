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

    // Add XP column to users
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
    `);
    console.log("Added xp column to users.");

    // Create challenges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        challenger_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        challenged_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        challenger_score INTEGER,
        challenged_score INTEGER,
        winner_id TEXT,
        created_at BIGINT NOT NULL
      );
    `);
    console.log("Created challenges table.");

    console.log("Migration v4 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
