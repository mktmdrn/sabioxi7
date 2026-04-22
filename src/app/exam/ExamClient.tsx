"use client";

import { useState, useEffect } from "react";
import { X, Check, XCircle, Timer, AlertTriangle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Lesson, Question, addPointToUser, recordTestLog, addXpToUser } from "@/actions/db";
import confetti from "canvas-confetti";

export default function ExamClient({ exam, userId }: { exam: Lesson; userId: string }) {
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<"racing" | "finished">("racing");
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSaving, setIsSaving] = useState(false);

  const currentQ = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const progressPercent = (currentIndex / totalQuestions) * 100;

  useEffect(() => {
    if (status === "finished") return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  useEffect(() => {
    if (currentQ) {
      const allOptions = [currentQ.correctAnswer, ...currentQ.wrongAnswers];
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      setShuffledOptions(allOptions);
      setSelectedOption(null);
    }
  }, [currentIndex, currentQ]);

  const handleOptionClick = (option: string) => {
    if (status === "finished" || isSaving) return;
    
    setSelectedOption(option);
    
    // Calculate if it's correct for the score (hidden from user)
    const wasCorrect = option === currentQ.correctAnswer;
    
    // Auto-advance with small delay for visual feedback of selection
    setTimeout(async () => {
      if (currentIndex < totalQuestions - 1) {
        if (wasCorrect) setScore((prev) => prev + 1);
        setCurrentIndex((prev) => prev + 1);
      } else {
        await handleFinishInternal(option, wasCorrect);
      }
    }, 400);
  };

  const handleFinishInternal = async (lastOption: string, lastCorrect: boolean) => {
    if (status === "finished") return;
    setStatus("finished");
    setIsSaving(true);

    const finalScore = score + (lastCorrect ? 1 : 0);
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.7;

    if (isApproved) {
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
      await addPointToUser(userId);
      await addPointToUser(userId);
      await addXpToUser(userId, 50);
    }

    await recordTestLog(userId, exam.id, finalScore, isApproved);
    setIsSaving(false);
  };

  const handleFinish = async () => {
    handleFinishInternal(selectedOption || "", selectedOption === currentQ?.correctAnswer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "finished") {
    const finalScore = score;
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.7;

    return (
      <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-2xl w-full bg-white border-2 border-duo-gray border-b-8 p-10 rounded-[3rem] space-y-8">
          {isApproved ? (
            <>
              <div className="w-32 h-32 bg-duo-yellow rounded-full flex items-center justify-center mx-auto border-4 border-[#c89b00] animate-bounce">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-duo-foreground mb-2 italic">¡APROBADO!</h1>
                <p className="text-duo-yellow font-black tracking-widest uppercase">Certificación oficial obtenida</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f7f7f7] p-4 rounded-2xl border-2 border-duo-gray">
                  <p className="text-[10px] text-duo-gray-dark font-black uppercase mb-1">Aciertos</p>
                  <p className="text-2xl font-black">{finalScore}/{totalQuestions}</p>
                </div>
                <div className="bg-[#f7f7f7] p-4 rounded-2xl border-2 border-duo-gray">
                  <p className="text-[10px] text-duo-gray-dark font-black uppercase mb-1">Recompensa</p>
                  <p className="text-2xl font-black text-duo-yellow">+2 ⭐ +50 XP</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-32 h-32 bg-duo-red/20 rounded-full flex items-center justify-center mx-auto border-4 border-duo-red">
                <XCircle className="w-16 h-16 text-duo-red" />
              </div>
              <h1 className="text-4xl font-black text-duo-foreground italic uppercase">No Superado</h1>
              <p className="text-duo-gray-dark font-medium text-lg">
                Has obtenido un {Math.round(percentage * 100)}%. Se requiere un 70% para aprobar.
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            disabled={isSaving}
            className="w-full py-5 text-xl font-black rounded-2xl bg-duo-blue text-white border-b-8 border-duo-blue-dark hover:brightness-110 transition-all active:border-b-0 active:translate-y-2 disabled:opacity-50"
          >
            VOLVER AL PANEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white text-duo-foreground flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-3 md:p-6 flex items-center justify-between bg-white border-b-2 border-duo-gray shrink-0">
        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => router.push("/dashboard")} className="text-duo-gray-dark hover:text-duo-foreground transition-colors p-1">
            <X className="w-7 h-7 md:w-9 md:h-9" />
          </button>
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-duo-yellow uppercase tracking-widest">Examen de Certificación</p>
            <h1 className="text-sm font-black italic">{exam.title.replace("[EXAMEN FINAL] ", "")}</h1>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 md:px-8 md:py-3 rounded-2xl border-2 border-b-4 transition-all ${timeLeft < 300 ? "bg-duo-red/10 border-duo-red text-duo-red animate-pulse shadow-lg shadow-duo-red/20" : "bg-duo-gray border-duo-gray-dark text-duo-foreground shadow-sm"}`}>
          <Timer className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-lg md:text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[8px] md:text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Pregunta</p>
          <p className="text-xs md:text-lg font-black">{currentIndex + 1} de {totalQuestions}</p>
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 min-h-0">
        <div className="max-w-4xl w-full flex flex-col h-full max-h-full">
          <div className="flex-1 flex flex-col justify-center py-4 md:py-10 space-y-8 md:space-y-12">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-center italic leading-tight px-2">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 w-full overflow-y-auto pr-1 custom-scrollbar">
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-left font-black text-base sm:text-lg md:text-xl border-2 border-b-4 md:border-b-8 transition-all ${
                    selectedOption === option 
                      ? "bg-duo-blue/10 border-duo-blue text-duo-blue translate-y-1 md:translate-y-2 border-b-0 shadow-inner" 
                      : "bg-white border-duo-gray text-duo-foreground hover:bg-[#f7f7f7] hover:border-duo-gray-dark active:translate-y-1 active:border-b-2"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-xs md:text-sm shadow-sm ${selectedOption === option ? "bg-duo-blue border-duo-blue text-white" : "bg-white border-duo-gray text-duo-gray-dark"}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-tight break-words pt-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t-2 border-duo-gray bg-white">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-duo-gray-dark">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-xs font-black uppercase">Final Boss: Sin segundas oportunidades.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-32 h-2 bg-duo-gray rounded-full overflow-hidden">
              <div 
                className="h-full bg-duo-blue transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-duo-gray-dark">
              Pregunta {currentIndex + 1} de {totalQuestions}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
