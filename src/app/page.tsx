import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe, Layout, Trophy, Swords, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-duo-foreground font-sans selection:bg-duo-blue/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-duo-blue/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-duo-green/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#f7f7f7] border-2 border-duo-gray text-xs font-black text-duo-gray-dark uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4">
              <Sparkles className="w-4 h-4 text-duo-yellow fill-duo-yellow" />
              La plataforma definitiva para el sector IT
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-duo-foreground leading-none italic uppercase">
              APRENDE IT <br /> <span className="text-duo-blue">JUGANDO.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-duo-gray-dark mb-12 font-bold leading-relaxed">
              Domina ASIR y DAW con nuestra metodología gamificada. Batallas PvP, personalización de avatar y certificaciones reales.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/login" 
                className="group px-12 py-6 bg-duo-green text-white rounded-[2rem] font-black text-2xl uppercase italic tracking-tighter transition-all flex items-center gap-4 border-b-8 border-duo-green-dark hover:brightness-110 active:border-b-0 active:translate-y-2 shadow-xl shadow-duo-green/20"
              >
                ¡Empieza Gratis!
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/dashboard" 
                className="px-12 py-6 bg-white text-duo-blue border-2 border-duo-gray border-b-8 rounded-[2rem] font-black text-2xl uppercase italic tracking-tighter transition-all hover:bg-duo-gray/5 active:border-b-0 active:translate-y-2"
              >
                Ver Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t-4 border-duo-gray bg-[#f7f7f7]">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-duo-foreground uppercase italic tracking-tighter">¿POR QUÉ SABIOXI?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Swords className="w-8 h-8 text-white" />}
            bgColor="bg-duo-red"
            borderColor="border-duo-red-dark"
            title="Duelos PvP en la Arena"
            description="Compite contra otros estudiantes en tiempo real. Demuestra quién sabe más de redes y bases de datos."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-white" />}
            bgColor="bg-duo-yellow"
            borderColor="border-[#e5a400]"
            title="Gamificación Real"
            description="Gana estrellas, sube de nivel y personaliza tu avatar 3D con items exclusivos."
          />
          <FeatureCard 
            icon={<Layout className="w-8 h-8 text-white" />}
            bgColor="bg-duo-blue"
            borderColor="border-duo-blue-dark"
            title="Contenido Curado"
            description="Todo el temario de ASIR y DAW estructurado en misiones y desafíos de alta intensidad."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 border-t-4 border-duo-gray text-center text-duo-gray-dark font-black uppercase tracking-widest text-xs bg-white">
        <p>© 2024 SABIOXI IT ACADEMY. EL FUTURO ESTÁ AQUÍ. 🦉✨</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, bgColor, borderColor }: { icon: React.ReactNode, title: string, description: string, bgColor: string, borderColor: string }) {
  return (
    <div className="p-10 rounded-[3rem] bg-white border-2 border-duo-gray border-b-8 hover:-translate-y-2 transition-all group">
      <div className={`w-16 h-16 ${bgColor} ${borderColor} border-b-4 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight">{title}</h3>
      <p className="text-duo-gray-dark font-bold leading-relaxed">{description}</p>
    </div>
  );
}
