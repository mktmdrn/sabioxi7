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
      <div className="h-[100dvh] bg-slate-950 flex items-center justify-center p-4">
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
      <div className="h-[100dvh] bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="text-7xl">{won ? "🏆" : draw ? "🤝" : "😢"}</div>
          <h1 className="text-4xl font-extrabold text-white">
            {won ? "¡Victoria!" : draw ? "¡Empate!" : "Derrota..."}
          </h1>
          <p className={`font-bold text-lg ${won ? "text-green-400" : draw ? "text-slate-300" : "text-red-400"}`}>
            vs {opponent?.name} · {won ? "+20 XP" : draw ? "+10 XP" : "+5 XP"}
          </p>
          <div className="flex gap-3">
            <Link href="/arena" className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors text-center">
              Volver a la Arena
            </Link>
            <Link href="/dashboard" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-colors text-center">
              Dashboard
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
    <div className="h-[100dvh] bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-4xl">⚔️</p>
        <h1 className="text-2xl font-bold text-white">Reto pendiente</h1>
        <p className="text-slate-400">Este reto aún no ha sido aceptado.</p>
        <Link href="/arena" className="block w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors">
          Volver a la Arena
        </Link>
      </div>
    </div>
  );
}
