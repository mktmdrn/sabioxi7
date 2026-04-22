const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function fixTypes() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Update existing lessons where type is null
    const res = await client.query(`
      UPDATE lessons SET type = 'lesson' WHERE type IS NULL;
    `);
    console.log(`Updated ${res.rowCount} lessons to 'lesson' type.`);

    console.log("Fix completed successfully.");
  } catch (err) {
    console.error("Fix failed:", err);
  } finally {
    await client.end();
  }
}

fixTypes();
