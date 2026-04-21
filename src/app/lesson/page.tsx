import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLessons } from "@/actions/db";
import LessonClient from "./LessonClient";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function LessonPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const lessons = await getLessons();

  if (!lessons || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">No hay lecciones</h1>
          <p className="text-slate-400">Aún no se ha creado ninguna lección. Ve al generador para crear la primera.</p>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/generator" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-500 transition-colors">
              Ir al Generador
            </Link>
            <Link href="/dashboard" className="bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-slate-700 transition-colors">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pick the latest lesson for now
  const latestLesson = lessons[lessons.length - 1];

  return <LessonClient lesson={latestLesson} userId={session.user.id} />;
}
