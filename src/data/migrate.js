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

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0
      );
    `);
    console.log("Created users table.");

    // Create Lessons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        created_at BIGINT NOT NULL
      );
    `);
    console.log("Created lessons table.");

    // Create Questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        wrong_answers JSONB NOT NULL
      );
    `);
    console.log("Created questions table.");

    // Create an index for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
    `);
    console.log("Created indexes.");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
