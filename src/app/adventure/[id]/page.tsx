import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getAdventureDetail, getCompletedLessons } from "@/actions/db";
import AdventurePath from "@/components/AdventurePath";
import { ChevronLeft, Map as MapIcon } from "lucide-react";
import Link from "next/link";

export default async function AdventurePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  let adventure;
  try {
    adventure = await getAdventureDetail(id);
  } catch (err) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!session) {
    redirect("/login");
  }

  const completedIds = userId ? await getCompletedLessons(userId) : [];

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-duo-gray p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-sm">
            <ChevronLeft className="w-6 h-6" /> Volver
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight">{adventure.name}</h1>
            <p className="text-[10px] font-black text-duo-yellow uppercase tracking-widest">Aventura Activa 🗺️</p>
          </div>
          <div className="w-10 h-10 bg-duo-yellow/10 rounded-xl flex items-center justify-center border-2 border-duo-yellow/20">
            <MapIcon className="w-6 h-6 text-duo-yellow" />
          </div>
        </div>
      </header>

      {/* Path Container */}
      <main className="flex-1 w-full relative">
        <AdventurePath 
          adventureName={adventure.name}
          milestones={adventure.milestones} 
          completedIds={completedIds} 
        />
      </main>
    </div>
  );
}
