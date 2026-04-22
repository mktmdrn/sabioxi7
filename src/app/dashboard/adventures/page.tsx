"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  getAdventures, 
  getAdventureDetail, 
  upsertAdventure, 
  deleteAdventure, 
  saveMilestones,
  getLessons,
  Adventure,
  Milestone,
  MilestoneNode
} from "@/actions/db";
import { 
  Map, Plus, Trash2, Edit3, Save, X, ChevronLeft, 
  GripVertical, BookOpen, Trophy, Loader2, PlayCircle,
  Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

export default function AdventuresAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit">("list");
  
  // Editor State
  const [currentAdventure, setCurrentAdventure] = useState<Partial<Adventure> | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [advs, allLessons, allExams] = await Promise.all([
        getAdventures(),
        getLessons("lesson"),
        getLessons("exam")
      ]);
      setAdventures(advs);
      setLessons(allLessons);
      setExams(allExams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setCurrentAdventure({ name: "", description: "", is_published: false });
    setMilestones([]);
    setView("edit");
  };

  const handleEdit = async (adv: Adventure) => {
    setLoading(true);
    try {
      const detail = await getAdventureDetail(adv.id);
      setCurrentAdventure(detail);
      setMilestones(detail.milestones);
      setView("edit");
    } catch (err) {
      alert("Error al cargar detalle");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentAdventure?.name) return alert("El nombre es obligatorio");
    setIsSaving(true);
    try {
      const savedAdv = await upsertAdventure(currentAdventure);
      await saveMilestones(savedAdv.id, milestones);
      await fetchData();
      setView("list");
    } catch (err) {
      alert("Error al guardar aventura");
    } finally {
      setIsSaving(false);
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID
      adventure_id: currentAdventure?.id || "",
      name: `Hito ${milestones.length + 1}`,
      order: milestones.length,
      nodes: []
    };
    setMilestones([...milestones, newMilestone]);
  };

  const addNodeToMilestone = (milestoneId: string, nodeId: string, type: "lesson" | "exam") => {
    const title = type === "lesson" 
      ? lessons.find(l => l.id === nodeId)?.title 
      : exams.find(e => e.id === nodeId)?.title;

    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          nodes: [...(m.nodes || []), {
            id: Math.random().toString(36).substr(2, 9),
            milestone_id: m.id,
            node_id: nodeId,
            type,
            order: (m.nodes || []).length,
            title
          }]
        };
      }
      return m;
    }));
  };

  const removeNode = (milestoneId: string, nodeId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          nodes: (m.nodes || []).filter(n => n.node_id !== nodeId)
        };
      }
      return m;
    }));
  };

  if (loading && view === "list") {
    return <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center font-black text-duo-blue uppercase tracking-widest animate-pulse">Cargando Aventuras...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground p-6 md:p-10 font-sans selection:bg-duo-blue/30">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-duo-yellow rounded-[1.25rem] flex items-center justify-center border-b-8 border-[#c89b00] shadow-lg">
              <Map className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-duo-foreground uppercase italic tracking-tighter leading-none">
                GESTIÓN DE AVENTURAS
              </h1>
              <p className="text-duo-yellow font-black text-xs uppercase tracking-[0.2em] mt-1 text-shadow-sm">Crea mundos de aprendizaje</p>
            </div>
          </div>
          <div className="flex gap-4">
            {view === "list" ? (
              <button 
                onClick={handleCreateNew}
                className="bg-duo-green text-white border-b-8 border-duo-green-dark px-8 py-4 rounded-2xl font-black text-xl uppercase italic tracking-tighter hover:brightness-110 active:translate-y-2 transition-all flex items-center gap-3 shadow-lg shadow-duo-green/20"
              >
                <Plus className="w-6 h-6" /> Nueva Aventura
              </button>
            ) : (
              <button 
                onClick={() => setView("list")}
                className="bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </header>

        {view === "list" ? (
          <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#f7f7f7] border-b-2 border-duo-gray">
                <tr className="text-[10px] uppercase font-black text-duo-gray-dark tracking-widest">
                  <th className="px-8 py-5">Nombre / Descripción</th>
                  <th className="px-8 py-5 text-center">Estado</th>
                  <th className="px-8 py-5 text-center">Hitos</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-duo-gray">
                {adventures.map(adv => (
                  <tr key={adv.id} className="hover:bg-[#f7f7f7]/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-duo-foreground uppercase italic text-lg">{adv.name}</span>
                        <span className="text-sm text-duo-gray-dark line-clamp-1">{adv.description || "Sin descripción"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {adv.is_published ? (
                        <span className="bg-duo-green/10 text-duo-green px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-duo-green/20">Publicada</span>
                      ) : (
                        <span className="bg-duo-gray/20 text-duo-gray-dark px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-duo-gray/30">Borrador</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center font-black text-duo-blue text-lg">
                       —
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(adv)}
                        className="p-3 bg-white border-2 border-duo-gray border-b-4 rounded-xl text-duo-blue hover:bg-duo-blue hover:text-white transition-all active:translate-y-1 active:border-b-0"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("¿Borrar aventura?")) {
                            await deleteAdventure(adv.id);
                            fetchData();
                          }
                        }}
                        className="p-3 bg-white border-2 border-duo-gray border-b-4 rounded-xl text-duo-red hover:bg-duo-red hover:text-white transition-all active:translate-y-1 active:border-b-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {adventures.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center font-black text-duo-gray-dark uppercase tracking-widest opacity-30 italic text-xl">
                      No hay aventuras creadas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Editor Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 space-y-6 shadow-sm sticky top-10">
                <h2 className="text-xl font-black uppercase italic tracking-tight text-duo-blue flex items-center gap-2">
                  <Edit3 className="w-5 h-5" /> Ajustes Básicos
                </h2>
                
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-duo-gray-dark mb-2 ml-1">Nombre</label>
                    <input 
                      type="text" 
                      value={currentAdventure?.name || ""}
                      onChange={(e) => setCurrentAdventure({...currentAdventure!, name: e.target.value})}
                      placeholder="Ej: Aventura ASIR"
                      className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-2xl px-5 py-4 text-duo-foreground font-black uppercase italic tracking-tight focus:outline-none focus:border-duo-blue transition-all"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-duo-gray-dark mb-2 ml-1">Descripción</label>
                    <textarea 
                      value={currentAdventure?.description || ""}
                      onChange={(e) => setCurrentAdventure({...currentAdventure!, description: e.target.value})}
                      placeholder="Describe el objetivo..."
                      className="w-full bg-[#f7f7f7] border-2 border-duo-gray border-b-4 rounded-2xl px-5 py-4 text-duo-foreground font-bold focus:outline-none focus:border-duo-blue transition-all h-32 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-duo-blue/5 rounded-2xl border-2 border-duo-blue/10">
                    <span className="font-black uppercase italic text-xs text-duo-blue">¿Publicada?</span>
                    <button 
                      onClick={() => setCurrentAdventure({...currentAdventure!, is_published: !currentAdventure?.is_published})}
                      className={`w-12 h-6 rounded-full transition-all relative ${currentAdventure?.is_published ? "bg-duo-green" : "bg-duo-gray"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentAdventure?.is_published ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-duo-blue text-white border-b-8 border-duo-blue-dark py-5 rounded-2xl font-black text-2xl uppercase italic tracking-tighter hover:brightness-110 active:translate-y-2 transition-all flex items-center justify-center gap-3 shadow-lg shadow-duo-blue/20"
                >
                  {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8" />}
                  GUARDAR AVENTURA
                </button>
              </div>
            </div>

            {/* Milestones Editor */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-duo-foreground flex items-center gap-3">
                  <div className="w-2 h-8 bg-duo-yellow rounded-full" />
                  Hitos y Contenido
                </h2>
                <button 
                  onClick={addMilestone}
                  className="bg-white border-2 border-duo-gray border-b-4 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest text-duo-blue flex items-center gap-2 hover:bg-duo-blue hover:text-white transition-all active:translate-y-1 active:border-b-0"
                >
                  <Plus className="w-4 h-4" /> Añadir Hito
                </button>
              </div>

              <div className="space-y-6">
                {milestones.map((milestone, mIdx) => (
                  <div key={milestone.id} className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 shadow-sm animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between gap-6 mb-8 pb-4 border-b-2 border-duo-gray/30">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-duo-blue/10 rounded-xl flex items-center justify-center font-black text-duo-blue border-2 border-duo-blue/20">
                          {mIdx + 1}
                        </div>
                        <input 
                          type="text" 
                          value={milestone.name}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[mIdx].name = e.target.value;
                            setMilestones(newMilestones);
                          }}
                          className="flex-1 bg-transparent font-black uppercase italic text-2xl tracking-tighter text-duo-foreground focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => setMilestones(milestones.filter((_, i) => i !== mIdx))}
                        className="text-duo-red hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {milestone.nodes?.map((node, nIdx) => (
                        <div key={nIdx} className="flex items-center justify-between bg-[#f7f7f7] border-2 border-duo-gray/50 rounded-2xl px-5 py-4 group">
                          <div className="flex items-center gap-4">
                             {node.type === "exam" ? (
                               <Trophy className="w-5 h-5 text-duo-yellow" />
                             ) : (
                               <BookOpen className="w-5 h-5 text-duo-blue" />
                             )}
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase tracking-widest text-duo-gray-dark">{node.type}</span>
                               <span className="font-bold text-sm text-duo-foreground">{node.title}</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => removeNode(milestone.id, node.node_id)}
                            className="opacity-0 group-hover:opacity-100 text-duo-red transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-duo-gray-dark ml-2">Añadir Lección</label>
                           <select 
                             className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-duo-blue"
                             onChange={(e) => e.target.value && addNodeToMilestone(milestone.id, e.target.value, "lesson")}
                             value=""
                           >
                             <option value="">— Elegir lección —</option>
                             {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-duo-gray-dark ml-2">Añadir Examen</label>
                           <select 
                             className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-duo-blue"
                             onChange={(e) => e.target.value && addNodeToMilestone(milestone.id, e.target.value, "exam")}
                             value=""
                           >
                             <option value="">— Elegir examen —</option>
                             {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                           </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-duo-gray rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4">
                     <div className="w-16 h-16 bg-duo-gray/20 rounded-full flex items-center justify-center text-duo-gray-dark">
                        <Map className="w-8 h-8" />
                     </div>
                     <p className="font-black uppercase text-duo-gray-dark tracking-widest opacity-50">Crea tu primer hito para empezar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
