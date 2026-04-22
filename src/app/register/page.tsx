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
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-duo-gray border-b-8 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-duo-green/10 rounded-2xl flex items-center justify-center mb-4 border-2 border-duo-green/20">
              <UserPlus className="w-10 h-10 text-duo-green" />
            </div>
            <h1 className="text-3xl font-black text-duo-foreground tracking-tight italic uppercase">Crear Cuenta</h1>
            <p className="text-duo-gray-dark mt-2 text-center font-black text-sm uppercase tracking-widest">
              Únete a la aventura de ASIR
            </p>
          </div>

          {success ? (
            <div className="bg-duo-green/10 border-2 border-duo-green p-6 rounded-3xl text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-duo-green mx-auto" />
              <h2 className="text-xl font-black text-duo-green uppercase italic">¡REGISTRO ÉPICO!</h2>
              <p className="text-duo-foreground font-medium">
                Tu cuenta ha sido creada. Un administrador debe aprobarte antes de poder empezar a jugar.
              </p>
              <Link href="/login" className="block w-full py-4 bg-duo-blue text-white rounded-2xl font-black text-lg border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 transition-all uppercase">
                VOLVER AL LOGIN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1.5 ml-1">Nombre completo</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl px-4 py-4 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-bold"
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl px-4 py-4 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-bold"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-duo-gray-dark uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray rounded-2xl px-4 py-4 text-duo-foreground focus:outline-none focus:border-duo-blue transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-duo-red/10 border-2 border-duo-red text-duo-red rounded-2xl text-sm font-black italic uppercase">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-duo-green text-white border-b-8 border-duo-green-dark active:border-b-0 active:translate-y-2 py-4 rounded-2xl font-black text-xl uppercase transition-all flex items-center justify-center gap-2"
              >
                {isPending ? "REGISTRANDO..." : "REGISTRARSE"}
              </button>
              
              <p className="text-center text-xs font-black text-duo-gray-dark uppercase pt-6 border-t-2 border-duo-gray">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-duo-blue hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
