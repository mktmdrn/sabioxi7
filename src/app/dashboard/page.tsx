import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink, Play, Star, PlusCircle, Sparkles, Swords, Timer, Map as MapIcon, GraduationCap } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header / Welcome */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-2 italic tracking-tight">¡DALE CAÑA, {session.user?.name?.toUpperCase()}! 👋</h2>
                <p className="text-indigo-100 text-lg font-medium opacity-90">Tu camino al título de ASIR continúa hoy.</p>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link 
                    href="/arena" 
                    className="bg-red-500 text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1 px-8 py-4 rounded-2xl font-black text-lg hover:bg-red-400 transition-all flex items-center gap-3 relative shadow-xl shadow-red-500/20"
                  >
                    <Swords className="w-6 h-6" />
                    ARENA PvP
                    {pendingChallenges.length > 0 && (
                      <span className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-bounce border-4 border-slate-950">
                        {pendingChallenges.length}
                      </span>
                    )}
                  </Link>

                  {role === "admin" && (
                    <Link 
                      href="/dashboard/admin" 
                      className="bg-slate-900/50 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-900/80 transition-all flex items-center gap-3"
                    >
                      <Shield className="w-6 h-6 text-amber-500" />
                      ADMIN
                    </Link>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px]" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-900 p-2 rounded-3xl border border-slate-800 w-max mx-auto sm:mx-0 shadow-lg">
              <Link 
                href="/dashboard?tab=campaign"
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all ${tab === "campaign" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
              >
                <MapIcon className="w-5 h-5" /> CAMPAÑA
              </Link>
              <Link 
                href="/dashboard?tab=catalog"
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all ${tab === "catalog" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
              >
                <GraduationCap className="w-5 h-5" /> CATÁLOGO
              </Link>
            </div>

            {/* Content Area */}
            <div className="w-full">
              {tab === "campaign" ? (
                <CampaignPath 
                  lessons={lessons} 
                  exams={exams} 
                  completedIds={completedIds} 
                />
              ) : (
                <div className="space-y-12">
                  <Catalog 
                    lessons={exams} 
                    title="Exámenes de Certificación" 
                    iconType="timer" 
                  />
                  <Catalog lessons={lessons} />
                </div>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl sticky top-24">
              <div className="flex flex-col items-center">
                <MiniAvatar config={avatarConfig} />
                
                <div className="w-full mt-8 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rango Actual</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white italic">{rank.name.toUpperCase()}</span>
                      <span className="text-3xl">{rank.emoji}</span>
                    </div>
                  </div>

                  <Link
                    href="/avatar"
                    className="w-full bg-slate-800 text-white border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 px-6 py-4 rounded-2xl font-black text-center hover:bg-slate-700 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    EDITAR AVATAR
                  </Link>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                        <User className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Jugador</p>
                        <p className="text-white font-bold">{session.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">ID</p>
                        <p className="text-white font-bold truncate max-w-[150px]">{session.user?.email}</p>
                      </div>
                    </div>
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
