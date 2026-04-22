import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  console.log("Testing connection to adventures table...");
  const { data, error } = await supabase
    .from("adventures")
    .insert({
      name: "TEST ADVENTURE",
      description: "Testing if insertion works",
      is_published: false
    })
    .select()
    .single();

  if (error) {
    console.error("❌ INSERT FAILED:", error);
  } else {
    console.log("✅ INSERT SUCCESSFUL:", data);
    
    console.log("Cleaning up test data...");
    await supabase.from("adventures").delete().eq("id", data.id);
    console.log("✅ Cleanup done.");
  }
}

test();
