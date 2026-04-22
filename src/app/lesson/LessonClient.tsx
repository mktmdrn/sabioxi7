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

  const handleCheck = () => {
    if (!selectedOption) return;
    if (selectedOption === currentQ.correctAnswer) {
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
    const finalScore = score + (status === "correct" ? 1 : 0);
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
    <div className="h-screen bg-white text-duo-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b-2 border-duo-gray">
        <button onClick={() => router.push("/dashboard")} className="text-duo-gray-dark hover:text-duo-foreground transition-colors">
          <X className="w-8 h-8" />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-6 h-4 bg-duo-gray rounded-full overflow-hidden">
          <div 
            className="h-full bg-duo-green transition-all duration-300 relative" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-duo-yellow/10 px-4 py-2 rounded-xl border border-duo-yellow/20">
          <Star className="w-5 h-5 text-duo-yellow fill-current" />
          <span className="font-black text-duo-yellow">{score}</span>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-duo-foreground text-center italic">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {shuffledOptions.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = status === "correct" && isSelected;
              const isWrong = status === "incorrect" && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => status === "idle" && setSelectedOption(option)}
                  disabled={status !== "idle"}
                  className={`
                    group p-5 rounded-2xl text-left font-black text-lg border-2 border-b-8 transition-all
                    ${status === "idle" 
                      ? isSelected 
                        ? "bg-duo-blue/10 border-duo-blue text-duo-blue translate-y-2 border-b-0" 
                        : "bg-white border-duo-gray text-duo-foreground hover:bg-[#f7f7f7]"
                      : isCorrect
                        ? "bg-duo-green/10 border-duo-green text-duo-green translate-y-2 border-b-0"
                        : isWrong
                          ? "bg-duo-red/10 border-duo-red text-duo-red translate-y-2 border-b-0"
                          : "bg-white border-duo-gray text-duo-foreground opacity-50"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 font-black text-xs ${isSelected ? "bg-duo-blue border-duo-blue text-white" : "bg-white border-duo-gray text-duo-gray-dark"}`}>
                      {idx + 1}
                    </span>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-6 border-t-2 transition-colors ${
        status === "correct" ? "bg-duo-green/10 border-duo-green/20" : 
        status === "incorrect" ? "bg-duo-red/10 border-duo-red/20" : 
        "bg-white border-duo-gray"
      }`}>
        <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {status === "correct" && (
              <div className="flex items-center gap-3 text-duo-green">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-duo-green">
                  <Check className="w-8 h-8" />
                </div>
                <span className="text-xl font-black uppercase italic">¡Buen trabajo!</span>
              </div>
            )}
            {status === "incorrect" && (
              <div className="flex items-center gap-3 text-duo-red text-center sm:text-left">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-duo-red hidden sm:flex">
                  <X className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase italic">Solución correcta:</p>
                  <p className="font-bold">{currentQ.correctAnswer}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={status === "idle" ? handleCheck : handleNext}
            disabled={!selectedOption && status === "idle"}
            className={`
              w-full sm:w-auto px-16 py-4 rounded-2xl font-black text-lg transition-all border-b-8 active:border-b-0 active:translate-y-2
              ${!selectedOption && status === "idle" 
                ? "bg-duo-gray border-duo-gray-dark text-duo-gray-dark" 
                : status === "correct"
                  ? "bg-duo-green border-duo-green-dark text-white"
                  : status === "incorrect"
                    ? "bg-duo-red border-duo-red-dark text-white"
                    : "bg-duo-green border-duo-green-dark text-white"}
            `}
          >
            {status === "idle" ? "COMPROBAR" : "SIGUIENTE"}
          </button>
        </div>
      </footer>
    </div>
  );
}
