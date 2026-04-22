"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { Check, Lock, Star, Trophy, GraduationCap, ChevronRight, TreePine, Cloud, Mountain, Ghost, Zap, Flame } from "lucide-react";

type Node = {
  id: string;
  title: string;
  type: "lesson" | "exam";
  order: number;
};

type Unit = {
  subject: string;
  nodes: Node[];
};

export default function CampaignPath({ 
  lessons, 
  exams, 
  completedIds 
}: { 
  lessons: any[], 
  exams: any[], 
  completedIds: string[] 
}) {
  // Scroll to bottom on mount so the user starts at the beginning (Módulo 1)
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  }, []);

  const units = useMemo<Unit[]>(() => {
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

    return subjects.map(subject => {
      const subjectLessons = lessons
        .filter(l => l.title.includes(`[${subject}]`))
        .sort((a, b) => {
          const numA = parseInt(a.title.match(/Lección (\d+)/)?.[1] || "0");
          const numB = parseInt(b.title.match(/Lección (\d+)/)?.[1] || "0");
          return numA - numB;
        })
        .slice(0, 10)
        .map((l, idx) => ({ id: l.id, title: l.title, type: "lesson" as const, order: idx }));

      const subjectExam = exams.find(e => e.title.includes(subject));
      const nodes: Node[] = [...subjectLessons];
      if (subjectExam) {
        nodes.push({ id: subjectExam.id, title: subjectExam.title, type: "exam" as const, order: 10 });
      }

      return { subject, nodes };
    });
  }, [lessons, exams]);

  const allNodes = useMemo(() => units.flatMap(u => u.nodes), [units]);
  
  const isUnlocked = (nodeId: string) => {
    const idx = allNodes.findIndex(n => n.id === nodeId);
    if (idx === 0) return true;
    const prevNode = allNodes[idx - 1];
    return completedIds.includes(prevNode.id);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#f7f7f7] min-h-screen font-sans">
      {/* Adventure Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none" style={{ backgroundImage: "radial-gradient(#4b4b4b 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-20 left-10 text-duo-gray opacity-10 animate-pulse"><Cloud className="w-40 h-40" /></div>
      <div className="absolute bottom-40 right-10 text-duo-gray opacity-10"><Mountain className="w-60 h-60" /></div>
      <div className="absolute top-1/2 left-1/4 text-duo-green opacity-10"><TreePine className="w-20 h-20" /></div>

      {/* Path Content - Reverse Order (Módulo 1 at bottom) */}
      <div className="flex flex-col-reverse items-center pt-20 pb-40">
        
        {/* Starting Point Illustration */}
        <div className="mb-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-duo-green border-b-8 border-duo-green-dark rounded-3xl flex items-center justify-center animate-bounce shadow-lg">
             <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <p className="mt-4 font-black text-duo-green uppercase text-xs tracking-[0.3em]">Comienza tu viaje</p>
        </div>

        {units.map((unit, unitIdx) => (
          <div key={unitIdx} className="w-full flex flex-col-reverse items-center">
            
            {/* Unit Header (Appears ABOVE the nodes in reverse flow) */}
            <div className="w-full max-w-sm bg-white border-2 border-duo-gray border-b-8 p-6 rounded-[2.5rem] my-16 relative group shadow-sm">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-duo-blue rounded-2xl flex items-center justify-center border-b-4 border-duo-blue-dark rotate-[-10deg]">
                <span className="text-white font-black">{unitIdx + 1}</span>
              </div>
              <h4 className="text-duo-foreground font-black text-lg uppercase italic text-center px-4">{unit.subject}</h4>
            </div>

            {/* Nodes Path (ZigZag) */}
            <div className="relative flex flex-col items-center gap-14 w-full max-w-sm">
              {unit.nodes.map((node, nodeIdx) => {
                const completed = completedIds.includes(node.id);
                const unlocked = isUnlocked(node.id);
                
                // Calculate horizontal offset for zigzag
                const offsetPattern = [0, 50, 90, 50, 0, -50, -90, -50];
                const xOffset = offsetPattern[nodeIdx % offsetPattern.length];

                return (
                  <div 
                    key={node.id} 
                    className="relative"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Decorative illustration near some nodes */}
                    {nodeIdx === 5 && (
                      <div className="absolute -left-20 top-0 text-duo-orange opacity-20"><Flame className="w-10 h-10" /></div>
                    )}
                    {nodeIdx === 2 && unitIdx % 2 === 0 && (
                      <div className="absolute -right-20 top-0 text-duo-purple opacity-20"><Ghost className="w-10 h-10" /></div>
                    )}

                    <Link 
                      href={unlocked ? (node.type === "exam" ? `/exam/${node.id}` : `/lesson/${node.id}`) : "#"}
                      className={`
                        relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                        border-b-[10px] transition-all active:border-b-0 active:translate-y-2
                        ${completed 
                          ? "bg-duo-green border-duo-green-dark text-white" 
                          : unlocked 
                            ? node.type === "exam"
                              ? "bg-duo-yellow border-[#c89b00] text-slate-900 scale-125 z-10 shadow-lg animate-pulse"
                              : "bg-duo-blue border-duo-blue-dark text-white"
                            : "bg-duo-gray border-duo-gray-dark text-duo-gray-dark grayscale cursor-not-allowed"}
                      `}
                    >
                      {completed ? (
                        <Check className="w-10 h-10 font-black" />
                      ) : node.type === "exam" ? (
                        <Trophy className="w-12 h-12" />
                      ) : (
                        <Star className={`w-10 h-10 ${unlocked ? "fill-current" : ""}`} />
                      )}
                    </Link>

                    {/* Connector line */}
                    {nodeIdx < unit.nodes.length - 1 && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-3 h-14 bg-duo-gray -z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator between units */}
            {unitIdx > 0 && (
              <div className="w-full flex flex-col items-center py-10">
                <div className="w-3 h-20 bg-duo-gray" />
              </div>
            )}
          </div>
        ))}

        {/* Final Trophy Illustration (at the TOP of the scroll) */}
        <div className="mt-40 flex flex-col items-center">
          <div className="w-32 h-32 bg-duo-yellow border-b-8 border-[#c89b00] rounded-full flex items-center justify-center relative shadow-2xl">
            <GraduationCap className="w-20 h-20 text-white" />
            <div className="absolute -top-4 -right-4 bg-duo-red text-white p-2 rounded-xl rotate-12 font-black text-xs border-b-4 border-red-700">FINAL</div>
          </div>
          <h5 className="mt-6 text-duo-foreground font-black text-2xl uppercase tracking-widest text-center italic">
            TÍTULO DE ASIR
          </h5>
          <p className="text-duo-gray-dark font-black text-sm mt-2">META DEFINITIVA</p>
        </div>
      </div>
    </div>
  );
}
