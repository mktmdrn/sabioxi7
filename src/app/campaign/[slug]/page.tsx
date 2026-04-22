import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getLessons, getCompletedLessons } from "@/actions/db";
import CampaignPath from "@/components/CampaignPath";
import { ChevronLeft, Map as MapIcon } from "lucide-react";
import Link from "next/link";

const CAMPAIGNS: Record<string, { title: string, subjects: string[] }> = {
  "asir": {
    title: "ADMINISTRACIÓN DE SISTEMAS (ASIR)",
    subjects: [
      "Planificación y administración de redes",
      "Implantación de sistemas operativos",
      "Gestión de bases de datos",
      "Sistemas informáticos",
      "Seguridad y Alta Disponibilidad",
      "Servicios de Red e Internet",
      "Implantación de Aplicaciones Web"
    ]
  },
  "daw": {
    title: "DESARROLLO DE APPS WEB (DAW)",
    subjects: [
      "Sistemas informáticos",
      "Bases de Datos",
      "Programación",
      "Entornos de Desarrollo",
      "Desarrollo Web en Entorno Cliente",
      "Desarrollo Web en Entorno Servidor",
      "Despliegue de Aplicaciones Web",
      "Diseño de Interfaces Web"
    ]
  }
};

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const campaign = CAMPAIGNS[slug as keyof typeof CAMPAIGNS];

  if (!campaign) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!session) {
    redirect("/login");
  }

  const [lessons, exams, completedIds] = await Promise.all([
    getLessons("lesson"),
    getLessons("exam"),
    userId ? getCompletedLessons(userId) : Promise.resolve([])
  ]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-duo-gray p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-sm">
            <ChevronLeft className="w-6 h-6" /> Volver
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight">{campaign.title}</h1>
            <p className="text-[10px] font-black text-duo-green uppercase tracking-widest">Aventura Activa</p>
          </div>
          <div className="w-10 h-10 bg-duo-green/10 rounded-xl flex items-center justify-center border-2 border-duo-green/20">
            <MapIcon className="w-6 h-6 text-duo-green" />
          </div>
        </div>
      </header>

      {/* Path Container */}
      <main className="flex-1 w-full relative">
        <CampaignPath 
          lessons={lessons} 
          exams={exams} 
          completedIds={completedIds} 
          subjects={campaign.subjects}
        />
      </main>
    </div>
  );
}
