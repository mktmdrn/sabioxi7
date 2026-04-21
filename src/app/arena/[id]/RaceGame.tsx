"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { buyBooster, finishRace } from "@/actions/arena";
import { Rocket, Star, ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

const RaceScene = dynamic(() => import("@/components/RaceScene"), { ssr: false });

const FINISH_LINE = 50;
const RACE_TIMEOUT = 30; // seconds

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Phase = "lobby" | "countdown" | "racing" | "finished";

export default function RaceGame({
  challengeId,
  userId,
  userLevel,
  userPoints,
  myConfig,
  opponentConfig,
  opponentName,
  opponentLevel,
  opponentId,
  isChallenger,
}: {
  challengeId: string;
  userId: string;
  userLevel: number;
  userPoints: number;
  myConfig: { color: string; hat: string; accessory: string };
  opponentConfig: { color: string; hat: string; accessory: string };
  opponentName: string;
  opponentLevel: number;
  opponentId: string;
  isChallenger: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [countdown, setCountdown] = useState(3);
  const [myPos, setMyPos] = useState(0);
  const [opPos, setOpPos] = useState(0);
  const [mySpeed, setMySpeed] = useState(0);
  const [opSpeed, setOpSpeed] = useState(0);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasBooster, setHasBooster] = useState(false);
  const [myBoosting, setMyBoosting] = useState(false);
  const [opBoosting, setOpBoosting] = useState(false);
  const [boosterUsed, setBoosterUsed] = useState(false);
  const [opReady, setOpReady] = useState(false);
  const [meReady, setMeReady] = useState(false);
  const [winner, setWinner] = useState<"me" | "opponent" | "draw" | null>(null);
  const [timeLeft, setTimeLeft] = useState(RACE_TIMEOUT);
  const [buyingBooster, setBuyingBooster] = useState(false);
  const [stars, setStars] = useState(userPoints);

  const channelRef = useRef<any>(null);
  const myPosRef = useRef(0);
  const opPosRef = useRef(0);
  const speedDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const stepSize = 0.5 + userLevel / 500;

  // Supabase Realtime channel setup
  useEffect(() => {
    const channel = supabase.channel(`race-${challengeId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "ready" }, () => {
        setOpReady(true);
      })
      .on("broadcast", { event: "position" }, ({ payload }: any) => {
        opPosRef.current = payload.pos;
        setOpPos(payload.pos);
        setOpSpeed(payload.speed);
        setOpBoosting(payload.boosting || false);
      })
      .on("broadcast", { event: "finish" }, ({ payload }: any) => {
        // Opponent finished
        if (!finishedRef.current) {
          finishedRef.current = true;
          setWinner("opponent");
          setPhase("finished");
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      if (speedDecayRef.current) clearInterval(speedDecayRef.current);
      if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
      if (raceTimerRef.current) clearInterval(raceTimerRef.current);
    };
  }, [challengeId]);

  // Send ready
  const handleReady = useCallback(() => {
    setMeReady(true);
    channelRef.current?.send({ type: "broadcast", event: "ready", payload: {} });
  }, []);

  // Start countdown when both ready
  useEffect(() => {
    if (meReady && opReady && phase === "lobby") {
      setPhase("countdown");
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase("racing");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [meReady, opReady, phase]);

  // Race timer
  useEffect(() => {
    if (phase !== "racing") return;
    setTimeLeft(RACE_TIMEOUT);
    raceTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - compare positions
          if (!finishedRef.current) {
            finishedRef.current = true;
            const myFinal = myPosRef.current;
            const opFinal = opPosRef.current;
            if (myFinal > opFinal) setWinner("me");
            else if (opFinal > myFinal) setWinner("opponent");
            else setWinner("draw");
            setPhase("finished");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Speed decay
    speedDecayRef.current = setInterval(() => {
      setMySpeed((prev) => Math.max(0, prev * 0.85));
    }, 100);

    // Broadcast position
    const broadcastInterval = setInterval(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "position",
        payload: { pos: myPosRef.current, speed: mySpeed, boosting: myBoosting },
      });
    }, 50);

    return () => {
      if (raceTimerRef.current) clearInterval(raceTimerRef.current);
      if (speedDecayRef.current) clearInterval(speedDecayRef.current);
      clearInterval(broadcastInterval);
    };
  }, [phase]);

  // Keyboard handler
  useEffect(() => {
    if (phase !== "racing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
        // Space for booster
        if (e.key === " " && hasBooster && !boosterUsed) {
          e.preventDefault();
          activateBooster();
          return;
        }
        return;
      }
      e.preventDefault();

      // Must alternate keys
      if (e.key === lastKey) return;
      setLastKey(e.key);

      const boost = myBoosting ? 2 : 1;
      const step = stepSize * boost;
      const newPos = Math.min(myPosRef.current + step, FINISH_LINE);
      myPosRef.current = newPos;
      setMyPos(newPos);
      setMySpeed(1);

      // Check finish
      if (newPos >= FINISH_LINE && !finishedRef.current) {
        finishedRef.current = true;
        setWinner("me");
        setPhase("finished");
        channelRef.current?.send({ type: "broadcast", event: "finish", payload: {} });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, lastKey, stepSize, myBoosting, hasBooster, boosterUsed]);

  // Handle finish - save results
  useEffect(() => {
    if (phase !== "finished" || !winner) return;
    if (winner === "me") {
      finishRace(challengeId, userId, opponentId);
    }
    // If opponent won, they call finishRace from their side
  }, [phase, winner]);

  const activateBooster = () => {
    if (boosterUsed || !hasBooster) return;
    setBoosterUsed(true);
    setMyBoosting(true);
    boostTimerRef.current = setTimeout(() => {
      setMyBoosting(false);
    }, 3000);
  };

  const handleBuyBooster = async () => {
    if (stars < 3) return;
    setBuyingBooster(true);
    const success = await buyBooster(userId);
    if (success) {
      setHasBooster(true);
      setStars((prev) => prev - 3);
    }
    setBuyingBooster(false);
  };

  // Mobile touch controls
  const handleTouch = (key: string) => {
    if (phase !== "racing" || finishedRef.current) return;
    if (key === lastKey) return;
    setLastKey(key);
    const boost = myBoosting ? 2 : 1;
    const step = stepSize * boost;
    const newPos = Math.min(myPosRef.current + step, FINISH_LINE);
    myPosRef.current = newPos;
    setMyPos(newPos);
    setMySpeed(1);
    if (newPos >= FINISH_LINE && !finishedRef.current) {
      finishedRef.current = true;
      setWinner("me");
      setPhase("finished");
      channelRef.current?.send({ type: "broadcast", event: "finish", payload: {} });
    }
  };

  const progressMe = (myPos / FINISH_LINE) * 100;
  const progressOp = (opPos / FINISH_LINE) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* HUD */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-2 z-30 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-400">Tú</span>
            <span className="text-white font-bold ml-2">Lv.{userLevel}</span>
            {hasBooster && !boosterUsed && (
              <span className="ml-2 text-amber-400 animate-pulse">🚀</span>
            )}
            {myBoosting && (
              <span className="ml-2 text-amber-400 font-bold animate-pulse">BOOST!</span>
            )}
          </div>
          {phase === "racing" && (
            <span className="text-white font-bold tabular-nums">{timeLeft}s</span>
          )}
          <div className="text-sm text-right">
            <span className="text-slate-400">{opponentName}</span>
            <span className="text-white font-bold ml-2">Lv.{opponentLevel}</span>
            {opBoosting && (
              <span className="ml-2 text-red-400 font-bold animate-pulse">BOOST!</span>
            )}
          </div>
        </div>
        {/* Progress bars */}
        {phase === "racing" && (
          <div className="max-w-4xl mx-auto mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 w-8">Tú</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-100 rounded-full" style={{ width: `${progressMe}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 w-8">{opponentName.slice(0, 4)}</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-100 rounded-full" style={{ width: `${progressOp}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative">
        <RaceScene
          player1Config={isChallenger ? myConfig : opponentConfig}
          player2Config={isChallenger ? opponentConfig : myConfig}
          player1Pos={isChallenger ? myPos : opPos}
          player2Pos={isChallenger ? opPos : myPos}
          player1Speed={isChallenger ? mySpeed : opSpeed}
          player2Speed={isChallenger ? opSpeed : mySpeed}
          player1Boosting={isChallenger ? myBoosting : opBoosting}
          player2Boosting={isChallenger ? opBoosting : myBoosting}
        />

        {/* Lobby overlay */}
        {phase === "lobby" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="text-center space-y-6 max-w-sm">
              <div className="text-6xl">⚔️</div>
              <h1 className="text-3xl font-extrabold text-white">Sala de Espera</h1>
              <p className="text-slate-300">
                vs <span className="font-bold">{opponentName}</span> (Lv.{opponentLevel})
              </p>

              {/* Booster purchase */}
              {!hasBooster && (
                <button
                  onClick={handleBuyBooster}
                  disabled={stars < 3 || buyingBooster}
                  className={`w-full py-3 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    stars >= 3
                      ? "bg-amber-500 text-white border-b-4 border-amber-600 hover:bg-amber-400 active:border-b-0 active:translate-y-[4px]"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Rocket className="w-5 h-5" />
                  Comprar Booster (3 <Star className="w-4 h-4 inline fill-current" />)
                </button>
              )}
              {hasBooster && (
                <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl text-amber-400 font-bold">
                  🚀 Booster preparado (pulsa ESPACIO durante la carrera)
                </div>
              )}

              <div className="space-y-2">
                {!meReady ? (
                  <button
                    onClick={handleReady}
                    className="w-full bg-green-500 text-white border-b-4 border-green-600 active:border-b-0 active:translate-y-[4px] py-4 rounded-2xl font-extrabold text-xl hover:bg-green-400 transition-all"
                  >
                    ✅ LISTO
                  </button>
                ) : (
                  <div className="text-green-400 font-bold text-lg">✅ Estás listo</div>
                )}
                {!opReady && meReady && (
                  <p className="text-slate-500 text-sm animate-pulse">Esperando a {opponentName}...</p>
                )}
              </div>

              <p className="text-slate-600 text-xs">
                Alterna ← → para correr. Cuanto más rápido alternes, más rápido corres.
              </p>
            </div>
          </div>
        )}

        {/* Countdown overlay */}
        {phase === "countdown" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <div className="text-9xl font-extrabold text-white animate-bounce drop-shadow-2xl">
              {countdown}
            </div>
          </div>
        )}

        {/* Finished overlay */}
        {phase === "finished" && winner && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="text-center space-y-6 max-w-sm">
              <div className="text-7xl">
                {winner === "me" ? "🏆" : winner === "draw" ? "🤝" : "😢"}
              </div>
              <h1 className="text-4xl font-extrabold text-white">
                {winner === "me" ? "¡Victoria!" : winner === "draw" ? "¡Empate!" : "Derrota..."}
              </h1>
              <p className={`font-bold text-lg ${winner === "me" ? "text-green-400" : winner === "draw" ? "text-slate-300" : "text-red-400"}`}>
                {winner === "me" ? "+20 XP" : winner === "draw" ? "+10 XP" : "+5 XP"}
              </p>
              <div className="flex gap-3">
                <Link href="/arena" className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors text-center">
                  Arena
                </Link>
                <Link href="/dashboard" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-500 transition-colors text-center">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      {phase === "racing" && (
        <div className="sm:hidden flex gap-4 p-4 bg-slate-900 border-t border-slate-800">
          <button
            onTouchStart={() => handleTouch("ArrowLeft")}
            className={`flex-1 py-6 rounded-2xl font-extrabold text-2xl transition-all ${
              lastKey === "ArrowLeft"
                ? "bg-blue-600 text-white scale-95"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700"
            }`}
          >
            ← IZQ
          </button>
          <button
            onTouchStart={() => handleTouch("ArrowRight")}
            className={`flex-1 py-6 rounded-2xl font-extrabold text-2xl transition-all ${
              lastKey === "ArrowRight"
                ? "bg-blue-600 text-white scale-95"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700"
            }`}
          >
            DER →
          </button>
        </div>
      )}

      {/* Desktop key hints */}
      {phase === "racing" && (
        <div className="hidden sm:flex justify-center gap-6 p-3 bg-slate-900/80 border-t border-slate-800">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${lastKey === "ArrowLeft" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            <ArrowLeft className="w-5 h-5" /> ←
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${lastKey === "ArrowRight" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            → <ArrowRight className="w-5 h-5" />
          </div>
          {hasBooster && !boosterUsed && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
              <Rocket className="w-5 h-5" /> ESPACIO = Boost
            </div>
          )}
        </div>
      )}
    </div>
  );
}
