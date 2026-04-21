"use client";

import { useState } from "react";
import { X, Check, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const dummyQuestion = {
  question: "¿Cómo se dice 'Manzana' en inglés?",
  options: [
    { id: "1", text: "Banana" },
    { id: "2", text: "Apple" },
    { id: "3", text: "Orange" },
    { id: "4", text: "Grape" },
  ],
  correctId: "2",
};

export default function LessonPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect" | "finished">("idle");

  const handleCheck = () => {
    if (!selectedOption) return;
    if (selectedOption === dummyQuestion.correctId) {
      setStatus("correct");
    } else {
      setStatus("incorrect");
    }
  };

  const handleContinue = () => {
    if (status === "correct") {
      setStatus("finished");
    } else if (status === "incorrect") {
      setStatus("idle");
      setSelectedOption(null);
    } else if (status === "finished") {
      router.push("/dashboard");
    }
  };

  // Gamified colors
  const bgColor = status === "correct" ? "bg-green-100" : status === "incorrect" ? "bg-red-100" : "bg-white";

  if (status === "finished") {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500">
            <Check className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800">¡Lección completada!</h1>
          <p className="text-lg text-slate-500 font-medium">Has dominado una nueva palabra.</p>
          <button
            onClick={handleContinue}
            className="w-full py-4 text-xl font-bold rounded-2xl bg-green-500 text-white border-b-4 border-green-600 hover:bg-green-400 active:border-b-0 active:translate-y-1 transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} text-slate-900 flex flex-col transition-colors duration-300 font-sans`}>
      {/* Header / Progress */}
      <header className="max-w-4xl mx-auto w-full p-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-8 h-8" />
        </Link>
        <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: status === "correct" ? "100%" : "20%" }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-10">
          {dummyQuestion.question}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dummyQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isWrongAndSelected = status === "incorrect" && isSelected;
            const isCorrectAndSelected = status === "correct" && isSelected;

            let buttonClasses = "p-6 rounded-2xl border-2 border-b-4 text-left font-bold text-lg transition-all ";
            
            if (isWrongAndSelected) {
              buttonClasses += "border-red-500 bg-red-50 text-red-600 border-b-2 translate-y-[2px]";
            } else if (isCorrectAndSelected) {
              buttonClasses += "border-green-500 bg-green-50 text-green-600 border-b-2 translate-y-[2px]";
            } else if (isSelected) {
              buttonClasses += "border-blue-400 bg-blue-50 text-blue-600 border-b-2 translate-y-[2px]";
            } else {
              buttonClasses += "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
            }

            return (
              <button
                key={option.id}
                onClick={() => status === "idle" && setSelectedOption(option.id)}
                disabled={status !== "idle"}
                className={buttonClasses}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="border-t-2 border-slate-200 bg-white p-6 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {status === "idle" ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOption}
              className={`w-full py-4 text-xl font-bold rounded-2xl border-b-4 transition-all ${
                selectedOption
                  ? "bg-green-500 text-white border-green-600 hover:bg-green-400 active:border-b-0 active:translate-y-1 cursor-pointer"
                  : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
              }`}
            >
              Comprobar
            </button>
          ) : (
            <div className={`absolute inset-0 p-6 flex items-center justify-between ${status === "correct" ? "bg-green-100" : "bg-red-100"}`}>
              <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-6">
                <div className={`flex items-center gap-4 ${status === "correct" ? "text-green-600" : "text-red-600"} font-extrabold text-2xl`}>
                  {status === "correct" ? (
                    <>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      ¡Correcto!
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                      Incorrecto. ¡Inténtalo de nuevo!
                    </>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className={`py-4 px-10 text-xl font-bold rounded-2xl border-b-4 text-white active:border-b-0 active:translate-y-1 transition-all ${
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
