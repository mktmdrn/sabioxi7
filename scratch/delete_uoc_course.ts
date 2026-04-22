import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deleteCourse(courseName: string) {
  const pattern = `[${courseName}]%`;
  console.log(`Buscando lecciones del curso: ${courseName} (pattern: ${pattern})`);

  const { data: lessons, error: findError } = await supabase
    .from("lessons")
    .select("id, title")
    .like("title", pattern);

  if (findError) {
    console.error("Error buscando lecciones:", findError);
    return;
  }

  if (!lessons || lessons.length === 0) {
    console.log("No se encontraron lecciones para este curso.");
    return;
  }

  console.log(`Encontradas ${lessons.length} lecciones. Eliminando...`);

  for (const lesson of lessons) {
    console.log(`Eliminando: ${lesson.title} (${lesson.id})`);
    
    // Delete questions first (FK constraint)
    const { error: qError } = await supabase
      .from("questions")
      .delete()
      .eq("lesson_id", lesson.id);
    
    if (qError) {
      console.error(`Error eliminando preguntas de ${lesson.id}:`, qError);
      continue;
    }

    // Delete lesson
    const { error: lError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);
    
    if (lError) {
      console.error(`Error eliminando lección ${lesson.id}:`, lError);
    }
  }

  console.log("Proceso completado.");
}

deleteCourse("UOC - ADE");
