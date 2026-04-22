"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Swords, LogOut, LayoutDashboard, Check, X, Star, Plus } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4 sm:px-6">
      {/* Logo / Links */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-white font-bold text-lg flex items-center gap-2">
          <span className="text-amber-500 text-xl">⚡</span>
          <span className="hidden xs:inline">SABIOXI</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-white" : "text-slate-400 hover:text-white"}`}>
            <LayoutDashboard className="w-4 h-4 inline mr-1" /> Panel
          </Link>
          <Link href="/arena" className={`text-sm font-medium transition-colors ${pathname.startsWith("/arena") ? "text-white" : "text-slate-400 hover:text-white"}`}>
            <Swords className="w-4 h-4 inline mr-1" /> Arena
          </Link>
          {role === "admin" && (
            <>
              <Link href="/dashboard/admin" className={`text-sm font-medium transition-colors ${pathname === "/dashboard/admin" ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}>
                Admin
              </Link>
              <Link href="/arena/practice" className={`text-sm font-medium transition-colors ${pathname === "/arena/practice" ? "text-indigo-400" : "text-slate-400 hover:text-indigo-400"}`}>
                Practice
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {userData.level > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-indigo-500/10 px-2 sm:px-3 py-1 rounded-full border border-indigo-500/20">
              <span className="text-xs sm:text-sm">{userData.rank.emoji}</span>
              <span className="text-indigo-400 font-bold text-[10px] sm:text-sm">Lv.{userData.level}</span>
            </div>
            <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-full border border-amber-500/20 group relative">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
              <span className="text-amber-500 font-bold text-[10px] sm:text-sm">{userData.points}</span>
              
              {role === "admin" && (
                <button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="ml-1 p-0.5 rounded-full bg-amber-500 text-slate-900 hover:scale-110 transition-transform"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors relative"
          >
            <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${hasNew ? "text-white animate-bounce" : "text-slate-300"}`} />
            {pendingChallenges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                {pendingChallenges.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-[-60px] sm:right-0 mt-2 w-[280px] sm:w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-700 bg-slate-900">
                <h3 className="text-white font-bold text-sm">Retos Pendientes</h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {pendingChallenges.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400 text-center">No tienes retos pendientes.</p>
                ) : (
                  pendingChallenges.map((c) => (
                    <div key={c.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <p className="text-sm text-white mb-2">
                        <span className="font-bold text-amber-400">{c.challenger?.name}</span> te ha retado.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAccept(c.id)}
                          className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-400 transition-all flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Aceptar
                        </button>
                        <button 
                          onClick={() => handleDecline(c.id)}
                          className="flex-1 bg-slate-700 text-slate-300 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      {/* Admin Star Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Cargar Estrellas
              </h2>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email del Usuario</label>
                <input 
                  type="email" 
                  value={adminTargetEmail}
                  onChange={(e) => setAdminTargetEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
                <button 
                  onClick={() => setAdminTargetEmail(session?.user?.email || "")}
                  className="text-[10px] text-amber-500 font-bold mt-1 ml-1 hover:underline"
                >
                  Usar mi email
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Cantidad</label>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setAdminStarAmount(amt)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${adminStarAmount === amt ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={adminStarAmount}
                  onChange={(e) => setAdminStarAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              {adminStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${adminStatus.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : adminStatus.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}`}>
                  {adminStatus.message}
                </div>
              )}

              <button 
                onClick={handleAdminAddStars}
                disabled={adminStatus.type === "loading"}
                className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
              >
                CARGAR ESTRELLAS
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
