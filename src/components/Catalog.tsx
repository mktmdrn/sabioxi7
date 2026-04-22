"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Play, GraduationCap, BookOpen, ChevronDown, ListChecks, Clock, Timer } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  questions: any[];
  type?: string;
  durationMinutes?: number;
};

type ParsedLesson = Lesson & {
  category: string;
  subject: string;
  cleanTitle: string;
};

const CATEGORY_META: Record<string, { label: string; color: string; border: string; bg: string }> = {
  ASIR: { label: "Administración de Sistemas Informáticos en Red", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  DAW: { label: "Desarrollo de Aplicaciones Web", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  DAM: { label: "Desarrollo de Aplicaciones Multiplataforma", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  Otros: { label: "Lecciones sin categoría", color: "text-slate-400", border: "border-slate-500/30", bg: "bg-slate-500/10" },
};

const ICONS = {
  graduation: GraduationCap,
  timer: Timer,
};

export default function Catalog({ lessons, title = "Catálogo de Cursos", iconType = "graduation" }: { lessons: Lesson[], title?: string, iconType?: "graduation" | "timer" }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const Icon = ICONS[iconType] || GraduationCap;

  const parsedLessons = useMemo<ParsedLesson[]>(() => {
    return lessons.map(lesson => {
      const title = lesson.title || "";
      // For exams, title is "[EXAMEN FINAL] Subject"
      if (lesson.type === "exam") {
        return { 
          ...lesson, 
          category: "ASIR", // Default to ASIR for now as requested
          subject: title.replace("[EXAMEN FINAL] ", ""), 
          cleanTitle: "Examen de Certificación" 
        };
      }

      const match = title.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
      if (match) {
        return { ...lesson, category: match[1], subject: match[2], cleanTitle: match[3] };
      }
      return { ...lesson, category: "Otros", subject: "Sin Asignar", cleanTitle: title };
    });
  }, [lessons]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    parsedLessons.forEach(l => cats.add(l.category));
    return Array.from(cats);
  }, [parsedLessons]);

  const subjects = useMemo(() => {
    if (!selectedCategory) return [];
    const subs = new Set<string>();
    parsedLessons.filter(l => l.category === selectedCategory).forEach(l => subs.add(l.subject));
    return Array.from(subs);
  }, [parsedLessons, selectedCategory]);

  // Auto-select subject if only one exists
  const effectiveSubject = useMemo(() => {
    if (selectedSubject) return selectedSubject;
    if (subjects.length === 1) return subjects[0];
    return "";
  }, [selectedSubject, subjects]);

  const filteredLessons = useMemo(() => {
    if (!selectedCategory || !effectiveSubject) return [];
    return parsedLessons.filter(l => l.category === selectedCategory && l.subject === effectiveSubject);
  }, [parsedLessons, selectedCategory, effectiveSubject]);

  const catMeta = CATEGORY_META[selectedCategory] || CATEGORY_META["Otros"];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Icon className="w-6 h-6 text-indigo-400" />
        {title}
      </h3>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Filter */}
        <div className="flex-1 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Curso</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubject(""); }}
              className="w-full appearance-none bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 pr-10 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-600"
            >
              <option value="">— Selecciona un curso —</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} — {(CATEGORY_META[cat] || CATEGORY_META["Otros"]).label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex-1 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Asignatura</label>
          <div className="relative">
            <select
              value={effectiveSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedCategory || subjects.length <= 1}
              className="w-full appearance-none bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 pr-10 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!selectedCategory ? (
                <option value="">— Primero selecciona un curso —</option>
              ) : subjects.length === 0 ? (
                <option value="">— Sin asignaturas —</option>
              ) : subjects.length === 1 ? (
                <option value={subjects[0]}>{subjects[0]}</option>
              ) : (
                <>
                  <option value="">— Selecciona una asignatura —</option>
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Selected info badge */}
      {selectedCategory && effectiveSubject && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${catMeta.border} ${catMeta.bg}`}>
          <BookOpen className={`w-5 h-5 ${catMeta.color}`} />
          <div>
            <span className={`font-bold text-sm ${catMeta.color}`}>{selectedCategory}</span>
            <span className="text-slate-500 mx-2">›</span>
            <span className="text-white font-medium text-sm">{effectiveSubject}</span>
          </div>
          <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">
            {filteredLessons.length} {filteredLessons[0].type === "exam" ? "exámenes" : "temas"}
          </span>
        </div>
      )}

      {/* Lessons List */}
      {!selectedCategory && (
        <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
          <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Selecciona un curso y asignatura para ver las opciones disponibles.</p>
        </div>
      )}

      {selectedCategory && !effectiveSubject && subjects.length > 1 && (
        <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Selecciona una asignatura para continuar.</p>
        </div>
      )}

      {filteredLessons.length > 0 && (
        <div className="space-y-2">
          {filteredLessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-4 border p-4 rounded-2xl transition-all group ${lesson.type === "exam" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors shrink-0 text-sm ${lesson.type === "exam" ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10"}`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-white text-sm truncate" title={lesson.cleanTitle}>
                  {lesson.cleanTitle}
                </h5>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-slate-500 text-xs">{lesson.questions.length} preguntas</p>
                  {lesson.durationMinutes && (
                    <p className="text-amber-500/80 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {lesson.durationMinutes} min
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/${lesson.type === "exam" ? "exam" : "lesson"}/${lesson.id}`}
                className={`${lesson.type === "exam" ? "bg-amber-500 hover:bg-amber-400 text-slate-900" : "bg-indigo-600 hover:bg-indigo-500 text-white"} px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 font-bold text-sm shrink-0`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{lesson.type === "exam" ? "Empezar Examen" : "Jugar"}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
