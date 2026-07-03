import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import type { NotifKey } from "../types";
import { Toggle, PageHeader, ConfirmDialog } from "../components/ui";
import { notificationsSupported, requestPermission, notify } from "../notifications";
import { IconBell, IconDownload, IconUpload, IconTrash, IconSun, IconMoon } from "../components/Icons";

const NOTIF_LABELS: Record<NotifKey, { title: string; desc: string }> = {
  tasks:    { title: "Tarefas",           desc: "Avisar quando uma tarefa com data/hora vencer hoje" },
  calendar: { title: "Calendário",        desc: "Lembrar de eventos com lembrete ativado" },
  habits:   { title: "Hábitos",           desc: "Lembrete às 18h se houver hábitos pendentes" },
  studies:  { title: "Estudos",           desc: "Lembrete diário de estudo às 19h" },
  finance:  { title: "Metas financeiras", desc: "Avisar quando uma meta estiver a 7 dias do prazo" },
};

const WIDGET_LABELS: Record<string, string> = {
  tasks: "Tarefas de hoje",
  events: "Agenda de hoje",
  habits: "Hábitos",
  finance: "Finanças do mês",
  goals: "Objetivos",
  studies: "Estudos",
};

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function Settings() {
  const { state, setSettings, exportJSON, importJSON, resetAll } = useStore();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState<null | { ok: boolean; text: string }>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    notificationsSupported() ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    if (!importMsg) return;
    const t = setTimeout(() => setImportMsg(null), 4000);
    return () => clearTimeout(t);
  }, [importMsg]);

  const askPermission = async () => {
    const p = await requestPermission();
    setPermission(p);
    if (p === "granted") {
      notify("Notificações ativadas ✅", "O LifeHub vai avisar você sobre tarefas, eventos e hábitos.", "perm-test");
    }
  };

  const dark = s.theme === "dark";

  return (
    <div className="max-w-2xl">
      <PageHeader title="Ajustes" subtitle="Preferências, notificações e seus dados" />

      <div className="space-y-5">
        {/* Perfil */}
        <Section title="Perfil">
          <label className="label" htmlFor="set-name">Seu nome (usado na saudação do Dashboard)</label>
          <input
            id="set-name"
            className="input max-w-xs"
            value={s.userName}
            onChange={(e) => setSettings({ userName: e.target.value })}
            placeholder="Ex.: Ana"
          />
        </Section>

        {/* Aparência */}
        <Section title="Aparência">
          <Row
            title="Tema escuro"
            desc={dark ? "Ativado — visual quase-preto" : "Desativado — visual claro"}
            icon={dark ? <IconMoon className="w-4 h-4" /> : <IconSun className="w-4 h-4" />}
          >
            <Toggle checked={dark} onChange={(v) => setSettings({ theme: v ? "dark" : "light" })} label="Tema escuro" />
          </Row>
        </Section>

        {/* Notificações */}
        <Section title="Notificações">
          {permission === "unsupported" ? (
            <p className="text-sm text-zinc-500">Este navegador não suporta notificações.</p>
          ) : permission !== "granted" ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex flex-wrap items-center gap-3">
              <IconBell className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm flex-1 min-w-[200px]">
                {permission === "denied"
                  ? "Notificações bloqueadas. Libere nas configurações do navegador para este site."
                  : "Permita notificações para receber lembretes de tarefas, eventos e hábitos."}
              </p>
              {permission === "default" && (
                <button className="btn-primary !py-1.5 text-xs" onClick={askPermission}>Permitir</button>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-500 mb-1">✓ Permissão concedida</p>
          )}

          <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.07] mt-2">
            {(Object.keys(NOTIF_LABELS) as NotifKey[]).map((k) => (
              <Row key={k} title={NOTIF_LABELS[k].title} desc={NOTIF_LABELS[k].desc}>
                <Toggle
                  checked={s.notifications[k]}
                  onChange={(v) => setSettings({ notifications: { ...s.notifications, [k]: v } })}
                  label={NOTIF_LABELS[k].title}
                />
              </Row>
            ))}

            {/* Resumo diário */}
            <Row title="Resumo diário" desc="Tarefas pendentes e eventos do dia, no horário escolhido">
              <div className="flex items-center gap-3">
                {s.dailyReminder.enabled && (
                  <input
                    type="time"
                    className="input !w-auto !py-1.5"
                    value={s.dailyReminder.time}
                    onChange={(e) => setSettings({ dailyReminder: { ...s.dailyReminder, time: e.target.value } })}
                    aria-label="Horário do resumo diário"
                  />
                )}
                <Toggle
                  checked={s.dailyReminder.enabled}
                  onChange={(v) => setSettings({ dailyReminder: { ...s.dailyReminder, enabled: v } })}
                  label="Resumo diário"
                />
              </div>
            </Row>

            {/* Resumo semanal */}
            <Row title="Resumo semanal" desc="Revisão de metas, hábitos e finanças">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {s.weeklyReminder.enabled && (
                  <>
                    <select
                      className="input !w-auto !py-1.5"
                      value={s.weeklyReminder.weekday}
                      onChange={(e) => setSettings({ weeklyReminder: { ...s.weeklyReminder, weekday: Number(e.target.value) } })}
                      aria-label="Dia do resumo semanal"
                    >
                      {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                    <input
                      type="time"
                      className="input !w-auto !py-1.5"
                      value={s.weeklyReminder.time}
                      onChange={(e) => setSettings({ weeklyReminder: { ...s.weeklyReminder, time: e.target.value } })}
                      aria-label="Horário do resumo semanal"
                    />
                  </>
                )}
                <Toggle
                  checked={s.weeklyReminder.enabled}
                  onChange={(v) => setSettings({ weeklyReminder: { ...s.weeklyReminder, enabled: v } })}
                  label="Resumo semanal"
                />
              </div>
            </Row>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-3">
            Como o LifeHub não usa servidor, as notificações são disparadas enquanto o app (ou o PWA instalado) está aberto.
          </p>
        </Section>

        {/* Widgets do Dashboard */}
        <Section title="Widgets do Dashboard">
          <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.07]">
            {Object.keys(WIDGET_LABELS).map((k) => (
              <Row key={k} title={WIDGET_LABELS[k]} desc="Exibir no Dashboard">
                <Toggle
                  checked={s.dashboardWidgets[k] ?? true}
                  onChange={(v) => setSettings({ dashboardWidgets: { ...s.dashboardWidgets, [k]: v } })}
                  label={WIDGET_LABELS[k]}
                />
              </Row>
            ))}
          </div>
        </Section>

        {/* Dados */}
        <Section title="Seus dados">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Tudo fica salvo apenas no seu dispositivo (IndexedDB). Faça backups periódicos com a exportação.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost bg-zinc-100 dark:bg-white/[0.06]" onClick={exportJSON}>
              <IconDownload className="w-4 h-4" /> Exportar backup (JSON)
            </button>
            <button className="btn-ghost bg-zinc-100 dark:bg-white/[0.06]" onClick={() => fileRef.current?.click()}>
              <IconUpload className="w-4 h-4" /> Importar backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const ok = await importJSON(file);
                setImportMsg(ok
                  ? { ok: true, text: "Backup importado com sucesso ✅" }
                  : { ok: false, text: "Arquivo inválido — use um backup exportado pelo LifeHub." });
              }}
            />
            <button className="btn-danger" onClick={() => setConfirmReset(true)}>
              <IconTrash className="w-4 h-4" /> Apagar tudo
            </button>
          </div>
          {importMsg && (
            <p className={`text-xs mt-3 ${importMsg.ok ? "text-emerald-500" : "text-rose-500"}`}>{importMsg.text}</p>
          )}
        </Section>

        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 pb-4">
          LifeHub Pro v1.0 · seus dados nunca saem do seu dispositivo
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => resetAll()}
        title="Apagar todos os dados"
        message="Isso remove tarefas, eventos, notas, finanças, hábitos e objetivos deste dispositivo. Exporte um backup antes se quiser guardar algo. Essa ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 animate-fadeUp">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ title, desc, icon, children }: {
  title: string; desc?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium flex items-center gap-1.5">{icon}{title}</p>
        {desc && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
