import { useState } from "react";
import { useStore } from "../store";
import type { Goal } from "../types";
import { uid, fmtDate, todayISO, clamp } from "../utils";
import { Modal, ProgressBar, EmptyState, PageHeader, ConfirmDialog, Badge } from "../components/ui";
import { IconPlus, IconTrash, IconEdit, IconTarget } from "../components/Icons";

export default function Goals() {
  const { state, update } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [toDelete, setToDelete] = useState<Goal | null>(null);

  const today = todayISO();

  const save = (goal: Goal) => {
    update("goals", (prev) =>
      prev.some((g) => g.id === goal.id)
        ? prev.map((g) => (g.id === goal.id ? goal : g))
        : [...prev, goal]
    );
    setModalOpen(false);
    setEditing(null);
  };

  const setProgress = (id: string, progress: number) =>
    update("goals", (prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress: clamp(progress, 0, 100) } : g))
    );

  const sorted = [...state.goals].sort((a, b) => {
    const done = (g: Goal) => (g.progress >= 100 ? 1 : 0);
    if (done(a) !== done(b)) return done(a) - done(b);
    return (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });

  const avg = state.goals.length
    ? Math.round(state.goals.reduce((s, g) => s + g.progress, 0) / state.goals.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Objetivos"
        subtitle={state.goals.length ? `${state.goals.length} objetivo(s) · progresso médio ${avg}%` : "Defina metas e acompanhe o progresso"}
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <IconPlus className="w-4 h-4" /> Novo objetivo
          </button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<IconTarget className="w-6 h-6" />}
          title="Nenhum objetivo ainda"
          hint="Crie um objetivo, defina um prazo e atualize o progresso conforme avança."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sorted.map((g) => {
            const done = g.progress >= 100;
            const overdue = !done && g.deadline && g.deadline < today;
            const daysLeft = g.deadline
              ? Math.ceil((new Date(g.deadline + "T12:00").getTime() - new Date(today + "T12:00").getTime()) / 86400000)
              : null;
            return (
              <div key={g.id} className={`card p-5 animate-fadeUp ${done ? "opacity-75" : ""}`}>
                <div className="flex items-start gap-2 mb-2">
                  <h2 className={`font-semibold flex-1 min-w-0 truncate ${done ? "line-through text-zinc-400" : ""}`}>
                    {g.title}
                  </h2>
                  <button className="btn-ghost !p-1.5" onClick={() => { setEditing(g); setModalOpen(true); }} aria-label="Editar objetivo">
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost !p-1.5 hover:!text-rose-500" onClick={() => setToDelete(g)} aria-label="Excluir objetivo">
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {done && <Badge className="bg-emerald-500/10 text-emerald-500">Concluído 🎉</Badge>}
                  {g.deadline && (
                    <Badge className={overdue ? "bg-rose-500/10 text-rose-500" : "bg-orange-500/10 text-orange-500"}>
                      {fmtDate(g.deadline)}
                      {!done && daysLeft !== null && (daysLeft >= 0 ? ` · ${daysLeft}d restantes` : ` · atrasado`)}
                    </Badge>
                  )}
                </div>

                {g.notes && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{g.notes}</p>}

                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-2xl font-semibold tabular-nums">{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} color={done ? "bg-emerald-500" : "bg-orange-500"} />

                {/* Controle de progresso */}
                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={g.progress}
                    onChange={(e) => setProgress(g.id, Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                    aria-label={`Progresso de ${g.title}`}
                  />
                  <div className="flex gap-1.5">
                    <button
                      className="btn-ghost !py-1 !px-2.5 text-xs bg-zinc-100 dark:bg-white/[0.06]"
                      onClick={() => setProgress(g.id, g.progress + 10)}
                      disabled={done}
                    >
                      +10%
                    </button>
                    <button
                      className="btn-ghost !py-1 !px-2.5 text-xs bg-zinc-100 dark:bg-white/[0.06]"
                      onClick={() => setProgress(g.id, 100)}
                      disabled={done}
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GoalModal
        open={modalOpen}
        goal={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={save}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("goals", (prev) => prev.filter((g) => g.id !== toDelete.id))}
        title="Excluir objetivo"
        message={`Excluir "${toDelete?.title}"?`}
      />
    </div>
  );
}

function GoalModal({ open, goal, onClose, onSave }: {
  open: boolean; goal: Goal | null; onClose: () => void; onSave: (g: Goal) => void;
}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgressV] = useState(0);
  const [notes, setNotes] = useState("");

  const [lastKey, setLastKey] = useState("");
  const key = `${open}-${goal?.id ?? "new"}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setTitle(goal?.title ?? "");
    setDeadline(goal?.deadline ?? "");
    setProgressV(goal?.progress ?? 0);
    setNotes(goal?.notes ?? "");
  }

  return (
    <Modal open={open} onClose={onClose} title={goal ? "Editar objetivo" : "Novo objetivo"}>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="go-title">Título</label>
          <input id="go-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Correr 5km sem parar" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="go-deadline">Prazo (opcional)</label>
            <input id="go-deadline" type="date" className="input" value={deadline}
              onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="go-progress">Progresso: {progress}%</label>
            <input id="go-progress" type="range" min={0} max={100} step={5} value={progress}
              onChange={(e) => setProgressV(Number(e.target.value))}
              className="w-full accent-orange-500 mt-2.5" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="go-notes">Notas (opcional)</label>
          <textarea id="go-notes" className="input resize-none" rows={2} value={notes}
            onChange={(e) => setNotes(e.target.value)} placeholder="Por que esse objetivo importa?" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!title.trim()}
            onClick={() => onSave({
              id: goal?.id ?? uid(),
              title: title.trim(),
              deadline: deadline || undefined,
              progress: clamp(progress, 0, 100),
              notes: notes.trim() || undefined,
            })}>
            {goal ? "Salvar alterações" : "Criar objetivo"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
