import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Transaction, TxType, FinanceGoal } from "../types";
import { uid, fmtMoney, fmtDate, todayISO, monthKey, clamp } from "../utils";
import { Modal, ProgressBar, EmptyState, PageHeader, ConfirmDialog, Badge } from "../components/ui";
import { BarChart, Donut } from "../components/Charts";
import { IconPlus, IconTrash, IconWallet, IconTrendUp, IconTrendDown, IconTarget } from "../components/Icons";

const CATEGORIES = ["Salário", "Freelance", "Investimentos", "Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Compras", "Outros"];
const CAT_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#6366F1", "#71717A"];

export default function Finance() {
  const { state, update } = useStore();
  const [txModal, setTxModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<FinanceGoal | null>(null);

  const txs = useMemo(
    () => [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [state.transactions]
  );

  const mk = monthKey(todayISO());
  const monthTx = txs.filter((t) => monthKey(t.date) === mk);
  const income = monthTx.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);

  // Patrimônio = tudo que entrou menos tudo que saiu (histórico completo)
  const netWorth = txs.reduce((s, t) => s + (t.type === "receita" ? t.amount : -t.amount), 0);

  // Fluxo de caixa: últimos 6 meses
  const cashflow = useMemo(() => {
    const months: { label: string; a: number; b: number }[] = [];
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5);
    for (let i = 0; i < 6; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const list = txs.filter((t) => monthKey(t.date) === key);
      months.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        a: list.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0),
        b: list.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
      });
      d.setMonth(d.getMonth() + 1);
    }
    return months;
  }, [txs]);

  // Despesas do mês por categoria
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTx.filter((x) => x.type === "despesa")) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], i) => ({ label, value, color: CAT_COLORS[CATEGORIES.indexOf(label) % CAT_COLORS.length] ?? CAT_COLORS[i] }));
  }, [monthTx]);

  return (
    <div>
      <PageHeader
        title="Finanças"
        subtitle="Receitas, despesas, patrimônio e metas"
        action={
          <div className="flex gap-2">
            <button className="btn-ghost bg-zinc-100 dark:bg-white/[0.06]" onClick={() => setGoalModal(true)}>
              <IconTarget className="w-4 h-4" /> <span className="hidden sm:inline">Nova meta</span>
            </button>
            <button className="btn-primary" onClick={() => setTxModal(true)}>
              <IconPlus className="w-4 h-4" /> Lançamento
            </button>
          </div>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium mb-1">
            <IconTrendUp className="w-3.5 h-3.5" /> Receitas (mês)
          </div>
          <p className="text-lg sm:text-xl font-semibold tabular-nums truncate">{fmtMoney(income)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-medium mb-1">
            <IconTrendDown className="w-3.5 h-3.5" /> Despesas (mês)
          </div>
          <p className="text-lg sm:text-xl font-semibold tabular-nums truncate">{fmtMoney(expense)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-indigo-500 text-xs font-medium mb-1">
            <IconWallet className="w-3.5 h-3.5" /> Patrimônio
          </div>
          <p className={`text-lg sm:text-xl font-semibold tabular-nums truncate ${netWorth < 0 ? "text-rose-500" : ""}`}>
            {fmtMoney(netWorth)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        {/* Fluxo de caixa */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Fluxo de caixa — últimos 6 meses</h2>
          <BarChart data={cashflow} />
          <div className="flex gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Receitas</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Despesas</span>
          </div>
        </section>

        {/* Categorias */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Despesas do mês por categoria</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhuma despesa registrada neste mês.</p>
          ) : (
            <Donut data={byCategory} />
          )}
        </section>
      </div>

      {/* Metas financeiras */}
      {state.financeGoals.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold mb-3">Metas financeiras</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {state.financeGoals.map((g) => {
              const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
              return (
                <div key={g.id} className="card p-4 group">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{g.name}</p>
                    <div className="flex items-center gap-1">
                      {g.deadline && <Badge className="bg-zinc-500/10 text-zinc-500">{fmtDate(g.deadline)}</Badge>}
                      <button className="btn-ghost !p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:!text-rose-500"
                        onClick={() => setGoalToDelete(g)} aria-label="Excluir meta">
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2 tabular-nums">
                    {fmtMoney(g.saved)} de {fmtMoney(g.target)} · {Math.min(100, Math.round(pct))}%
                  </p>
                  <ProgressBar value={pct} color="bg-emerald-500" />
                  <div className="flex gap-2 mt-3">
                    {[50, 100, 500].map((v) => (
                      <button key={v}
                        className="btn-ghost !py-1 !px-2.5 text-xs bg-zinc-100 dark:bg-white/[0.06]"
                        onClick={() => update("financeGoals", (prev) =>
                          prev.map((x) => x.id === g.id ? { ...x, saved: x.saved + v } : x))}>
                        +{fmtMoney(v)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lançamentos */}
      <h2 className="text-sm font-semibold mb-3">Lançamentos recentes</h2>
      {txs.length === 0 ? (
        <EmptyState
          icon={<IconWallet className="w-6 h-6" />}
          title="Nenhum lançamento"
          hint="Registre receitas e despesas para acompanhar seu fluxo de caixa."
        />
      ) : (
        <ul className="space-y-2">
          {txs.slice(0, 30).map((t) => (
            <li key={t.id} className="card px-4 py-3 flex items-center gap-3 group">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                t.type === "receita" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              }`}>
                {t.type === "receita" ? <IconTrendUp className="w-4 h-4" /> : <IconTrendDown className="w-4 h-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{t.description}</p>
                <p className="text-xs text-zinc-400">{t.category} · {fmtDate(t.date)}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${t.type === "receita" ? "text-emerald-500" : "text-rose-500"}`}>
                {t.type === "receita" ? "+" : "−"}{fmtMoney(t.amount)}
              </span>
              <button className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:!text-rose-500"
                onClick={() => setToDelete(t)} aria-label="Excluir lançamento">
                <IconTrash className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <TxModal open={txModal} onClose={() => setTxModal(false)}
        onSave={(t) => { update("transactions", (prev) => [t, ...prev]); setTxModal(false); }} />
      <GoalModal open={goalModal} onClose={() => setGoalModal(false)}
        onSave={(g) => { update("financeGoals", (prev) => [...prev, g]); setGoalModal(false); }} />

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && update("transactions", (prev) => prev.filter((t) => t.id !== toDelete.id))}
        title="Excluir lançamento" message={`Excluir "${toDelete?.description}"?`} />
      <ConfirmDialog open={!!goalToDelete} onClose={() => setGoalToDelete(null)}
        onConfirm={() => goalToDelete && update("financeGoals", (prev) => prev.filter((g) => g.id !== goalToDelete.id))}
        title="Excluir meta" message={`Excluir a meta "${goalToDelete?.name}"?`} />
    </div>
  );
}

function TxModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (t: Transaction) => void;
}) {
  const [type, setType] = useState<TxType>("despesa");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[4]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  const submit = () => {
    const v = Number(String(amount).replace(",", "."));
    if (!description.trim() || !(v > 0)) return;
    onSave({ id: uid(), type, description: description.trim(), category, amount: v, date });
    setDescription(""); setAmount("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo lançamento">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-white/[0.05]">
          {(["despesa", "receita"] as TxType[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === "receita" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  : "text-zinc-500"
              }`}>
              {t}
            </button>
          ))}
        </div>
        <div>
          <label className="label" htmlFor="f-desc">Descrição</label>
          <input id="f-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Supermercado" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="f-amount">Valor (R$)</label>
            <input id="f-amount" type="number" inputMode="decimal" min="0" step="0.01" className="input"
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label className="label" htmlFor="f-date">Data</label>
            <input id="f-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="f-cat">Categoria</label>
          <select id="f-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit}
            disabled={!description.trim() || !(Number(String(amount).replace(",", ".")) > 0)}>
            Adicionar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function GoalModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (g: FinanceGoal) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [deadline, setDeadline] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Nova meta financeira">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="g-name">Nome</label>
          <input id="g-name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Reserva de emergência" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="g-target">Valor alvo (R$)</label>
            <input id="g-target" type="number" min="1" step="0.01" className="input" value={target}
              onChange={(e) => setTarget(e.target.value)} placeholder="10000" />
          </div>
          <div>
            <label className="label" htmlFor="g-saved">Já guardado (R$)</label>
            <input id="g-saved" type="number" min="0" step="0.01" className="input" value={saved}
              onChange={(e) => setSaved(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="g-deadline">Prazo (opcional)</label>
          <input id="g-deadline" type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!name.trim() || !(Number(target) > 0)}
            onClick={() => {
              onSave({
                id: uid(), name: name.trim(),
                target: Number(target), saved: clamp(Number(saved) || 0, 0, Number(target) * 100),
                deadline: deadline || undefined,
              });
              setName(""); setTarget(""); setSaved("0"); setDeadline("");
            }}>
            Criar meta
          </button>
        </div>
      </div>
    </Modal>
  );
}
