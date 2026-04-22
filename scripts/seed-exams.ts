import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const subjects = [
  "Planificación y Administración de Redes",
  "Fundamentos de Hardware",
  "Gestión de Bases de Datos",
  "Lenguajes de Marcas",
  "Servicios de Red e Internet",
  "Seguridad y Alta Disponibilidad",
  "Administración de Sistemas Operativos",
  "Implantación de Aplicaciones Web"
];

function generateMockQuestions(subject: string, count: number) {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      question: `[EXAMEN] Pregunta ${i} sobre ${subject}: ¿Cuál es el concepto clave ${i}?`,
      correctAnswer: `Respuesta correcta ${i}`,
      wrongAnswers: [`Error A ${i}`, `Error B ${i}`, `Error C ${i}`]
    });
  }
  return questions;
}

async function seedExams() {
  console.log("Seeding Exams (50 questions each)...");

  for (const subject of subjects) {
    const fullTitle = `[EXAMEN FINAL] ${subject}`;
    
    // Check if exists
    const { data: existing } = await supabase
      .from("lessons")
      .select("id")
      .eq("title", fullTitle)
      .single();

    if (existing) {
      console.log(`Skipping: ${fullTitle} (Already exists)`);
      continue;
    }

    const examId = `exam-${subject.toLowerCase().replace(/ /g, "-")}-${Date.now()}`;
    
    const { error: lessonError } = await supabase
      .from("lessons")
      .insert({ 
        id: examId, 
        title: fullTitle,
        type: "exam",
        duration_minutes: 60,
        created_at: Date.now()
      });

    if (lessonError) {
      console.error(`Failed to insert exam ${fullTitle}:`, lessonError.message);
      continue;
    }

    const questions = generateMockQuestions(subject, 50);
    const questionInserts = questions.map((q) => ({
      lesson_id: examId,
      question: q.question,
      correct_answer: q.correctAnswer,
      wrong_answers: q.wrongAnswers,
    }));

    // Insert in batches of 25 to avoid issues
    for (let i = 0; i < questionInserts.length; i += 25) {
      const batch = questionInserts.slice(i, i + 25);
      const { error: qError } = await supabase
        .from("questions")
        .insert(batch);
      
      if (qError) {
        console.error(`Failed to insert questions batch for ${fullTitle}:`, qError.message);
      }
    }

    console.log(`✅ Inserted Exam: ${fullTitle} (50 questions)`);
  }

  console.log("Exam seeding complete!");
}

seedExams();
