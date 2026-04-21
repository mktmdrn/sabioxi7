const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addLesson(title, questions) {
  const lessonId = Date.now().toString() + Math.floor(Math.random() * 1000);
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

  console.log(`Created lesson: ${title}`);
}

async function seed() {
  const capitales = [
    {
      question: "¿Cuál es la capital de Francia?",
      correctAnswer: "París",
      wrongAnswers: ["Madrid", "Roma", "Berlín"]
    },
    {
      question: "¿Cuál es la capital de Japón?",
      correctAnswer: "Tokio",
      wrongAnswers: ["Pekín", "Seúl", "Bangkok"]
    },
    {
      question: "¿Cuál es la capital de Australia?",
      correctAnswer: "Canberra",
      wrongAnswers: ["Sídney", "Melbourne", "Brisbane"]
    },
    {
      question: "¿Cuál es la capital de Canadá?",
      correctAnswer: "Ottawa",
      wrongAnswers: ["Toronto", "Vancouver", "Montreal"]
    },
    {
      question: "¿Cuál es la capital de Brasil?",
      correctAnswer: "Brasilia",
      wrongAnswers: ["Río de Janeiro", "São Paulo", "Buenos Aires"]
    },
    {
      question: "¿Cuál es la capital de España?",
      correctAnswer: "Madrid",
      wrongAnswers: ["Barcelona", "Sevilla", "Valencia"]
    }
  ];

  const ingles = [
    {
      question: "¿Cómo se dice 'Manzana' en inglés?",
      correctAnswer: "Apple",
      wrongAnswers: ["Banana", "Grape", "Orange"]
    },
    {
      question: "¿Cuál es la traducción de 'Perro'?",
      correctAnswer: "Dog",
      wrongAnswers: ["Cat", "Bird", "Fish"]
    },
    {
      question: "¿Qué significa 'Hello'?",
      correctAnswer: "Hola",
      wrongAnswers: ["Adiós", "Gracias", "Por favor"]
    },
    {
      question: "¿Cómo se dice 'Rojo' en inglés?",
      correctAnswer: "Red",
      wrongAnswers: ["Blue", "Green", "Yellow"]
    },
    {
      question: "¿Cuál es la traducción de 'Agua'?",
      correctAnswer: "Water",
      wrongAnswers: ["Fire", "Earth", "Air"]
    },
    {
      question: "¿Qué significa 'Book'?",
      correctAnswer: "Libro",
      wrongAnswers: ["Mesa", "Silla", "Lápiz"]
    }
  ];

  try {
    await addLesson("Geografía: Capitales del Mundo", capitales);
    await addLesson("Inglés Básico: Vocabulario", ingles);
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
