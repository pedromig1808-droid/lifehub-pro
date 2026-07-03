import type { AppState } from "./types";
import { todayISO, streak } from "./utils";

export function notificationsSupported(): boolean {
  return "Notification" in window;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export async function notify(title: string, body: string, tag?: string): Promise<void> {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.active) {
      reg.active.postMessage({ type: "SHOW_NOTIFICATION", title, body, tag });
      return;
    }
  } catch {
    /* usa fallback abaixo */
  }
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png", tag });
  } catch {
    /* alguns navegadores móveis exigem SW */
  }
}

/** Evita repetir a mesma notificação: guarda tags já disparadas no dia. */
function alreadyFired(tag: string): boolean {
  const key = "lifehub-fired";
  const today = todayISO();
  let data: { day: string; tags: string[] };
  try {
    data = JSON.parse(localStorage.getItem(key) || "null") || { day: today, tags: [] };
  } catch {
    data = { day: today, tags: [] };
  }
  if (data.day !== today) data = { day: today, tags: [] };
  if (data.tags.includes(tag)) return true;
  data.tags.push(tag);
  localStorage.setItem(key, JSON.stringify(data));
  return false;
}

const nowHM = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Verificador executado a cada minuto enquanto o app está aberto.
 * (Sem backend, o navegador só dispara notificações com o app/aba aberta —
 *  ou instalado como PWA em plataformas que mantêm o SW ativo.)
 */
export function checkAndNotify(state: AppState): void {
  const { settings } = state;
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const today = todayISO();
  const hm = nowHM();

  // Tarefas com data/hora de hoje
  if (settings.notifications.tasks) {
    for (const t of state.tasks) {
      if (t.done || t.dueDate !== today) continue;
      const time = t.dueTime || "09:00";
      if (hm >= time && !alreadyFired(`task-${t.id}`)) {
        notify("Tarefa para hoje", t.title, `task-${t.id}`);
      }
    }
  }

  // Eventos do calendário com lembrete
  if (settings.notifications.calendar) {
    for (const ev of state.events) {
      if (!ev.remind || ev.date !== today) continue;
      const time = ev.time || "09:00";
      if (hm >= time && !alreadyFired(`event-${ev.id}`)) {
        notify("Evento agora", `${ev.title}${ev.time ? ` às ${ev.time}` : ""}`, `event-${ev.id}`);
      }
    }
  }

  // Resumo diário
  if (settings.dailyReminder.enabled && hm >= settings.dailyReminder.time && !alreadyFired("daily")) {
    const pending = state.tasks.filter((t) => !t.done).length;
    const todays = state.events.filter((e) => e.date === today).length;
    notify("Resumo do dia — LifeHub", `${pending} tarefa(s) pendente(s) · ${todays} evento(s) hoje.`, "daily");
  }

  // Resumo semanal
  if (
    settings.weeklyReminder.enabled &&
    new Date().getDay() === settings.weeklyReminder.weekday &&
    hm >= settings.weeklyReminder.time &&
    !alreadyFired("weekly")
  ) {
    notify("Resumo da semana — LifeHub", "Revise suas metas, hábitos e finanças da semana.", "weekly");
  }

  // Hábitos: lembrete no fim da tarde se algum ainda não foi feito hoje
  if (settings.notifications.habits && hm >= "18:00" && !alreadyFired("habits")) {
    const pending = state.habits.filter((h) => !h.log.includes(today));
    if (pending.length) {
      const atRisk = pending.filter((h) => streak(h.log) > 0).length;
      notify(
        "Hábitos de hoje",
        `${pending.length} hábito(s) pendente(s)${atRisk ? ` — ${atRisk} sequência(s) em risco!` : "."}`,
        "habits"
      );
    }
  }

  // Estudos: lembrete diário simples
  if (settings.notifications.studies && hm >= "19:00" && !alreadyFired("studies") && state.subjects.length) {
    notify("Hora de estudar", "Registre sua sessão de estudos de hoje no LifeHub.", "studies");
  }

  // Metas financeiras com prazo próximo (7 dias)
  if (settings.notifications.finance && hm >= "10:00" && !alreadyFired("finance")) {
    const soon = state.financeGoals.filter((g) => {
      if (!g.deadline || g.saved >= g.target) return false;
      const diff = (new Date(g.deadline).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 7;
    });
    if (soon.length) {
      notify("Meta financeira próxima do prazo", soon.map((g) => g.name).join(", "), "finance");
    }
  }
}

export function startScheduler(getState: () => AppState): () => void {
  const tick = () => checkAndNotify(getState());
  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}
