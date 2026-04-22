"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Play, Folder, ChevronRight, BookOpen, GraduationCap } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  questions: any[];
};

type ParsedLesson = Lesson & {
  category: string;
  subject: string;
  cleanTitle: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  ASIR: "from-blue-600 to-indigo-600",
  DAW: "from-emerald-500 to-teal-600",
  DAM: "from-amber-500 to-orange-600",
  Otros: "from-slate-600 to-slate-800"
};

export default function Catalog({ lessons }: { lessons: Lesson[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const parsedLessons = useMemo<ParsedLesson[]>(() => {
    return lessons.map(lesson => {
      // Regex to match "[Category] [Subject] Title"
      const match = lesson.title.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
      if (match) {
        return {
          ...lesson,
          category: match[1],
          subject: match[2],
          cleanTitle: match[3]
        };
      }
      return {
        ...lesson,
        category: "Otros",
        subject: "Sin Asignar",
        cleanTitle: lesson.title
      };
    });
  }, [lessons]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    // Always show the 3 main ones even if empty, to look like a real catalog
    cats.add("ASIR");
    cats.add("DAW");
    cats.add("DAM");
    
    parsedLessons.forEach(l => cats.add(l.category));
    return Array.from(cats);
  }, [parsedLessons]);

  const subjectsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const subs = new Set<string>();
    parsedLessons
      .filter(l => l.category === selectedCategory)
      .forEach(l => subs.add(l.subject));
    return Array.from(subs);
  }, [parsedLessons, selectedCategory]);

  const lessonsForSubject = useMemo(() => {
    if (!selectedCategory || !selectedSubject) return [];
    return parsedLessons.filter(l => l.category === selectedCategory && l.subject === selectedSubject);
  }, [parsedLessons, selectedCategory, selectedSubject]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-indigo-400" />
        Catálogo de Cursos
      </h3>

      {/* Breadcrumb / Navigation */}
      <div className="flex items-center gap-2 text-sm font-medium bg-slate-900 border border-slate-800 p-3 rounded-2xl overflow-x-auto">
        <button 
          onClick={() => { setSelectedCategory(null); setSelectedSubject(null); }}
          className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${!selectedCategory ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
        >
          <Folder className="w-4 h-4" /> Grados
        </button>
        
        {selectedCategory && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            <button 
              onClick={() => setSelectedSubject(null)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${!selectedSubject ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
            >
              <BookOpen className="w-4 h-4" /> {selectedCategory}
            </button>
          </>
        )}

        {selectedSubject && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Play className="w-4 h-4" /> {selectedSubject}
            </span>
          </>
        )}
      </div>

      {/* STEP 1: Categories */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const count = parsedLessons.filter(l => l.category === cat).length;
            const bgGradient = CATEGORY_COLORS[cat] || "from-slate-700 to-slate-900";
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative overflow-hidden text-left p-6 rounded-3xl border border-slate-700 hover:border-slate-500 transition-all group shadow-lg bg-gradient-to-br ${bgGradient}`}
              >
                <div className="relative z-10">
                  <h4 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{cat}</h4>
                  <p className="text-white/80 text-sm font-medium">{count} lecciones disponibles</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-20 group-hover:scale-110 transition-transform origin-bottom-right">
                  <Folder className="w-32 h-32 -mb-8 -mr-8" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* STEP 2: Subjects */}
      {selectedCategory && !selectedSubject && (
        <div>
          {subjectsForCategory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
              <p className="text-slate-400">Aún no hay asignaturas en este grado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectsForCategory.map(sub => {
                const count = parsedLessons.filter(l => l.category === selectedCategory && l.subject === sub).length;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{sub}</h4>
                        <p className="text-slate-500 text-sm">{count} lecciones</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Lessons */}
      {selectedCategory && selectedSubject && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h4 className="text-xl font-bold text-white">{selectedSubject}</h4>
              <p className="text-slate-400 text-sm">{lessonsForSubject.length} temas disponibles</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lessonsForSubject.map((lesson, idx) => (
              <div key={lesson.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm line-clamp-1" title={lesson.cleanTitle}>
                      {lesson.cleanTitle}
                    </h5>
                    <p className="text-slate-500 text-xs mt-1">{lesson.questions.length} preguntas</p>
                  </div>
                </div>
                
                <Link 
                  href={`/lesson/${lesson.id}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                  title="Jugar lección"
                >
                  <Play className="w-4 h-4 fill-current" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
