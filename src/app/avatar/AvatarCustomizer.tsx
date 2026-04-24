"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Star, Lock, Check, Save, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
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

const MOUTHS: ItemDef[] = [
  { id: "neutral", label: "Neutral", cost: 0, emoji: "😐" },
  { id: "smile", label: "Sonrisa", cost: 0, emoji: "🙂" },
  { id: "smileWide", label: "Gran Sonrisa", cost: 1, emoji: "😄" },
  { id: "grin", label: "Mueca", cost: 1, emoji: "😏" },
  { id: "surprise", label: "Sorpresa", cost: 2, emoji: "😮" },
  { id: "anger", label: "Enfado", cost: 2, emoji: "😠" },
  { id: "cool", label: "Cool", cost: 3, emoji: "😎" },
];

const EYES: ItemDef[] = [
  { id: "neutral", label: "Estándar", cost: 0, emoji: "👀" },
  { id: "wide", label: "Abiertos", cost: 1, emoji: "😳" },
  { id: "squint", label: "Entrecerrados", cost: 1, emoji: "😑" },
  { id: "happy", label: "Felices", cost: 2, emoji: "😊" },
  { id: "closed", label: "Cerrados", cost: 2, emoji: "😴" },
];

const HAIR_STYLES: ItemDef[] = [
  { id: "standard", label: "Estándar", cost: 0, emoji: "👦" },
  { id: "short", label: "Corto", cost: 2, emoji: "💇" },
  { id: "long", label: "Largo", cost: 3, emoji: "👱" },
  { id: "spike", label: "Cresta", cost: 4, emoji: "🤘" },
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
  const [activeTab, setActiveTab] = useState<keyof AvatarConfig>("color");
  const [zoom, setZoom] = useState(1);

  const handleSave = async () => {
    setSaving(true);
    await saveAvatarConfig(userId, config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: "color" as const, label: "Colores", emoji: "🎨" },
    { key: "mouth" as const, label: "Bocas", emoji: "👄" },
    { key: "eyes" as const, label: "Ojos", emoji: "👁️" },
    { key: "hair" as const, label: "Pelo", emoji: "💇" },
    { key: "hat" as const, label: "Sombreros", emoji: "🎩" },
    { key: "accessory" as const, label: "Accesorios", emoji: "✨" },
  ];

  const getItemsForTab = (tab: keyof AvatarConfig) => {
    switch (tab) {
      case "color": return COLORS;
      case "hat": return HATS;
      case "accessory": return ACCESSORIES;
      case "mouth": return MOUTHS;
      case "eyes": return EYES;
      case "hair": return HAIR_STYLES;
      default: return [];
    }
  };

  const currentItems = getItemsForTab(activeTab);
  const currentKey = activeTab;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground font-sans">
      {/* Header */}
      <nav className="border-b-4 border-duo-gray bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-duo-gray-dark hover:text-duo-foreground transition-all font-black uppercase text-sm">
              <ArrowLeft className="w-6 h-6" />
              <span>Volver</span>
            </Link>
            <h1 className="text-xl font-black text-duo-foreground flex items-center gap-2 uppercase italic tracking-tight">
              <Sparkles className="w-6 h-6 text-duo-blue" />
              Personalizar Avatar
            </h1>
            <div className="flex items-center gap-2 bg-duo-yellow/10 px-4 py-2 rounded-2xl border-2 border-duo-yellow/20">
              <Star className="w-6 h-6 text-duo-yellow fill-duo-yellow" />
              <span className="text-duo-yellow font-black text-lg">{points}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 3D Preview */}
          <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[3rem] p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-duo-blue/5 to-transparent" />
            
            {/* Zoom Controls */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.2, 1.8))}
                className="w-12 h-12 bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 rounded-xl flex items-center justify-center text-duo-gray-dark hover:text-duo-blue hover:border-duo-blue transition-all"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))}
                className="w-12 h-12 bg-white border-2 border-duo-gray border-b-4 active:border-b-0 active:translate-y-1 rounded-xl flex items-center justify-center text-duo-gray-dark hover:text-duo-blue hover:border-duo-blue transition-all"
                title="Reducir Zoom"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
            </div>

            <div className="relative z-10 w-full">
              <Avatar3D config={config} size="large" zoom={zoom} />
            </div>
            <div className="relative z-10 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`
                  px-12 py-4 rounded-2xl font-black text-xl uppercase italic tracking-tighter
                  transition-all active:translate-y-1 disabled:opacity-50
                  shadow-lg border-b-[6px] flex items-center gap-3
                  ${saved 
                    ? "bg-duo-green border-duo-green-dark text-white" 
                    : "bg-duo-blue border-duo-blue-dark text-white hover:brightness-110 shadow-duo-blue/20"}
                `}
              >
                {saved ? (
                  <>
                    <Check className="w-6 h-6 font-black" />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Items Panel */}
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${
                    activeTab === tab.key
                      ? "bg-duo-blue text-white border-b-4 border-duo-blue-dark shadow-sm"
                      : "bg-white text-duo-gray-dark border-duo-gray hover:bg-duo-gray/10"
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
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
                    className={`relative p-6 rounded-[2rem] border-2 border-b-4 transition-all text-center flex flex-col items-center gap-3 ${
                      isActive
                        ? "border-duo-blue bg-duo-blue/10 text-duo-blue ring-2 ring-duo-blue/20 shadow-sm"
                        : isUnlocked
                        ? "border-duo-gray bg-white text-duo-foreground hover:border-duo-gray-dark hover:bg-duo-gray/5"
                        : "border-duo-gray bg-duo-gray/10 text-duo-gray-dark cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-duo-blue rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-4 h-4 text-white font-black" />
                      </div>
                    )}
                    <span className="text-4xl filter drop-shadow-sm">{item.emoji}</span>
                    <span className="font-black text-sm uppercase tracking-tight">{item.label}</span>
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-duo-red bg-duo-red/10 px-2 py-1 rounded-lg border border-duo-red/20 uppercase">
                        <Lock className="w-3 h-3" />
                        <span>{item.cost} Estrellas</span>
                      </div>
                    ) : item.cost > 0 ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-duo-yellow bg-duo-yellow/10 px-2 py-1 rounded-lg border border-duo-yellow/20 uppercase">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.cost}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-duo-green uppercase bg-duo-green/10 px-2 py-1 rounded-lg border border-duo-green/20">Gratis</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info box */}
            <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2rem] p-6 shadow-sm">
              <p className="text-duo-gray-dark font-bold text-sm leading-relaxed flex gap-3">
                <span className="bg-duo-blue/10 p-2 rounded-xl h-fit">💡</span>
                <span>
                  <span className="text-duo-foreground font-black uppercase text-xs block mb-1">Consejo del Sabio:</span>
                  Completa lecciones con un 90% o más de aciertos para ganar estrellas y desbloquear nuevos items para tu avatar.
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
