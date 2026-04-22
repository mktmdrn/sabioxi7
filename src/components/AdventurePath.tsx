"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { Check, Star, Trophy, GraduationCap, TreePine, Cloud, Mountain, Ghost, Zap, Flame } from "lucide-react";
import { Milestone } from "@/actions/db";

export default function AdventurePath({ 
  adventureName,
  milestones, 
  completedIds
}: { 
  adventureName: string,
  milestones: Milestone[], 
  completedIds: string[]
}) {
  // Scroll to bottom on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Prepare all nodes in a single flat list for unlock logic
  const allNodes = useMemo(() => {
    return milestones.flatMap(m => m.nodes || []);
  }, [milestones]);
  
  const isUnlocked = (nodeId: string) => {
    const idx = allNodes.findIndex(n => n.node_id === nodeId);
    if (idx === 0) return true;
    const prevNode = allNodes[idx - 1];
    return completedIds.includes(prevNode.node_id);
  };

  // Render from top to bottom (Meta at top, Start at bottom)
  const reversedMilestones = useMemo(() => [...milestones].reverse(), [milestones]);

  return (
    <div className="relative w-full overflow-hidden bg-[#f7f7f7] min-h-screen font-sans pb-40">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none select-none blur-[0.5px]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h40v40H10zM60 10h50v20H60zM60 40h50v20H60zM10 60h40v50H10zM60 70h50v40H60z' fill='%234b4b4b' fill-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px"
        }} 
      />
      
      {/* Background Elements */}
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
             AVENTURA COMPLETADA
          </h5>
        </div>

        {reversedMilestones.map((milestone, mIdx) => (
          <div key={milestone.id} className="w-full flex flex-col items-center">
            
            {/* Milestone Header */}
            <div className="w-full max-w-sm bg-white border-2 border-duo-gray border-b-8 p-6 rounded-[2.5rem] mb-12 relative group shadow-sm">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-duo-blue rounded-2xl flex items-center justify-center border-b-4 border-duo-blue-dark rotate-[-10deg]">
                <span className="text-white font-black">{milestones.length - mIdx}</span>
              </div>
              <h4 className="text-duo-foreground font-black text-lg uppercase italic text-center px-4 leading-tight">{milestone.name}</h4>
            </div>

            {/* Nodes Path */}
            <div className="relative flex flex-col items-center gap-14 w-full max-w-sm mb-16">
              {[...(milestone.nodes || [])].reverse().map((node, nodeIdx) => {
                const completed = completedIds.includes(node.node_id);
                const unlocked = isUnlocked(node.node_id);
                
                // Zigzag pattern
                const offsetPattern = [0, -50, -90, -50, 0, 50, 90, 50];
                const xOffset = offsetPattern[nodeIdx % offsetPattern.length];

                return (
                  <div 
                    key={node.id} 
                    className="relative group"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Node Info Text (Side) */}
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-48 hidden sm:block ${xOffset > 0 ? "-left-56 text-right" : "-right-56 text-left"}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-duo-gray-dark tracking-widest uppercase">
                          {node.type === "exam" ? "Desafío Final" : "Lección"}
                        </span>
                        <span className="text-sm font-bold text-duo-foreground leading-tight">
                          {node.title?.split('] ').pop() || "Cargando..."}
                        </span>
                      </div>
                    </div>

                    <Link 
                      href={unlocked ? (node.type === "exam" ? `/exam/${node.node_id}` : `/lesson/${node.node_id}`) : "#"}
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

                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white border-2 border-duo-gray px-4 py-2 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl translate-y-2 group-hover:translate-y-0">
                         {node.type === "exam" ? "¡EXAMEN FINAL!" : "ENTRAR"}
                      </div>
                    </Link>

                    {nodeIdx < (milestone.nodes?.length || 0) - 1 && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-3 h-14 bg-duo-gray -z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator / Level Up */}
            {mIdx < milestones.length - 1 && (
              <div className="w-full flex flex-col items-center py-10 relative">
                <div className="w-3 h-24 bg-duo-gray" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-duo-yellow px-6 py-2 rounded-2xl border-b-4 border-[#c89b00] shadow-[0_0_20px_rgba(255,191,0,0.5)] animate-pulse">
                    <span className="text-white font-black text-xl italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">¡SIGUIENTE NIVEL!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
