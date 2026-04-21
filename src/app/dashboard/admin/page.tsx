import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers, getTestLogs, activateUser, deactivateUser } from "@/actions/admin";
import { Shield, CheckCircle, XCircle, UserX, UserCheck, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();
  const logs = await getTestLogs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === "admin" ? "bg-amber-500/20 text-amber-500" : "bg-slate-800 text-slate-400"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${u.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
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
                        <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${u.status === "active" ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-white">Registro de Actividad (Test Logs)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Lección</th>
                <th className="px-6 py-4">Resultado</th>
                <th className="px-6 py-4 text-right">Aprobado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay registros de actividad aún.</td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(Number(log.createdAt)).toLocaleString("es-ES")}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{log.userName}</td>
                    <td className="px-6 py-4">{log.lessonTitle}</td>
                    <td className="px-6 py-4 font-bold">{log.score} aciertos</td>
                    <td className="px-6 py-4 text-right">
                      {log.passed ? (
                        <span className="inline-flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" /> Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full text-sm">
                          <XCircle className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
