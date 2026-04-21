import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar / Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SABIO<span className="text-blue-500">XI</span></span>
            </div>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 rounded-lg transition-all text-sm font-medium">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">¡Hola, {session.user?.name}! 👋</h2>
                <p className="text-blue-100 text-lg opacity-90">Has iniciado sesión correctamente en el sistema.</p>
                <div className="mt-6 flex gap-4">
                  <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                    Ver Perfil <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Background abstract shape */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            </div>

            {/* Quick Stats or Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Actividad Reciente {i}</h3>
                  <p className="text-slate-400 text-sm">Próximamente se mostrarán las métricas y logs de actividad en este panel.</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Tu Perfil
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Nombre</p>
                    <p className="text-white font-medium">{session.user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <Mail className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-white font-medium">{session.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rol</p>
                    <p className="text-white font-medium capitalize">{(session.user as any).role || "Usuario"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
