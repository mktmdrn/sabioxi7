"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { buyBooster, finishRace } from "@/actions/arena";
import { Rocket, Star, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const RaceScene = dynamic(() => import("@/components/RaceScene"), { ssr: false });

const FINISH_LINE = 50;
const RACE_TIMEOUT = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Phase = "connecting" | "lobby" | "countdown" | "racing" | "finished";

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
  practiceMode = false,
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
  practiceMode?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("connecting");
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
  const [channelReady, setChannelReady] = useState(false);

  const channelRef = useRef<any>(null);
  const myPosRef = useRef(0);
  const opPosRef = useRef(0);
  const mySpeedRef = useRef(0);
  const speedDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readyPingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const meReadyRef = useRef(false);

  const stepSize = 0.5 + userLevel / 500;

  // Supabase Realtime channel setup
  useEffect(() => {
    if (practiceMode) {
      setChannelReady(true);
      setPhase("lobby");
      setOpReady(true); // Dummy opponent always ready
      return;
    }

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
      .on("broadcast", { event: "finish" }, () => {
        if (!finishedRef.current) {
          finishedRef.current = true;
          setWinner("opponent");
          setPhase("finished");
        }
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          setChannelReady(true);
          setPhase("lobby");
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      if (speedDecayRef.current) clearInterval(speedDecayRef.current);
      if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
      if (raceTimerRef.current) clearInterval(raceTimerRef.current);
      if (readyPingRef.current) clearInterval(readyPingRef.current);
    };
  }, [challengeId]);

  // Send ready — keep pinging until opponent acknowledges
  const handleReady = useCallback(() => {
    setMeReady(true);
    meReadyRef.current = true;

    // Send immediately
    channelRef.current?.send({ type: "broadcast", event: "ready", payload: {} });

    // Keep re-sending every second so even if opponent joins later, they get it
    readyPingRef.current = setInterval(() => {
      if (meReadyRef.current) {
        channelRef.current?.send({ type: "broadcast", event: "ready", payload: {} });
      }
    }, 1000);
  }, []);

  // Start countdown when both ready
  useEffect(() => {
    if (meReady && opReady && phase === "lobby") {
      // Stop pinging
      if (readyPingRef.current) {
        clearInterval(readyPingRef.current);
        readyPingRef.current = null;
      }

      setPhase("countdown");
      setCountdown(3);
      let c = 3;
      const interval = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
          setPhase("racing");
        }
      }, 1000);
    }
  }, [meReady, opReady, phase]);

  // Race timer + broadcasting
  useEffect(() => {
    if (phase !== "racing") return;
    setTimeLeft(RACE_TIMEOUT);

    raceTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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

    speedDecayRef.current = setInterval(() => {
      mySpeedRef.current *= 0.85;
      if (mySpeedRef.current < 0.01) mySpeedRef.current = 0;
      setMySpeed(mySpeedRef.current);
    }, 100);

    const broadcastInterval = setInterval(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "position",
        payload: { pos: myPosRef.current, speed: mySpeedRef.current, boosting: myBoosting },
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
        if (e.key === " " && hasBooster && !boosterUsed) {
          e.preventDefault();
          activateBooster();
        }
        return;
      }
      e.preventDefault();

      if (e.key === lastKey) return;
      setLastKey(e.key);

      const boost = myBoosting ? 2 : 1;
      const step = stepSize * boost;
      const newPos = Math.min(myPosRef.current + step, FINISH_LINE);
      myPosRef.current = newPos;
      setMyPos(newPos);
      
      mySpeedRef.current = 1;
      setMySpeed(1);

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
    if (phase !== "finished" || !winner || practiceMode) return;
    if (winner === "me") {
      finishRace(challengeId, userId, opponentId);
    }
  }, [phase, winner, challengeId, userId, opponentId, practiceMode]);

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

  const handleTouch = (key: string) => {
    if (phase !== "racing" || finishedRef.current) return;
    if (key === lastKey) return;
    setLastKey(key);
    const boost = myBoosting ? 2 : 1;
    const step = stepSize * boost;
    const newPos = Math.min(myPosRef.current + step, FINISH_LINE);
    myPosRef.current = newPos;
    setMyPos(newPos);
    mySpeedRef.current = 1;
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
    <div className="h-[calc(100dvh-4rem)] bg-slate-950 grid grid-rows-[auto,1fr,auto] overflow-hidden">
      {/* HUD */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-2 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-400">Tú</span>
            <span className="text-white font-bold ml-2">Lv.{userLevel}</span>
            {hasBooster && !boosterUsed && (
              <span className="ml-2 text-amber-400 animate-pulse">🚀</span>
            )}
            {myBoosting && (
              <span className="ml-2 text-amber-400 font-bold animate-pulse font-mono text-xs">BOOST!</span>
            )}
          </div>
          <div className="text-center">
            {phase === "racing" ? (
              <span className="text-white font-bold tabular-nums text-lg">{timeLeft}s</span>
            ) : (
              <span className="text-slate-500 font-mono text-xs">Sala #{challengeId.slice(-4)}</span>
            )}
          </div>
          <div className="text-sm text-right">
            <span className="text-slate-400">{opponentName}</span>
            <span className="text-white font-bold ml-2">Lv.{opponentLevel}</span>
            {opBoosting && (
              <span className="ml-2 text-red-400 font-bold animate-pulse font-mono text-xs">BOOST!</span>
            )}
          </div>
        </div>
        {phase === "racing" && (
          <div className="max-w-4xl mx-auto mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 w-8">Tú</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-100 rounded-full" style={{ width: `${progressMe}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 w-8">{opponentName.slice(0, 4)}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-100 rounded-full" style={{ width: `${progressOp}%` }} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3D Scene */}
      <main className="relative min-h-0">
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

        {/* Overlays (Connecting, Lobby, Countdown, Finished) */}
        {phase === "connecting" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="text-center space-y-4">
              <div className="text-5xl animate-spin">⏳</div>
              <p className="text-white text-xl font-bold">Conectando...</p>
            </div>
          </div>
        )}

        {phase === "lobby" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 p-4">
            <div className="text-center space-y-4 max-w-sm w-full bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="text-5xl">⚔️</div>
              <h1 className="text-2xl font-extrabold text-white">Sala de Espera</h1>
              <p className="text-slate-300 text-sm">vs <span className="font-bold">{opponentName}</span></p>

              {!hasBooster ? (
                <button
                  onClick={handleBuyBooster}
                  disabled={stars < 3 || buyingBooster}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    stars >= 3 ? "bg-amber-500 text-white border-b-4 border-amber-600 active:border-b-0 active:translate-y-1" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <Rocket className="w-4 h-4" /> Comprar Booster (3⭐)
                </button>
              ) : (
                <div className="bg-amber-500/20 border border-amber-500/30 p-2 rounded-xl text-amber-400 font-bold text-xs">
                  🚀 Booster preparado
                </div>
              )}

              <div className="space-y-2">
                {!meReady ? (
                  <button
                    onClick={handleReady}
                    disabled={!channelReady}
                    className="w-full bg-green-500 text-white border-b-4 border-green-600 active:border-b-0 active:translate-y-1 py-3 rounded-xl font-extrabold text-lg transition-all"
                  >
                    LISTO
                  </button>
                ) : (
                  <div className="text-green-400 font-bold">✅ Listo</div>
                )}
                {opReady && !meReady && <p className="text-green-400 text-xs">✅ Rival listo</p>}
                {!opReady && meReady && <p className="text-slate-500 text-xs animate-pulse">Esperando rival...</p>}
              </div>
            </div>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <div className="text-8xl font-extrabold text-white animate-ping">
              {countdown > 0 ? countdown : "GO!"}
            </div>
          </div>
        )}

        {phase === "finished" && winner && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 p-4">
            <div className="text-center space-y-6 max-w-sm w-full bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="text-6xl">{winner === "me" ? "🏆" : "🤝"}</div>
              <h1 className="text-3xl font-extrabold text-white">{winner === "me" ? "¡Victoria!" : "¡Buen juego!"}</h1>
              <div className="flex gap-2">
                <Link href="/arena" className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm">Arena</Link>
                <Link href="/dashboard" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">Panel</Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Controls Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-3 h-[110px] sm:h-[80px] flex flex-col justify-center z-40 relative">
        {phase === "racing" ? (
          <div className="flex gap-3 max-w-4xl mx-auto w-full">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch("ArrowLeft"); }}
              onMouseDown={(e) => { e.preventDefault(); handleTouch("ArrowLeft"); }}
              className={`flex-1 py-5 rounded-2xl font-extrabold text-2xl transition-all shadow-lg active:scale-95 touch-none ${
                lastKey === "ArrowLeft" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              ←
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch("ArrowRight"); }}
              onMouseDown={(e) => { e.preventDefault(); handleTouch("ArrowRight"); }}
              className={`flex-1 py-5 rounded-2xl font-extrabold text-2xl transition-all shadow-lg active:scale-95 touch-none ${
                lastKey === "ArrowRight" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              →
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
            {phase === "lobby" ? "Prepárate para la carrera..." : "Esperando..."}
          </p>
        )}
      </footer>
    </div>
  );
}
