import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink, Play, Star, PlusCircle, Sparkles, Swords, Timer } from "lucide-react";
import { getUserPoints, getLessons, getAvatarConfig, getUserXp } from "@/actions/db";
import { calculateLevel, getRankInfo } from "@/lib/levels";
import { getChallengesForUser } from "@/actions/arena";
import MiniAvatar from "@/components/MiniAvatar";
import Catalog from "@/components/Catalog";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as any)?.role;
  const points = userId ? await getUserPoints(userId) : 0;
  
  const [lessons, exams] = await Promise.all([
    getLessons("lesson"),
    getLessons("exam")
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
      {/* Sidebar / Navigation */}


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome Card */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">¡Hola, {session.user?.name}! 👋</h2>
                <p className="text-blue-100 text-lg opacity-90">Has iniciado sesión correctamente en el sistema.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {role === "admin" && (
                    <>
                      <Link href="/generator" className="bg-indigo-600 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Generador
                      </Link>
                      <Link href="/dashboard/admin" className="bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-lg hover:bg-amber-500 transition-all flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Panel Admin
                      </Link>
                    </>
                  )}
                  <Link href="/arena" className="bg-red-500 text-white border-b-4 border-red-600 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-lg hover:bg-red-400 transition-all flex items-center gap-2 relative">
                    <Swords className="w-5 h-5" />
                    Arena PvP
                    {pendingChallenges.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {pendingChallenges.length}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              {/* Background abstract shape */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            </div>

            {/* Exams Section */}
            <div className="w-full">
              <Catalog 
                lessons={exams} 
                title="Exámenes de Certificación Oficial" 
                iconType="timer" 
              />
            </div>

            {/* Lessons Section */}
            <div className="w-full">
              <Catalog lessons={lessons} />
            </div>
          </div>

          {/* User Profile Card */}
          <div className="space-y-6">
            {/* Mini Avatar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg">
              <MiniAvatar config={avatarConfig} />
              <Link
                href="/avatar"
                className="mt-4 w-full bg-indigo-600 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-center hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Personalizar Avatar
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Tu Perfil
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Nombre</p>
                    <p className="text-white font-medium">{session.user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <Mail className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-white font-medium">{session.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rol</p>
                    <p className="text-white font-medium capitalize">{(session.user as any).role || "Usuario"}</p>
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
