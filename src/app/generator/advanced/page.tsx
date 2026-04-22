"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { syncLessonWithQuestions, bulkSyncLessons, deleteLessonsByCourse, Question } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle, Play, FileText, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdvancedGeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{success: number, errors: string[]} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await deleteLessonsByCourse("UOC - ADE");
      alert(`Se han borrado ${res.count} lecciones.`);
      setShowDeleteModal(false);
    } catch (err) {
      alert("Error al borrar el curso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center font-black text-duo-blue uppercase tracking-widest animate-pulse">Cargando Panel...</div>;
  }

  const handleBulkLoad = async () => {
    setIsSubmitting(true);
    setResults(null);
    const errors: string[] = [];
    let successCount = 0;

    // Split by blocks of 8 lines
    const allLines = input.split("\n").map(l => l.trim()).filter(l => l !== "");
    const blocks: string[][] = [];
    
    for (let i = 0; i < allLines.length; i += 8) {
      const block = allLines.slice(i, i + 8);
      if (block.length === 8) {
        blocks.push(block);
      } else {
        errors.push(`Bloque incompleto cerca de la línea ${i + 1}. Se esperan 8 líneas.`);
      }
    }

    if (blocks.length === 0 && errors.length === 0) {
      errors.push("No se detectaron bloques válidos.");
      setIsSubmitting(false);
      setResults({ success: 0, errors });
      return;
    }

    // Prepare blocks for bulk sync
    const blocksToSync = blocks.map(block => {
      const [course, subject, title, qText, correct, w1, w2, w3] = block;
      return {
        title: `[${course}] [${subject}] ${title}`,
        questions: [{
          question: qText,
          correctAnswer: correct,
          wrongAnswers: [w1, w2, w3]
        }]
      };
    });

    try {
      const res = await bulkSyncLessons(blocksToSync);
      setResults({ 
        success: res.success, 
        errors: [...errors, ...res.errors] 
      });
      if (res.success > 0) setInput("");
    } catch (err) {
      setResults({ 
        success: 0, 
        errors: [...errors, `Error crítico de red: ${(err as Error).message}`] 
      });
    }

    setResults({ success: successCount, errors });
    setIsSubmitting(false);
    if (successCount > 0) setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-duo-blue rounded-[1.25rem] flex items-center justify-center border-b-8 border-duo-blue-dark shadow-lg shadow-duo-blue/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-duo-foreground uppercase italic tracking-tighter leading-none">
                ADVANCED GEN
              </h1>
              <p className="text-duo-blue font-black text-xs uppercase tracking-[0.2em] mt-1">Carga Masiva de Cursos</p>
            </div>
          </div>
          <Link href="/generator" className="bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Volver al Generador
          </Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-xl font-black mb-6 uppercase italic flex items-center gap-3 text-duo-blue">
                  <div className="w-2 h-6 bg-duo-blue rounded-full" />
                  ENTRADA DE DATOS (8 LÍNEAS POR BLOQUE)
                </h2>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pega aquí tus bloques de 8 líneas..."
                  className="w-full h-[500px] bg-[#f7f7f7] border-2 border-duo-gray border-b-8 rounded-[2rem] p-8 font-mono text-sm focus:outline-none focus:border-duo-blue transition-all resize-none shadow-inner"
                />
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleBulkLoad}
                    disabled={isSubmitting || !input.trim()}
                    className="bg-duo-green text-white border-b-8 border-duo-green-dark px-12 py-5 rounded-[2.5rem] font-black text-xl uppercase italic tracking-tighter hover:brightness-110 active:translate-y-2 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-duo-green/20"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CARGAR TODO 🚀"}
                  </button>
                </div>
             </div>

             {results && (
                <div className={`p-8 rounded-[2.5rem] border-2 border-b-8 transition-all animate-in slide-in-from-bottom-4 ${results.errors.length > 0 ? "bg-duo-red/5 border-duo-red" : "bg-duo-green/5 border-duo-green"}`}>
                  <h3 className="font-black uppercase italic text-lg flex items-center gap-3 mb-4">
                    {results.errors.length > 0 ? <AlertTriangle className="text-duo-red" /> : <CheckCircle className="text-duo-green" />}
                    RESULTADO DE LA CARGA
                  </h3>
                  <p className="font-bold text-duo-foreground">Lecciones creadas/actualizadas: <span className="text-duo-green font-black">{results.success}</span></p>
                  {results.errors.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-black text-duo-red uppercase tracking-widest">Errores Detectados:</p>
                      <ul className="text-xs font-mono text-duo-red/80 list-disc pl-5">
                        {results.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
               </div>
             )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 shadow-sm">
              <h3 className="font-black uppercase italic text-sm mb-4 text-duo-gray-dark flex items-center gap-2">
                <Play className="w-4 h-4 fill-current text-duo-blue" />
                TEMPLATE ESTRUCTURA
              </h3>
              <div className="bg-[#f7f7f7] p-5 rounded-xl font-mono text-[11px] leading-relaxed text-duo-gray-dark border-2 border-duo-gray/30 shadow-inner">
                L1: CURSO<br/>
                L2: ASIGNATURA<br/>
                L3: TÍTULO LECCIÓN<br/>
                L4: PREGUNTA<br/>
                L5: RESPUESTA CORRECTA<br/>
                L6: RESPUESTA INCORRECTA 1<br/>
                L7: RESPUESTA INCORRECTA 2<br/>
                L8: RESPUESTA INCORRECTA 3<br/>
                <br/>
                <span className="text-duo-blue opacity-60">(Sin líneas vacías entre bloques)</span>
              </div>
            </div>

            <div className="bg-duo-blue/5 border-2 border-duo-blue/20 rounded-[2rem] p-6">
              <h3 className="font-black uppercase italic text-sm mb-4 text-duo-blue flex items-center gap-2">
                💡 CONSEJO PRO
              </h3>
              <p className="text-xs font-bold text-duo-blue/70 leading-relaxed">
                Este generador crea una lección por cada bloque. Si el título ya existe, añade la pregunta a esa lección.
              </p>
            </div>

            <div className="bg-duo-red/5 border-2 border-duo-red/20 rounded-[2rem] p-6">
              <h3 className="font-black uppercase italic text-sm mb-4 text-duo-red flex items-center gap-2">
                ⚠️ ZONA PELIGROSA
              </h3>
              <p className="text-xs font-bold text-duo-red/70 leading-relaxed mb-4">
                Borra todas las lecciones del curso "UOC - ADE" para empezar de cero.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting}
                className="w-full bg-white border-2 border-duo-red border-b-4 active:border-b-0 active:translate-y-1 py-3 rounded-xl text-duo-red font-black uppercase text-[10px] tracking-widest hover:bg-duo-red hover:text-white transition-all disabled:opacity-50"
              >
                BORRAR CURSO UOC - ADE
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-duo-foreground/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-duo-red/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-duo-red/20">
              <AlertTriangle className="w-10 h-10 text-duo-red" />
            </div>
            <h3 className="text-2xl font-black text-duo-foreground text-center uppercase italic tracking-tighter mb-4">
              ¿Confirmar Borrado?
            </h3>
            <p className="text-duo-gray-dark font-bold text-center leading-relaxed mb-8">
              Esta acción eliminará todas las lecciones asociadas a "UOC - ADE" y el progreso de los alumnos. No se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-[#f7f7f7] border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 py-4 rounded-2xl text-duo-gray-dark font-black uppercase text-xs tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="flex-1 bg-duo-red text-white border-b-8 border-duo-red-dark py-4 rounded-2xl font-black uppercase italic tracking-widest hover:brightness-110 active:translate-y-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sí, Borrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
