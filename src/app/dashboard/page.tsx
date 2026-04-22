import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink, Play, Star, PlusCircle, Sparkles, Swords, Timer, Map as MapIcon, GraduationCap, Zap, ChevronRight } from "lucide-react";
import { getUserPoints, getLessons, getAvatarConfig, getUserXp, getCompletedLessons } from "@/actions/db";
import { calculateLevel, getRankInfo } from "@/lib/levels";
import { getChallengesForUser } from "@/actions/arena";
import MiniAvatar from "@/components/MiniAvatar";
import Catalog from "@/components/Catalog";
import CampaignPath from "@/components/CampaignPath";

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as any)?.role;
  const points = userId ? await getUserPoints(userId) : 0;
  
  const { tab = "campaign" } = await searchParams;

  const [lessons, exams, completedIds] = await Promise.all([
    getLessons("lesson"),
    getLessons("exam"),
    userId ? getCompletedLessons(userId) : Promise.resolve([])
  ]);

  const avatarConfig = userId ? await getAvatarConfig(userId) : { color: "blue", hat: "none", accessory: "none" };
  const xp = userId ? await getUserXp(userId) : 0;
  const level = calculateLevel(xp);
  const rank = getRankInfo(level);
  const challenges = userId ? await getChallengesForUser(userId) : [];
  const pendingChallenges = challenges.filter((c: any) => c.status === "pending" && (c.challenged as any)?.id === userId);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Header / Welcome */}
            <div className="bg-duo-blue rounded-[2.5rem] p-6 md:p-8 border-b-8 border-duo-blue-dark relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight italic">
                  ¡HOLA, {session.user?.name?.split(' ')[0].toUpperCase()}! 👋
                </h2>
                <p className="text-white text-base md:text-lg font-bold opacity-90">Continúa tu formación y domina el sector IT.</p>
                
                <div className="mt-8 flex gap-4">
                  <Link 
                    href="/arena" 
                    className="bg-duo-red text-white border-b-8 border-[#d33131] active:border-b-0 active:translate-y-2 px-8 py-4 rounded-2xl font-black text-lg hover:brightness-110 transition-all flex items-center gap-3 relative shadow-lg"
                  >
                    <Swords className="w-6 h-6" />
                    ARENA PvP
                    {pendingChallenges.length > 0 && (
                      <span className="absolute -top-3 -right-3 w-10 h-10 bg-duo-yellow text-slate-900 text-xs font-black rounded-full flex items-center justify-center animate-bounce border-4 border-white">
                        {pendingChallenges.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            </div>

            {/* List of Adventures */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-duo-green" />
                NUESTRAS AVENTURAS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* ASIR Campaign Card */}
                <Link href="/campaign" className="group">
                  <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 hover:bg-[#f7f7f7] transition-all relative overflow-hidden h-full flex flex-col">
                    <div className="w-14 h-14 bg-duo-green text-white rounded-2xl flex items-center justify-center mb-4 border-b-4 border-duo-green-dark group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-xl font-black text-duo-foreground mb-2 uppercase italic">TÍTULO DE ASIR</h4>
                    <p className="text-sm text-duo-gray-dark font-bold flex-1">Consigue tu certificación oficial de Administrador de Sistemas en esta aventura épica.</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-[10px] font-black text-duo-green uppercase bg-duo-green/10 px-3 py-1 rounded-full">
                        {completedIds.length} Completado
                      </div>
                      <ChevronRight className="w-5 h-5 text-duo-gray-dark group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Placeholder for future campaign */}
                <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 opacity-60 border-dashed relative">
                   <div className="absolute inset-0 flex items-center justify-center bg-white/40 z-10">
                      <span className="font-black text-duo-gray-dark uppercase tracking-widest -rotate-12 border-2 border-duo-gray-dark px-4 py-1 rounded-lg">Próximamente</span>
                   </div>
                   <div className="w-14 h-14 bg-duo-gray text-duo-gray-dark rounded-2xl flex items-center justify-center mb-4">
                      <Star className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-duo-gray-dark mb-2 uppercase italic">DAW: DESARROLLO WEB</h4>
                    <p className="text-sm text-duo-gray-dark font-bold">Domina el frontend y el backend en el camino del desarrollador.</p>
                </div>
              </div>
            </div>

            {/* Combined Catalog Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-4 border-duo-gray pb-4">
                <h3 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-duo-blue" />
                  BIBLIOTECA DE CONOCIMIENTO
                </h3>
              </div>
              
              <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-8">
                <p className="text-duo-gray-dark font-bold mb-6 text-sm">Explora todo el contenido educativo disponible, incluyendo lecciones teóricas y exámenes de certificación.</p>
                <Catalog 
                  lessons={[...exams, ...lessons]} 
                  title="Todo el Contenido" 
                />
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border-2 border-duo-gray rounded-[2.5rem] p-6 shadow-sm border-b-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <MiniAvatar config={avatarConfig} />
                  <div className="absolute -bottom-2 -right-2 bg-duo-yellow border-4 border-white p-2 rounded-xl">
                    <span className="text-lg">{rank.emoji}</span>
                  </div>
                </div>
                
                <div className="w-full mt-8 space-y-4">
                  <div className="bg-[#f7f7f7] p-5 rounded-3xl border-2 border-duo-gray text-center">
                    <p className="text-[10px] font-black text-duo-gray-dark uppercase tracking-[0.2em] mb-1">Rango del Sabio</p>
                    <span className="text-2xl font-black text-duo-foreground italic uppercase">{rank.name}</span>
                  </div>

                  <Link
                    href="/avatar"
                    className="w-full bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 px-6 py-4 rounded-2xl font-black text-center hover:brightness-110 transition-all flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-duo-yellow" />
                    PERSONALIZAR
                  </Link>

                  <div className="pt-6 grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-4 bg-duo-blue/5 p-3 rounded-2xl border border-duo-blue/10">
                      <div className="w-10 h-10 bg-duo-blue text-white rounded-xl flex items-center justify-center border-b-4 border-duo-blue-dark">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-duo-gray-dark font-black uppercase">Usuario</p>
                        <p className="text-sm font-black truncate">{session.user?.name}</p>
                      </div>
                    </div>
                    {role === "admin" && (
                      <Link href="/dashboard/admin" className="flex items-center gap-4 bg-duo-yellow/5 p-3 rounded-2xl border border-duo-yellow/10 hover:bg-duo-yellow/10 transition-colors">
                        <div className="w-10 h-10 bg-duo-yellow text-white rounded-xl flex items-center justify-center border-b-4 border-[#c89b00]">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-duo-gray-dark font-black uppercase">Acceso</p>
                          <p className="text-sm font-black">ADMINISTRADOR</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
