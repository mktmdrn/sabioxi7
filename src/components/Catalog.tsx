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
  ASIR: { label: "Administración de Sistemas Informáticos en Red", color: "text-duo-blue", border: "border-duo-blue", bg: "bg-duo-blue/10" },
  DAW: { label: "Desarrollo de Aplicaciones Web", color: "text-duo-green", border: "border-duo-green", bg: "bg-duo-green/10" },
  DAM: { label: "Desarrollo de Aplicaciones Multiplataforma", color: "text-duo-yellow", border: "border-duo-yellow", bg: "bg-duo-yellow/10" },
  Otros: { label: "Lecciones sin categoría", color: "text-duo-gray-dark", border: "border-duo-gray", bg: "bg-duo-gray/10" },
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
      <h3 className="text-xl font-black text-duo-foreground flex items-center gap-2 uppercase italic tracking-tight">
        <Icon className="w-6 h-6 text-duo-blue" />
        {title}
      </h3>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Filter */}
        <div className="flex-1 relative">
          <label className="block text-xs font-black text-duo-gray-dark uppercase tracking-wider mb-1.5 ml-1">Curso</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubject(""); }}
              className="w-full appearance-none bg-white border-2 border-duo-gray text-duo-foreground rounded-2xl px-4 py-3 pr-10 font-black text-sm focus:outline-none focus:border-duo-blue transition-all cursor-pointer hover:bg-[#f7f7f7]"
            >
              <option value="">— Selecciona un curso —</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} — {(CATEGORY_META[cat] || CATEGORY_META["Otros"]).label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-duo-gray-dark pointer-events-none" />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex-1 relative">
          <label className="block text-xs font-black text-duo-gray-dark uppercase tracking-wider mb-1.5 ml-1">Asignatura</label>
          <div className="relative">
            <select
              value={effectiveSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedCategory || subjects.length <= 1}
              className="w-full appearance-none bg-white border-2 border-duo-gray text-duo-foreground rounded-2xl px-4 py-3 pr-10 font-black text-sm focus:outline-none focus:border-duo-blue transition-all cursor-pointer hover:bg-[#f7f7f7] disabled:opacity-50 disabled:cursor-not-allowed"
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-duo-gray-dark pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Selected info badge */}
      {selectedCategory && effectiveSubject && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-duo-blue bg-duo-blue/5">
          <BookOpen className="w-5 h-5 text-duo-blue" />
          <div>
            <span className="font-black text-sm text-duo-blue">{selectedCategory}</span>
            <span className="text-duo-gray-dark mx-2">›</span>
            <span className="text-duo-foreground font-black text-sm">{effectiveSubject}</span>
          </div>
          <span className="ml-auto text-xs font-black text-duo-gray-dark bg-white border border-duo-gray px-2.5 py-1 rounded-lg">
            {filteredLessons.length} {filteredLessons[0].type === "exam" ? "exámenes" : "temas"}
          </span>
        </div>
      )}

      {/* Lessons List */}
      {!selectedCategory && (
        <div className="bg-white border-2 border-dashed border-duo-gray rounded-3xl p-10 text-center">
          <ListChecks className="w-12 h-12 text-duo-gray-dark mx-auto mb-4" />
          <p className="text-duo-gray-dark font-black">Selecciona un curso y asignatura para ver las opciones disponibles.</p>
        </div>
      )}

      {filteredLessons.length > 0 && (
        <div className="space-y-3">
          {filteredLessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-4 border-2 p-4 rounded-[2rem] transition-all group border-b-8 ${lesson.type === "exam" ? "bg-duo-yellow/10 border-duo-yellow" : "bg-white border-duo-gray hover:bg-[#f7f7f7]"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors shrink-0 text-sm ${lesson.type === "exam" ? "bg-duo-yellow text-white" : "bg-duo-blue text-white"}`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black text-duo-foreground text-sm line-clamp-2 uppercase leading-tight mb-0.5" title={lesson.cleanTitle}>
                  {lesson.cleanTitle}
                </h5>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-duo-gray-dark text-[10px] font-black uppercase">{lesson.questions.length} preguntas</p>
                  {lesson.durationMinutes && (
                    <p className="text-duo-orange text-[10px] font-black uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {lesson.durationMinutes} min
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/${lesson.type === "exam" ? "exam" : "lesson"}/${lesson.id}`}
                className={`${lesson.type === "exam" ? "bg-duo-yellow border-[#c89b00]" : "bg-duo-blue border-duo-blue-dark"} text-white px-6 py-2.5 rounded-2xl transition-all shadow-none border-b-4 active:border-b-0 active:translate-y-1 flex items-center gap-2 font-black text-sm shrink-0`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{lesson.type === "exam" ? "EMPEZAR" : "JUGAR"}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
