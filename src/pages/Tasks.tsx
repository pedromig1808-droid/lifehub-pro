import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Task, Priority } from "../types";
import { uid, fmtDate, todayISO } from "../utils";
import { Modal, Badge, EmptyState, PageHeader, ConfirmDialog } from "../components/ui";
import { IconPlus, IconTrash, IconEdit, IconTasks, IconCheck } from "../components/Icons";

type Filter = "todas" | "pendentes" | "concluidas" | "hoje" | "atrasadas";

const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-rose-500/10 text-rose-500" },
  media: { label: "Média", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  baixa: { label: "Baixa", cls: "bg-zinc-500/10 text-zinc-500" },
};

export default function Tasks() {
  const { state, update } = useStore();
  const [filter, setFilter] = useState<Filter>("pendentes");
  const [editing, setEditing] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Task | null>(null);

  const today = todayISO();

  const filtered = useMemo(() => {
    const list = [...state.tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const da = a.dueDate || "9999";
      const db = b.dueDate || "9999";
      if (da !== db) return da.localeCompare(db);
      const order: Priority[] = ["alta", "media", "baixa"];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });
    switch (filter) {
      case "pendentes": return list.filter((t) => !t.done);
      case "concluidas": return list.filter((t) => t.done);
      case "hoje": return list.filter((t) => t.dueDate === today);
      case "atrasadas": return list.filter((t) => !t.done && t.dueDate && t.dueDate < today);
      default: return list;
    }
  }, [state.tasks, filter, today]);

  const save = (task: Task) => {
    update("tasks", (prev) =>
      prev.some((t) => t.id === task.id)
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [task, ...prev]
    );
    setModalOpen(false);
    setEditing(null);
  };

  const toggle = (id: string) =>
    update("tasks", (prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => update("tasks", (prev) => prev.filter((t) => t.id !== id));

  const filters: { key: Filter; label: string }[] = [
    { key: "pendentes", label: "Pendentes" },
    { key: "hoje", label: "Hoje" },
    { key: "atrasadas", label: "Atrasadas" },
    { key: "concluidas", label: "Concluídas" },
    { key: "todas", label: "Todas" },
  ];

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle={`${state.tasks.filter((t) => !t.done).length} pendente(s)`}
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <IconPlus className="w-4 h-4" /> Nova tarefa
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scroll-thin pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconTasks className="w-6 h-6" />}
          title="Nada por aqui"
          hint="Crie uma tarefa com o botão acima para começar."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const overdue = !t.done && t.dueDate && t.dueDate < today;
            return (
              <li key={t.id} className="card px-4 py-3 flex items-center gap-3 group animate-fadeUp">
                <button
                  onClick={() => toggle(t.id)}
                  aria-label={t.done ? "Marcar como pendente" : "Concluir tarefa"}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    t.done
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-zinc-300 dark:border-zinc-600 hover:border-blue-500"
                  }`}
                >
                  {t.done && <IconCheck className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${t.done ? "line-through text-zinc-400" : ""}`}>{t.title}</p>
                  {t.notes && <p className="text-xs text-zinc-400 truncate">{t.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.dueDate && (
                    <Badge className={overdue ? "bg-rose-500/10 text-rose-500" : "bg-zinc-500/10 text-zinc-500"}>
                      {fmtDate(t.dueDate)}{t.dueTime ? ` · ${t.dueTime}` : ""}
                    </Badge>
                  )}
                  <Badge className={PRIORITY_META[t.priority].cls}>{PRIORITY_META[t.priority].label}</Badge>
                  <button
                    className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => { setEditing(t); setModalOpen(true); }}
                    aria-label="Editar tarefa"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:!text-rose-500"
                    onClick={() => setToDelete(t)}
                    aria-label="Excluir tarefa"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <TaskModal
        open={modalOpen}
        task={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={save}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete.id)}
        title="Excluir tarefa"
        message={`Excluir "${toDelete?.title}"? Essa ação não pode ser desfeita.`}
      />
    </div>
  );
}

function TaskModal({
  open, task, onClose, onSave,
}: {
  open: boolean; task: Task | null; onClose: () => void; onSave: (t: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  // Sincroniza campos ao abrir
  const [lastKey, setLastKey] = useState("");
  const key = `${open}-${task?.id ?? "new"}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setPriority(task?.priority ?? "media");
    setDueDate(task?.dueDate ?? "");
    setDueTime(task?.dueTime ?? "");
  }

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id ?? uid(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      done: task?.done ?? false,
      createdAt: task?.createdAt ?? Date.now(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Editar tarefa" : "Nova tarefa"}>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="t-title">Título</label>
          <input id="t-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Enviar relatório mensal" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="t-notes">Notas (opcional)</label>
          <textarea id="t-notes" className="input resize-none" rows={2} value={notes}
            onChange={(e) => setNotes(e.target.value)} placeholder="Detalhes da tarefa" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="t-priority">Prioridade</label>
            <select id="t-priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="t-date">Data</label>
            <input id="t-date" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t-time">Hora</label>
            <input id="t-time" type="time" className="input" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit} disabled={!title.trim()}>
            {task ? "Salvar alterações" : "Criar tarefa"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
