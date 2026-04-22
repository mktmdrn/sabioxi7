"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { Check, Star, Trophy, GraduationCap, TreePine, Cloud, Mountain, Ghost, Zap, Flame } from "lucide-react";

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
  completedIds,
  subjects
}: { 
  lessons: any[], 
  exams: any[], 
  completedIds: string[],
  subjects: string[]
}) {
  // Scroll to bottom on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const units = useMemo<Unit[]>(() => {
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
  }, [lessons, exams, subjects]);

  const allNodes = useMemo(() => units.flatMap(u => u.nodes), [units]);
  
  const isUnlocked = (nodeId: string) => {
    const idx = allNodes.findIndex(n => n.id === nodeId);
    if (idx === 0) return true;
    const prevNode = allNodes[idx - 1];
    return completedIds.includes(prevNode.id);
  };

  // We want to render from top to bottom (Final Trophy at top, Start at bottom)
  // But mapping units in original order (U1, U2...) would put U1 at top.
  // So we reverse the units array for rendering.
  const reversedUnits = useMemo(() => [...units].reverse(), [units]);

  return (
    <div className="relative w-full overflow-hidden bg-[#f7f7f7] min-h-screen font-sans pb-40">
      {/* Roman Stone Slabs Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none select-none blur-[0.5px]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h40v40H10zM60 10h50v20H60zM60 40h50v20H60zM10 60h40v50H10zM60 70h50v40H60z' fill='%234b4b4b' fill-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }} 
      />
      
      {/* Adventure Background Elements */}
      <div className="absolute top-20 left-10 text-duo-gray opacity-10 animate-pulse"><Cloud className="w-40 h-40" /></div>
      <div className="absolute bottom-40 right-10 text-duo-gray opacity-10"><Mountain className="w-60 h-60" /></div>
      <div className="absolute top-1/2 left-1/4 text-duo-green opacity-10"><TreePine className="w-20 h-20" /></div>

      <div className="flex flex-col items-center pt-20 relative z-20">
        
        {/* Final Trophy (Top) */}
        <div className="mt-20 mb-20 flex flex-col items-center">
          <div className="w-32 h-32 bg-duo-yellow border-b-8 border-[#c89b00] rounded-full flex items-center justify-center relative shadow-2xl">
            <GraduationCap className="w-20 h-20 text-white" />
            <div className="absolute -top-4 -right-4 bg-duo-red text-white p-2 rounded-xl rotate-12 font-black text-xs border-b-4 border-red-700 uppercase tracking-widest">Meta Final</div>
          </div>
          <h5 className="mt-6 text-duo-foreground font-black text-2xl uppercase tracking-widest text-center italic leading-tight">
            CERTIFICACIÓN COMPLETADA
          </h5>
        </div>

        {reversedUnits.map((unit, unitIdx) => (
          <div key={unit.subject} className="w-full flex flex-col items-center">
            
            {/* Unit Header */}
            <div className="w-full max-w-sm bg-white border-2 border-duo-gray border-b-8 p-6 rounded-[2.5rem] mb-12 relative group shadow-sm">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-duo-blue rounded-2xl flex items-center justify-center border-b-4 border-duo-blue-dark rotate-[-10deg]">
                <span className="text-white font-black">{units.length - unitIdx}</span>
              </div>
              <h4 className="text-duo-foreground font-black text-lg uppercase italic text-center px-4 leading-tight">{unit.subject}</h4>
            </div>

            {/* Nodes Path (ZigZag - Reversing nodes inside unit too) */}
            <div className="relative flex flex-col items-center gap-14 w-full max-w-sm mb-16">
              {[...unit.nodes].reverse().map((node, nodeIdx) => {
                const completed = completedIds.includes(node.id);
                const unlocked = isUnlocked(node.id);
                
                // Zigzag pattern
                const offsetPattern = [0, -50, -90, -50, 0, 50, 90, 50];
                const xOffset = offsetPattern[nodeIdx % offsetPattern.length];

                return (
                  <div 
                    key={node.id} 
                    className="relative group"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Decorative icons */}
                    {nodeIdx === 3 && (
                      <div className="absolute -left-20 top-0 text-duo-orange opacity-20"><Flame className="w-10 h-10" /></div>
                    )}

                    <Link 
                      href={unlocked ? (node.type === "exam" ? `/exam/${node.id}` : `/lesson/${node.id}`) : "#"}
                      className={`
                        relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                        border-b-[10px] transition-all active:border-b-0 active:translate-y-2 z-30
                        ${completed 
                          ? "bg-duo-green border-duo-green-dark text-white shadow-lg" 
                          : unlocked 
                            ? node.type === "exam"
                              ? "bg-duo-yellow border-[#c89b00] text-slate-900 scale-110 z-40 shadow-xl animate-pulse"
                              : "bg-duo-blue border-duo-blue-dark text-white shadow-lg"
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

                      {/* Tooltip */}
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-gray px-4 py-2 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl translate-y-2 group-hover:translate-y-0">
                         {node.type === "exam" ? "¡EXAMEN FINAL!" : node.title.split(': ')[1] || "Lección"}
                      </div>
                    </Link>

                    {/* Connector line (points DOWN to the NEXT node in flow) */}
                    {nodeIdx < unit.nodes.length - 1 && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-3 h-14 bg-duo-gray -z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            {unitIdx < units.length - 1 && (
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-3 h-20 bg-duo-gray" />
              </div>
            )}
          </div>
        ))}

        {/* Start Point (Bottom) */}
        <div className="mt-20 mb-40 flex flex-col items-center">
          <div className="w-20 h-20 bg-duo-green border-b-8 border-duo-green-dark rounded-3xl flex items-center justify-center animate-bounce shadow-lg">
             <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <p className="mt-4 font-black text-duo-green uppercase text-xs tracking-[0.3em]">Comienza Aquí</p>
        </div>
      </div>
    </div>
  );
}
