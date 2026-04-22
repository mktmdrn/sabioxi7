import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkTable() {
  const { error } = await supabase.from("adventures").select("*").limit(1);
  if (error) {
    console.log("TABLE_NOT_FOUND", error.message);
  } else {
    console.log("TABLE_EXISTS");
  }
}

checkTable();
