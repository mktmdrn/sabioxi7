"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addLesson, updateLesson, getLessons, Question, Lesson } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle, Search, Edit3, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function GeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"create" | "edit">("create");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // New structured title states
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  
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

  // Extract unique courses and subjects from existing lessons
  const existingCourses = Array.from(new Set(allLessons.map(l => {
    const match = l.title.match(/^\[(.*?)\]/);
    return match ? match[1] : null;
  }).filter(Boolean))) as string[];

  const existingSubjects = Array.from(new Set(allLessons.map(l => {
    const match = l.title.match(/^\[.*?\] \[(.*?)\]/);
    return match ? match[1] : null;
  }).filter(Boolean))) as string[];

  if (status === "loading") {
    return <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center font-black text-duo-blue uppercase tracking-widest animate-pulse">Cargando Panel...</div>;
  }

  if (!session || (session?.user as any)?.role !== "admin") {
    return null;
  }

  const handleSelectLesson = (id: string) => {
    const lesson = allLessons.find(l => l.id === id);
    if (lesson) {
      setSelectedLessonId(id);
      
      // Parse structured title: [Course] [Subject] Title
      const match = lesson.title.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
      if (match) {
        setCourse(match[1]);
        setSubject(match[2]);
        setLessonTitle(match[3]);
      } else {
        setCourse("");
        setSubject("");
        setLessonTitle(lesson.title);
      }

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
    
    if (!course || !subject || !lessonTitle) {
      setError("Faltan campos: Curso, Asignatura y Título son obligatorios.");
      return;
    }

    const questions = validateAndParse(input);
    if (!questions) return;

    const fullTitle = `[${course}] [${subject}] ${lessonTitle}`;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await addLesson(fullTitle, questions);
      } else {
        await updateLesson(selectedLessonId, fullTitle, questions);
      }
      setSuccess(true);
      if (mode === "create") {
        setLessonTitle("");
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
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans selection:bg-duo-blue/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-duo-yellow rounded-[1.25rem] flex items-center justify-center border-b-8 border-[#c89b00] shadow-lg shadow-duo-yellow/20">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-duo-foreground uppercase italic tracking-tighter leading-none">
                ADMIN PANEL
              </h1>
              <p className="text-duo-yellow font-black text-xs uppercase tracking-[0.2em] mt-1">Gestor de Contenido</p>
            </div>
          </div>
          <Link href="/dashboard/admin" className="bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            Volver al Panel Admin
          </Link>
        </header>


        {/* Mode Toggle */}
        <div className="flex bg-duo-gray/20 p-2 rounded-[2.5rem] border-2 border-duo-gray w-fit">
          <button 
            onClick={() => setMode("create")}
            className={`px-10 py-4 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 ${mode === "create" ? "bg-duo-blue text-white border-b-4 border-duo-blue-dark shadow-lg shadow-duo-blue/20" : "text-duo-gray-dark hover:bg-duo-gray/30"}`}
          >
            <PlusCircle className="w-5 h-5" />
            Crear Nueva
          </button>
          <button 
            onClick={() => setMode("edit")}
            className={`px-10 py-4 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 ${mode === "edit" ? "bg-duo-blue text-white border-b-4 border-duo-blue-dark shadow-lg shadow-duo-blue/20" : "text-duo-gray-dark hover:bg-duo-gray/30"}`}
          >
            <Edit3 className="w-5 h-5" />
            Editar Existente
          </button>
        </div>

        <main className="duo-card p-8 md:p-12 relative overflow-hidden">
          {mode === "edit" && (
            <div className="mb-12 space-y-6">
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark ml-2">Seleccionar Lección:</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-duo-gray-dark" />
                <input 
                  type="text"
                  placeholder="Buscar por título o asignatura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[2rem] py-5 pl-14 pr-6 text-duo-foreground font-black focus:outline-none focus:border-duo-blue transition-all shadow-inner"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                {filteredLessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLesson(l.id)}
                    className={`text-left px-6 py-5 rounded-[2rem] border-2 border-b-8 transition-all group ${selectedLessonId === l.id ? "bg-duo-blue/5 border-duo-blue text-duo-blue" : "bg-white border-duo-gray text-duo-gray-dark hover:border-duo-gray-dark hover:bg-[#f7f7f7]"}`}
                  >
                    <div className="font-black text-lg truncate uppercase italic tracking-tighter group-hover:scale-[1.02] transition-transform">{l.title}</div>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 mt-1 font-mono">ID: {l.id.slice(0, 8)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 space-y-4">
            <h2 className="text-2xl font-black text-duo-foreground uppercase italic tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 bg-duo-blue rounded-full" />
              EDITOR DE CONTENIDO
            </h2>
            <div className="bg-duo-blue/5 p-5 rounded-2xl border-2 border-duo-blue/10 flex gap-4">
              <div className="text-3xl">💡</div>
              <p className="text-duo-blue font-bold text-sm leading-relaxed">
                <span className="block font-black uppercase text-[10px] tracking-widest mb-1">Guía Rápida:</span>
                1. Pregunta | 2. Respuesta Correcta | 3-5. Opciones Incorrectas. 
                Usa <span className="font-black bg-duo-blue/20 px-1 rounded">Doble Salto de Línea</span> para separar preguntas.
              </p>
            </div>
          </div>

          <div className="mb-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2 group-focus-within:text-duo-blue transition-colors">Nombre del Curso</label>
                <input
                  type="text"
                  list="course-list"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ej: ASIR, DAW, 1º ESO..."
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-xl uppercase italic tracking-tighter placeholder:opacity-30"
                />
                <datalist id="course-list">
                  {existingCourses.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2 group-focus-within:text-duo-blue transition-colors">Asignatura</label>
                <input
                  type="text"
                  list="subject-list"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Redes, Programación..."
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-xl uppercase italic tracking-tighter placeholder:opacity-30"
                />
                <datalist id="subject-list">
                  {existingSubjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2 group-focus-within:text-duo-blue transition-colors">Título del Tema</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ej: Protocolos de Capa 3"
                className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-2xl uppercase italic tracking-tighter placeholder:opacity-30"
              />
            </div>
          </div>

          <div className="relative group">
             <div className="absolute top-4 right-6 text-[10px] font-black text-duo-gray-dark bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-duo-gray opacity-0 group-focus-within:opacity-100 transition-opacity z-10">
              MODO EDICIÓN ACTIVO
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe o pega aquí el contenido de la lección..."
              className="w-full h-[600px] bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-mono text-sm resize-none leading-loose custom-scrollbar shadow-inner"
            />
          </div>

          {error && (
            <div className="mt-8 p-6 bg-duo-red/10 border-2 border-duo-red rounded-3xl text-duo-red flex items-center gap-5 animate-shake shadow-lg shadow-duo-red/10">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-black uppercase text-sm tracking-widest">Error de Validación</p>
                <p className="font-bold text-lg">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-8 p-6 bg-duo-green/10 border-2 border-duo-green rounded-3xl text-duo-green flex items-center gap-5 animate-bounce shadow-lg shadow-duo-green/10">
              <CheckCircle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-black uppercase text-sm tracking-widest">¡Misión Cumplida!</p>
                <p className="font-black text-2xl italic uppercase tracking-tighter">Archivo guardado con éxito</p>
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-8 border-t-2 border-duo-gray pt-10">
            <div className="flex items-center gap-4 bg-[#f7f7f7] px-6 py-3 rounded-full border-2 border-duo-gray shadow-sm">
              <div className="w-3 h-3 rounded-full bg-duo-blue animate-pulse" />
              <p className="text-xs font-black text-duo-gray-dark uppercase tracking-[0.2em]">
                {input.split(/\n\s*\n/).filter(b => b.trim() !== "").length} <span className="text-duo-blue">BLOQUES</span> DETECTADOS
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === "create" && (!course || !subject || !lessonTitle)) || (mode === "edit" && !selectedLessonId)}
              className={`
                px-16 py-6 rounded-[2.5rem] font-black text-2xl uppercase italic tracking-tighter
                transition-all active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-2xl border-b-8
                ${isSubmitting || (mode === "create" && (!course || !subject || !lessonTitle)) || (mode === "edit" && !selectedLessonId)
                  ? "bg-duo-gray border-duo-gray-dark text-duo-gray-dark"
                  : "bg-duo-green border-duo-green-dark text-white hover:brightness-110 shadow-duo-green/30"}
              `}
            >
              {isSubmitting ? "GUARDANDO..." : mode === "create" ? "Publicar Lección" : "Guardar Cambios"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
