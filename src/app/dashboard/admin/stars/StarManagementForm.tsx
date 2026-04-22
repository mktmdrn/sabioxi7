"use client";

import { useState } from "react";
import { addStarsToUserByEmail } from "@/actions/db";
import { Star, CheckCircle, AlertCircle, Loader2, User } from "lucide-react";

export function StarManagementForm({ users }: { users: any[] }) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleAddStars = async () => {
    if (!email) {
      setStatus({ type: "error", message: "Selecciona un usuario" });
      return;
    }
    setStatus({ type: "loading", message: "Cargando estrellas..." });
    
    const res = await addStarsToUserByEmail(email, amount);
    
    if (res.success) {
      setStatus({ type: "success", message: res.message });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } else {
      setStatus({ type: "error", message: res.message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-duo-gray-dark uppercase tracking-[0.2em] ml-2">Seleccionar Alumno</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-duo-gray-dark" />
          <select 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl py-4 pl-12 pr-10 font-black focus:outline-none focus:border-duo-blue appearance-none cursor-pointer transition-all"
          >
            <option value="">-- Elige un usuario --</option>
            {users.map(u => (
              <option key={u.id} value={u.email} className="font-sans">
                {u.name.toUpperCase()} ({u.points} ★)
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-duo-gray-dark" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-duo-gray-dark uppercase tracking-[0.2em] ml-2">Cantidad de Estrellas</label>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[10, 50, 100, 500].map(amt => (
            <button 
              key={amt}
              onClick={() => setAmount(amt)}
              className={`py-3 rounded-2xl font-black transition-all border-2 ${amount === amt ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-[#f7f7f7] border-duo-gray text-duo-gray-dark hover:bg-white hover:border-duo-gray-dark"}`}
            >
              +{amt}
            </button>
          ))}
        </div>
        <div className="relative">
          <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-amber-500 fill-amber-500 opacity-20" />
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="w-full bg-[#f7f7f7] border-2 border-duo-gray text-duo-foreground rounded-2xl py-5 px-6 pl-14 text-3xl font-black focus:outline-none focus:border-duo-blue transition-all"
          />
        </div>
      </div>

      {status.message && (
        <div className={`p-5 rounded-[1.5rem] flex items-center gap-4 animate-in slide-in-from-top-2 border-2 ${status.type === "success" ? "bg-duo-green/10 border-duo-green/20 text-duo-green" : status.type === "error" ? "bg-duo-red/10 border-duo-red/20 text-duo-red" : "bg-duo-blue/10 border-duo-blue/20 text-duo-blue"}`}>
          {status.type === "success" && <CheckCircle className="w-6 h-6" />}
          {status.type === "error" && <AlertCircle className="w-6 h-6" />}
          {status.type === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
          <p className="font-black uppercase text-xs tracking-widest">{status.message}</p>
        </div>
      )}

      <button 
        onClick={handleAddStars}
        disabled={status.type === "loading"}
        className="w-full bg-amber-500 text-white font-black py-6 rounded-[2rem] hover:brightness-110 transition-all border-b-8 border-[#c89b00] active:border-b-0 active:translate-y-2 text-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-amber-500/20"
      >
        <Star className={`w-8 h-8 ${status.type === "loading" ? "" : "fill-white"}`} />
        {status.type === "loading" ? "PROCESANDO..." : "CARGAR ESTRELLAS"}
      </button>
    </div>
  );
}
