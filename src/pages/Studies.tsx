import { useState } from "react";
import { useStore } from "../store";
import type { Subject } from "../types";
import { uid, clamp } from "../utils";
import { Modal, ProgressBar, EmptyState, PageHeader, ConfirmDialog, Badge } from "../components/ui";
import { IconPlus, IconTrash, IconBook, IconCheck, IconClock } from "../components/Icons";

const COLORS = ["#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"];

export default function Studies() {
  const { state, update } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subject | null>(null);
  const [logFor, setLogFor] = useState<Subject | null>(null);

  const patch = (id: string, fn: (s: Subject) => Subject) =>
    update("subjects", (prev) => prev.map((s) => (s.id === id ? fn(s) : s)));

  const totalMin = state.subjects.reduce((s, x) => s + x.loggedMinutes, 0);

  return (
    <div>
      <PageHeader
        title="Estudos"
        subtitle={state.subjects.length ? `${(totalMin / 60).toFixed(1)}h estudadas no total` : "Acompanhe disciplinas e horas de estudo"}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="w-4 h-4" /> Nova disciplina
          </button>
        }
      />

      {state.subjects.length === 0 ? (
        <EmptyState
          icon={<IconBook className="w-6 h-6" />}
          title="Nenhuma disciplina ainda"
          hint="Crie uma disciplina, defina uma meta de horas e registre suas sessões."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {state.subjects.map((s) => {
            const hours = s.loggedMinutes / 60;
            const pct = s.targetHours > 0 ? (hours / s.targetHours) * 100 : 0;
            const doneItems = s.checklist.filter((c) => c.done).length;
            return (
              <div key={s.id} className="card p-5 animate-fadeUp">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <h2 className="font-semibold truncate flex-1">{s.name}</h2>
                  <button className="btn-ghost !p-1.5 hover:!text-rose-500" onClick={() => setToDelete(s)} aria-label="Excluir disciplina">
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-2xl font-semibold tabular-nums">{hours.toFixed(1)}h</span>
                  <span className="text-xs text-zinc-500">meta: {s.targetHours}h · {Math.min(100, Math.round(pct))}%</span>
                </div>
                <ProgressBar value={pct} color="bg-cyan-500" />

                <button className="btn-ghost w-full mt-3 !justify-center text-cyan-600 dark:text-cyan-400"
                  onClick={() => setLogFor(s)}>
                  <IconClock className="w-4 h-4" /> Registrar sessão
                </button>

                {/* Checklist */}
                <div className="mt-4 pt-4 border-t border-zinc-200/80 dark:border-white/[0.07]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-500">Checklist</p>
                    {s.checklist.length > 0 && (
                      <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {doneItems}/{s.checklist.length}
                      </Badge>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {s.checklist.map((c) => (
                      <li key={c.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => patch(s.id, (x) => ({
                            ...x,
                            checklist: x.checklist.map((i) => i.id === c.id ? { ...i, done: !i.done } : i),
                          }))}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            c.done ? "bg-cyan-500 border-cyan-500 text-white" : "border-zinc-300 dark:border-zinc-600"
                          }`}
                          aria-label={c.done ? "Desmarcar item" : "Concluir item"}
                        >
                          {c.done && <IconCheck className="w-3 h-3" />}
                        </button>
                        <span className={`text-sm flex-1 truncate ${c.done ? "line-through text-zinc-400" : ""}`}>{c.text}</span>
                        <button
                          className="btn-ghost !p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:!text-rose-500"
                          onClick={() => patch(s.id, (x) => ({ ...x, checklist: x.checklist.filter((i) => i.id !== c.id) }))}
                          aria-label="Remover item"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ChecklistInput onAdd={(text) => patch(s.id, (x) => ({
                    ...x,
                    checklist: [...x.checklist, { id: uid(), text, done: false }],
                  }))} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SubjectModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSave={(s) => { update("subjects", (prev) => [...prev, s]); setModalOpen(false); }} />

      <LogModal subject={logFor} onClose={() => setLogFor(null)}
        onLog={(min) => {
          if (logFor) patch(logFor.id, (s) => ({ ...s, loggedMinutes: s.loggedMinutes + min }));
          setLogFor(null);
        }} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("subjects", (prev) => prev.filter((s) => s.id !== toDelete.id))}
        title="Excluir disciplina"
        message={`Excluir "${toDelete?.name}" e todo o histórico de horas?`}
      />
    </div>
  );
}

function ChecklistInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="flex gap-2 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) { onAdd(text.trim()); setText(""); }
      }}
    >
      <input className="input !py-1.5 text-sm" placeholder="Novo item do checklist"
        value={text} onChange={(e) => setText(e.target.value)} aria-label="Novo item do checklist" />
      <button type="submit" className="btn-ghost !p-2 shrink-0" disabled={!text.trim()} aria-label="Adicionar item">
        <IconPlus className="w-4 h-4" />
      </button>
    </form>
  );
}

function SubjectModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (s: Subject) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("20");
  const [color, setColor] = useState(COLORS[0]);

  return (
    <Modal open={open} onClose={onClose} title="Nova disciplina">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="s-name">Nome</label>
          <input id="s-name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Matemática" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="s-target">Meta de horas</label>
          <input id="s-target" type="number" min="1" className="input" value={target}
            onChange={(e) => setTarget(e.target.value)} />
        </div>
        <div>
          <span className="label">Cor</span>
          <div className="flex gap-2">
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
            onClick={() => {
              onSave({ id: uid(), name: name.trim(), color, targetHours: clamp(Number(target) || 1, 1, 10000), loggedMinutes: 0, checklist: [] });
              setName(""); setTarget("20"); setColor(COLORS[0]);
            }}>
            Criar disciplina
          </button>
        </div>
      </div>
    </Modal>
  );
}

function LogModal({ subject, onClose, onLog }: {
  subject: Subject | null; onClose: () => void; onLog: (minutes: number) => void;
}) {
  const [minutes, setMinutes] = useState("30");
  return (
    <Modal open={!!subject} onClose={onClose} title={`Registrar sessão — ${subject?.name ?? ""}`}>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="log-min">Duração (minutos)</label>
          <input id="log-min" type="number" min="1" className="input" value={minutes}
            onChange={(e) => setMinutes(e.target.value)} autoFocus />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[15, 25, 30, 45, 60, 90].map((m) => (
            <button key={m} className="btn-ghost !py-1.5 !px-3 text-xs bg-zinc-100 dark:bg-white/[0.06]"
              onClick={() => setMinutes(String(m))}>
              {m} min
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!(Number(minutes) > 0)}
            onClick={() => onLog(clamp(Number(minutes), 1, 1440))}>
            Registrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
