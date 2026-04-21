"use server";

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  // Comprobar si existe
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    return { error: "El email ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = Date.now().toString() + Math.floor(Math.random() * 1000);

  const { error } = await supabase
    .from("users")
    .insert({
      id,
      email,
      name,
      password_hash: passwordHash,
      role: "user",
      status: "pending",
      points: 0
    });

  if (error) {
    return { error: "Error al crear la cuenta. Inténtalo de nuevo." };
  }

  return { success: true };
}
