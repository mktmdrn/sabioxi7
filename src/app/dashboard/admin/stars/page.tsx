import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/actions/admin";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { StarManagementForm } from "./StarManagementForm";

export default async function StarsManagementPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-center gap-5">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white border-2 border-duo-gray border-b-4 rounded-2xl flex items-center justify-center text-duo-gray-dark hover:text-duo-foreground transition-all active:border-b-0 active:translate-y-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-duo-foreground flex items-center gap-3 uppercase italic tracking-tight">
              <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
              Cargar Estrellas
            </h1>
            <p className="text-duo-gray-dark font-black text-[10px] uppercase tracking-widest mt-1 ml-1">Herramienta de Recompensas</p>
          </div>
        </div>

        <div className="bg-white border-2 border-duo-gray border-b-8 rounded-[2.5rem] p-10 shadow-sm max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StarManagementForm users={users} />
        </div>
      </div>
    </div>
  );
}
