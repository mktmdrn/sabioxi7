const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Alter users table
    await client.query(`
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS password_hash TEXT,
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    `);
    console.log("Updated users table.");

    // Create test_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        created_at BIGINT NOT NULL
      );
    `);
    console.log("Created test_logs table.");

    // Insert super admin if not exists
    const adminEmail = "admin@admin.com";
    const { rows } = await client.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);
    
    if (rows.length === 0) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      const adminId = Date.now().toString();
      await client.query(`
        INSERT INTO users (id, email, password_hash, name, role, status, points)
        VALUES ($1, $2, $3, $4, $5, $6, 0)
      `, [adminId, adminEmail, passwordHash, "Super Admin", "admin", "active"]);
      console.log("Created Super Admin account.");
    } else {
      console.log("Super Admin already exists.");
    }

    console.log("Migration v2 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
