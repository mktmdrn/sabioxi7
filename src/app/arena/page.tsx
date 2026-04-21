import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllActivePlayers, getUserXp } from "@/actions/db";
import { calculateLevel, getRankInfo } from "@/lib/levels";
import { getChallengesForUser, createChallenge, acceptChallenge, declineChallenge } from "@/actions/arena";
import Link from "next/link";
import { Swords, ArrowLeft, Star, Shield, Clock, Check, X, Play, Trophy } from "lucide-react";

export default async function ArenaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const players = await getAllActivePlayers();
  const challenges = await getChallengesForUser(userId);
  const myXp = await getUserXp(userId);
  const myLevel = calculateLevel(myXp);
  const myRank = getRankInfo(myLevel);

  const pendingForMe = challenges.filter(
    (c: any) => c.status === "pending" && (c.challenged as any)?.id === userId
  );
  const myPending = challenges.filter(
    (c: any) => c.status === "pending" && (c.challenger as any)?.id === userId
  );
  const activeGames = challenges.filter(
    (c: any) => c.status === "accepted"
  );
  const recentCompleted = challenges.filter(
    (c: any) => c.status === "completed"
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </Link>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-400" />
              Arena PvP
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Lv.{myLevel}</span>
              <span>{myRank.emoji}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Incoming challenges */}
        {pendingForMe.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              ¡Te han retado! ({pendingForMe.length})
            </h2>
            <div className="space-y-3">
              {pendingForMe.map((c: any) => {
                const challenger = c.challenger as any;
                const cLevel = calculateLevel(challenger?.xp || 0);
                const cRank = getRankInfo(cLevel);
                return (
                  <div key={c.id} className="flex items-center justify-between bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cRank.emoji}</span>
                      <div>
                        <p className="font-bold text-white">{challenger?.name}</p>
                        <p className="text-xs text-slate-400">Nivel {cLevel} · {cRank.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={async () => {
                        "use server";
                        await acceptChallenge(c.id);
                      }}>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-400 transition-colors flex items-center gap-1">
                          <Check className="w-4 h-4" /> Aceptar
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await declineChallenge(c.id);
                      }}>
                        <button className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors flex items-center gap-1">
                          <X className="w-4 h-4" /> Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active games */}
        {activeGames.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Retos Activos ({activeGames.length})
            </h2>
            <div className="space-y-3">
              {activeGames.map((c: any) => {
                const isChallenger = (c.challenger as any)?.id === userId;
                const opponent = isChallenger ? c.challenged as any : c.challenger as any;
                const myScore = isChallenger ? c.challenger_score : c.challenged_score;
                const hasPlayed = myScore !== null;
                return (
                  <div key={c.id} className="flex items-center justify-between bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRankInfo(calculateLevel(opponent?.xp || 0)).emoji}</span>
                      <div>
                        <p className="font-bold text-white">vs {opponent?.name}</p>
                        <p className="text-xs text-slate-400">
                          {hasPlayed ? "Esperando al oponente..." : "¡Tu turno de jugar!"}
                        </p>
                      </div>
                    </div>
                    {!hasPlayed ? (
                      <Link href={`/arena/${c.id}`} className="bg-amber-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-1">
                        <Play className="w-4 h-4" /> Jugar
                      </Link>
                    ) : (
                      <span className="text-amber-500 font-bold text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Esperando...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent results */}
        {recentCompleted.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Resultados Recientes
            </h2>
            <div className="space-y-3">
              {recentCompleted.map((c: any) => {
                const isChallenger = (c.challenger as any)?.id === userId;
                const opponent = isChallenger ? c.challenged as any : c.challenger as any;
                const won = c.winner_id === userId;
                const draw = c.winner_id === null;
                return (
                  <div key={c.id} className="flex items-center justify-between bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{won ? "🏆" : draw ? "🤝" : "😢"}</span>
                      <div>
                        <p className="font-bold text-white">vs {opponent?.name}</p>
                        <p className="text-xs text-slate-400">
                          {c.challenger_score} vs {c.challenged_score}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm px-3 py-1 rounded-full ${won ? "bg-green-500/20 text-green-400" : draw ? "bg-slate-700 text-slate-300" : "bg-red-500/20 text-red-400"}`}>
                      {won ? "+20 XP" : draw ? "+10 XP" : "+5 XP"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Player list */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Jugadores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.filter((p: any) => p.id !== userId).map((player: any) => {
              const pLevel = calculateLevel(player.xp || 0);
              const pRank = getRankInfo(pLevel);
              const alreadyChallenged = myPending.some(
                (c: any) => (c.challenged as any)?.id === player.id
              );
              return (
                <div key={player.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl">
                      {pRank.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{player.name}</p>
                      <p className="text-xs text-slate-400">Lv.{pLevel} · {pRank.name}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-amber-500 font-bold text-xs">{player.points || 0}</span>
                    </div>
                  </div>
                  {alreadyChallenged ? (
                    <div className="w-full py-2 text-center text-sm font-bold text-amber-500 bg-amber-500/10 rounded-xl">
                      ⏳ Reto enviado
                    </div>
                  ) : (
                    <form action={async () => {
                      "use server";
                      await createChallenge(userId, player.id);
                    }}>
                      <button className="w-full bg-red-500 text-white border-b-4 border-red-600 active:border-b-0 active:translate-y-[4px] py-2.5 rounded-xl font-bold text-sm hover:bg-red-400 transition-all flex items-center justify-center gap-2">
                        <Swords className="w-4 h-4" />
                        Retar
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* My pending sent */}
        {myPending.length > 0 && (
          <div className="text-center text-slate-500 text-sm">
            Tienes {myPending.length} reto(s) pendiente(s) de ser aceptado(s).
          </div>
        )}
      </main>
    </div>
  );
}
