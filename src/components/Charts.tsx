/** Gráficos leves em SVG puro — sem dependências externas. */

export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; a: number; b?: number }[];
  height?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.flatMap((d) => [d.a, d.b ?? 0]), 1);
  return (
    <div className="flex items-end gap-3 w-full" style={{ height }} role="img" aria-label="Gráfico de barras">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-full flex items-end justify-center gap-1" style={{ height: height - 24 }}>
            <div
              className="w-2/5 max-w-[22px] rounded-t-md bg-emerald-500/90 transition-all duration-500"
              style={{ height: `${(d.a / max) * 100}%` }}
              title={`Receitas: ${d.a.toFixed(2)}`}
            />
            {d.b !== undefined && (
              <div
                className="w-2/5 max-w-[22px] rounded-t-md bg-rose-500/90 transition-all duration-500"
                style={{ height: `${(d.b / max) * 100}%` }}
                title={`Despesas: ${d.b.toFixed(2)}`}
              />
            )}
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data,
  size = 150,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return null;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Gráfico de categorias">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="12" className="stroke-zinc-200 dark:stroke-white/10" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-zinc-600 dark:text-zinc-300">{d.label}</span>
            <span className="text-zinc-400 tabular-nums ml-auto pl-3">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, color = "#6366F1" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const w = 200;
  const h = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - 4 - ((v - min) / range) * (h - 8)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" role="img" aria-label="Tendência">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
