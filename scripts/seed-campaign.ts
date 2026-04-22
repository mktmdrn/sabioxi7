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

async function seedCampaignLessons() {
  console.log("Seeding Campaign Lessons (10 per subject)...");

  for (const subject of subjects) {
    for (let i = 1; i <= 10; i++) {
      const title = `[ASIR] [${subject}] Lección ${i}`;
      
      const { data: existing } = await supabase
        .from("lessons")
        .select("id")
        .eq("title", title)
        .single();

      if (existing) continue;

      const lessonId = `camp-${subject.toLowerCase().replace(/ /g, "-")}-l${i}`;
      
      await supabase.from("lessons").insert({
        id: lessonId,
        title: title,
        type: "lesson",
        created_at: Date.now()
      });

      // Simple questions
      const questions = [];
      for (let q = 1; q <= 5; q++) {
        questions.push({
          lesson_id: lessonId,
          question: `Pregunta ${q} de ${subject} (Lección ${i})`,
          correct_answer: "Respuesta Correcta",
          wrong_answers: ["Error 1", "Error 2", "Error 3"]
        });
      }
      await supabase.from("questions").insert(questions);
    }
    console.log(`✅ Seeded 10 lessons for ${subject}`);
  }
  console.log("Campaign seeding complete!");
}

seedCampaignLessons();
