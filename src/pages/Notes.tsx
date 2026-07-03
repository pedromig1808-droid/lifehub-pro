import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Note } from "../types";
import { uid } from "../utils";
import { Modal, EmptyState, PageHeader, ConfirmDialog } from "../components/ui";
import { IconPlus, IconTrash, IconNote, IconSearch } from "../components/Icons";

export default function Notes() {
  const { state, update } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Note | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...state.notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return list;
    return list.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [state.notes, query]);

  const save = (note: Note) => {
    update("notes", (prev) =>
      prev.some((n) => n.id === note.id)
        ? prev.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev]
    );
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Notas"
        subtitle={`${state.notes.length} nota(s)`}
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <IconPlus className="w-4 h-4" /> Nova nota
          </button>
        }
      />

      <div className="relative mb-5 max-w-md">
        <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          className="input !pl-9"
          placeholder="Buscar em títulos e conteúdo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar notas"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconNote className="w-6 h-6" />}
          title={query ? "Nada encontrado" : "Nenhuma nota ainda"}
          hint={query ? "Tente outra busca." : "Crie sua primeira nota para guardar ideias e informações."}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => { setEditing(n); setModalOpen(true); }}
              className="card p-4 text-left hover:-translate-y-0.5 hover:shadow-md transition-all group relative animate-fadeUp"
            >
              <h2 className="font-medium text-sm truncate pr-7">{n.title || "Sem título"}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-4 whitespace-pre-wrap">
                {n.content || "Nota vazia"}
              </p>
              <p className="text-[10px] text-zinc-400 mt-3">
                {new Date(n.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <span
                role="button"
                tabIndex={0}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all"
                onClick={(e) => { e.stopPropagation(); setToDelete(n); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setToDelete(n); } }}
                aria-label="Excluir nota"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      <NoteModal
        open={modalOpen}
        note={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={save}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("notes", (prev) => prev.filter((n) => n.id !== toDelete.id))}
        title="Excluir nota"
        message={`Excluir "${toDelete?.title || "esta nota"}"?`}
      />
    </div>
  );
}

function NoteModal({ open, note, onClose, onSave }: {
  open: boolean; note: Note | null; onClose: () => void; onSave: (n: Note) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [lastKey, setLastKey] = useState("");
  const key = `${open}-${note?.id ?? "new"}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? "Editar nota" : "Nova nota"}>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="n-title">Título</label>
          <input id="n-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="n-content">Conteúdo</label>
          <textarea id="n-content" className="input resize-y min-h-[160px]" value={content}
            onChange={(e) => setContent(e.target.value)} placeholder="Escreva aqui..." />
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!title.trim() && !content.trim()}
            onClick={() => onSave({ id: note?.id ?? uid(), title: title.trim(), content, updatedAt: Date.now() })}>
            {note ? "Salvar alterações" : "Criar nota"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
