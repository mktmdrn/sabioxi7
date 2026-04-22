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
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Seleccionar Usuario</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <select 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            <option value="">-- Elige un usuario --</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>
                {u.name} ({u.email}) - {u.points} ★
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Cantidad de Estrellas</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[10, 50, 100, 500].map(amt => (
            <button 
              key={amt}
              onClick={() => setAmount(amt)}
              className={`py-3 rounded-xl font-bold transition-all border-2 ${amount === amt ? "bg-amber-500 border-amber-400 text-slate-900" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"}`}
            >
              +{amt}
            </button>
          ))}
        </div>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 px-6 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {status.message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : status.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
          {status.type === "success" && <CheckCircle className="w-5 h-5" />}
          {status.type === "error" && <AlertCircle className="w-5 h-5" />}
          {status.type === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      <button 
        onClick={handleAddStars}
        disabled={status.type === "loading"}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <Star className={`w-6 h-6 ${status.type === "loading" ? "" : "fill-slate-900"}`} />
        CARGAR ESTRELLAS AHORA
      </button>
    </div>
  );
}
