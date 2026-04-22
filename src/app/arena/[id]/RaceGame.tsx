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
    <div className="h-[calc(100dvh-4rem)] bg-white relative overflow-hidden flex flex-col font-sans">
      {/* 3D Scene - Now as the background */}
      <div className="absolute inset-0 z-0">
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
      </div>

      {/* HUD Overlay - Top */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-duo-gray px-4 py-3 z-30 pointer-events-none shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-widest text-duo-blue flex items-center gap-2">
            <span className="bg-duo-blue text-white px-2 py-0.5 rounded-lg border-b-2 border-duo-blue-dark">TÚ</span>
            <span className="text-duo-foreground">Lv.{userLevel}</span>
            {hasBooster && !boosterUsed && (
              <span className="text-duo-yellow animate-pulse">🚀</span>
            )}
            {myBoosting && (
              <span className="text-duo-yellow font-black animate-pulse text-[10px]">¡BOOST!</span>
            )}
          </div>
          <div className="text-center">
            {phase === "racing" ? (
              <div className="bg-duo-gray/10 px-6 py-1 rounded-2xl border-2 border-duo-gray border-b-4">
                <span className="text-duo-foreground font-black tabular-nums text-xl italic">{timeLeft}S</span>
              </div>
            ) : (
              <span className="text-duo-gray-dark font-black text-[10px] uppercase tracking-[0.2em]">SALA #{challengeId.slice(-4)}</span>
            )}
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-duo-red flex items-center gap-2 text-right">
            <span className="text-duo-foreground">Lv.{opponentLevel}</span>
            <span className="bg-duo-red text-white px-2 py-0.5 rounded-lg border-b-2 border-[#d33131]">{opponentName.split(' ')[0]}</span>
            {opBoosting && (
              <span className="text-duo-yellow font-black animate-pulse text-[10px]">¡BOOST!</span>
            )}
          </div>
        </div>
        {phase === "racing" && (
          <div className="max-w-4xl mx-auto mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-duo-gray rounded-full overflow-hidden border-2 border-duo-gray shadow-inner">
                <div className="h-full bg-duo-blue transition-all duration-100 rounded-full border-r-4 border-duo-blue-dark" style={{ width: `${progressMe}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-duo-gray rounded-full overflow-hidden border-2 border-duo-gray shadow-inner">
                <div className="h-full bg-duo-red transition-all duration-100 rounded-full border-r-4 border-[#d33131]" style={{ width: `${progressOp}%` }} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container for Overlays (Connecting, Lobby, Countdown, Finished) */}
      <div className="flex-1 relative z-20 pointer-events-none">
        {phase === "connecting" && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-spin">🦉</div>
              <p className="text-duo-foreground text-xl font-black uppercase italic tracking-tight">Conectando con la Arena...</p>
            </div>
          </div>
        )}

        {phase === "lobby" && (
          <div className="absolute inset-0 bg-[#f7f7f7]/40 flex items-center justify-center p-6 pointer-events-auto">
            <div className="text-center space-y-6 max-w-sm w-full bg-white p-8 rounded-[3rem] border-2 border-duo-gray border-b-8 shadow-2xl">
              <div className="text-6xl animate-bounce">⚔️</div>
              <div>
                <h1 className="text-2xl font-black text-duo-foreground uppercase italic tracking-tight">Sala de Espera</h1>
                <p className="text-duo-gray-dark font-bold text-sm mt-1 uppercase">Duelo contra <span className="text-duo-blue">{opponentName}</span></p>
              </div>

              {!hasBooster ? (
                <button
                  onClick={handleBuyBooster}
                  disabled={stars < 3 || buyingBooster}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all border-b-4 ${
                    stars >= 3 
                      ? "bg-duo-yellow text-white border-[#e5a400] hover:brightness-110 active:border-b-0 active:translate-y-1" 
                      : "bg-duo-gray text-duo-gray-dark border-duo-gray-dark cursor-not-allowed"
                  }`}
                >
                  <Rocket className="w-5 h-5" /> Comprar Booster (3⭐)
                </button>
              ) : (
                <div className="bg-duo-yellow/10 border-2 border-duo-yellow/20 p-3 rounded-2xl text-duo-yellow font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4 animate-pulse" /> Booster Preparado
                </div>
              )}

              <div className="space-y-3">
                {!meReady ? (
                  <button
                    onClick={handleReady}
                    disabled={!channelReady}
                    className="w-full bg-duo-green text-white border-b-8 border-duo-green-dark active:border-b-0 active:translate-y-2 py-5 rounded-[1.5rem] font-black text-xl uppercase italic tracking-tighter transition-all hover:brightness-110"
                  >
                    ¡ESTOY LISTO!
                  </button>
                ) : (
                  <div className="bg-duo-green/10 text-duo-green font-black uppercase py-4 rounded-2xl border-2 border-duo-green/20 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 font-black" /> ¡LISTO!
                  </div>
                )}
                <div className="h-6">
                  {opReady && !meReady && <p className="text-duo-green text-[10px] font-black uppercase animate-pulse">✅ El rival está listo</p>}
                  {!opReady && meReady && <p className="text-duo-gray-dark text-[10px] font-black uppercase animate-pulse italic">Esperando al oponente...</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-9xl font-black text-duo-foreground animate-ping drop-shadow-xl italic uppercase tracking-tighter">
              {countdown > 0 ? countdown : "¡YA!"}
            </div>
          </div>
        )}

        {phase === "finished" && winner && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto">
            <div className="text-center space-y-8 max-w-sm w-full bg-white p-10 rounded-[3rem] border-2 border-duo-gray border-b-8 shadow-2xl">
              <div className="text-8xl animate-bounce">{winner === "me" ? "🏆" : "🤝"}</div>
              <div>
                <h1 className="text-4xl font-black text-duo-foreground uppercase italic tracking-tighter">
                  {winner === "me" ? "¡VICTORIA!" : "¡BUEN JUEGO!"}
                </h1>
                <p className="text-duo-gray-dark font-bold mt-2 uppercase tracking-widest text-sm">El duelo ha terminado</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                  Panel Principal
                </Link>
                <Link href="/arena" className="w-full bg-white text-duo-gray-dark border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                  Volver a la Arena
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-[80px] left-0 right-0 z-40 pointer-events-none">
        {phase === "racing" && (
          <div className="flex justify-center gap-12 max-w-2xl mx-auto w-full pointer-events-auto px-6">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch("ArrowLeft"); }}
              onMouseDown={(e) => { e.preventDefault(); handleTouch("ArrowLeft"); }}
              className={`w-24 h-24 rounded-full font-black text-4xl transition-all shadow-xl border-4 backdrop-blur-md active:scale-90 touch-none flex items-center justify-center border-b-8 ${
                lastKey === "ArrowLeft" 
                  ? "bg-duo-blue text-white border-duo-blue-dark translate-y-2" 
                  : "bg-white/40 border-duo-gray text-duo-gray-dark"
              }`}
            >
              <ArrowLeft className="w-10 h-10" />
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch("ArrowRight"); }}
              onMouseDown={(e) => { e.preventDefault(); handleTouch("ArrowRight"); }}
              className={`w-24 h-24 rounded-full font-black text-4xl transition-all shadow-xl border-4 backdrop-blur-md active:scale-90 touch-none flex items-center justify-center border-b-8 ${
                lastKey === "ArrowRight" 
                  ? "bg-duo-blue text-white border-duo-blue-dark translate-y-2" 
                  : "bg-white/40 border-duo-gray text-duo-gray-dark"
              }`}
            >
              <ArrowRight className="w-10 h-10" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
