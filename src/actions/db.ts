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
  type: string;
  durationMinutes: number;
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

export async function updateLesson(lessonId: string, title: string, questions: Question[]): Promise<void> {
  // Update title
  const { error: lessonError } = await supabase
    .from("lessons")
    .update({ title })
    .eq("id", lessonId);

  if (lessonError) throw new Error("Failed to update lesson: " + lessonError.message);

  // Delete old questions
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .eq("lesson_id", lessonId);

  if (deleteError) throw new Error("Failed to delete old questions: " + deleteError.message);

  // Insert new questions
  const questionInserts = questions.map((q) => ({
    lesson_id: lessonId,
    question: q.question,
    correct_answer: q.correctAnswer,
    wrong_answers: q.wrongAnswers,
  }));

  const { error: qError } = await supabase
    .from("questions")
    .insert(questionInserts);

  if (qError) throw new Error("Failed to insert new questions: " + qError.message);
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

export async function getLessons(type: string = "lesson"): Promise<Lesson[]> {
  const { data: lessonsData, error: lError } = await supabase
    .from("lessons")
    .select("id, title, created_at, type, duration_minutes")
    .eq("type", type)
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
      type: l.type,
      durationMinutes: l.duration_minutes || 0
    };
  });

  return lessons;
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const { data: lData, error: lError } = await supabase
    .from("lessons")
    .select("id, title, created_at, type, duration_minutes")
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
    type: lData.type,
    durationMinutes: lData.duration_minutes || 0,
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
  mouth: string;
  eyes: string;
  hair: string;
};

const DEFAULT_AVATAR: AvatarConfig = { 
  color: "blue", 
  hat: "none", 
  accessory: "none",
  mouth: "neutral",
  eyes: "neutral",
  hair: "standard"
};

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
    .select("id, name, email, xp, avatar_config, points")
    .eq("status", "active")
    .order("xp", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getCompletedLessons(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("test_logs")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("passed", true);
  
  if (error || !data) return [];
  return Array.from(new Set(data.map(l => l.lesson_id)));
}

export async function addStarsToUserByEmail(email: string, amount: number): Promise<{ success: boolean; message: string }> {
  // First find user by email
  const { data: user, error: findError } = await supabase
    .from("users")
    .select("id, points")
    .eq("email", email)
    .single();

  if (findError || !user) {
    return { success: false, message: "Usuario no encontrado" };
  }

  const newPoints = (user.points || 0) + amount;

  const { error: updateError } = await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, message: "Error al actualizar estrellas" };
  }

  return { success: true, message: `Se han añadido ${amount} estrellas a ${email}` };
}

export async function getTopFailedLessons(userId: string, limit: number = 3) {
  const { data, error } = await supabase
    .from("test_logs")
    .select("lesson_id, lessons(title)")
    .eq("user_id", userId)
    .eq("passed", false);

  if (error || !data) return [];

  // Group and count in JS
  const counts: Record<string, { id: string, title: string, count: number }> = {};
  data.forEach((log: any) => {
    const lid = log.lesson_id;
    const title = log.lessons?.title || "Lección desconocida";
    if (!counts[lid]) {
      counts[lid] = { id: lid, title, count: 0 };
    }
    counts[lid].count++;
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
export async function deleteLessonsByCourse(courseName: string): Promise<{ success: boolean; count: number }> {
  const pattern = `[${courseName}]%`;
  
  const { data: lessons, error: findError } = await supabase
    .from("lessons")
    .select("id")
    .like("title", pattern);

  if (findError) throw findError;
  if (!lessons || lessons.length === 0) return { success: true, count: 0 };

  const ids = lessons.map(l => l.id);

  // Delete test logs first
  const { error: logError } = await supabase
    .from("test_logs")
    .delete()
    .in("lesson_id", ids);

  if (logError) throw logError;

  // Delete questions
  const { error: qError } = await supabase
    .from("questions")
    .delete()
    .in("lesson_id", ids);

  if (qError) throw qError;

  // Delete lessons
  const { error: lError } = await supabase
    .from("lessons")
    .delete()
    .in("id", ids);

  if (lError) throw lError;

  return { success: true, count: ids.length };
}

export async function syncLessonWithQuestions(title: string, newQuestions: Question[]): Promise<string> {
  const { data: existingLesson, error: findError } = await supabase
    .from("lessons")
    .select("id")
    .eq("title", title)
    .maybeSingle();

  if (existingLesson) {
    const lessonId = existingLesson.id;
    
    // Check for existing questions to avoid duplicates (exact question text)
    const { data: existingQs } = await supabase
      .from("questions")
      .select("question")
      .eq("lesson_id", lessonId);
    
    const existingTexts = new Set(existingQs?.map(q => q.question) || []);
    const filteredNew = newQuestions.filter(q => !existingTexts.has(q.question));

    if (filteredNew.length === 0) return lessonId;

    const questionInserts = filteredNew.map((q) => ({
      lesson_id: lessonId,
      question: q.question,
      correct_answer: q.correctAnswer,
      wrong_answers: q.wrongAnswers,
    }));

    const { error: qError } = await supabase
      .from("questions")
      .insert(questionInserts);

    if (qError) throw new Error("Failed to append questions: " + qError.message);
    return lessonId;
  } else {
    return addLesson(title, newQuestions);
  }
}

export async function deleteLesson(id: string): Promise<void> {
  // Delete test logs first (FK constraint)
  const { error: logError } = await supabase
    .from("test_logs")
    .delete()
    .eq("lesson_id", id);

  if (logError) throw new Error("Failed to delete test logs: " + logError.message);

  // Delete questions
  const { error: qError } = await supabase
    .from("questions")
    .delete()
    .eq("lesson_id", id);

  if (qError) throw new Error("Failed to delete questions: " + qError.message);

  // Delete lesson
  const { error: lError } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id);

  if (lError) throw new Error("Failed to delete lesson: " + lError.message);
}

export type CourseStat = {
  id: string;
  course: string;
  subject: string;
  lessonTitle: string;
  attempts: number;
  passed: number;
  failed: number;
};

export async function getCourseStats(): Promise<CourseStat[]> {
  const { data: lessons, error: lError } = await supabase
    .from("lessons")
    .select("id, title");

  if (lError || !lessons) return [];

  const { data: logs, error: logError } = await supabase
    .from("test_logs")
    .select("lesson_id, passed");

  if (logError || !logs) return [];

  const statsMap: Record<string, CourseStat> = {};

  lessons.forEach(lesson => {
    // Extract [COURSE] [SUBJECT] from title
    // Format: "[COURSE] [SUBJECT] Title"
    const match = lesson.title.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)$/);
    const course = match ? match[1] : "General";
    const subject = match ? match[2] : "Varios";
    const lessonTitle = match ? match[3] : lesson.title;

    statsMap[lesson.id] = {
      id: lesson.id,
      course,
      subject,
      lessonTitle,
      attempts: 0,
      passed: 0,
      failed: 0
    };
  });

  logs.forEach(log => {
    if (statsMap[log.lesson_id]) {
      statsMap[log.lesson_id].attempts++;
      if (log.passed) {
        statsMap[log.lesson_id].passed++;
      } else {
        statsMap[log.lesson_id].failed++;
      }
    }
  });

  return Object.values(statsMap);
}

export async function deleteLessons(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  // Delete test logs first
  const { error: logError } = await supabase
    .from("test_logs")
    .delete()
    .in("lesson_id", ids);

  if (logError) throw new Error("Failed to delete test logs: " + logError.message);

  // Delete questions
  const { error: qError } = await supabase
    .from("questions")
    .delete()
    .in("lesson_id", ids);

  if (qError) throw new Error("Failed to delete questions: " + qError.message);

  // Delete lessons
  const { error: lError } = await supabase
    .from("lessons")
    .delete()
    .in("id", ids);

  if (lError) throw new Error("Failed to delete lessons: " + lError.message);
}
