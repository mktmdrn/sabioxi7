"use server";

import { createClient } from "@supabase/supabase-js";

// Usamos el Service Role Key para poder escribir/leer como admin desde Server Actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Question = {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
};

export type Lesson = {
  id: string;
  title: string;
  createdAt: number;
  questions: Question[];
};

export async function addLesson(title: string, questions: Question[]): Promise<string> {
  const lessonId = Date.now().toString();
  const createdAt = Date.now();

  const { error: lessonError } = await supabase
    .from("lessons")
    .insert({ id: lessonId, title, created_at: createdAt });

  if (lessonError) throw new Error("Failed to create lesson: " + lessonError.message);

  const questionInserts = questions.map((q) => ({
    lesson_id: lessonId,
    question: q.question,
    correct_answer: q.correctAnswer,
    wrong_answers: q.wrongAnswers,
  }));

  const { error: qError } = await supabase
    .from("questions")
    .insert(questionInserts);

  if (qError) throw new Error("Failed to insert questions: " + qError.message);

  return lessonId;
}

export async function recordTestLog(userId: string, lessonId: string, score: number, passed: boolean) {
  const { error } = await supabase
    .from("test_logs")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      score,
      passed,
      created_at: Date.now()
    });

  if (error) console.error("Could not record test log:", error);
}

export async function getLessons(): Promise<Lesson[]> {
  const { data: lessonsData, error: lError } = await supabase
    .from("lessons")
    .select("id, title, created_at")
    .order("created_at", { ascending: true });

  if (lError || !lessonsData) return [];

  const { data: questionsData, error: qError } = await supabase
    .from("questions")
    .select("lesson_id, question, correct_answer, wrong_answers");

  if (qError || !questionsData) return [];

  const lessons: Lesson[] = lessonsData.map((l) => {
    const qList = questionsData.filter((q) => q.lesson_id === l.id).map(q => ({
      question: q.question,
      correctAnswer: q.correct_answer,
      wrongAnswers: q.wrong_answers
    }));

    return {
      id: l.id,
      title: l.title,
      createdAt: l.created_at,
      questions: qList,
    };
  });

  return lessons;
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const { data: lData, error: lError } = await supabase
    .from("lessons")
    .select("id, title, created_at")
    .eq("id", id)
    .single();

  if (lError || !lData) return null;

  const { data: qData, error: qError } = await supabase
    .from("questions")
    .select("question, correct_answer, wrong_answers")
    .eq("lesson_id", id);

  if (qError || !qData) return null;

  return {
    id: lData.id,
    title: lData.title,
    createdAt: lData.created_at,
    questions: qData.map((q) => ({
      question: q.question,
      correctAnswer: q.correct_answer,
      wrongAnswers: q.wrong_answers,
    })),
  };
}

export async function getUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("points")
    .eq("id", userId)
    .single();

  if (error || !data) return 0;
  return data.points;
}

export async function addPointToUser(userId: string): Promise<void> {
  const currentPoints = await getUserPoints(userId);
  const newPoints = currentPoints + 1;

  const { error } = await supabase
    .from("users")
    .upsert({ id: userId, points: newPoints }, { onConflict: "id" });
    
  if (error) console.error("Error updating points:", error);
}

export type AvatarConfig = {
  color: string;
  hat: string;
  accessory: string;
};

const DEFAULT_AVATAR: AvatarConfig = { color: "blue", hat: "none", accessory: "none" };

export async function getAvatarConfig(userId: string): Promise<AvatarConfig> {
  const { data, error } = await supabase
    .from("users")
    .select("avatar_config")
    .eq("id", userId)
    .single();

  if (error || !data || !data.avatar_config) return DEFAULT_AVATAR;
  return data.avatar_config as AvatarConfig;
}

export async function saveAvatarConfig(userId: string, config: AvatarConfig): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ avatar_config: config })
    .eq("id", userId);

  if (error) console.error("Error saving avatar config:", error);
}

// ===== XP & LEVEL SYSTEM =====

export async function getUserXp(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("xp")
    .eq("id", userId)
    .single();

  if (error || !data) return 0;
  return data.xp || 0;
}

export async function addXpToUser(userId: string, amount: number): Promise<void> {
  const currentXp = await getUserXp(userId);
  const newXp = currentXp + amount;

  const { error } = await supabase
    .from("users")
    .update({ xp: newXp })
    .eq("id", userId);

  if (error) console.error("Error updating XP:", error);
}

export async function getAllActivePlayers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, xp, avatar_config, points")
    .eq("status", "active")
    .order("xp", { ascending: false });

  if (error || !data) return [];
  return data;
}
