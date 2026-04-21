"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Star, Lock, Check, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { AvatarConfig, saveAvatarConfig } from "@/actions/db";

// Dynamic import to avoid SSR issues with Three.js
const Avatar3D = dynamic(() => import("@/components/Avatar3D"), { ssr: false });

type ItemDef = {
  id: string;
  label: string;
  cost: number;
  emoji: string;
};

const COLORS: ItemDef[] = [
  { id: "blue", label: "Azul", cost: 0, emoji: "🔵" },
  { id: "green", label: "Verde", cost: 1, emoji: "🟢" },
  { id: "red", label: "Rojo", cost: 2, emoji: "🔴" },
  { id: "purple", label: "Violeta", cost: 3, emoji: "🟣" },
  { id: "pink", label: "Rosa", cost: 4, emoji: "🩷" },
  { id: "gold", label: "Dorado", cost: 5, emoji: "🟡" },
];

const HATS: ItemDef[] = [
  { id: "none", label: "Ninguno", cost: 0, emoji: "❌" },
  { id: "cap", label: "Gorra", cost: 1, emoji: "🧢" },
  { id: "tophat", label: "Chistera", cost: 3, emoji: "🎩" },
  { id: "crown", label: "Corona", cost: 5, emoji: "👑" },
  { id: "wizard", label: "Mago", cost: 7, emoji: "🧙" },
];

const ACCESSORIES: ItemDef[] = [
  { id: "none", label: "Ninguno", cost: 0, emoji: "❌" },
  { id: "glasses", label: "Gafas de sol", cost: 2, emoji: "🕶️" },
  { id: "monocle", label: "Monóculo", cost: 3, emoji: "🧐" },
  { id: "scarf", label: "Bufanda", cost: 4, emoji: "🧣" },
  { id: "cape", label: "Capa", cost: 6, emoji: "🦸" },
];

export default function AvatarCustomizer({
  userId,
  points,
  initialConfig,
}: {
  userId: string;
  points: number;
  initialConfig: AvatarConfig;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"color" | "hat" | "accessory">("color");

  const handleSave = async () => {
    setSaving(true);
    await saveAvatarConfig(userId, config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: "color" as const, label: "Colores", emoji: "🎨" },
    { key: "hat" as const, label: "Sombreros", emoji: "🎩" },
    { key: "accessory" as const, label: "Accesorios", emoji: "✨" },
  ];

  const currentItems = activeTab === "color" ? COLORS : activeTab === "hat" ? HATS : ACCESSORIES;
  const currentKey = activeTab === "color" ? "color" : activeTab === "hat" ? "hat" : "accessory";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </Link>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Personalizar Avatar
            </h1>
            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-amber-500 font-bold">{points}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Preview */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="relative z-10 w-full">
              <Avatar3D config={config} size="large" />
            </div>
            <div className="relative z-10 mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white border-b-4 border-green-600 active:border-b-0 active:translate-y-[4px] px-8 py-3 rounded-2xl font-bold text-lg hover:bg-green-400 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {saving ? "Guardando..." : "Guardar"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Items Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white border-b-4 border-indigo-700"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {currentItems.map((item) => {
                const isUnlocked = points >= item.cost;
                const isActive = config[currentKey] === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setConfig((prev) => ({ ...prev, [currentKey]: item.id }));
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                      isActive
                        ? "border-indigo-500 bg-indigo-500/10 text-white ring-2 ring-indigo-500/30"
                        : isUnlocked
                        ? "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                        : "border-slate-800/50 bg-slate-900/50 text-slate-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Lock className="w-3 h-3" />
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.cost}</span>
                      </div>
                    ) : item.cost > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.cost}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-green-500">Gratis</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-white font-bold">💡 Consejo:</span> Completa lecciones con un 90% o más de aciertos para ganar estrellas y desbloquear nuevos items para tu avatar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
