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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          Cargar Estrellas
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl max-w-2xl mx-auto">
        <StarManagementForm users={users} />
      </div>
    </div>
  );
}
