"use client";

import { useState, useEffect } from "react";
import { X, Check, XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lesson, Question, addPointToUser, recordTestLog } from "@/actions/db";
import confetti from "canvas-confetti";

export default function LessonClient({ lesson, userId }: { lesson: Lesson; userId: string }) {
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect" | "finished">("idle");
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentQ = lesson.questions[currentIndex];
  const totalQuestions = lesson.questions.length;
  const progressPercent = (currentIndex / totalQuestions) * 100;

  // Shuffle options when question changes
  useEffect(() => {
    if (currentQ) {
      const allOptions = [currentQ.correctAnswer, ...currentQ.wrongAnswers];
      // Fisher-Yates shuffle
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      setShuffledOptions(allOptions);
      setSelectedOption(null);
      setStatus("idle");
    }
  }, [currentIndex, currentQ]);

  if (!currentQ && status !== "finished") {
    return <div className="p-10 text-center">Cargando...</div>;
  }

  const playDing = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported", e);
    }
  };

  const handleCheck = () => {
    if (!selectedOption) return;
    if (selectedOption === currentQ.correctAnswer) {
      setStatus("correct");
      setScore((prev) => prev + 1);
      playDing();
    } else {
      setStatus("incorrect");
    }
  };

  const handleContinue = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish lesson
      const newScore = score + (status === "correct" ? 1 : 0);
      const percentage = newScore / totalQuestions;
      const isApproved = percentage >= 0.9;
      
      setStatus("finished");
      setIsSaving(true);
      
      if (isApproved) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#3b82f6", "#eab308"]
        });
        await addPointToUser(userId);
      }
      
      // Save to logs
      await recordTestLog(userId, lesson.id, newScore, isApproved);
      setIsSaving(false);
    }
  };

  const bgColor = status === "correct" ? "bg-green-100" : status === "incorrect" ? "bg-red-100" : "bg-white";

  if (status === "finished") {
    const finalScore = score;
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.9;

    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {isApproved ? (
            <>
              <div className="w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500">
                <Check className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">¡Lección superada!</h1>
              <p className="text-lg text-slate-500 font-medium">
                ¡Has conseguido un {Math.round(percentage * 100)}% de aciertos! ¡Ganaste 1 punto!
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                disabled={isSaving}
                className="w-full py-4 text-xl font-bold rounded-2xl bg-green-500 text-white border-b-4 border-green-600 hover:bg-green-400 active:border-b-0 active:translate-y-1 transition-all"
              >
                Volver al Dashboard
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 md:w-32 md:h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-red-500">
                <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">¡Casi lo tienes!</h1>
              <p className="text-lg text-slate-500 font-medium">
                Conseguiste un {Math.round(percentage * 100)}%. Necesitas un 90% para aprobar.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 text-xl font-bold rounded-2xl bg-blue-500 text-white border-b-4 border-blue-600 hover:bg-blue-400 active:border-b-0 active:translate-y-1 transition-all mb-4"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 text-lg font-bold rounded-2xl bg-slate-200 text-slate-500 hover:bg-slate-300 transition-all"
              >
                Volver al Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} text-slate-900 flex flex-col transition-colors duration-300 font-sans`}>
      {/* Header / Progress */}
      <header className="max-w-4xl mx-auto w-full p-4 md:p-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </Link>
        <div className="flex-1 h-3 md:h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 flex flex-col justify-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6 md:mb-10 text-center md:text-left">
          {currentQ.question}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isWrongAndSelected = status === "incorrect" && isSelected;
            const isCorrectAndSelected = status === "correct" && isSelected;
            const isCorrectOption = status !== "idle" && option === currentQ.correctAnswer;

            let buttonClasses = "p-4 md:p-6 rounded-2xl border-2 border-b-4 text-left font-bold text-base md:text-lg transition-all ";
            
            if (isWrongAndSelected) {
              buttonClasses += "border-red-500 bg-red-50 text-red-600 border-b-2 translate-y-[2px]";
            } else if (isCorrectAndSelected || isCorrectOption) {
              buttonClasses += "border-green-500 bg-green-50 text-green-600 border-b-2 translate-y-[2px]";
            } else if (isSelected) {
              buttonClasses += "border-blue-400 bg-blue-50 text-blue-600 border-b-2 translate-y-[2px]";
            } else {
              buttonClasses += "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
            }

            return (
              <button
                key={idx}
                onClick={() => status === "idle" && setSelectedOption(option)}
                disabled={status !== "idle"}
                className={buttonClasses}
              >
                {option}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="border-t-2 border-slate-200 bg-white relative min-h-[100px] md:min-h-[120px] flex items-center">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6">
          {status === "idle" ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOption}
              className={`w-full py-3 md:py-4 text-lg md:text-xl font-bold rounded-2xl border-b-4 transition-all ${
                selectedOption
                  ? "bg-green-500 text-white border-green-600 hover:bg-green-400 active:border-b-0 active:translate-y-1 cursor-pointer"
                  : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
              }`}
            >
              Comprobar
            </button>
          ) : (
            <div className={`absolute inset-0 p-4 md:p-6 flex items-center justify-between ${status === "correct" ? "bg-green-100" : "bg-red-100"}`}>
              <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4 md:gap-6">
                <div className={`flex items-center gap-3 md:gap-4 ${status === "correct" ? "text-green-600" : "text-red-600"} font-extrabold text-xl md:text-2xl`}>
                  {status === "correct" ? (
                    <>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                      </div>
                      ¡Correcto!
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                      </div>
                      <span className="hidden sm:inline">Incorrecto. ¡Inténtalo de nuevo!</span>
                      <span className="sm:hidden">Incorrecto</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className={`py-3 md:py-4 px-6 md:px-10 text-lg md:text-xl font-bold rounded-2xl border-b-4 text-white active:border-b-0 active:translate-y-1 transition-all ${
                    status === "correct" ? "bg-green-500 border-green-600 hover:bg-green-400" : "bg-red-500 border-red-600 hover:bg-red-400"
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
