import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Habit } from "../types";
import { uid, todayISO, toISO, streak, bestStreak } from "../utils";
import { Modal, EmptyState, PageHeader, ConfirmDialog, Badge } from "../components/ui";
import { IconPlus, IconTrash, IconFlame, IconCheck } from "../components/Icons";

const COLORS = ["#F43F5E", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"];

export default function Habits() {
  const { state, update } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Habit | null>(null);

  const today = todayISO();

  // Últimos 7 dias para o mini-heatmap
  const last7 = useMemo(() => {
    const days: string[] = [];
    const d = new Date();
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      days.push(toISO(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, []);

  const toggleDay = (habitId: string, iso: string) =>
    update("habits", (prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, log: h.log.includes(iso) ? h.log.filter((x) => x !== iso) : [...h.log, iso] }
          : h
      )
    );

  const doneToday = state.habits.filter((h) => h.log.includes(today)).length;

  return (
    <div>
      <PageHeader
        title="Hábitos"
        subtitle={state.habits.length ? `${doneToday} de ${state.habits.length} concluído(s) hoje` : "Construa sequências dia após dia"}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="w-4 h-4" /> Novo hábito
          </button>
        }
      />

      {state.habits.length === 0 ? (
        <EmptyState
          icon={<IconFlame className="w-6 h-6" />}
          title="Nenhum hábito ainda"
          hint="Crie um hábito e marque os dias concluídos para acompanhar sua sequência."
        />
      ) : (
        <div className="space-y-3">
          {state.habits.map((h) => {
            const cur = streak(h.log);
            const best = bestStreak(h.log);
            const doneNow = h.log.includes(today);
            // Taxa dos últimos 30 dias
            const d30 = new Date();
            d30.setDate(d30.getDate() - 29);
            const from = toISO(d30);
            const rate = Math.round((h.log.filter((x) => x >= from && x <= today).length / 30) * 100);

            return (
              <div key={h.id} className="card p-4 sm:p-5 animate-fadeUp">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Concluir hoje */}
                  <button
                    onClick={() => toggleDay(h.id, today)}
                    aria-label={doneNow ? "Desmarcar hoje" : "Concluir hoje"}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                      doneNow ? "text-white border-transparent" : "border-zinc-300 dark:border-zinc-600 text-transparent hover:border-current"
                    }`}
                    style={doneNow ? { background: h.color } : { color: h.color }}
                  >
                    <IconCheck className="w-5 h-5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{h.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge className="bg-rose-500/10 text-rose-500">🔥 {cur} dia(s)</Badge>
                      <Badge className="bg-zinc-500/10 text-zinc-500">recorde: {best}</Badge>
                      <Badge className="bg-zinc-500/10 text-zinc-500">30 dias: {rate}%</Badge>
                    </div>
                  </div>

                  {/* Últimos 7 dias */}
                  <div className="flex gap-1.5 ml-auto">
                    {last7.map((iso) => {
                      const done = h.log.includes(iso);
                      const weekday = new Date(iso + "T12:00").toLocaleDateString("pt-BR", { weekday: "narrow" });
                      return (
                        <button
                          key={iso}
                          onClick={() => toggleDay(h.id, iso)}
                          title={iso}
                          aria-label={`${iso} — ${done ? "feito" : "não feito"}`}
                          className={`w-7 h-9 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[9px] transition-all ${
                            done ? "text-white" : "bg-zinc-100 dark:bg-white/[0.06] text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                          }`}
                          style={done ? { background: h.color } : undefined}
                        >
                          <span className="uppercase">{weekday}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-white" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                        </button>
                      );
                    })}
                  </div>

                  <button className="btn-ghost !p-1.5 hover:!text-rose-500 shrink-0"
                    onClick={() => setToDelete(h)} aria-label="Excluir hábito">
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HabitModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSave={(h) => { update("habits", (prev) => [...prev, h]); setModalOpen(false); }} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("habits", (prev) => prev.filter((h) => h.id !== toDelete.id))}
        title="Excluir hábito"
        message={`Excluir "${toDelete?.name}" e todo o histórico de sequências?`}
      />
    </div>
  );
}

function HabitModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (h: Habit) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  return (
    <Modal open={open} onClose={onClose} title="Novo hábito">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="h-name">Nome</label>
          <input id="h-name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Ler 20 minutos" autoFocus />
        </div>
        <div>
          <span className="label">Cor</span>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} aria-label={`Cor ${c}`}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-surface-dark" : ""}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!name.trim()}
            onClick={() => { onSave({ id: uid(), name: name.trim(), color, log: [] }); setName(""); setColor(COLORS[0]); }}>
            Criar hábito
          </button>
        </div>
      </div>
    </Modal>
  );
}
