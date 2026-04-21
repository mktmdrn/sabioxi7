"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, status, points")
    .order("status", { ascending: false }); // pending first

  if (error) return [];
  return data;
}

export async function activateUser(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({ status: "active" })
    .eq("id", userId);

  if (error) throw new Error("Could not activate user");
  revalidatePath("/dashboard/admin");
}

export async function deactivateUser(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({ status: "pending" })
    .eq("id", userId);

  if (error) throw new Error("Could not deactivate user");
  revalidatePath("/dashboard/admin");
}

export async function getTestLogs() {
  // Join test_logs with users and lessons to get names and titles
  const { data, error } = await supabase
    .from("test_logs")
    .select(`
      id,
      score,
      passed,
      created_at,
      users ( name ),
      lessons ( title )
    `)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map((log: any) => ({
    id: log.id,
    userName: log.users?.name || "Desconocido",
    lessonTitle: log.lessons?.title || "Lección borrada",
    score: log.score,
    passed: log.passed,
    createdAt: log.created_at,
  }));
}
