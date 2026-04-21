import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLessonById } from "@/actions/db";
import LessonClient from "../LessonClient";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function LessonPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // En Next.js 15+, params es una promesa
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Lección no encontrada</h1>
          <p className="text-slate-400">La lección que buscas no existe o ha sido eliminada.</p>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/dashboard" className="bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-xl hover:bg-slate-700 transition-colors">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LessonClient lesson={lesson} userId={session.user.id} />;
}
