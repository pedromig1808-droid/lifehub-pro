import { useEffect, useState } from "react";
import { useStore } from "../store";
import type { View } from "../types";
import { greeting, todayISO, fmtMoney, streak, monthKey } from "../utils";
import { ProgressBar, Badge } from "../components/ui";
import { IconTasks, IconCalendar, IconFlame, IconWallet, IconTarget, IconBook, IconChevronRight } from "../components/Icons";

export default function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { state } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const today = todayISO();
  const widgets = state.settings.dashboardWidgets;

  const pendingTasks = state.tasks.filter((t) => !t.done);
  const todayTasks = pendingTasks.filter((t) => t.dueDate === today);
  const todayEvents = state.events
    .filter((e) => e.date === today)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const habitsDone = state.habits.filter((h) => h.log.includes(today)).length;

  const mk = monthKey(today);
  const monthTx = state.transactions.filter((t) => monthKey(t.date) === mk);
  const income = monthTx.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);

  const totalStudyMin = state.subjects.reduce((s, x) => s + x.loggedMinutes, 0);
  const avgGoal = state.goals.length
    ? state.goals.reduce((s, g) => s + g.progress, 0) / state.goals.length
    : 0;

  const name = state.settings.userName.trim();

  return (
    <div className="space-y-6">
      {/* Saudação + relógio */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {greeting()}{name ? `, ${name}` : ""} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 capitalize">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-4xl font-light tabular-nums tracking-tight text-zinc-800 dark:text-zinc-200">
          {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          <span className="text-lg text-zinc-400">
            :{String(now.getSeconds()).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<IconTasks className="w-5 h-5" />} tint="text-blue-500" bg="bg-blue-500/10"
          value={String(pendingTasks.length)} label="Tarefas pendentes"
          onClick={() => onNavigate("tasks")}
        />
        <SummaryCard
          icon={<IconCalendar className="w-5 h-5" />} tint="text-violet-500" bg="bg-violet-500/10"
          value={String(todayEvents.length)} label="Eventos hoje"
          onClick={() => onNavigate("calendar")}
        />
        <SummaryCard
          icon={<IconFlame className="w-5 h-5" />} tint="text-rose-500" bg="bg-rose-500/10"
          value={`${habitsDone}/${state.habits.length}`} label="Hábitos hoje"
          onClick={() => onNavigate("habits")}
        />
        <SummaryCard
          icon={<IconWallet className="w-5 h-5" />} tint="text-emerald-500" bg="bg-emerald-500/10"
          value={fmtMoney(income - expense)} label="Saldo do mês"
          onClick={() => onNavigate("finance")}
        />
      </div>

      {/* Widgets */}
      <div className="grid md:grid-cols-2 gap-4">
        {widgets.tasks && (
          <Widget title="Tarefas de hoje" tint="text-blue-500" onOpen={() => onNavigate("tasks")}>
            {todayTasks.length === 0 ? (
              <Hint text="Nenhuma tarefa com prazo para hoje." />
            ) : (
              <ul className="space-y-2">
                {todayTasks.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === "alta" ? "bg-rose-500" : t.priority === "media" ? "bg-amber-500" : "bg-zinc-400"
                    }`} />
                    <span className="truncate">{t.title}</span>
                    {t.dueTime && <span className="ml-auto text-xs text-zinc-400 tabular-nums">{t.dueTime}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        )}

        {widgets.events && (
          <Widget title="Agenda de hoje" tint="text-violet-500" onOpen={() => onNavigate("calendar")}>
            {todayEvents.length === 0 ? (
              <Hint text="Agenda livre por hoje." />
            ) : (
              <ul className="space-y-2">
                {todayEvents.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center gap-2.5 text-sm">
                    <span className="text-xs tabular-nums text-violet-500 font-medium w-11">{e.time || "—"}</span>
                    <span className="truncate">{e.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        )}

        {widgets.habits && (
          <Widget title="Hábitos" tint="text-rose-500" onOpen={() => onNavigate("habits")}>
            {state.habits.length === 0 ? (
              <Hint text="Crie seu primeiro hábito para acompanhar sequências." />
            ) : (
              <ul className="space-y-2.5">
                {state.habits.slice(0, 4).map((h) => (
                  <li key={h.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: h.color }} />
                    <span className="truncate">{h.name}</span>
                    <Badge className="ml-auto bg-rose-500/10 text-rose-500">🔥 {streak(h.log)}</Badge>
                    {h.log.includes(today) && <Badge className="bg-emerald-500/10 text-emerald-500">feito</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        )}

        {widgets.finance && (
          <Widget title="Finanças do mês" tint="text-emerald-500" onOpen={() => onNavigate("finance")}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Receitas</p>
                <p className="font-semibold text-emerald-500 tabular-nums">{fmtMoney(income)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Despesas</p>
                <p className="font-semibold text-rose-500 tabular-nums">{fmtMoney(expense)}</p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={income > 0 ? Math.min((expense / income) * 100, 100) : expense > 0 ? 100 : 0}
                color="bg-emerald-500"
              />
              <p className="text-xs text-zinc-500 mt-1.5">
                {income > 0 ? `${Math.round((expense / income) * 100)}% das receitas gastas` : "Sem receitas registradas neste mês"}
              </p>
            </div>
          </Widget>
        )}

        {widgets.goals && (
          <Widget title="Objetivos" tint="text-orange-500" onOpen={() => onNavigate("goals")}>
            {state.goals.length === 0 ? (
              <Hint text="Defina objetivos e acompanhe o progresso." />
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm text-zinc-500">Progresso médio</span>
                  <span className="text-lg font-semibold tabular-nums">{Math.round(avgGoal)}%</span>
                </div>
                <ProgressBar value={avgGoal} color="bg-orange-500" />
              </>
            )}
          </Widget>
        )}

        {widgets.studies && (
          <Widget title="Estudos" tint="text-cyan-500" onOpen={() => onNavigate("studies")}>
            {state.subjects.length === 0 ? (
              <Hint text="Cadastre disciplinas e registre horas de estudo." />
            ) : (
              <div className="flex items-center gap-3">
                <IconBook className="w-8 h-8 text-cyan-500/60" />
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {(totalStudyMin / 60).toFixed(1)}h
                  </p>
                  <p className="text-xs text-zinc-500">estudadas em {state.subjects.length} disciplina(s)</p>
                </div>
              </div>
            )}
          </Widget>
        )}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Personalize quais widgets aparecem aqui em <button className="underline underline-offset-2" onClick={() => onNavigate("settings")}>Ajustes</button>.
      </p>
    </div>
  );
}

function SummaryCard({
  icon, tint, bg, value, label, onClick,
}: {
  icon: React.ReactNode; tint: string; bg: string; value: string; label: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card p-4 text-left hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className={`w-9 h-9 rounded-xl ${bg} ${tint} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-xl font-semibold tabular-nums truncate">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
    </button>
  );
}

function Widget({
  title, tint, children, onOpen,
}: {
  title: string; tint: string; children: React.ReactNode; onOpen: () => void;
}) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-semibold ${tint}`}>{title}</h2>
        <button onClick={onOpen} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" aria-label={`Abrir ${title}`}>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

function Hint({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400 dark:text-zinc-500">{text}</p>;
}
