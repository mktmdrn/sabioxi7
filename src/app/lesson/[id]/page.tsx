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
  const decodedId = decodeURIComponent(id);
  
  const lesson = await getLessonById(decodedId);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-white border-2 border-duo-gray border-b-8 p-10 rounded-[2.5rem] space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-duo-red/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-duo-red/20">
            <AlertCircle className="w-12 h-12 text-duo-red" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-duo-foreground uppercase italic tracking-tight">LECCIÓN NO ENCONTRADA</h1>
            <p className="text-duo-gray-dark font-bold mt-2">La lección que buscas parece haberse perdido en el ciberespacio.</p>
          </div>
          <div className="pt-4">
            <Link 
              href="/dashboard" 
              className="block w-full bg-duo-blue text-white border-b-8 border-duo-blue-dark active:border-b-0 active:translate-y-2 py-4 px-8 rounded-2xl font-black uppercase tracking-widest transition-all hover:brightness-110"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LessonClient lesson={lesson} userId={session.user.id} />;
}
