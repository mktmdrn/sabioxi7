import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getChallengeById } from "@/actions/arena";
import { getUserXp, getUserPoints, getAvatarConfig } from "@/actions/db";
import { calculateLevel } from "@/lib/levels";
import RaceGame from "./RaceGame";
import Link from "next/link";

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return (
      <div className="h-[calc(100dvh-4rem)] bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">❌</p>
          <h1 className="text-2xl font-bold text-white">Reto no encontrado</h1>
          <Link href="/arena" className="text-blue-400 hover:underline">Volver a la Arena</Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;
  const challenger = challenge.challenger as any;
  const challenged = challenge.challenged as any;
  const isChallenger = challenger?.id === userId;
  const isParticipant = challenger?.id === userId || challenged?.id === userId;

  if (!isParticipant) redirect("/arena");

  const opponent = isChallenger ? challenged : challenger;
  const myXp = await getUserXp(userId);
  const myLevel = calculateLevel(myXp);
  const myPoints = await getUserPoints(userId);
  const myAvatarConfig = await getAvatarConfig(userId);
  const opponentLevel = calculateLevel(opponent?.xp || 0);
  const opponentConfig = opponent?.avatar_config || { color: "blue", hat: "none", accessory: "none" };

  // If completed, show results
  if (challenge.status === "completed") {
    const won = challenge.winner_id === userId;
    const draw = challenge.winner_id === null;

    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-duo-gray border-b-8 rounded-[3rem] p-10 text-center space-y-8 shadow-sm">
          <div className="text-8xl filter drop-shadow-lg animate-bounce">{won ? "🏆" : draw ? "🤝" : "😢"}</div>
          <div>
            <h1 className="text-4xl font-black text-duo-foreground uppercase italic tracking-tighter">
              {won ? "¡Victoria!" : draw ? "¡Empate!" : "Derrota..."}
            </h1>
            <p className={`font-black text-lg mt-2 uppercase tracking-tight ${won ? "text-duo-green" : draw ? "text-duo-gray-dark" : "text-duo-red"}`}>
              vs {opponent?.name} · {won ? "+20 XP" : draw ? "+10 XP" : "+5 XP"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="/arena" className="bg-white text-duo-foreground border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-duo-gray/5 transition-all">
              Volver a la Arena
            </Link>
            <Link href="/dashboard" className="bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:brightness-110 transition-all shadow-lg shadow-duo-blue/20">
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If accepted, show the race game
  if (challenge.status === "accepted") {
    return (
      <RaceGame
        challengeId={id}
        userId={userId}
        userLevel={myLevel}
        userPoints={myPoints}
        myConfig={myAvatarConfig}
        opponentConfig={opponentConfig}
        opponentName={opponent?.name || "Oponente"}
        opponentLevel={opponentLevel}
        opponentId={opponent?.id || ""}
        isChallenger={isChallenger}
      />
    );
  }

  // Pending or other status
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border-2 border-duo-gray border-b-8 rounded-[3rem] p-10 text-center space-y-6 shadow-sm">
        <div className="text-6xl animate-pulse">⚔️</div>
        <h1 className="text-2xl font-black text-duo-foreground uppercase italic">Reto pendiente</h1>
        <p className="text-duo-gray-dark font-bold">Este reto aún no ha sido aceptado por tu oponente.</p>
        <Link href="/arena" className="block w-full bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:brightness-110 transition-all">
          Volver a la Arena
        </Link>
      </div>
    </div>
  );
}
