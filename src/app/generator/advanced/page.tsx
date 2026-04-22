"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addLesson, Question } from "@/actions/db";
import { LayoutDashboard, CheckCircle, AlertTriangle, Play, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AdvancedGeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{success: number, errors: string[]} | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

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

    // Process each block as a NEW lesson (standard behavior for this format)
    for (const block of blocks) {
      const [course, subject, title, qText, correct, w1, w2, w3] = block;
      const fullTitle = `[${course}] [${subject}] ${title}`;
      const questions: Question[] = [{
        question: qText,
        correctAnswer: correct,
        wrongAnswers: [w1, w2, w3]
      }];

      try {
        await addLesson(fullTitle, questions);
        successCount++;
      } catch (err) {
        errors.push(`Error al guardar "${title}": ${(err as Error).message}`);
      }
    }

    setResults({ success: successCount, errors });
    setIsSubmitting(false);
    if (successCount > 0) setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
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
             <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8">
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
                    {isSubmitting ? "PROCESANDO..." : "CARGAR TODO 🚀"}
                  </button>
                </div>
             </div>

             {results && (
               <div className={`p-8 rounded-[2.5rem] border-2 border-b-8 transition-all animate-in slide-in-from-bottom-4 ${results.errors.length > 0 ? "bg-duo-red/5 border-duo-red" : "bg-duo-green/5 border-duo-green"}`}>
                  <h3 className="font-black uppercase italic text-lg flex items-center gap-3 mb-4">
                    {results.errors.length > 0 ? <AlertTriangle className="text-duo-red" /> : <CheckCircle className="text-duo-green" />}
                    RESULTADO DE LA CARGA
                  </h3>
                  <p className="font-bold text-duo-foreground">Lecciones creadas: <span className="text-duo-green font-black">{results.success}</span></p>
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
            <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6">
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
                Este generador crea una lección por cada bloque. Si necesitas añadir varias preguntas a la misma lección, usa el generador estándar.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
