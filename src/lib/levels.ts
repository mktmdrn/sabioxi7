// Pure utility functions — not server actions, can be used on client and server

export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / 10), 1000);
}

export function getRankInfo(level: number): { emoji: string; name: string } {
  if (level >= 1000) return { emoji: "🏆", name: "Sabio Supremo" };
  if (level >= 500) return { emoji: "👑", name: "Leyenda" };
  if (level >= 250) return { emoji: "⚡", name: "Gran Maestro" };
  if (level >= 100) return { emoji: "🔥", name: "Maestro" };
  if (level >= 50) return { emoji: "💎", name: "Experto" };
  if (level >= 25) return { emoji: "🥇", name: "Estudiante" };
  if (level >= 10) return { emoji: "🥈", name: "Aprendiz" };
  return { emoji: "🥉", name: "Novato" };
}
