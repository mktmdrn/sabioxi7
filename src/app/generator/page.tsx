"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addLesson, updateLesson, getLessons, deleteLesson, Question, Lesson } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle, Search, Edit3, PlusCircle, Trash2, ChevronLeft, BookOpen, Settings } from "lucide-react";
import Link from "next/link";

export default function GeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [view, setView] = useState<"list" | "form">("list");
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
  const [filterCourse, setFilterCourse] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAll = async () => {
    const [l, e] = await Promise.all([getLessons("lesson"), getLessons("exam")]);
    setAllLessons([...l, ...e]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

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

  const handleEdit = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setMode("edit");
    
    const match = lesson.title.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
    if (match) {
      const c = match[1];
      const s = match[2];
      
      if (existingCourses.includes(c)) {
        setSelectedCourse(c);
        setCustomCourse("");
      } else {
        setSelectedCourse("__NEW__");
        setCustomCourse(c);
      }

      if (existingSubjects.includes(s)) {
        setSelectedSubject(s);
        setCustomSubject("");
      } else {
        setSelectedSubject("__NEW__");
        setCustomSubject(s);
      }

      setLessonTitle(match[3]);
    } else {
      setSelectedCourse("__NEW__");
      setCustomCourse("");
      setSelectedSubject("__NEW__");
      setCustomSubject("");
      setLessonTitle(lesson.title);
    }

    const text = lesson.questions.map(q => {
      return `${q.question}\n${q.correctAnswer}\n${q.wrongAnswers[0]}\n${q.wrongAnswers[1]}\n${q.wrongAnswers[2]}`;
    }).join("\n\n");
    setInput(text);
    setError(null);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar esta lección?")) return;
    setIsSubmitting(true);
    try {
      await deleteLesson(id);
      await fetchAll();
    } catch (err) {
      alert("Error al borrar lección");
    } finally {
      setIsSubmitting(false);
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
        setError(`El bloque ${i + 1} tiene ${lines.length} líneas, pero debe tener exactamente 5.`);
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
    
    const finalCourse = selectedCourse === "__NEW__" ? customCourse : selectedCourse;
    const finalSubject = selectedSubject === "__NEW__" ? customSubject : selectedSubject;

    if (!finalCourse || !finalSubject || !lessonTitle) {
      setError("Campos obligatorios faltantes.");
      return;
    }

    const questions = validateAndParse(input);
    if (!questions) return;

    const fullTitle = `[${finalCourse}] [${finalSubject}] ${lessonTitle}`;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await addLesson(fullTitle, questions);
      } else {
        await updateLesson(selectedLessonId, fullTitle, questions);
      }
      setSuccess(true);
      setTimeout(async () => {
        await fetchAll();
        setView("list");
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError("Error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLessons = allLessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans selection:bg-duo-blue/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-duo-blue rounded-[1.25rem] flex items-center justify-center border-b-8 border-duo-blue-dark shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-duo-foreground uppercase italic tracking-tighter leading-none">
                GESTIÓN DE CURSOS
              </h1>
              <p className="text-duo-blue font-black text-xs uppercase tracking-[0.2em] mt-1">Sabioxi Admin Panel</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/generator/advanced" className="bg-duo-blue/10 border-2 border-duo-blue border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl text-duo-blue hover:bg-duo-blue hover:text-white transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest">
              Bulk Loader 🚀
            </Link>
            <Link href="/dashboard/admin" className="bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest">
              Volver al Admin
            </Link>
          </div>
        </header>

        {view === "list" ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1 w-full space-y-4">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-duo-gray-dark" />
                  <input 
                    type="text"
                    placeholder="Buscar lecciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-duo-gray border-b-4 rounded-[1.5rem] py-4 pl-14 pr-6 text-duo-foreground font-bold focus:outline-none focus:border-duo-blue transition-all"
                  />
                </div>
                
                {(filterCourse || filterSubject) && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[10px] font-black uppercase text-duo-gray-dark tracking-widest flex items-center mr-2">Filtros activos:</span>
                    {filterCourse && (
                      <button 
                        onClick={() => setFilterCourse(null)}
                        className="bg-duo-blue/10 text-duo-blue px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-duo-blue/20 flex items-center gap-2 hover:bg-duo-blue/20"
                      >
                        Curso: {filterCourse} <X className="w-3 h-3" />
                      </button>
                    )}
                    {filterSubject && (
                      <button 
                        onClick={() => setFilterSubject(null)}
                        className="bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500/20"
                      >
                        Asignatura: {filterSubject} <X className="w-3 h-3" />
                      </button>
                    )}
                    <button 
                      onClick={() => { setFilterCourse(null); setFilterSubject(null); }}
                      className="text-[10px] font-black uppercase text-duo-red hover:underline ml-2"
                    >
                      Limpiar todo
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  setMode("create");
                  setSelectedLessonId("");
                  setLessonTitle("");
                  setInput("");
                  setView("form");
                }}
                className="bg-duo-green text-white border-b-8 border-duo-green-dark px-10 py-4 rounded-2xl font-black text-xl uppercase italic tracking-tighter hover:brightness-110 active:translate-y-2 transition-all flex items-center gap-3 shadow-lg shadow-duo-green/20 w-full md:w-auto justify-center"
              >
                <PlusCircle className="w-6 h-6" />
                Nueva Lección
              </button>
            </div>

            <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#f7f7f7] border-b-2 border-duo-gray">
                  <tr className="text-[10px] uppercase font-black text-duo-gray-dark tracking-widest">
                    <th className="px-8 py-5">Curso</th>
                    <th className="px-8 py-5">Asignatura</th>
                    <th className="px-8 py-5">Lección</th>
                    <th className="px-8 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-duo-gray">
                  {filteredLessons.map(l => {
                    const match = l.title.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
                    const course = match ? match[1] : "—";
                    const subject = match ? match[2] : "—";
                    const title = match ? match[3] : l.title;

                    return (
                      <tr key={l.id} className="hover:bg-[#f7f7f7]/50 transition-colors group">
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => setFilterCourse(course)}
                            className="font-black text-duo-blue uppercase italic text-sm hover:underline"
                          >
                            {course}
                          </button>
                        </td>
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => setFilterSubject(subject)}
                            className="font-bold text-duo-gray-dark uppercase text-xs hover:underline"
                          >
                            {subject}
                          </button>
                        </td>
                        <td className="px-8 py-5 font-black text-duo-foreground uppercase italic text-sm">{title}</td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleEdit(l); }}
                            disabled={isSubmitting}
                            className="p-3 bg-white border-2 border-duo-gray border-b-4 rounded-xl text-duo-blue hover:bg-duo-blue hover:text-white transition-all active:translate-y-1 active:border-b-0 disabled:opacity-50"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleDelete(l.id); }}
                            disabled={isSubmitting}
                            className="p-3 bg-white border-2 border-duo-gray border-b-4 rounded-xl text-duo-red hover:bg-duo-red hover:text-white transition-all active:translate-y-1 active:border-b-0 disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLessons.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center font-black text-duo-gray-dark uppercase tracking-widest opacity-30 italic">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView("list")}
                className="p-4 bg-white border-2 border-duo-gray border-b-4 rounded-2xl text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest active:translate-y-1 active:border-b-0"
              >
                <ChevronLeft className="w-5 h-5" /> Volver al Listado
              </button>
              <h2 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight">
                {mode === "create" ? "CREANDO NUEVA LECCIÓN" : `EDITANDO: ${lessonTitle}`}
              </h2>
            </div>

            <main className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 md:p-12">
              <div className="mb-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2">Curso</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-xl uppercase italic tracking-tighter"
                    >
                      <option value="">— Seleccionar —</option>
                      {existingCourses.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__NEW__" className="text-duo-blue">+ NUEVO CURSO</option>
                    </select>
                    {selectedCourse === "__NEW__" && (
                      <input type="text" value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} placeholder="Nombre del nuevo curso..." className="w-full bg-white border-2 border-duo-blue border-b-4 rounded-xl p-4 mt-3 font-bold uppercase animate-in slide-in-from-top-2" autoFocus />
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2">Asignatura</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-xl uppercase italic tracking-tighter"
                    >
                      <option value="">— Seleccionar —</option>
                      {existingSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="__NEW__" className="text-duo-blue">+ NUEVA ASIGNATURA</option>
                    </select>
                    {selectedSubject === "__NEW__" && (
                      <input type="text" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Nombre de asignatura..." className="w-full bg-white border-2 border-duo-blue border-b-4 rounded-xl p-4 mt-3 font-bold uppercase animate-in slide-in-from-top-2" autoFocus />
                    )}
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-[0.3em] text-duo-gray-dark mb-3 ml-2">Título de la Lección</label>
                  <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Ej: Fundamentos de Redes" className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-[1.5rem] p-6 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-black text-2xl uppercase italic tracking-tighter" />
                </div>
              </div>

              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pega aquí el contenido..."
                  className="w-full h-[500px] bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-8 font-mono text-sm focus:outline-none focus:border-duo-blue transition-all resize-none leading-loose shadow-inner"
                />
              </div>

              {error && <div className="mt-8 p-6 bg-duo-red/10 border-2 border-duo-red rounded-3xl text-duo-red font-bold animate-shake">{error}</div>}
              {success && <div className="mt-8 p-6 bg-duo-green/10 border-2 border-duo-green rounded-3xl text-duo-green font-black uppercase text-xl animate-bounce">¡Guardado con éxito!</div>}

              <div className="mt-12 flex justify-end gap-6">
                <button 
                  onClick={() => setView("list")} 
                  className="px-8 py-5 rounded-2xl font-black text-duo-gray-dark uppercase tracking-widest hover:bg-[#f7f7f7]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-duo-green text-white border-b-8 border-duo-green-dark px-16 py-6 rounded-[2rem] font-black text-2xl uppercase italic tracking-tighter hover:brightness-110 active:translate-y-2 transition-all disabled:opacity-50 shadow-xl"
                >
                  {isSubmitting ? "GUARDANDO..." : "Publicar Ahora"}
                </button>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
