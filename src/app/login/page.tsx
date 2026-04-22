"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Credenciales inválidas. Inténtalo de nuevo.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-duo-gray border-b-8 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-duo-blue/10 rounded-2xl mb-4 border-2 border-duo-blue/20">
              <LogIn className="w-10 h-10 text-duo-blue" />
            </div>
            <h1 className="text-4xl font-black text-duo-foreground mb-2 italic uppercase">Sabioxi</h1>
            <p className="text-duo-gray-dark font-black uppercase text-sm tracking-widest">Inicia sesión para jugar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-duo-red/10 border-2 border-duo-red text-duo-red rounded-2xl p-4 flex items-center gap-3 text-sm font-black italic uppercase">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-duo-gray-dark uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray-dark" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-duo-blue transition-all font-bold"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-duo-gray-dark uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray-dark" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-duo-blue transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-duo-blue text-white border-b-8 border-duo-blue-dark active:border-b-0 active:translate-y-2 py-4 rounded-2xl font-black text-xl uppercase transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>

            <p className="text-center text-xs font-black text-duo-gray-dark uppercase pt-6 border-t-2 border-duo-gray">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-duo-blue hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
