"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Swords, LogOut, LayoutDashboard, Check, X, Star, Plus, ChevronDown, Shield, Zap, Activity, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { acceptChallenge, declineChallenge, getChallengesForUser } from "@/actions/arena";
import { getUserXp, getUserPoints, addStarsToUserByEmail } from "@/actions/db";
import { calculateLevel, getRankInfo } from "@/lib/levels";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function GlobalNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [userData, setUserData] = useState({ level: 0, points: 0, rank: { name: "", emoji: "" } });
  
  // Admin Star Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [adminTargetEmail, setAdminTargetEmail] = useState("");
  const [adminStarAmount, setAdminStarAmount] = useState(10);
  const [adminStatus, setAdminStatus] = useState({ type: "", message: "" });

  const userId = session?.user?.id;
  const role = (session?.user as any)?.role;

  const fetchChallenges = async () => {
    if (!userId) return;
    const all = await getChallengesForUser(userId);
    // Filter only those pending WHERE I AM THE CHALLENGED ONE
    const pendingForMe = all.filter(
      (c: any) => c.status === "pending" && c.challenged?.id === userId
    );
    setPendingChallenges(pendingForMe);

    // Fetch user level and points
    const xp = await getUserXp(userId);
    const points = await getUserPoints(userId);
    const level = calculateLevel(xp);
    const rank = getRankInfo(level);
    setUserData({ level, points, rank });
  };

  const handleAdminAddStars = async () => {
    if (!adminTargetEmail) return;
    setAdminStatus({ type: "loading", message: "Procesando..." });
    const res = await addStarsToUserByEmail(adminTargetEmail, adminStarAmount);
    if (res.success) {
      setAdminStatus({ type: "success", message: res.message });
      fetchChallenges(); // Refresh points
      setTimeout(() => {
        setIsAdminModalOpen(false);
        setAdminStatus({ type: "", message: "" });
        setAdminTargetEmail("");
      }, 2000);
    } else {
      setAdminStatus({ type: "error", message: res.message });
    }
  };

  useEffect(() => {
    if (!userId) return;
    // Initial fetch
    fetchChallenges();

    // Setup Realtime Listener for ANY changes in challenges table involving this user
    const channel = supabase
      .channel('global-notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'challenges' 
      }, (payload) => {
        const row = (payload.new || payload.old) as any;
        if (row && (row.challenger_id === userId || row.challenged_id === userId)) {
          // If it's a NEW challenge and I am the challenged party, trigger alert
          if (payload.eventType === "INSERT" && row.challenged_id === userId) {
            setHasNew(true);
            // Optional: play sound
            try {
              const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
              audio.play().catch(e => console.log("Audio play blocked", e));
            } catch (e) {}
          }
          
          // Re-fetch local state for the bell dropdown
          fetchChallenges();
          
          // Refresh the router so Server Components (like /arena) update automatically
          router.refresh();
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, router]);

  const handleAccept = async (id: string) => {
    await acceptChallenge(id);
    setIsOpen(false);
  };

  const handleDecline = async (id: string) => {
    await declineChallenge(id);
  };

  // Hidden on login/register pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  // If no session, don't render
  if (!userId) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b-2 border-duo-gray z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Logo / Links */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-duo-foreground font-black text-lg flex items-center gap-2 italic uppercase tracking-tighter hover:scale-105 transition-transform">
          <span className="text-duo-yellow text-2xl drop-shadow-sm">⚡</span>
          <span className="hidden xs:inline">SABIOXI</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className={`text-xs font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${pathname === "/dashboard" ? "text-duo-blue bg-duo-blue/5" : "text-duo-gray-dark hover:text-duo-blue hover:bg-duo-blue/5"}`}>
            <LayoutDashboard className="w-4 h-4 inline mr-1.5" /> Inicio
          </Link>
          <Link href="/courses" className={`text-xs font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${pathname === "/courses" ? "text-duo-green bg-duo-green/5" : "text-duo-gray-dark hover:text-duo-green hover:bg-duo-green/5"}`}>
            <Star className="w-4 h-4 inline mr-1.5" /> Cursos
          </Link>
          <Link href="/arena" className={`text-xs font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${pathname.startsWith("/arena") ? "text-duo-red bg-duo-red/5" : "text-duo-gray-dark hover:text-duo-red hover:bg-duo-red/5"}`}>
            <Swords className="w-4 h-4 inline mr-1.5" /> Arena
          </Link>
          {role === "admin" && (
            <div 
              className="relative group"
              onMouseEnter={() => setAdminDropdownOpen(true)}
              onMouseLeave={() => setAdminDropdownOpen(false)}
            >
              <button 
                className={`text-xs font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl flex items-center gap-1.5 ${pathname.startsWith("/dashboard/admin") || pathname.startsWith("/generator") ? "text-amber-500 bg-amber-500/5" : "text-duo-gray-dark hover:text-amber-500 hover:bg-amber-500/5"}`}
              >
                <Shield className="w-4 h-4" />
                Admin
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${adminDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {adminDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border-2 border-duo-gray rounded-2xl shadow-xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 border-b-8">
                  <Link 
                    href="/dashboard/admin" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Panel Principal</span>
                  </Link>
                  <Link 
                    href="/dashboard/admin#users-table" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Gestión Usuarios</span>
                  </Link>
                  <Link 
                    href="/dashboard/admin/stars" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Gestión Estrellas</span>
                  </Link>
                  <Link 
                    href="/generator" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Gestión Cursos</span>
                  </Link>
                  <Link 
                    href="/dashboard/admin/activity" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Actividad Global</span>
                  </Link>
                  <div className="h-0.5 bg-duo-gray/30 mx-4 my-2" />
                  <Link 
                    href="/generator/advanced" 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-duo-gray-dark hover:text-amber-600 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-duo-blue">Generador Avanzado</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href="/arena/practice" className={`text-xs font-black uppercase tracking-widest transition-all px-3 py-2 rounded-xl ${pathname === "/arena/practice" ? "text-indigo-400 bg-indigo-400/5" : "text-duo-gray-dark hover:text-indigo-400 hover:bg-indigo-400/5"}`}>
            Practice
          </Link>
        </div>
      </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {userData.level > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-2xl border-2 border-indigo-500/20 shadow-sm">
              <span className="text-xs sm:text-sm">{userData.rank.emoji}</span>
              <span className="text-indigo-500 font-black text-[10px] sm:text-sm">LV.{userData.level}</span>
            </div>
            <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border-2 border-amber-500/20 group relative shadow-sm">
              <Star className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-500" />
              <span className="text-amber-500 font-black text-[10px] sm:text-sm">{userData.points}</span>
              
              {role === "admin" && (
                <button 
                   onClick={() => setIsAdminModalOpen(true)}
                   className="ml-1.5 p-1 rounded-full bg-amber-500 text-white hover:scale-110 transition-transform shadow-md"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsOpen(!isOpen);
              if (hasNew) setHasNew(false);
            }}
            className={`p-2.5 rounded-2xl transition-all relative border-2 ${hasNew ? "bg-duo-red border-duo-red text-white animate-bounce" : "bg-[#f7f7f7] border-duo-gray text-duo-gray-dark hover:bg-white hover:border-duo-gray-dark"}`}
          >
            <Bell className="w-5 h-5" />
            {pendingChallenges.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-duo-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {pendingChallenges.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-[-60px] sm:right-0 mt-3 w-[300px] sm:w-80 bg-white border-2 border-duo-gray rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 z-[60] border-b-8">
              <div className="p-5 border-b-2 border-duo-gray bg-[#f7f7f7]">
                <h3 className="text-duo-foreground font-black text-sm uppercase italic tracking-tight flex items-center gap-2">
                  <Swords className="w-4 h-4 text-duo-red" /> Retos Pendientes
                </h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {pendingChallenges.length === 0 ? (
                  <p className="p-8 text-sm text-duo-gray-dark text-center font-bold italic">No tienes retos pendientes en este momento.</p>
                ) : (
                  pendingChallenges.map((c) => (
                    <div key={c.id} className="p-5 border-b-2 border-duo-gray/50 hover:bg-[#f7f7f7] transition-colors">
                      <p className="text-sm text-duo-foreground mb-4 font-bold leading-relaxed">
                        <span className="font-black text-amber-500 uppercase italic tracking-tighter">{c.challenger?.name}</span> te ha retado a un duelo a muerte.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAccept(c.id)}
                          className="flex-1 bg-duo-green text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 shadow-sm"
                        >
                          Aceptar
                        </button>
                        <button 
                          onClick={() => handleDecline(c.id)}
                          className="flex-1 bg-white text-duo-gray-dark py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-duo-gray/5 transition-all border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1"
                        >
                          Pasar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2.5 rounded-2xl bg-white border-2 border-duo-gray text-duo-gray-dark hover:text-duo-red hover:border-duo-red transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Admin Star Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-duo-foreground/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white border-2 border-duo-gray border-b-8 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-duo-foreground flex items-center gap-3 uppercase italic tracking-tight leading-none">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Cargar Estrellas
              </h2>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-duo-gray-dark hover:text-duo-foreground p-1 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-duo-gray-dark uppercase tracking-[0.2em] mb-3 ml-2">Email del Alumno</label>
                <input 
                  type="email" 
                  value={adminTargetEmail}
                  onChange={(e) => setAdminTargetEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl px-5 py-3.5 font-bold focus:outline-none focus:border-duo-blue transition-all"
                />
                <button 
                  onClick={() => setAdminTargetEmail(session?.user?.email || "")}
                  className="text-[10px] text-duo-blue font-black uppercase tracking-widest mt-2 ml-2 hover:underline"
                >
                  Usar mi email
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-duo-gray-dark uppercase tracking-[0.2em] mb-3 ml-2">Cantidad a Otorga</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10, 50, 100, 500].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setAdminStarAmount(amt)}
                      className={`py-2 rounded-xl text-[10px] font-black transition-all border-2 ${adminStarAmount === amt ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-[#f7f7f7] text-duo-gray-dark border-duo-gray hover:bg-white"}`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={adminStarAmount}
                  onChange={(e) => setAdminStarAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl px-5 py-3.5 font-bold focus:outline-none focus:border-duo-blue transition-all"
                />
              </div>

              {adminStatus.message && (
                <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 animate-in slide-in-from-bottom-2 ${adminStatus.type === "success" ? "bg-duo-green/10 border-duo-green/20 text-duo-green" : adminStatus.type === "error" ? "bg-duo-red/10 border-duo-red/20 text-duo-red" : "bg-duo-blue/10 border-duo-blue/20 text-duo-blue"}`}>
                  {adminStatus.message}
                </div>
              )}

              <button 
                onClick={handleAdminAddStars}
                disabled={adminStatus.type === "loading"}
                className="w-full bg-duo-green text-white font-black py-4 rounded-2xl hover:brightness-110 transition-all border-b-8 border-duo-green-dark active:border-b-0 active:translate-y-2 text-xl uppercase italic tracking-tighter disabled:opacity-50"
              >
                {adminStatus.type === "loading" ? "PROCESANDO..." : "CARGAR ESTRELLAS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
