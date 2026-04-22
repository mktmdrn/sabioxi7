"use client";

import { useState, useEffect } from "react";
import { X, Check, XCircle, Clock, Timer, AlertTriangle } from "lucide-react";
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

  // Timer logic
  useEffect(() => {
    if (status === "finished") return;
    
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  // Shuffle options
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

  const handleNext = () => {
    if (!selectedOption) return;
    
    // Check answer silently
    if (selectedOption === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (status === "finished") return;
    setStatus("finished");
    setIsSaving(true);

    const finalScore = score + (selectedOption === currentQ?.correctAnswer ? 1 : 0);
    const percentage = finalScore / totalQuestions;
    const isApproved = percentage >= 0.7; // Exams approve with 70%

    if (isApproved) {
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#eab308", "#f59e0b", "#fbbf24"]
      });
      // Exams give more rewards
      await addPointToUser(userId);
      await addPointToUser(userId); // 2 stars for exam
      await addXpToUser(userId, 50); // 50 XP for exam
    }

    await recordTestLog(userId, exam.id, finalScore, isApproved);
    setIsSaving(false);
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-8">
          {isApproved ? (
            <>
              <div className="w-32 h-32 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-amber-500 animate-bounce">
                <Check className="w-16 h-16 text-amber-500" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-white mb-2 italic">¡APROBADO!</h1>
                <p className="text-amber-500 font-bold tracking-widest uppercase">Certificación de {exam.title.replace("[EXAMEN FINAL] ", "")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Aciertos</p>
                  <p className="text-2xl font-black">{finalScore}/{totalQuestions}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Recompensa</p>
                  <p className="text-2xl font-black text-amber-500">+2 ⭐ +50 XP</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-4xl font-black text-white italic uppercase">No Superado</h1>
              <p className="text-slate-400 text-lg">
                Has obtenido un {Math.round(percentage * 100)}%. Se requiere un 70% para aprobar este examen oficial.
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            disabled={isSaving}
            className="w-full py-5 text-xl font-black rounded-2xl bg-white text-slate-950 hover:bg-slate-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
          >
            VOLVER AL PANEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Examen Oficial</p>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{exam.title.replace("[EXAMEN FINAL] ", "")}</h1>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors ${timeLeft < 300 ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "bg-slate-800 border-slate-700 text-white"}`}>
          <Timer className="w-5 h-5" />
          <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pregunta</p>
          <p className="text-sm font-black">{currentIndex + 1} / {totalQuestions}</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800">
        <div 
          className="h-full bg-blue-500 transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-center leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`p-6 rounded-2xl text-left font-bold text-lg border-2 transition-all active:scale-95 ${
                  selectedOption === option 
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-xs text-slate-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-xs">Piensa bien tu respuesta. No hay vuelta atrás.</p>
          </div>
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`px-10 py-4 rounded-xl font-black text-lg transition-all shadow-xl disabled:opacity-50 ${
              selectedOption ? "bg-white text-slate-950 hover:bg-slate-200" : "bg-slate-800 text-slate-600"
            }`}
          >
            {currentIndex === totalQuestions - 1 ? "FINALIZAR EXAMEN" : "SIGUIENTE PREGUNTA"}
          </button>
        </div>
      </footer>
    </div>
  );
}
