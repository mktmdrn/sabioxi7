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

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{"color":"blue","hat":"none","accessory":"none"}'::jsonb;
    `);
    console.log("Added avatar_config column to users table.");

    console.log("Migration v3 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
