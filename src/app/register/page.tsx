"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    setIsPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-400 mt-2 text-center">
            Regístrate para acceder a las lecciones.
          </p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">¡Registro completado!</h2>
            <p className="text-green-400">
              Tu cuenta ha sido creada y está pendiente de activación. Un administrador debe aprobarte para poder entrar.
            </p>
            <Link href="/login" className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre completo</label>
              <input
                name="name"
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Registrando..." : "Registrarse"}
            </button>
            
            <p className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
