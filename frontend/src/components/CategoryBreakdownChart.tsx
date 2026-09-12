import { formatRupiah } from "@/lib/format"

type BreakdownDatum = { label: string; amount: number; type: "income" | "expense" }

const COLOR_INCOME = "#2a78d6"
const COLOR_EXPENSE = "#e34948"
const GRIDLINE = "#e1e0d9"
const AXIS = "#c3c2b7"
const MUTED_TEXT = "#898781"
const PRIMARY_TEXT = "#0b0b0b"

// ponytail: hand-rolled SVG bar (no chart lib) — consistent with FinanceChart.
function roundedRightRectPath(x: number, y: number, width: number, height: number, r: number) {
  if (width <= 0) return ""
  const radius = Math.min(r, height / 2, width)
  return `M ${x} ${y} L ${x + width - radius} ${y} Q ${x + width} ${y} ${x + width} ${y + radius} L ${x + width} ${y + height - radius} Q ${x + width} ${y + height} ${x + width - radius} ${y + height} L ${x} ${y + height} Z`
}

export function CategoryBreakdownChart({ data }: { data: BreakdownDatum[] }) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const barHeight = 18
  const gap = 10
  const rowHeight = barHeight + gap
  const labelWidth = 96
  const width = 640
  const topPadding = 4
  const plotWidth = width - labelWidth - 90
  const height = sorted.length * rowHeight + topPadding
  const max = Math.max(1, ...sorted.map((d) => d.amount))
  const ticks = [0, max / 2, max]
  const xFor = (value: number) => labelWidth + (value / max) * plotWidth
  const compact = new Intl.NumberFormat("id-ID", { notation: "compact" })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_INCOME }} />
          Pemasukan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_EXPENSE }} />
          Pengeluaran
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Rincian kategori pemasukan dan pengeluaran"
      >
        {ticks.map((t) => (
          <line key={t} x1={xFor(t)} x2={xFor(t)} y1={0} y2={height} stroke={GRIDLINE} strokeWidth={1} />
        ))}
        <line x1={labelWidth} x2={labelWidth} y1={0} y2={height} stroke={AXIS} strokeWidth={1} />
        {sorted.map((d, i) => {
          const y = topPadding + i * rowHeight
          const barWidth = (d.amount / max) * plotWidth
          const color = d.type === "income" ? COLOR_INCOME : COLOR_EXPENSE
          return (
            <g key={`${d.label}-${d.type}`}>
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill={PRIMARY_TEXT}
              >
                {d.label}
              </text>
              <path d={roundedRightRectPath(labelWidth, y, barWidth, barHeight, 4)} fill={color}>
                <title>{`${d.label} — ${formatRupiah(d.amount)}`}</title>
              </path>
              <text x={labelWidth + barWidth + 6} y={y + barHeight / 2} dominantBaseline="middle" fontSize={11} fill={MUTED_TEXT}>
                {compact.format(d.amount)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
