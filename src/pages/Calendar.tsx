import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { CalendarEvent } from "../types";
import { uid, toISO, todayISO, fmtDateLong } from "../utils";
import { Modal, Toggle, PageHeader, ConfirmDialog } from "../components/ui";
import { IconChevronLeft, IconChevronRight, IconPlus, IconTrash, IconEdit, IconBell } from "../components/Icons";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default function Calendar() {
  const { state, update } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<string>(todayISO());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);

  const today = todayISO();

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const days: { iso: string; inMonth: boolean; day: number }[] = [];
    const d = new Date(start);
    for (let i = 0; i < 42; i++) {
      days.push({ iso: toISO(d), inMonth: d.getMonth() === cursor.m, day: d.getDate() });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of state.events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    return map;
  }, [state.events]);

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const save = (ev: CalendarEvent) => {
    update("events", (prev) =>
      prev.some((e) => e.id === ev.id) ? prev.map((e) => (e.id === ev.id ? ev : e)) : [...prev, ev]
    );
    setModalOpen(false);
    setEditing(null);
  };

  const selectedEvents = eventsByDate.get(selected) ?? [];

  return (
    <div>
      <PageHeader
        title="Calendário"
        subtitle="Visão mensal, eventos e lembretes"
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <IconPlus className="w-4 h-4" /> Novo evento
          </button>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Grade mensal */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <button className="btn-ghost !p-2" onClick={() => shift(-1)} aria-label="Mês anterior">
              <IconChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold capitalize">{monthLabel}</h2>
            <button className="btn-ghost !p-2" onClick={() => shift(1)} aria-label="Próximo mês">
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-zinc-400 mb-1">
            {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map(({ iso, inMonth, day }) => {
              const evs = eventsByDate.get(iso) ?? [];
              const isToday = iso === today;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={`relative aspect-square rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 transition-colors
                    ${!inMonth ? "text-zinc-300 dark:text-zinc-600" : ""}
                    ${isSelected ? "bg-violet-500 text-white" :
                      isToday ? "bg-violet-500/15 text-violet-600 dark:text-violet-300 font-semibold" :
                      "hover:bg-zinc-100 dark:hover:bg-white/[0.06]"}`}
                  aria-label={fmtDateLong(iso)}
                >
                  <span className="tabular-nums">{day}</span>
                  {evs.length > 0 && (
                    <span className={`flex gap-0.5 ${isSelected ? "" : ""}`}>
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-violet-500"}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dia selecionado */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold capitalize mb-3">{fmtDateLong(selected)}</h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Nenhum evento neste dia.</p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((e) => (
                <li key={e.id} className="rounded-xl border border-zinc-200 dark:border-white/[0.07] px-3 py-2.5 group">
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums font-medium text-violet-500 w-11 shrink-0">{e.time || "dia todo"}</span>
                    <span className="text-sm truncate flex-1">{e.title}</span>
                    {e.remind && <IconBell className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                    <button className="btn-ghost !p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => { setEditing(e); setModalOpen(true); }} aria-label="Editar evento">
                      <IconEdit className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost !p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:!text-rose-500"
                      onClick={() => setToDelete(e)} aria-label="Excluir evento">
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {e.notes && <p className="text-xs text-zinc-400 mt-1 pl-[52px]">{e.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          <button
            className="btn-ghost w-full mt-3 !justify-center text-violet-500"
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            <IconPlus className="w-4 h-4" /> Adicionar em {fmtDateLong(selected).split(",")[0]}
          </button>
        </div>
      </div>

      <EventModal
        open={modalOpen}
        event={editing}
        defaultDate={selected}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={save}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("events", (prev) => prev.filter((e) => e.id !== toDelete.id))}
        title="Excluir evento"
        message={`Excluir "${toDelete?.title}"?`}
      />
    </div>
  );
}

function EventModal({
  open, event, defaultDate, onClose, onSave,
}: {
  open: boolean; event: CalendarEvent | null; defaultDate: string;
  onClose: () => void; onSave: (e: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [remind, setRemind] = useState(true);

  const [lastKey, setLastKey] = useState("");
  const key = `${open}-${event?.id ?? "new"}-${defaultDate}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setTitle(event?.title ?? "");
    setDate(event?.date ?? defaultDate);
    setTime(event?.time ?? "");
    setNotes(event?.notes ?? "");
    setRemind(event?.remind ?? true);
  }

  const submit = () => {
    if (!title.trim() || !date) return;
    onSave({
      id: event?.id ?? uid(),
      title: title.trim(),
      date,
      time: time || undefined,
      notes: notes.trim() || undefined,
      remind,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={event ? "Editar evento" : "Novo evento"}>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="e-title">Título</label>
          <input id="e-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Consulta médica" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="e-date">Data</label>
            <input id="e-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="e-time">Hora (opcional)</label>
            <input id="e-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="e-notes">Notas (opcional)</label>
          <textarea id="e-notes" className="input resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3.5 py-3">
          <div>
            <p className="text-sm font-medium">Lembrete</p>
            <p className="text-xs text-zinc-500">Notificar no dia e horário do evento</p>
          </div>
          <Toggle checked={remind} onChange={setRemind} label="Lembrete do evento" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit} disabled={!title.trim() || !date}>
            {event ? "Salvar alterações" : "Criar evento"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
