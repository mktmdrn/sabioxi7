import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllActivePlayers, getUserXp } from "@/actions/db";
import { calculateLevel, getRankInfo } from "@/lib/levels";
import { getChallengesForUser, createChallenge, acceptChallenge, declineChallenge, cancelChallenge } from "@/actions/arena";
import Link from "next/link";
import { Swords, ArrowLeft, Star, Shield, Clock, Check, X, Play, Trophy } from "lucide-react";

export default async function ArenaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const players = await getAllActivePlayers();
  // Sort players by XP for the ranking
  players.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));
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
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-duo-gray p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-duo-gray-dark hover:text-duo-foreground transition-all flex items-center gap-2 font-black uppercase text-sm">
            <ArrowLeft className="w-6 h-6" /> Volver
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-2">
              <Swords className="w-6 h-6 text-duo-red" />
              ARENA PvP
            </h1>
            <p className="text-[10px] font-black text-duo-red uppercase tracking-widest">Duelo de Sabios</p>
          </div>
          <div className="flex items-center gap-2 bg-duo-yellow/10 px-3 py-1 rounded-xl border-2 border-duo-yellow/20">
            <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            <span className="text-duo-yellow font-black">{myXp}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Incoming challenges */}
        {pendingForMe.length > 0 && (
          <div className="bg-duo-red/5 border-2 border-duo-red border-b-8 rounded-[2.5rem] p-6 md:p-8">
            <h2 className="text-xl font-black text-duo-red mb-6 flex items-center gap-3 uppercase italic">
              <div className="w-10 h-10 bg-duo-red rounded-xl flex items-center justify-center border-b-4 border-[#d33131] shadow-sm">
                <Swords className="w-5 h-5 text-white" />
              </div>
              ¡Te han retado! ({pendingForMe.length})
            </h2>
            <div className="space-y-4">
              {pendingForMe.map((c: any) => {
                const challenger = c.challenger as any;
                const cLevel = calculateLevel(challenger?.xp || 0);
                const cRank = getRankInfo(cLevel);
                return (
                  <div key={c.id} className="flex items-center justify-between bg-white rounded-3xl p-5 border-2 border-duo-gray border-b-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-duo-gray/20 rounded-2xl flex items-center justify-center text-3xl">
                        {cRank.emoji}
                      </div>
                      <div>
                        <p className="font-black text-duo-foreground text-lg uppercase leading-tight">{challenger?.name}</p>
                        <p className="text-xs font-bold text-duo-gray-dark uppercase tracking-widest mt-1">Nivel {cLevel} · {cRank.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <form action={async () => {
                        "use server";
                        await acceptChallenge(c.id);
                      }}>
                        <button className="bg-duo-green text-white border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center gap-2">
                          <Check className="w-4 h-4 font-black" /> Aceptar
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await declineChallenge(c.id);
                      }}>
                        <button className="bg-white text-duo-red border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center gap-2">
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
          <div className="bg-duo-yellow/5 border-2 border-duo-yellow border-b-8 rounded-[2.5rem] p-6 md:p-8">
            <h2 className="text-xl font-black text-duo-yellow mb-6 flex items-center gap-3 uppercase italic">
              <div className="w-10 h-10 bg-duo-yellow rounded-xl flex items-center justify-center border-b-4 border-[#e5a400] shadow-sm">
                <Play className="w-5 h-5 text-white" />
              </div>
              Retos Activos ({activeGames.length})
            </h2>
            <div className="space-y-4">
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
          <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-duo-foreground mb-6 flex items-center gap-3 uppercase italic">
              <div className="w-10 h-10 bg-duo-yellow rounded-xl flex items-center justify-center border-b-4 border-[#e5a400] shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              Resultados Recientes
            </h2>
            <div className="space-y-4">
              {recentCompleted.map((c: any) => {
                const isChallenger = (c.challenger as any)?.id === userId;
                const opponent = isChallenger ? c.challenged as any : c.challenger as any;
                const won = c.winner_id === userId;
                const draw = c.winner_id === null;
                return (
                  <div key={c.id} className="flex items-center justify-between bg-[#f7f7f7] rounded-3xl p-5 border-2 border-duo-gray border-b-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-duo-gray">
                        {won ? "🏆" : draw ? "🤝" : "😢"}
                      </div>
                      <div>
                        <p className="font-black text-duo-foreground uppercase leading-tight">vs {opponent?.name || "Jugador"}</p>
                        <p className="text-xs font-black text-duo-gray-dark mt-1">
                          {c.challenger_score} PUNTOS vs {c.challenged_score} PUNTOS
                        </p>
                      </div>
                    </div>
                    <span className={`font-black text-xs px-4 py-2 rounded-xl border-2 border-b-4 uppercase ${won ? "bg-duo-green/10 border-duo-green text-duo-green" : draw ? "bg-duo-gray/20 border-duo-gray text-duo-gray-dark" : "bg-duo-red/10 border-duo-red text-duo-red"}`}>
                      {won ? "+20 XP" : draw ? "+10 XP" : "+5 XP"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Public Ranking */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-duo-foreground uppercase italic tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-duo-yellow fill-duo-yellow" />
            Ranking de Sabios
          </h2>
          <div className="space-y-4">
            {players.map((player: any, index: number) => {
              const pLevel = calculateLevel(player.xp || 0);
              const pRank = getRankInfo(pLevel);
              const isMe = player.id === userId;
              const alreadyChallenged = myPending.some(
                (c: any) => (c.challenged as any)?.id === player.id
              );
              
              // Styling for top 3
              let rankStyle = "bg-duo-gray text-duo-gray-dark border-duo-gray";
              if (index === 0) rankStyle = "bg-duo-yellow text-white border-b-4 border-[#e5a400] scale-110 z-10 shadow-lg";
              else if (index === 1) rankStyle = "bg-slate-300 text-white border-b-4 border-slate-400";
              else if (index === 2) rankStyle = "bg-[#cd7f32] text-white border-b-4 border-[#a0522d]";

              return (
                <div key={player.id} className={`flex items-center justify-between rounded-[2rem] p-5 border-2 border-b-8 transition-all ${isMe ? "bg-duo-blue/5 border-duo-blue shadow-sm" : "bg-white border-duo-gray hover:bg-duo-gray/5"}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic ${rankStyle}`}>
                      #{index + 1}
                    </div>
                    <div className="w-14 h-14 bg-white border-2 border-duo-gray rounded-2xl flex items-center justify-center text-3xl relative shadow-sm">
                      {pRank.emoji}
                      {isMe && <span className="absolute -top-1 -right-1 w-4 h-4 bg-duo-blue rounded-full border-2 border-white ring-2 ring-duo-blue/20"></span>}
                    </div>
                    <div>
                      <p className="font-black text-duo-foreground uppercase text-lg leading-tight flex items-center gap-2">
                        {player.name}
                        {isMe && <span className="text-[10px] bg-duo-blue text-white px-2 py-0.5 rounded-lg border-b-2 border-duo-blue-dark">TÚ</span>}
                      </p>
                      <p className="text-xs font-black text-duo-gray-dark uppercase tracking-widest mt-1">Lv.{pLevel} · {pRank.name} · {player.xp || 0} XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 bg-duo-yellow/10 px-4 py-2 rounded-2xl border-2 border-duo-yellow/20">
                      <Star className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
                      <span className="text-duo-yellow font-black text-lg">{player.points || 0}</span>
                    </div>
                    
                    {!isMe && (
                      <div className="w-32">
                        {alreadyChallenged ? (
                          <div className="w-full py-3 text-center text-xs font-black uppercase text-duo-yellow bg-duo-yellow/10 rounded-2xl border-2 border-duo-yellow/20 italic">
                            ⏳ Pendiente
                          </div>
                        ) : (
                          <form action={async () => {
                            "use server";
                            await createChallenge(userId, player.id);
                          }}>
                            <button className="w-full bg-duo-red text-white border-b-4 border-[#d33131] active:border-b-0 active:translate-y-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                              <Swords className="w-4 h-4 font-black" />
                              Retar
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My pending sent */}
        {myPending.length > 0 && (
          <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-duo-gray-dark mb-6 flex items-center gap-3 uppercase italic">
              <div className="w-10 h-10 bg-duo-gray rounded-xl flex items-center justify-center border-b-4 border-duo-gray-dark">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Retos Enviados ({myPending.length})
            </h2>
            <div className="space-y-4">
              {myPending.map((c: any) => {
                const opponent = c.challenged as any;
                return (
                  <div key={c.id} className="flex items-center justify-between bg-[#f7f7f7] rounded-3xl p-5 border-2 border-duo-gray border-b-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        ⏳
                      </div>
                      <div>
                        <p className="font-black text-duo-foreground uppercase leading-tight">Reto a {opponent?.name}</p>
                        <p className="text-xs font-black text-duo-gray-dark mt-1">Esperando aceptación...</p>
                      </div>
                    </div>
                    <form action={async () => {
                      "use server";
                      await cancelChallenge(c.id, userId);
                    }}>
                      <button className="bg-white text-duo-gray-dark border-2 border-duo-gray border-b-4 px-5 py-2.5 rounded-2xl font-black text-xs uppercase hover:bg-duo-red/10 hover:text-duo-red hover:border-duo-red transition-all">
                        Cancelar
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
