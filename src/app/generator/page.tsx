"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addLesson, updateLesson, getLessons, Question, Lesson } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle, Search, Edit3, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function GeneratorPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [l, e] = await Promise.all([getLessons("lesson"), getLessons("exam")]);
      setAllLessons([...l, ...e]);
    };
    fetchAll();
  }, []);

  const handleSelectLesson = (id: string) => {
    const lesson = allLessons.find(l => l.id === id);
    if (lesson) {
      setSelectedLessonId(id);
      setTitle(lesson.title);
      // Convert questions to text format
      const text = lesson.questions.map(q => {
        return `${q.question}\n${q.correctAnswer}\n${q.wrongAnswers[0]}\n${q.wrongAnswers[1]}\n${q.wrongAnswers[2]}`;
      }).join("\n\n");
      setInput(text);
      setError(null);
    }
  };

  const validateAndParse = (text: string): Question[] | null => {
    const blocks = text.split(/\n\s*\n/).filter((b) => b.trim() !== "");
    if (blocks.length < 1) {
      setError(`Necesitas al menos 1 pregunta.`);
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
      if (mode === "create") {
        await addLesson(title || "Lección sin título", questions);
      } else {
        await updateLesson(selectedLessonId, title, questions);
      }
      setSuccess(true);
      if (mode === "create") {
        setTitle("");
        setInput("");
      }
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("Error al guardar la lección en la base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLessons = allLessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            </div>
            Admin: Gestor de Contenido
          </h1>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            Volver al Dashboard
          </Link>
        </header>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button 
            onClick={() => setMode("create")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${mode === "create" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
          >
            <PlusCircle className="w-4 h-4" />
            Crear Nueva
          </button>
          <button 
            onClick={() => setMode("edit")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${mode === "edit" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Edit3 className="w-4 h-4" />
            Editar Existente
          </button>
        </div>

        <main className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
          
          {mode === "edit" && (
            <div className="mb-8 space-y-4">
              <label className="block text-sm font-medium text-slate-400">Buscar lección o examen:</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Filtrar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredLessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLesson(l.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${selectedLessonId === l.id ? "bg-indigo-500/20 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"}`}
                  >
                    <div className="font-bold truncate">{l.title}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50">{l.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <h2 className="text-xl font-semibold text-white">Editor de Texto Plano:</h2>
            <p className="text-slate-400 text-sm">Formato: Pregunta (L1), Correcta (L2), Falsa x3 (L3-5). Doble salto entre bloques.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Título del Contenido</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: [ASIR] Redes Avanzadas"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega o edita tus preguntas aquí..."
            className="w-full h-[500px] bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm resize-y leading-relaxed"
          />

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3 animate-bounce">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-bold text-lg">¡Archivo guardado con éxito!</p>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <p className="text-xs text-slate-500 italic">
              {input.split(/\n\s*\n/).filter(b => b.trim() !== "").length} bloques de preguntas detectados.
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === "create" && !title) || (mode === "edit" && !selectedLessonId)}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 flex items-center gap-2"
            >
              {isSubmitting ? "Procesando..." : mode === "create" ? "Publicar Lección" : "Guardar Cambios"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
