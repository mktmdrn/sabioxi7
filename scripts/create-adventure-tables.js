const { Client } = require("pg");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config({ path: ".env.local" });

async function createTables() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Postgres.");

    const sql = `
      -- 1. Tabla de Aventuras
      CREATE TABLE IF NOT EXISTS adventures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- 2. Tabla de Hitos (Milestones)
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- 3. Tabla de Nodos de Hito (Lecciones/Exámenes dentro de un hito)
      CREATE TABLE IF NOT EXISTS milestone_nodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
        node_id TEXT NOT NULL, -- ID de la lección/examen
        type TEXT NOT NULL, -- 'lesson' o 'exam'
        "order" INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Desactivar RLS para facilitar desarrollo inicial
      ALTER TABLE adventures DISABLE ROW LEVEL SECURITY;
      ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
      ALTER TABLE milestone_nodes DISABLE ROW LEVEL SECURITY;
    `;

    await client.query(sql);
    console.log("✅ Tables created successfully!");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await client.end();
  }
}

createTables();
