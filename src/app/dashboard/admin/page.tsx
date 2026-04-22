import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers, getTestLogs, activateUser, deactivateUser } from "@/actions/admin";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, UserCheck, Activity, Star, Users, ArrowRight, Zap, BookOpen, Crown, ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-[#f7f7f7] text-duo-foreground font-sans selection:bg-duo-blue/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border-2 border-duo-gray border-b-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-amber-500 rounded-[1.5rem] flex items-center justify-center border-b-8 border-[#c89b00] shadow-lg shadow-amber-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-duo-foreground tracking-tighter uppercase italic leading-none">Admin Center</h1>
              <p className="text-duo-gray-dark font-black text-xs uppercase tracking-[0.2em] mt-2">Gestión Global de Sabioxi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#f7f7f7] px-5 py-3 rounded-2xl border-2 border-duo-gray">
            <div className="w-3 h-3 rounded-full bg-duo-green animate-pulse" />
            <span className="text-xs font-black text-duo-gray-dark uppercase tracking-widest">Sistema Operativo</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <KpiCard 
            label="Usuarios Totales"
            value={totalUsers}
            subValue={`${activeUsers} activos`}
            icon={<Users className="w-8 h-8" />}
            color="bg-duo-blue"
            borderColor="border-duo-blue-dark"
          />
          <KpiCard 
            label="Actividad (Tests)"
            value={totalLogs}
            subValue="Registros totales"
            icon={<Activity className="w-8 h-8" />}
            color="bg-indigo-500"
            borderColor="border-indigo-700"
          />
          <KpiCard 
            label="Arena Status"
            value="READY"
            subValue="Sistema 3D Online"
            icon={<Crown className="w-8 h-8" />}
            color="bg-amber-500"
            borderColor="border-[#c89b00]"
          />
        </div>

        {/* Tool Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ToolCard 
            title="Gestión de Usuarios" 
            desc="Activa, desactiva o edita permisos de alumnos." 
            icon={<Users className="w-6 h-6 text-duo-blue" />}
            href="#users-table"
          />
          <ToolCard 
            title="Gestionar Cursos" 
            desc="Crea, edita o elimina lecciones y asignaturas." 
            icon={<BookOpen className="w-6 h-6 text-duo-green" />}
            href="/generator"
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

        {/* Users Management Table */}
        <div id="users-table" className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] overflow-hidden shadow-sm mt-12">
          <div className="p-8 border-b-2 border-duo-gray flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-duo-blue/10 rounded-xl flex items-center justify-center border-2 border-duo-blue/20">
                <UserCheck className="w-5 h-5 text-duo-blue" />
              </div>
              <h2 className="text-xl font-black text-duo-foreground uppercase italic tracking-tight">Gestión Directa de Usuarios</h2>
            </div>
            <div className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest bg-[#f7f7f7] px-4 py-2 rounded-full border border-duo-gray">
              {users.length} Alumnos Registrados
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f7f7f7] text-[10px] uppercase font-black text-duo-gray-dark border-b-2 border-duo-gray">
                <tr>
                  <th className="px-8 py-5 tracking-widest">Alumno</th>
                  <th className="px-8 py-5 tracking-widest">Email</th>
                  <th className="px-8 py-5 tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-right tracking-widest">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-duo-gray">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f7f7f7]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-black text-duo-foreground uppercase italic tracking-tight">{u.name}</div>
                      <div className="text-[9px] text-duo-gray-dark font-black uppercase mt-0.5">ID: {u.id.slice(0,8)}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-duo-gray-dark">{u.email}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                        u.status === "active" 
                          ? "bg-duo-green/10 text-duo-green border-duo-green/20" 
                          : "bg-duo-red/10 text-duo-red border-duo-red/20"
                      }`}>
                        {u.status === "active" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.status === "active" ? "Activo" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {u.role !== "admin" && (
                        <form action={async () => {
                          "use server";
                          if (u.status === "active") await deactivateUser(u.id);
                          else await activateUser(u.id);
                        }}>
                          <button className={`
                            px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-b-4 active:border-b-0 active:translate-y-1
                            ${u.status === "active" 
                              ? "bg-white border-duo-gray text-duo-gray-dark hover:bg-[#f7f7f7]" 
                              : "bg-duo-blue border-duo-blue-dark text-white hover:brightness-110 shadow-lg shadow-duo-blue/20"}
                          `}>
                            {u.status === "active" ? "Desactivar" : "Activar Ahora"}
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
    </div>
  );
}

function KpiCard({ label, value, subValue, icon, color, borderColor }: { label: string, value: string | number, subValue: string, icon: React.ReactNode, color: string, borderColor: string }) {
  return (
    <div className="bg-white border-2 border-duo-gray border-b-8 p-8 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-1 transition-all">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform group-hover:opacity-[0.08] ${color.replace('bg-', 'text-')}`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-duo-gray-dark font-black uppercase text-[10px] tracking-[0.2em] mb-3">{label}</p>
        <div className="flex items-end gap-3">
          <h3 className="text-5xl font-black text-duo-foreground italic tracking-tighter leading-none">{value}</h3>
          <div className={`w-2 h-10 ${color} rounded-full mb-1`} />
        </div>
        <p className="text-duo-gray-dark font-bold text-xs mt-4 flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-duo-green" /> {subValue}
        </p>
      </div>
    </div>
  );
}

function ToolCard({ title, desc, icon, href }: { title: string, desc: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="group bg-white border-2 border-duo-gray border-b-8 p-8 rounded-[2.5rem] hover:border-duo-blue transition-all duration-300">
      <div className="w-14 h-14 bg-[#f7f7f7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-duo-blue/5 transition-all duration-300 border-2 border-duo-gray group-hover:border-duo-blue/20">
        {icon}
      </div>
      <h3 className="text-xl font-black text-duo-foreground mb-3 flex items-center gap-2 uppercase italic tracking-tight">
        {title} <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-duo-blue" />
      </h3>
      <p className="text-sm text-duo-gray-dark font-bold leading-relaxed">{desc}</p>
    </Link>
  );
}

