"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { addXpToUser } from "./db";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createChallenge(challengerId: string, challengedId: string) {
  const id = Date.now().toString() + Math.floor(Math.random() * 1000);

  const { error } = await supabase
    .from("challenges")
    .insert({
      id,
      challenger_id: challengerId,
      challenged_id: challengedId,
      status: "pending",
      created_at: Date.now(),
    });

  if (error) throw new Error("Could not create challenge: " + error.message);
  revalidatePath("/arena");
  return id;
}

export async function acceptChallenge(challengeId: string) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "accepted" })
    .eq("id", challengeId);

  if (error) throw new Error("Could not accept challenge");
  revalidatePath("/arena");
}

export async function declineChallenge(challengeId: string) {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "declined" })
    .eq("id", challengeId);

  if (error) throw new Error("Could not decline challenge");
  revalidatePath("/arena");
}

export async function submitScore(challengeId: string, userId: string, score: number) {
  // Get the challenge to know who's who
  const { data: challenge, error: fetchErr } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (fetchErr || !challenge) throw new Error("Challenge not found");

  const isChallenger = challenge.challenger_id === userId;
  const updateField = isChallenger ? "challenger_score" : "challenged_score";

  const { error } = await supabase
    .from("challenges")
    .update({ [updateField]: score })
    .eq("id", challengeId);

  if (error) throw new Error("Could not save score");

  // Check if both scores are now in — determine winner
  const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;

  if (otherScore !== null) {
    // Both have played
    let winnerId: string | null = null;
    if (score > otherScore) {
      winnerId = userId;
    } else if (otherScore > score) {
      winnerId = isChallenger ? challenge.challenged_id : challenge.challenger_id;
    }
    // If equal, winnerId stays null (draw)

    await supabase
      .from("challenges")
      .update({ status: "completed", winner_id: winnerId })
      .eq("id", challengeId);

    // Award XP
    if (winnerId) {
      const loserId = winnerId === challenge.challenger_id ? challenge.challenged_id : challenge.challenger_id;
      await addXpToUser(winnerId, 20);
      await addXpToUser(loserId, 5);
    } else {
      // Draw — both get 10
      await addXpToUser(challenge.challenger_id, 10);
      await addXpToUser(challenge.challenged_id, 10);
    }
  }

  revalidatePath("/arena");
  revalidatePath(`/arena/${challengeId}`);
}

export async function getChallengesForUser(userId: string) {
  const { data, error } = await supabase
    .from("challenges")
    .select(`
      id, status, challenger_score, challenged_score, winner_id, created_at,
      challenger:challenger_id ( id, name, xp, avatar_config ),
      challenged:challenged_id ( id, name, xp, avatar_config )
    `)
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data;
}

export async function getChallengeById(challengeId: string) {
  const { data, error } = await supabase
    .from("challenges")
    .select(`
      id, status, challenger_score, challenged_score, winner_id, created_at,
      challenger:challenger_id ( id, name, xp, avatar_config ),
      challenged:challenged_id ( id, name, xp, avatar_config )
    `)
    .eq("id", challengeId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function buyBooster(userId: string): Promise<boolean> {
  // Check if user has enough stars (3 required)
  const { data: user, error: fetchErr } = await supabase
    .from("users")
    .select("points")
    .eq("id", userId)
    .single();

  if (fetchErr || !user || (user.points || 0) < 3) return false;

  const { error } = await supabase
    .from("users")
    .update({ points: (user.points || 0) - 3 })
    .eq("id", userId);

  if (error) return false;
  revalidatePath("/arena");
  return true;
}

export async function finishRace(challengeId: string, winnerId: string, loserId: string) {
  await supabase
    .from("challenges")
    .update({ status: "completed", winner_id: winnerId })
    .eq("id", challengeId);

  await addXpToUser(winnerId, 20);
  await addXpToUser(loserId, 5);
  revalidatePath("/arena");
}
