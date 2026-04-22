"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, Lock, Star, Trophy, GraduationCap, Map as MapIcon, ChevronRight } from "lucide-react";

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
      // Find 10 lessons for this subject
      const subjectLessons = lessons
        .filter(l => l.title.includes(`[${subject}]`))
        .sort((a, b) => {
          const numA = parseInt(a.title.match(/Lección (\d+)/)?.[1] || "0");
          const numB = parseInt(b.title.match(/Lección (\d+)/)?.[1] || "0");
          return numA - numB;
        })
        .slice(0, 10)
        .map((l, idx) => ({ id: l.id, title: l.title, type: "lesson" as const, order: idx }));

      // Find the exam for this subject
      const subjectExam = exams.find(e => e.title.includes(subject));
      
      const nodes: Node[] = [...subjectLessons];
      if (subjectExam) {
        nodes.push({ id: subjectExam.id, title: subjectExam.title, type: "exam" as const, order: 10 });
      }

      return { subject, nodes };
    });
  }, [lessons, exams]);

  // Flatten all nodes to determine lock status
  const allNodes = useMemo(() => units.flatMap(u => u.nodes), [units]);
  
  // A node is unlocked if it is the first one OR the previous one is completed
  const isUnlocked = (nodeId: string) => {
    const idx = allNodes.findIndex(n => n.id === nodeId);
    if (idx === 0) return true;
    const prevNode = allNodes[idx - 1];
    return completedIds.includes(prevNode.id);
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="bg-duo-blue rounded-3xl p-6 shadow-none border-b-8 border-duo-blue-dark flex items-center justify-between">
        <div>
          <h3 className="text-white font-black text-2xl uppercase tracking-wider flex items-center gap-2">
            <MapIcon className="w-6 h-6" /> MODO CAMPAÑA: ASIR
          </h3>
          <p className="text-white text-sm font-bold opacity-90">Completa el camino para obtener tu título de Administrador de Sistemas.</p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl border border-white/30 text-white font-bold text-sm">
          {completedIds.length} / {allNodes.length} Completado
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {units.map((unit, unitIdx) => (
          <div key={unitIdx} className="w-full flex flex-col items-center">
            {/* Unit Header */}
            <div className="w-full max-w-md bg-duo-green border-b-8 border-duo-green-dark p-6 rounded-[2rem] mb-10 relative overflow-hidden group">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">Módulo {unitIdx + 1}</p>
              <h4 className="text-white font-black text-xl uppercase leading-tight">{unit.subject}</h4>
            </div>

            {/* Nodes Path (ZigZag) */}
            <div className="relative flex flex-col items-center gap-10 w-full max-w-sm">
              {unit.nodes.map((node, nodeIdx) => {
                const completed = completedIds.includes(node.id);
                const unlocked = isUnlocked(node.id);
                
                // Calculate horizontal offset for zigzag
                const offsetPattern = [0, 40, 70, 40, 0, -40, -70, -40];
                const xOffset = offsetPattern[nodeIdx % offsetPattern.length];

                return (
                  <div 
                    key={node.id} 
                    className="relative transition-transform duration-500 hover:scale-105"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    <Link 
                      href={unlocked ? (node.type === "exam" ? `/exam/${node.id}` : `/lesson/${node.id}`) : "#"}
                      className={`
                        relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                        border-b-8 transition-all active:border-b-0 active:translate-y-2
                        ${completed 
                          ? "bg-duo-green border-duo-green-dark text-white shadow-none" 
                          : unlocked 
                            ? node.type === "exam"
                              ? "bg-duo-yellow border-[#c89b00] text-slate-900 scale-125 z-10 animate-pulse shadow-none"
                              : "bg-duo-blue border-duo-blue-dark text-white shadow-none"
                            : "bg-duo-gray border-duo-gray-dark text-duo-gray-dark grayscale cursor-not-allowed"}
                      `}
                    >
                      {completed ? (
                        <Check className="w-8 h-8 font-black" />
                      ) : node.type === "exam" ? (
                        <Trophy className="w-10 h-10" />
                      ) : (
                        <Star className={`w-8 h-8 ${unlocked ? "fill-current" : ""}`} />
                      )}
                    </Link>

                    {/* Connector line */}
                    {nodeIdx < unit.nodes.length - 1 && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-2 h-10 bg-duo-gray -z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator between units */}
            {unitIdx < units.length - 1 && (
              <div className="w-full flex flex-col items-center py-12">
                <div className="w-2 h-20 bg-duo-gray" />
                <div className="w-12 h-12 rounded-full bg-duo-gray border-b-4 border-duo-gray-dark flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-duo-gray-dark rotate-90" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Trophy */}
      <div className="flex flex-col items-center pt-10">
        <div className="w-24 h-24 bg-duo-yellow border-b-8 border-[#c89b00] rounded-full flex items-center justify-center">
          <GraduationCap className="w-14 h-14 text-white" />
        </div>
        <h5 className="mt-4 text-duo-foreground font-black text-xl uppercase tracking-widest text-center">
          TÍTULO DE ASIR <br/>
          <span className="text-duo-orange text-sm">PRÓXIMA META</span>
        </h5>
      </div>
    </div>
  );
}
