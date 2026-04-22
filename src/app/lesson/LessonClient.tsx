"use client";

import { useState, useEffect } from "react";
import { X, Check, XCircle, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lesson, Question, addPointToUser, recordTestLog, addXpToUser } from "@/actions/db";
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

  useEffect(() => {
    if (currentQ) {
      const allOptions = [currentQ.correctAnswer, ...currentQ.wrongAnswers];
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      setShuffledOptions(allOptions);
    }
  }, [currentIndex, currentQ]);

  const handleOptionSelect = (option: string) => {
    if (status !== "idle") return;
    setSelectedOption(option);
    if (option === currentQ.correctAnswer) {
      setStatus("correct");
      setScore((prev) => prev + 1);
    } else {
      setStatus("incorrect");
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setStatus("idle");
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setStatus("finished");
    setIsSaving(true);
    // score is already updated during selection
    const finalScore = score;
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.9;

    if (isApproved) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      await addPointToUser(userId);
      await addXpToUser(userId, 10);
    }

    await recordTestLog(userId, lesson.id, finalScore, isApproved);
    setIsSaving(false);
  };

  if (status === "finished") {
    const finalScore = score;
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.9;

    return (
      <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-2xl w-full bg-white border-2 border-duo-gray border-b-8 p-10 rounded-[3rem] space-y-8">
          {isApproved ? (
            <>
              <div className="w-32 h-32 bg-duo-yellow/20 rounded-full flex items-center justify-center mx-auto border-4 border-duo-yellow animate-bounce">
                <Check className="w-16 h-16 text-duo-yellow" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-duo-foreground mb-2 italic">¡IMPRESIONANTE!</h1>
                <p className="text-duo-blue font-black tracking-widest uppercase">Has dominado esta lección</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f7f7f7] p-4 rounded-2xl border-2 border-duo-gray">
                  <p className="text-[10px] text-duo-gray-dark font-black uppercase mb-1">Aciertos</p>
                  <p className="text-2xl font-black">{finalScore}/{totalQuestions}</p>
                </div>
                <div className="bg-[#f7f7f7] p-4 rounded-2xl border-2 border-duo-gray">
                  <p className="text-[10px] text-duo-gray-dark font-black uppercase mb-1">XP Ganada</p>
                  <p className="text-2xl font-black text-duo-blue">+10 XP</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-32 h-32 bg-duo-red/20 rounded-full flex items-center justify-center mx-auto border-4 border-duo-red">
                <XCircle className="w-16 h-16 text-duo-red" />
              </div>
              <h1 className="text-4xl font-black text-duo-foreground italic uppercase">Sigue practicando</h1>
              <p className="text-duo-gray-dark font-medium text-lg">
                Has obtenido un {Math.round(percentage * 100)}%. ¡No te rindas, vuelve a intentarlo!
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            disabled={isSaving}
            className="w-full py-5 text-xl font-black rounded-2xl bg-duo-blue text-white border-b-8 border-duo-blue-dark hover:brightness-110 transition-all active:border-b-0 active:translate-y-2 disabled:opacity-50 shadow-none"
          >
            VOLVER AL PANEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 z-40 bg-white text-duo-foreground flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-3 md:p-5 flex items-center justify-between bg-white border-b-2 border-duo-gray shrink-0">
        <button onClick={() => router.push("/dashboard")} className="text-duo-gray-dark hover:text-duo-foreground transition-colors p-1">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-4 md:mx-10 h-3 md:h-4 bg-duo-gray rounded-full overflow-hidden">
          <div 
            className="h-full bg-duo-green transition-all duration-500 relative" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-1 left-1 right-1 h-0.5 md:h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-duo-yellow/10 px-3 py-1 md:px-5 md:py-2 rounded-2xl border-2 border-duo-yellow/20 shrink-0">
          <Star className="w-4 h-4 md:w-6 md:h-6 text-duo-yellow fill-current" />
          <span className="font-black text-duo-yellow text-sm md:text-xl tabular-nums">{score}</span>
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 min-h-0 relative">
        <div className="max-w-3xl w-full flex flex-col h-full max-h-full">
          <div className="flex-1 flex flex-col justify-center py-2 md:py-6 space-y-4 md:space-y-8">
            <h2 className="text-lg sm:text-xl md:text-3xl font-black text-duo-foreground text-center italic leading-tight px-2 shrink-0">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 gap-2 md:gap-3 w-full max-w-2xl mx-auto overflow-y-auto pr-1 custom-scrollbar pb-4">
              {shuffledOptions.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = status === "correct" && isSelected;
                const isWrong = status === "incorrect" && isSelected;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    disabled={status !== "idle"}
                    className={`
                      group w-full p-4 md:p-5 rounded-2xl md:rounded-3xl text-left font-black text-base md:text-xl border-2 border-b-4 md:border-b-8 transition-all
                      ${status === "idle" 
                        ? isSelected 
                          ? "bg-duo-blue/10 border-duo-blue text-duo-blue translate-y-1 md:translate-y-2 border-b-0 shadow-inner" 
                          : "bg-white border-duo-gray text-duo-foreground hover:bg-[#f7f7f7] hover:border-duo-gray-dark active:translate-y-1 active:border-b-2"
                        : isCorrect
                          ? "bg-duo-green/10 border-duo-green text-duo-green translate-y-1 md:translate-y-2 border-b-0 shadow-inner"
                          : isWrong
                            ? "bg-duo-red/10 border-duo-red text-duo-red translate-y-1 md:translate-y-2 border-b-0 shadow-inner"
                            : "bg-white border-duo-gray text-duo-foreground opacity-30"}
                    `}
                  >
                    <div className="flex items-center gap-3 md:gap-5">
                      <span className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-[10px] md:text-xs shadow-sm ${isSelected ? "bg-duo-blue border-duo-blue text-white" : "bg-white border-duo-gray text-duo-gray-dark"}`}>
                        {idx + 1}
                      </span>
                      <span className="leading-tight break-words">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Area - Conditional to prevent white space gap */}
      {status !== "idle" && (
        <footer className={`p-4 md:p-6 border-t-2 shrink-0 transition-all duration-500 animate-in slide-in-from-bottom-full ${
          status === "correct" ? "bg-duo-green/10 border-duo-green/20" : 
          "bg-duo-red/10 border-duo-red/20"
        }`}>
          <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {status === "correct" && (
                <div className="flex items-center gap-3 text-duo-green animate-in slide-in-from-bottom-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center border-2 border-duo-green shadow-sm">
                    <Check className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <span className="text-lg md:text-xl font-black uppercase italic tracking-tight">¡Excelente!</span>
                </div>
              )}
              {status === "incorrect" && (
                <div className="flex items-center gap-3 text-duo-red text-center sm:text-left animate-in slide-in-from-bottom-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center border-2 border-duo-red hidden sm:flex shadow-sm">
                    <X className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70">Respuesta correcta:</p>
                    <p className="font-bold text-base md:text-lg leading-tight">{currentQ.correctAnswer}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className={`
                w-full sm:w-auto px-12 md:px-16 py-3 md:py-4 rounded-2xl font-black text-base md:text-lg transition-all border-b-8 active:border-b-0 active:translate-y-2 animate-in zoom-in-95
                ${status === "correct"
                  ? "bg-duo-green border-duo-green-dark text-white"
                  : "bg-duo-red border-duo-red-dark text-white"}
              `}
            >
              SIGUIENTE
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
