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
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-center gap-5">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white border-2 border-duo-gray border-b-4 rounded-2xl flex items-center justify-center text-duo-gray-dark hover:text-duo-foreground transition-all active:border-b-0 active:translate-y-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-duo-foreground flex items-center gap-3 uppercase italic tracking-tight">
              <Activity className="w-10 h-10 text-indigo-500" />
              Registro de Actividad
            </h1>
            <p className="text-duo-gray-dark font-black text-[10px] uppercase tracking-widest mt-1 ml-1">Monitorización en Tiempo Real</p>
          </div>
        </div>

        <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f7f7f7] text-[10px] uppercase font-black text-duo-gray-dark border-b-2 border-duo-gray">
                <tr>
                  <th className="px-8 py-5 tracking-widest">Fecha y Hora</th>
                  <th className="px-8 py-5 tracking-widest">Alumno</th>
                  <th className="px-8 py-5 tracking-widest">Lección / Examen</th>
                  <th className="px-8 py-5 tracking-widest">Puntuación</th>
                  <th className="px-8 py-5 text-right tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-duo-gray">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-duo-gray-dark font-bold italic">
                      No hay registros de actividad en la base de datos.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#f7f7f7]/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-duo-gray-dark">
                        {new Date(Number(log.createdAt)).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-black text-duo-foreground uppercase italic tracking-tight">{log.userName}</div>
                      </td>
                      <td className="px-8 py-5 font-bold text-sm text-duo-gray-dark italic">
                        {log.lessonTitle}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-lg text-duo-foreground">{log.score}</span>
                        <span className="text-[10px] font-black text-duo-gray-dark uppercase ml-1">aciertos</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {log.passed ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-duo-green/10 text-duo-green border-2 border-duo-green/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-duo-red/10 text-duo-red border-2 border-duo-red/20">
                            <XCircle className="w-3.5 h-3.5" /> Fallido
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
    </div>
  );
}
