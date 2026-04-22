import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers, getTestLogs, activateUser, deactivateUser } from "@/actions/admin";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, UserCheck, Activity, Star, Users, ArrowRight, Zap } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();
  const logs = await getTestLogs();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const totalLogs = logs.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Admin Center</h1>
            <p className="text-slate-400 mt-1">Gestión global de la plataforma Sabioxi</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="w-32 h-32 text-blue-500" />
          </div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Usuarios Totales</p>
          <h3 className="text-4xl font-black text-white">{totalUsers}</h3>
          <p className="text-blue-400 text-sm mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {activeUsers} activos
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity className="w-32 h-32 text-indigo-500" />
          </div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Actividad (Tests)</p>
          <h3 className="text-4xl font-black text-white">{totalLogs}</h3>
          <p className="text-indigo-400 text-sm mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Registros totales
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Star className="w-32 h-32 text-amber-500" />
          </div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Arena Status</p>
          <h3 className="text-4xl font-black text-white">READY</h3>
          <p className="text-amber-500 text-sm mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Sistema 3D Online
          </p>
        </div>
      </div>

      {/* Tool Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard 
          title="Gestión de Usuarios" 
          desc="Activa, desactiva o edita permisos de alumnos." 
          icon={<Users className="w-6 h-6 text-blue-500" />}
          href="#users-table"
        />
        <ToolCard 
          title="Cargar Estrellas" 
          desc="Otorga estrellas manualmente a cualquier jugador." 
          icon={<Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
          href="/dashboard/admin/stars"
        />
        <ToolCard 
          title="Registro de Actividad" 
          desc="Ver resultados detallados de los tests realizados." 
          icon={<Activity className="w-6 h-6 text-indigo-500" />}
          href="/dashboard/admin/activity"
        />
      </div>

      <div id="users-table" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mt-12">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Gestión Directa de Usuarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${u.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {u.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.status === "active" ? "Activo" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== "admin" && (
                      <form action={async () => {
                        "use server";
                        if (u.status === "active") await deactivateUser(u.id);
                        else await activateUser(u.id);
                      }}>
                        <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${u.status === "active" ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
                          {u.status === "active" ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ title, desc, icon, href }: { title: string, desc: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        {title} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </Link>
  );
}
