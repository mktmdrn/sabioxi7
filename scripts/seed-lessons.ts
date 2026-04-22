import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const topics = [
  "Introducción a los Sistemas Operativos",
  "Gestión de Procesos",
  "Planificación del Procesador",
  "Hilos y Concurrencia",
  "Sincronización de Procesos",
  "Interbloqueos (Deadlocks)",
  "Gestión de Memoria Principal",
  "Memoria Virtual",
  "Sistemas de Archivos",
  "Gestión de E/S",
  "Almacenamiento Secundario",
  "Sistemas Operativos Distribuidos",
  "Seguridad y Protección",
  "Administración de Linux básico",
  "Scripting en Bash",
  "Administración de Windows Server",
  "Powershell básico",
  "Virtualización (Conceptos)",
  "Contenedores (Docker básico)",
  "Monitorización y Rendimiento"
];

const MOCK_QUESTIONS = [
  {
    question: "¿Cuál es el núcleo de un sistema operativo?",
    correctAnswer: "El Kernel",
    wrongAnswers: ["El Shell", "El disco duro", "La memoria RAM"]
  },
  {
    question: "¿Qué gestiona la asignación de tiempo de CPU a los procesos?",
    correctAnswer: "El Planificador (Scheduler)",
    wrongAnswers: ["El Gestor de Memoria", "El Sistema de Archivos", "La BIOS"]
  },
  {
    question: "¿Cuál es la función principal de la memoria virtual?",
    correctAnswer: "Simular tener más memoria RAM usando el disco",
    wrongAnswers: ["Hacer el procesador más rápido", "Evitar virus informáticos", "Mejorar la resolución de pantalla"]
  }
];

async function seed() {
  console.log("Seeding lessons for [ASIR] [Sistemas Operativos]...");

  for (let i = 0; i < topics.length; i++) {
    const title = `[ASIR] [Sistemas Operativos] Tema ${i + 1}: ${topics[i]}`;
    const lessonId = `seed-os-${i + 1}-${Date.now()}`;
    const createdAt = Date.now() + i;

    // Check if it exists (by title) to avoid duplicates if run multiple times
    const { data: existing } = await supabase
      .from("lessons")
      .select("id")
      .eq("title", title)
      .single();

    if (existing) {
      console.log(`Skipping: ${title} (Already exists)`);
      continue;
    }

    const { error: lessonError } = await supabase
      .from("lessons")
      .insert({ id: lessonId, title, created_at: createdAt });

    if (lessonError) {
      console.error(`Failed to insert lesson ${title}:`, lessonError.message);
      continue;
    }

    const questionInserts = MOCK_QUESTIONS.map((q) => ({
      lesson_id: lessonId,
      question: q.question,
      correct_answer: q.correctAnswer,
      wrong_answers: q.wrongAnswers,
    }));

    const { error: qError } = await supabase
      .from("questions")
      .insert(questionInserts);

    if (qError) {
      console.error(`Failed to insert questions for ${title}:`, qError.message);
    } else {
      console.log(`✅ Inserted: ${title}`);
    }
  }

  console.log("Done!");
}

seed();
