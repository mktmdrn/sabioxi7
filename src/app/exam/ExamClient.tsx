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

  const handleNext = () => {
    if (!selectedOption) return;
    if (selectedOption === currentQ.correctAnswer) setScore((prev) => prev + 1);
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
    <div className="h-screen bg-white text-duo-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b-2 border-duo-gray">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-duo-gray-dark hover:text-duo-foreground transition-colors">
            <X className="w-8 h-8" />
          </button>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-duo-yellow uppercase tracking-widest">Examen de Certificación</p>
            <h1 className="text-sm font-black italic">{exam.title.replace("[EXAMEN FINAL] ", "")}</h1>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border-2 border-b-4 transition-all ${timeLeft < 300 ? "bg-duo-red/10 border-duo-red text-duo-red animate-pulse" : "bg-duo-gray border-duo-gray-dark text-duo-foreground"}`}>
          <Timer className="w-5 h-5" />
          <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">Pregunta</p>
          <p className="text-sm font-black">{currentIndex + 1} / {totalQuestions}</p>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-10">
          <h2 className="text-2xl md:text-3xl font-black text-center italic">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`p-6 rounded-3xl text-left font-black text-lg border-2 border-b-8 transition-all ${
                  selectedOption === option 
                    ? "bg-duo-blue/10 border-duo-blue text-duo-blue translate-y-2 border-b-0" 
                    : "bg-white border-duo-gray text-duo-foreground hover:bg-[#f7f7f7]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 text-xs ${selectedOption === option ? "bg-duo-blue border-duo-blue text-white" : "bg-white border-duo-gray text-duo-gray-dark"}`}>
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
      <footer className="p-6 border-t-2 border-duo-gray bg-white">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-duo-gray-dark">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-xs font-black uppercase">Final Boss: Sin segundas oportunidades.</p>
          </div>
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`px-12 py-4 rounded-2xl font-black text-lg transition-all border-b-8 active:border-b-0 active:translate-y-2 ${
              selectedOption ? "bg-duo-blue border-duo-blue-dark text-white" : "bg-duo-gray border-duo-gray-dark text-duo-gray-dark"
            }`}
          >
            {currentIndex === totalQuestions - 1 ? "FINALIZAR" : "SIGUIENTE"}
          </button>
        </div>
      </footer>
    </div>
  );
}
