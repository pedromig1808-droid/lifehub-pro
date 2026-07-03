import { useEffect, type ReactNode } from "react";
import { IconX } from "./Icons";
import { clamp } from "../utils";

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto scroll-thin rounded-b-none sm:rounded-2xl animate-scaleIn">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-surface-light dark:bg-surface-dark rounded-t-2xl">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="btn-ghost !p-2 !rounded-lg" onClick={onClose} aria-label="Fechar">
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-7 rounded-full transition-colors shrink-0 ${
        checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-white/15"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

/* ---------- Barra de progresso ---------- */
export function ProgressBar({ value, color = "bg-indigo-500" }: { value: number; color?: string }) {
  const v = clamp(value, 0, 100);
  return (
    <div className="h-2 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${v}%` }} />
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

/* ---------- Estado vazio ---------- */
export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6 animate-fadeUp">
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-zinc-400 mb-3">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{hint}</p>
    </div>
  );
}

/* ---------- Cabeçalho de página ---------- */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Confirmação ---------- */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Excluir",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button
          className="btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
