import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const subjects = [
  "Sistemas Informáticos",
  "Bases de Datos",
  "Programación",
  "Entornos de Desarrollo",
  "Desarrollo Web en Entorno Cliente",
  "Desarrollo Web en Entorno Servidor",
  "Despliegue de Aplicaciones Web",
  "Diseño de Interfaces Web"
];

async function seedDawLessons() {
  console.log("Seeding DAW Campaign Lessons (10 per subject)...");

  for (const subject of subjects) {
    for (let i = 1; i <= 10; i++) {
      const title = `[DAW] [${subject}] Lección ${i}`;
      
      const lessonId = `daw-${subject.toLowerCase().replace(/ /g, "-")}-${i}`;
      
      await supabase.from("lessons").insert({
        id: lessonId,
        title: title,
        type: "lesson",
        created_at: Date.now()
      });

      const questions = [];
      for (let q = 1; q <= 5; q++) {
        questions.push({
          lesson_id: lessonId,
          question: `Pregunta ${q} de ${subject} (Lección ${i}) - DAW`,
          correct_answer: "Respuesta Correcta",
          wrong_answers: ["Error 1", "Error 2", "Error 3"]
        });
      }
      await supabase.from("questions").insert(questions);
    }

    // Add Exam for the subject
    const examId = `daw-exam-${subject.toLowerCase().replace(/ /g, "-")}`;
    await supabase.from("lessons").insert({
      id: examId,
      title: `[DAW] Examen Final: ${subject}`,
      type: "exam",
      duration_minutes: 60,
      created_at: Date.now()
    });

    const examQuestions = [];
    for (let q = 1; q <= 50; q++) {
      examQuestions.push({
        lesson_id: examId,
        question: `Pregunta de Examen ${q} de ${subject} - DAW`,
        correct_answer: "Respuesta Correcta",
        wrong_answers: ["Opción A", "Opción B", "Opción C"]
      });
    }
    await supabase.from("questions").insert(examQuestions);

    console.log(`✅ Seeded 10 lessons + Exam for ${subject}`);
  }
  console.log("DAW Campaign seeding complete!");
}

seedDawLessons();
