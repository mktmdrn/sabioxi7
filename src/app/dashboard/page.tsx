import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink, Play, Star, PlusCircle, Sparkles, Swords, Timer, Map as MapIcon, GraduationCap, Zap, ChevronRight, AlertTriangle } from "lucide-react";
import { getUserPoints, getLessons, getAvatarConfig, getUserXp, getCompletedLessons, getTopFailedLessons, getAdventures } from "@/actions/db";
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

  const [lessons, exams, completedIds, topFailed, allAdventures] = await Promise.all([
    getLessons("lesson"),
    getLessons("exam"),
    userId ? getCompletedLessons(userId) : Promise.resolve([]),
    userId ? getTopFailedLessons(userId, 3) : Promise.resolve([]),
    getAdventures()
  ]);

  const adventures = allAdventures.filter(a => a.is_published);

  const avatarConfig = userId ? await getAvatarConfig(userId) : { color: "blue", hat: "none", accessory: "none", mouth: "neutral", eyes: "neutral", hair: "standard" };
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
          <div className="lg:col-span-3 space-y-12">
            
            {/* Header / Welcome / Avatar Combined */}
            <div className="bg-duo-blue rounded-[2.5rem] p-8 md:p-10 border-b-8 border-duo-blue-dark relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:justify-between">
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight italic">
                    ¡HOLA, {session.user?.name?.split(' ')[0].toUpperCase()}! 👋
                  </h2>
                  <p className="text-white text-lg md:text-2xl font-bold opacity-95 max-w-xl">
                    Continúa tu formación y domina el sector IT. Tienes el rango de <span className="text-duo-yellow italic">{rank.name}</span>.
                  </p>
                  
                  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link 
                      href="/arena" 
                      className="bg-duo-red text-white border-b-8 border-[#d33131] active:border-b-0 active:translate-y-2 px-8 py-5 rounded-2xl font-black text-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 relative shadow-lg"
                    >
                      <Swords className="w-6 h-6" />
                      ARENA PvP
                      {pendingChallenges.length > 0 && (
                        <span className="absolute -top-3 -right-3 w-10 h-10 bg-duo-yellow text-slate-900 text-xs font-black rounded-full flex items-center justify-center animate-bounce border-4 border-white">
                          {pendingChallenges.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/avatar"
                      className="bg-white text-duo-blue border-b-8 border-slate-200 active:border-b-0 active:translate-y-2 px-8 py-5 rounded-2xl font-black text-xl hover:bg-[#f0f9ff] transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Sparkles className="w-6 h-6 text-duo-yellow fill-current" />
                      PERSONALIZAR
                    </Link>
                  </div>
                </div>

                <div className="relative group/avatar">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150 group-hover/avatar:scale-[2] transition-transform duration-700" />
                  <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full border-4 border-white/20 shadow-2xl group-hover/avatar:rotate-3 transition-transform duration-500">
                    <MiniAvatar config={avatarConfig} />
                    <div className="absolute -bottom-4 -right-4 bg-duo-yellow border-4 border-white p-3 rounded-2xl shadow-xl transform group-hover/avatar:scale-110 transition-transform">
                      <span className="text-3xl">{rank.emoji}</span>
                    </div>
                  </div>
                </div>

              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
            
            {/* List of Adventures */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-duo-green" />
                NUESTRAS AVENTURAS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dynamic Adventures */}
                {adventures.map(adv => (
                  <Link key={adv.id} href={`/adventure/${adv.id}`} className="group relative z-20 cursor-pointer text-left">
                    <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 hover:bg-[#f7f7f7] transition-all relative overflow-hidden h-full flex flex-col">
                      <div className="w-14 h-14 bg-duo-yellow text-white rounded-2xl flex items-center justify-center mb-4 border-b-4 border-[#c89b00] group-hover:scale-110 transition-transform">
                        <MapIcon className="w-8 h-8 fill-current" />
                      </div>
                      <h4 className="text-xl font-black text-duo-foreground mb-2 uppercase italic leading-tight">{adv.name}</h4>
                      <p className="text-sm text-duo-gray-dark font-bold flex-1 line-clamp-2">{adv.description}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-[10px] font-black text-duo-yellow uppercase bg-duo-yellow/10 px-3 py-1 rounded-full border border-duo-yellow/20">
                          AVENTURA
                        </div>
                        <ChevronRight className="w-5 h-5 text-duo-gray-dark group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}

                {/* ASIR Campaign Card (Legacy) */}
                <Link href="/campaign/asir" className="group relative z-20 cursor-pointer text-left">
                  <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 hover:bg-[#f7f7f7] transition-all relative overflow-hidden h-full flex flex-col">
                    <div className="w-14 h-14 bg-duo-green text-white rounded-2xl flex items-center justify-center mb-4 border-b-4 border-duo-green-dark group-hover:scale-110 transition-transform text-left">
                      <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-xl font-black text-duo-foreground mb-2 uppercase italic">TÍTULO DE ASIR</h4>
                    <p className="text-sm text-duo-gray-dark font-bold flex-1">Consigue tu certificación oficial de Administrador de Sistemas en esta aventura épica.</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-[10px] font-black text-duo-green uppercase bg-duo-green/10 px-3 py-1 rounded-full">
                        ACTIVA
                      </div>
                      <ChevronRight className="w-5 h-5 text-duo-gray-dark group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* DAW Campaign Card (Legacy) */}
                <Link href="/campaign/daw" className="group relative z-20 cursor-pointer text-left">
                  <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 hover:bg-[#f7f7f7] transition-all relative overflow-hidden h-full flex flex-col">
                    <div className="w-14 h-14 bg-duo-blue text-white rounded-2xl flex items-center justify-center mb-4 border-b-4 border-duo-blue-dark group-hover:scale-110 transition-transform">
                      <Star className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-xl font-black text-duo-foreground mb-2 uppercase italic">DESARROLLO WEB (DAW)</h4>
                    <p className="text-sm text-duo-gray-dark font-bold flex-1">Domina el desarrollo de aplicaciones web desde el frontend hasta el servidor.</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-[10px] font-black text-duo-blue uppercase bg-duo-blue/10 px-3 py-1 rounded-full">
                        NUEVA
                      </div>
                      <ChevronRight className="w-5 h-5 text-duo-gray-dark group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Top Failed Lessons Section */}
            {topFailed.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-duo-red" />
                  TUS DESAFÍOS (MÁS FALLADOS)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topFailed.map((item: any, index: number) => (
                    <Link key={item.id} href={`/lesson/${item.id}`} className="group">
                      <div className="bg-white border-2 border-duo-red border-b-8 rounded-[2rem] p-6 hover:bg-duo-red/5 transition-all relative overflow-hidden flex items-center gap-4">
                        <div className="w-12 h-12 bg-duo-red text-white rounded-xl flex items-center justify-center font-black text-xl border-b-4 border-[#d33131]">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-duo-foreground uppercase italic truncate text-sm">
                            {item.title}
                          </h4>
                          <p className="text-[10px] font-black text-duo-red uppercase tracking-widest mt-1">
                            {item.count} FALLOS DETECTADOS
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-duo-red group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

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
        </div>
      </main>
    </div>
  );
}
