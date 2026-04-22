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
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-duo-foreground flex items-center gap-3 italic uppercase tracking-tight">
            <div className="w-12 h-12 bg-duo-blue rounded-2xl flex items-center justify-center border-b-4 border-duo-blue-dark shadow-sm">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            Admin: Gestor de Contenido
          </h1>
          <Link href="/dashboard" className="text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-sm">
            Volver al Dashboard
          </Link>
        </header>

        {/* Mode Toggle */}
        <div className="flex bg-white p-1.5 rounded-[2rem] border-2 border-duo-gray w-fit shadow-sm">
          <button 
            onClick={() => setMode("create")}
            className={`px-8 py-3 rounded-2xl font-black uppercase text-sm transition-all flex items-center gap-2 ${mode === "create" ? "bg-duo-blue text-white border-b-4 border-duo-blue-dark" : "text-duo-gray-dark hover:bg-duo-gray/20"}`}
          >
            <PlusCircle className="w-4 h-4" />
            Crear Nueva
          </button>
          <button 
            onClick={() => setMode("edit")}
            className={`px-8 py-3 rounded-2xl font-black uppercase text-sm transition-all flex items-center gap-2 ${mode === "edit" ? "bg-duo-blue text-white border-b-4 border-duo-blue-dark" : "text-duo-gray-dark hover:bg-duo-gray/20"}`}
          >
            <Edit3 className="w-4 h-4" />
            Editar Existente
          </button>
        </div>

        <main className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
          {mode === "edit" && (
            <div className="mb-10 space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest text-duo-gray-dark">Buscar lección o examen:</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray-dark" />
                <input 
                  type="text"
                  placeholder="Filtrar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-duo-gray rounded-2xl py-4 pl-12 pr-4 text-duo-foreground font-bold focus:outline-none focus:border-duo-blue transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {filteredLessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLesson(l.id)}
                    className={`text-left px-5 py-4 rounded-2xl border-2 border-b-4 transition-all ${selectedLessonId === l.id ? "bg-duo-blue/10 border-duo-blue text-duo-blue ring-2 ring-duo-blue/20" : "bg-white border-duo-gray text-duo-gray-dark hover:border-duo-gray-dark"}`}
                  >
                    <div className="font-black text-lg truncate leading-tight">{l.title}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">{l.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-black text-duo-foreground uppercase italic italic tracking-tight">Editor de Texto Plano:</h2>
            <p className="text-duo-gray-dark font-bold text-sm bg-duo-gray/10 p-3 rounded-xl border-l-4 border-duo-gray">Formato: Pregunta (L1), Correcta (L2), Falsa x3 (L3-5). Doble salto entre bloques.</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-black uppercase tracking-widest text-duo-gray-dark mb-2">Título del Contenido</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: [ASIR] Redes Avanzadas"
              className="w-full bg-white border-2 border-duo-gray border-b-4 rounded-2xl p-4 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-xl"
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pega o edita tus preguntas aquí..."
            className="w-full h-[600px] bg-white border-2 border-duo-gray border-b-4 rounded-[2rem] p-8 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-mono text-sm resize-y leading-relaxed"
          />

          {error && (
            <div className="mt-8 p-5 bg-duo-red/10 border-2 border-duo-red rounded-2xl text-duo-red flex items-center gap-4 animate-shake">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p className="font-black uppercase text-sm tracking-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-8 p-5 bg-duo-green/10 border-2 border-duo-green rounded-2xl text-duo-green flex items-center gap-4 animate-bounce">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-black uppercase text-lg tracking-tight italic">¡Archivo guardado con éxito!</p>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 bg-duo-gray/10 px-4 py-2 rounded-full border border-duo-gray">
              <div className="w-2 h-2 rounded-full bg-duo-blue animate-pulse" />
              <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest">
                {input.split(/\n\s*\n/).filter(b => b.trim() !== "").length} Bloques Detectados
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === "create" && !title) || (mode === "edit" && !selectedLessonId)}
              className={`
                px-12 py-5 rounded-2xl font-black text-xl uppercase italic tracking-tighter
                transition-all active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-xl border-b-[6px]
                ${isSubmitting || (mode === "create" && !title) || (mode === "edit" && !selectedLessonId)
                  ? "bg-duo-gray border-duo-gray-dark text-duo-gray-dark"
                  : "bg-duo-green border-duo-green-dark text-white hover:bg-[#61e002] shadow-duo-green/20"}
              `}
            >
              {isSubmitting ? "Procesando..." : mode === "create" ? "Publicar Lección" : "Guardar Cambios"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
