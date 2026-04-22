"use client";

import { useState, useMemo } from "react";
import { CourseStat, deleteLessons } from "@/actions/db";
import { Search, Filter, ArrowUpDown, CheckCircle, XCircle, PlayCircle, BookOpen, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CoursesClient({ stats }: { stats: CourseStat[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const courses = useMemo(() => Array.from(new Set(stats.map(s => s.course))), [stats]);
  const subjects = useMemo(() => {
    const filtered = courseFilter === "all" ? stats : stats.filter(s => s.course === courseFilter);
    return Array.from(new Set(filtered.map(s => s.subject)));
  }, [stats, courseFilter]);

  const filteredStats = useMemo(() => {
    return stats.filter(s => {
      const matchesSearch = s.lessonTitle.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "all" || s.course === courseFilter;
      const matchesSubject = subjectFilter === "all" || s.subject === subjectFilter;
      return matchesSearch && matchesCourse && matchesSubject;
    });
  }, [stats, search, courseFilter, subjectFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStats.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} lecciones seleccionadas? Esta acción no se puede deshacer.`)) return;

    setIsDeleting(true);
    try {
      await deleteLessons(selectedIds);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      console.error("Error deleting lessons:", error);
      alert("Hubo un error al eliminar las lecciones.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-duo-foreground uppercase italic tracking-tight mb-4 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-duo-green" />
              Estadísticas de Cursos
            </h1>
            <p className="text-duo-gray-dark font-bold text-lg max-w-2xl">
              Analiza el rendimiento global de los contenidos. Filtra por curso o asignatura para ver los detalles de intentos y aprobados.
            </p>
          </div>
          
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-duo-red text-white border-b-8 border-[#d33131] active:border-b-0 active:translate-y-2 px-8 py-4 rounded-2xl font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
              ELIMINAR ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-duo-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-2 border-duo-gray border-b-8 rounded-3xl p-6 flex flex-col lg:flex-row gap-6 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-duo-gray-dark w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar lección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl pl-12 pr-4 py-3.5 font-bold focus:outline-none focus:border-duo-blue transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3 flex-1 lg:flex-none">
            <Filter className="w-5 h-5 text-duo-gray-dark" />
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setSubjectFilter("all");
                setSelectedIds([]);
              }}
              className="bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl px-4 py-3.5 font-bold focus:outline-none focus:border-duo-blue transition-all min-w-[150px] cursor-pointer"
            >
              <option value="all">Todos los Cursos</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 flex-1 lg:flex-none">
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setSelectedIds([]);
              }}
              className="bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl px-4 py-3.5 font-bold focus:outline-none focus:border-duo-blue transition-all min-w-[150px] cursor-pointer"
            >
              <option value="all">Todas las Asignaturas</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] border-b-2 border-duo-gray">
                <th className="px-6 py-5 w-12">
                  <input 
                    type="checkbox"
                    checked={filteredStats.length > 0 && selectedIds.length === filteredStats.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-duo-gray text-duo-blue focus:ring-duo-blue cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Curso / Asignatura</th>
                <th className="px-6 py-5 text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Lección / Examen</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Intentos</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Aprobados</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Fallados</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Ratio Éxito</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-duo-gray/30">
              {filteredStats.length > 0 ? filteredStats.map((stat, i) => {
                const ratio = stat.attempts > 0 ? (stat.passed / stat.attempts) * 100 : 0;
                const isSelected = selectedIds.includes(stat.id);
                return (
                  <tr key={i} className={`hover:bg-duo-gray/5 transition-colors group ${isSelected ? "bg-duo-blue/5" : ""}`}>
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(stat.id)}
                        className="w-5 h-5 rounded border-2 border-duo-gray text-duo-blue focus:ring-duo-blue cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-duo-blue uppercase tracking-tighter mb-1">{stat.course}</span>
                        <span className="text-sm font-black text-duo-foreground">{stat.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-duo-gray-dark group-hover:text-duo-foreground transition-colors">{stat.lessonTitle}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-duo-gray/10 px-3 py-1.5 rounded-xl border border-duo-gray/20">
                        <PlayCircle className="w-4 h-4 text-duo-gray-dark" />
                        <span className="text-sm font-black">{stat.attempts}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-duo-green/10 px-3 py-1.5 rounded-xl border border-duo-green/20">
                        <CheckCircle className="w-4 h-4 text-duo-green" />
                        <span className="text-sm font-black text-duo-green">{stat.passed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-duo-red/10 px-3 py-1.5 rounded-xl border border-duo-red/20">
                        <XCircle className="w-4 h-4 text-duo-red" />
                        <span className="text-sm font-black text-duo-red">{stat.failed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-sm font-black ${ratio >= 70 ? "text-duo-green" : ratio >= 40 ? "text-duo-yellow" : "text-duo-red"}`}>
                          {ratio.toFixed(1)}%
                        </span>
                        <div className="w-20 h-1.5 bg-duo-gray/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${ratio >= 70 ? "bg-duo-green" : ratio >= 40 ? "bg-duo-yellow" : "bg-duo-red"}`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-duo-gray-dark font-bold italic">
                    No se han encontrado lecciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
