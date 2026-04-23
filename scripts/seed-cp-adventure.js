const { createClient } = require("@supabase/supabase-js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createControlPresupuestarioAdventure() {
  console.log("Searching for 'control presupuestario' lessons...");
  
  const { data: lessons, error: lError } = await supabase
    .from("lessons")
    .select("id, title, type")
    .ilike("title", "%control presupuestario%");

  if (lError) {
    console.error("Error fetching lessons:", lError);
    return;
  }

  if (!lessons || lessons.length === 0) {
    console.log("No lessons found for 'control presupuestario'.");
    return;
  }

  console.log(`Found ${lessons.length} lessons.`);

  // Create adventure
  const { data: adventure, error: advError } = await supabase
    .from("adventures")
    .insert({
      name: "Ruta de Control Presupuestario",
      description: "Domina el control de costes y presupuestos con esta aventura intensiva.",
      is_published: true
    })
    .select()
    .single();

  if (advError) {
    console.error("Error creating adventure:", advError);
    return;
  }

  console.log("Created adventure:", adventure.id);

  // Group lessons into milestones (e.g., 2 lessons per milestone)
  const milestoneSize = 2;
  for (let i = 0; i < lessons.length; i += milestoneSize) {
    const chunk = lessons.slice(i, i + milestoneSize);
    const order = Math.floor(i / milestoneSize);
    
    const { data: milestone, error: mError } = await supabase
      .from("milestones")
      .insert({
        adventure_id: adventure.id,
        name: `Hito ${order + 1}`,
        order: order
      })
      .select()
      .single();

    if (mError) {
      console.error("Error creating milestone:", mError);
      continue;
    }

    console.log(`Created milestone: ${milestone.name}`);

    const nodeInserts = chunk.map((l, idx) => ({
      milestone_id: milestone.id,
      node_id: l.id,
      type: l.type || "lesson",
      order: idx
    }));

    const { error: nError } = await supabase.from("milestone_nodes").insert(nodeInserts);
    if (nError) {
      console.error("Error creating nodes:", nError);
    }
  }

  console.log("✅ Adventure created successfully!");
}

createControlPresupuestarioAdventure();
