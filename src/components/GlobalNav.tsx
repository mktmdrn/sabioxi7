"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Swords, LogOut, LayoutDashboard, Check, X, Star } from "lucide-react";
import Link from "next/link";
import { acceptChallenge, declineChallenge, getChallengesForUser } from "@/actions/arena";
import { getUserXp, getUserPoints } from "@/actions/db";
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
          SABIOXI
        </Link>
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-white" : "text-slate-400 hover:text-white"}`}>
            <LayoutDashboard className="w-4 h-4 inline mr-1" /> Panel
          </Link>
          <Link href="/arena" className={`text-sm font-medium transition-colors ${pathname.startsWith("/arena") ? "text-white" : "text-slate-400 hover:text-white"}`}>
            <Swords className="w-4 h-4 inline mr-1" /> Arena
          </Link>
          {role === "admin" && (
            <Link href="/dashboard/admin" className={`text-sm font-medium transition-colors ${pathname === "/dashboard/admin" ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}>
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-4">
        {userData.level > 0 && (
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <span className="text-sm">{userData.rank.emoji}</span>
              <span className="text-indigo-400 font-bold text-sm">Lv.{userData.level}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-amber-500 font-bold text-sm">{userData.points}</span>
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
            <Bell className={`w-5 h-5 ${hasNew ? "text-white animate-bounce" : "text-slate-300"}`} />
            {pendingChallenges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                {pendingChallenges.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
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

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>
    </nav>
  );
}
