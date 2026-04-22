import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTestLogs } from "@/actions/admin";
import Link from "next/link";
import { ArrowLeft, Activity, CheckCircle, XCircle } from "lucide-react";

export default async function ActivityPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "admin") {
    redirect("/dashboard");
  }

  const logs = await getTestLogs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Activity className="w-8 h-8 text-indigo-500" />
          Registro de Actividad
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
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
