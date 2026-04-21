"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLesson, Question } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GeneratorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAndParse = (text: string): Question[] | null => {
    const blocks = text.split(/\n\s*\n/).filter((b) => b.trim() !== "");
    if (blocks.length < 6) {
      setError(`Necesitas al menos 6 preguntas. Tienes ${blocks.length}.`);
      return null;
    }

    const parsedQuestions: Question[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const lines = blocks[i].split("\n").map((l) => l.trim()).filter((l) => l !== "");
      if (lines.length !== 5) {
        setError(`El bloque ${i + 1} tiene ${lines.length} líneas, pero debe tener exactamente 5 (1 pregunta + 4 opciones).`);
        return null;
      }

      parsedQuestions.push({
        question: lines[0],
        correctAnswer: lines[1],
        wrongAnswers: [lines[2], lines[3], lines[4]],
      });
    }

    return parsedQuestions;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    
    const questions = validateAndParse(input);
    if (!questions) return;

    setIsSubmitting(true);
    try {
      await addLesson(title || "Lección sin título", questions);
      setSuccess(true);
      setTitle("");
      setInput("");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("Error al guardar la lección en la base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            </div>
            Generador de Lecciones
          </h1>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            Volver al Dashboard
          </Link>
        </header>

        <main className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="mb-6 space-y-2">
            <h2 className="text-xl font-semibold text-white">Instrucciones de formato:</h2>
            <p className="text-slate-400">Pega tu texto abajo. Separa cada pregunta con un doble salto de línea (línea en blanco). Cada bloque de pregunta debe tener <strong>exactamente 5 líneas</strong>:</p>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 font-mono overflow-x-auto">
{`¿Cuál es la capital de Francia?
París (Siempre la correcta aquí en la línea 2)
Madrid
Roma
Berlín

¿Siguiente pregunta?
Respuesta correcta
Falsa 1
Falsa 2
Falsa 3`}
            </pre>
            <p className="text-amber-500/90 text-sm flex items-center gap-2 mt-2">
              <AlertTriangle className="w-4 h-4" />
              Mínimo 6 preguntas obligatorias por lección.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Título de la Lección</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Geografía - Capitales"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega tus preguntas aquí..."
            className="w-full h-96 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm resize-y"
          />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>¡Lección creada con éxito! Redirigiendo al dashboard...</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || input.trim() === ""}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Crear Lección"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
