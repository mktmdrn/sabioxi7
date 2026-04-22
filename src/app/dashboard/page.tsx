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
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header / Welcome */}
            <div className="bg-duo-blue rounded-[2.5rem] p-8 border-b-8 border-duo-blue-dark relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">¡DALE CAÑA, {session.user?.name?.toUpperCase()}! 👋</h2>
                <p className="text-white text-lg font-bold opacity-90">Tu camino al título de ASIR continúa hoy.</p>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link 
                    href="/arena" 
                    className="bg-duo-red text-white border-b-4 border-[#d33131] active:border-b-0 active:translate-y-1 px-8 py-4 rounded-2xl font-black text-lg hover:brightness-110 transition-all flex items-center gap-3 relative"
                  >
                    <Swords className="w-6 h-6" />
                    ARENA PvP
                    {pendingChallenges.length > 0 && (
                      <span className="absolute -top-3 -right-3 w-8 h-8 bg-duo-yellow text-slate-900 text-xs font-black rounded-full flex items-center justify-center animate-bounce border-4 border-white">
                        {pendingChallenges.length}
                      </span>
                    )}
                  </Link>

                  {role === "admin" && (
                    <Link 
                      href="/dashboard/admin" 
                      className="bg-white text-duo-foreground border-b-4 border-duo-gray px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center gap-3"
                    >
                      <Shield className="w-6 h-6 text-duo-yellow" />
                      ADMIN
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white p-2 rounded-3xl border-b-4 border-duo-gray w-max mx-auto sm:mx-0 shadow-sm">
              <Link 
                href="/dashboard?tab=campaign"
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all ${tab === "campaign" ? "bg-duo-blue text-white shadow-none border-b-4 border-duo-blue-dark" : "text-duo-gray-dark hover:text-duo-foreground"}`}
              >
                <MapIcon className="w-5 h-5" /> CAMPAÑA
              </Link>
              <Link 
                href="/dashboard?tab=catalog"
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all ${tab === "catalog" ? "bg-duo-blue text-white shadow-none border-b-4 border-duo-blue-dark" : "text-duo-gray-dark hover:text-duo-foreground"}`}
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
            <div className="bg-white border-2 border-duo-gray rounded-[2.5rem] p-6 shadow-sm sticky top-24 border-b-8">
              <div className="flex flex-col items-center">
                <MiniAvatar config={avatarConfig} />
                
                <div className="w-full mt-8 space-y-4">
                  <div className="bg-[#f7f7f7] p-4 rounded-2xl border-2 border-duo-gray">
                    <p className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest mb-1">Rango Actual</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-duo-foreground italic">{rank.name.toUpperCase()}</span>
                      <span className="text-3xl">{rank.emoji}</span>
                    </div>
                  </div>

                  <Link
                    href="/avatar"
                    className="w-full bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 px-6 py-4 rounded-2xl font-black text-center hover:brightness-110 transition-all flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-duo-yellow" />
                    EDITAR AVATAR
                  </Link>

                  <div className="pt-4 border-t-2 border-duo-gray">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-duo-blue/10 rounded-full flex items-center justify-center border-2 border-duo-blue/20">
                        <User className="w-5 h-5 text-duo-blue" />
                      </div>
                      <div>
                        <p className="text-[10px] text-duo-gray-dark font-black uppercase">Jugador</p>
                        <p className="text-duo-foreground font-black">{session.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-duo-green/10 rounded-full flex items-center justify-center border-2 border-duo-green/20">
                        <Mail className="w-5 h-5 text-duo-green" />
                      </div>
                      <div>
                        <p className="text-[10px] text-duo-gray-dark font-black uppercase">ID</p>
                        <p className="text-duo-foreground font-black truncate max-w-[150px]">{session.user?.email}</p>
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
