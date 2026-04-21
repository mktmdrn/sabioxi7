"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitScore } from "@/actions/arena";

const GAME_DURATION = 10; // seconds

export default function TapGame({
  challengeId,
  userId,
  userLevel,
  opponentName,
  opponentLevel,
}: {
  challengeId: string;
  userId: string;
  userLevel: number;
  opponentName: string;
  opponentLevel: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [finalScore, setFinalScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const tapMultiplier = 1 + userLevel / 200;

  const startGame = useCallback(() => {
    setPhase("playing");
    setTaps(0);
    setTimeLeft(GAME_DURATION);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("done");
      }
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== "playing") return;
    setTaps((prev) => prev + 1);
  }, [phase]);

  // Calculate and save score when done
  useEffect(() => {
    if (phase === "done" && !saving) {
      const score = Math.round(taps * tapMultiplier);
      setFinalScore(score);
      setSaving(true);
      submitScore(challengeId, userId, score).then(() => {
        setSaving(false);
      });
    }
  }, [phase, taps, tapMultiplier, challengeId, userId, saving]);

  const progressPercent = ((GAME_DURATION - timeLeft) / GAME_DURATION) * 100;

  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-3xl font-extrabold text-white">Carrera de Tapping</h1>
          <p className="text-slate-400 text-lg">
            Pulsa el botón lo más rápido posible durante {GAME_DURATION} segundos.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tu nivel:</span>
              <span className="text-white font-bold">Lv.{userLevel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Multiplicador:</span>
              <span className="text-amber-400 font-bold">x{tapMultiplier.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Oponente:</span>
              <span className="text-white font-bold">{opponentName} (Lv.{opponentLevel})</span>
            </div>
          </div>
          <button
            onClick={startGame}
            className="w-full bg-red-500 text-white border-b-4 border-red-600 active:border-b-0 active:translate-y-[4px] py-5 rounded-2xl font-extrabold text-2xl hover:bg-red-400 transition-all"
          >
            🏁 ¡EMPEZAR!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-3xl font-extrabold text-white">¡Tiempo!</h1>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
            <p className="text-slate-400">Taps realizados</p>
            <p className="text-5xl font-extrabold text-white">{taps}</p>
            <div className="border-t border-slate-800 pt-4 mt-4">
              <p className="text-slate-400 text-sm">Multiplicador x{tapMultiplier.toFixed(1)}</p>
              <p className="text-amber-400 text-3xl font-extrabold">{finalScore} pts</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            {saving ? "Guardando resultado..." : "Resultado guardado. Esperando al oponente..."}
          </p>
          <button
            onClick={() => router.push("/arena")}
            className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-colors"
          >
            Volver a la Arena
          </button>
        </div>
      </div>
    );
  }

  // PLAYING phase
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Timer */}
      <div className="mb-6 text-center">
        <p className="text-7xl font-extrabold text-white tabular-nums">
          {timeLeft.toFixed(1)}
        </p>
        <p className="text-slate-500 text-sm mt-1">segundos</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md h-3 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-100 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Tap counter */}
      <p className="text-amber-400 text-2xl font-bold mb-8">
        {taps} taps · <span className="text-white">{Math.round(taps * tapMultiplier)} pts</span>
      </p>

      {/* TAP BUTTON */}
      <button
        onPointerDown={handleTap}
        className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-8 border-red-400 shadow-[0_0_60px_rgba(239,68,68,0.4)] active:scale-95 active:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center select-none touch-none"
      >
        <span className="text-white text-5xl sm:text-6xl font-extrabold pointer-events-none">
          TAP!
        </span>
      </button>

      <p className="text-slate-600 text-xs mt-8">
        x{tapMultiplier.toFixed(1)} multiplicador (Lv.{userLevel})
      </p>
    </div>
  );
}
