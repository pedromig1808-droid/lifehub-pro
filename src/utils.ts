export const uid = (): string =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fmtDate = (iso?: string): string => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export const fmtDateLong = (iso?: string): string => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const fmtMoney = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const monthKey = (iso: string): string => iso.slice(0, 7); // YYYY-MM

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

/** Calcula a sequência (streak) atual a partir de um log de datas YYYY-MM-DD. */
export function streak(log: string[]): number {
  const set = new Set(log);
  let count = 0;
  const d = new Date();
  // Se hoje não foi feito, a sequência ainda pode estar viva até ontem
  if (!set.has(toISO(d))) d.setDate(d.getDate() - 1);
  while (set.has(toISO(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Maior sequência histórica. */
export function bestStreak(log: string[]): number {
  if (!log.length) return 0;
  const dates = [...log].sort();
  let best = 1;
  let cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (toISO(prev) === dates[i]) cur++;
    else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));
