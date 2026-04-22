import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserXp, getUserPoints, getAvatarConfig } from "@/actions/db";
import { calculateLevel } from "@/lib/levels";
import RaceGame from "../[id]/RaceGame";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";

export default async function PracticeArenaPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  // Only for super admin
  if (!session?.user?.id || role !== "admin") {
    redirect("/dashboard");
  }

  const userId = session.user.id;
  const myXp = await getUserXp(userId);
  const myLevel = calculateLevel(myXp);
  const myPoints = await getUserPoints(userId);
  const myAvatarConfig = await getAvatarConfig(userId);

  // Dummy opponent data for aesthetic testing
  const dummyOpponentConfig = {
    color: "#ef4444",
    hat: "crown",
    accessory: "glasses",
  };

  return (
    <div className="h-[100dvh] bg-slate-950 flex flex-col overflow-hidden">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md p-4 flex items-center justify-between z-40">
        <Link href="/dashboard/admin" className="text-slate-400 hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Panel</span>
        </Link>
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <PlayCircle className="w-5 h-5" />
          <span>MODO PRUEBA (SOLO ADMIN)</span>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </nav>

      <div className="flex-1 relative">
        <RaceGame
          challengeId="practice-mode"
          userId={userId}
          userLevel={myLevel}
          userPoints={myPoints}
          myConfig={myAvatarConfig}
          opponentConfig={dummyOpponentConfig}
          opponentName="Bot de Prueba"
          opponentLevel={10}
          opponentId="bot-id"
          isChallenger={true}
          practiceMode={true}
        />
      </div>
    </div>
  );
}
