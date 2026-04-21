import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe, Layout } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium text-slate-400 mb-8 animate-in fade-in slide-in-from-bottom-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Sistema de Login Seguro v5.0
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              Seguridad para tus <br /> aplicaciones.
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
              Una plantilla premium construida con Next.js 15, Auth.js y Tailwind CSS. Lista para desplegar en Vercel con un solo click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Empezar Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/dashboard" 
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-lg transition-all active:scale-95"
              >
                Ver Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
            title="Autenticación Segura"
            description="Basado en Auth.js v5 con soporte para JWT y sesiones de servidor ultra seguras."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Rendimiento Optimizado"
            description="Utilizando Server Components de Next.js para una carga instantánea y SEO superior."
          />
          <FeatureCard 
            icon={<Layout className="w-6 h-6 text-purple-400" />}
            title="UI/UX Premium"
            description="Diseñado con Tailwind CSS enfocándose en una experiencia de usuario fluida y moderna."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2024 SABIOXI. Desarrollado con ❤️ para Vercel.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all group">
      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
