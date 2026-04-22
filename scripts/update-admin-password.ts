import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function updateAdminPassword() {
  const newPassword = "Hola123123";
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  const adminEmails = ["admin@example.com", "admin@admin.com"];

  console.log(`Updating admin passwords to: ${newPassword}`);

  for (const email of adminEmails) {
    const { data, error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("email", email)
      .select();

    if (error) {
      console.error(`Error updating ${email}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Password updated for ${email}`);
    } else {
      console.log(`ℹ️ User ${email} not found, skipping.`);
    }
  }

  console.log("Done!");
}

updateAdminPassword();
