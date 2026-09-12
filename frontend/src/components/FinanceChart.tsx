import { formatRupiah } from "@/lib/format"

type ChartDatum = { label: string; income: number; expense: number }

// dataviz-skill palette: blue/red is the validated diverging pair, doubling
// here as the income/expense categorical pair (validated via validate_palette.js).
const COLOR_INCOME = "#2a78d6"
const COLOR_EXPENSE = "#e34948"
const GRIDLINE = "#e1e0d9"
const AXIS = "#c3c2b7"
const MUTED_TEXT = "#898781"

// ponytail: hand-rolled SVG bar (no chart lib) — small, fixed dataset, one chart in the app.
function roundedTopRectPath(x: number, y: number, width: number, height: number, r: number) {
  if (height <= 0) return ""
  const radius = Math.min(r, width / 2, height)
  return `M ${x} ${y + height} L ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y} L ${x + width - radius} ${y} Q ${x + width} ${y} ${x + width} ${y + radius} L ${x + width} ${y + height} Z`
}

export function FinanceChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) return null

  const width = 640
  const height = 220
  const paddingLeft = 56
  const paddingBottom = 28
  const paddingTop = 12
  const plotWidth = width - paddingLeft - 8
  const plotHeight = height - paddingTop - paddingBottom

  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]))
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  const axisMax = Math.ceil(max / magnitude) * magnitude
  const ticks = [0, axisMax / 4, axisMax / 2, (axisMax * 3) / 4, axisMax]
  const yFor = (value: number) => paddingTop + plotHeight - (value / axisMax) * plotHeight

  const bandWidth = plotWidth / data.length
  const barWidth = Math.max(2, Math.min(24, bandWidth / 2 - 4))
  const gap = 2

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
        aria-label="Grafik pemasukan dan pengeluaran per bulan"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={paddingLeft} x2={width} y1={yFor(t)} y2={yFor(t)} stroke={GRIDLINE} strokeWidth={1} />
            <text x={paddingLeft - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={MUTED_TEXT}>
              {compact.format(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const bandX = paddingLeft + i * bandWidth
          const centerX = bandX + bandWidth / 2
          const incomeHeight = (d.income / axisMax) * plotHeight
          const expenseHeight = (d.expense / axisMax) * plotHeight

          return (
            <g key={d.label}>
              <path
                d={roundedTopRectPath(centerX - barWidth - gap / 2, yFor(d.income), barWidth, incomeHeight, 4)}
                fill={COLOR_INCOME}
              >
                <title>{`${d.label} — Pemasukan: ${formatRupiah(d.income)}`}</title>
              </path>
              <path
                d={roundedTopRectPath(centerX + gap / 2, yFor(d.expense), barWidth, expenseHeight, 4)}
                fill={COLOR_EXPENSE}
              >
                <title>{`${d.label} — Pengeluaran: ${formatRupiah(d.expense)}`}</title>
              </path>
              <text x={centerX} y={height - paddingBottom + 14} textAnchor="middle" fontSize={10} fill={MUTED_TEXT}>
                {d.label.slice(0, 3)}
              </text>
            </g>
          )
        })}

        <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={height - paddingBottom} stroke={AXIS} strokeWidth={1} />
        <line
          x1={paddingLeft}
          x2={width}
          y1={height - paddingBottom}
          y2={height - paddingBottom}
          stroke={AXIS}
          strokeWidth={1}
        />
      </svg>
    </div>
  )
}
