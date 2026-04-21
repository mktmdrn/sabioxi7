import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Mail, Shield, LogOut, ExternalLink, Play, Star, PlusCircle } from "lucide-react";
import { getUserPoints, getLessons } from "@/actions/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as any)?.role;
  const points = userId ? await getUserPoints(userId) : 0;
  const lessons = await getLessons();

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-amber-500 font-bold">{points}</span>
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
                <div className="mt-6 flex flex-wrap gap-4">
                  {role === "admin" && (
                    <>
                      <Link href="/generator" className="bg-indigo-600 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Generador
                      </Link>
                      <Link href="/dashboard/admin" className="bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-lg hover:bg-amber-500 transition-all flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Panel Admin
                      </Link>
                    </>
                  )}
                  <button className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-2xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2">
                    Ver Perfil <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Background abstract shape */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            </div>

            {/* Lessons Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-green-500 fill-green-500" />
                Lecciones Disponibles
              </h3>
              
              {lessons.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
                  <p className="text-slate-400 mb-4">Aún no hay lecciones creadas.</p>
                  <Link href="/generator" className="text-indigo-400 hover:text-indigo-300 font-medium">
                    Ve al generador para crear la primera
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col h-full group">
                      <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-green-500 font-extrabold text-xl">{idx + 1}</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{lesson.title}</h4>
                      <p className="text-slate-400 text-sm flex-1 mb-6">{lesson.questions.length} preguntas</p>
                      
                      <Link 
                        href={`/lesson/${lesson.id}`}
                        className="bg-green-500 text-white border-b-4 border-green-600 active:border-b-0 active:translate-y-[4px] px-6 py-3 rounded-2xl font-bold text-center hover:bg-green-400 transition-all flex items-center justify-center gap-2 w-full mt-auto"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Jugar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
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
