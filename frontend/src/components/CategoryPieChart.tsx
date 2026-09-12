import { formatRupiah } from "@/lib/format"

type Datum = { label: string; amount: number }

// only the first 3 categorical slots clear the strict all-pairs CVD/contrast
// check a pie needs (every slice is visually compared to every other, unlike
// a bar chart's adjacent-only comparisons) — validated via validate_palette.js
// --pairs all. Everything past the top 3 folds into "Lainnya" (neutral gray),
// which also keeps a many-category pie legible in the first place.
const SLICE_COLORS = ["#2a78d6", "#eb6834", "#1baf7a"]
const OTHER_COLOR = "#52514e"
const SURFACE = "#fcfcfb"

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export function CategoryPieChart({ data }: { data: Datum[] }) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const top = sorted.slice(0, 3)
  const rest = sorted.slice(3)
  const otherAmount = rest.reduce((sum, d) => sum + d.amount, 0)

  const slices = [
    ...top.map((d, i) => ({ label: d.label, amount: d.amount, color: SLICE_COLORS[i] })),
    ...(otherAmount > 0 ? [{ label: "Lainnya", amount: otherAmount, color: OTHER_COLOR }] : []),
  ]
  const total = slices.reduce((sum, s) => sum + s.amount, 0) || 1

  const size = 200
  const r = 88
  const cx = size / 2
  const cy = size / 2

  let angle = -Math.PI / 2
  const arcs = slices.map((s) => {
    const fraction = s.amount / total
    const startAngle = angle
    const endAngle = angle + fraction * Math.PI * 2
    angle = endAngle
    return { ...s, fraction, startAngle, endAngle }
  })

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Persentase kategori terbesar">
        {arcs.map((a) => (
          <path
            key={a.label}
            d={pieSlicePath(cx, cy, r, a.startAngle, a.endAngle)}
            fill={a.color}
            stroke={SURFACE}
            strokeWidth={2}
          >
            <title>{`${a.label} — ${(a.fraction * 100).toFixed(1)}% (${formatRupiah(a.amount)})`}</title>
          </path>
        ))}
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {arcs.map((a) => (
          <li key={a.label} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} />
            <span className="text-foreground">{a.label}</span>
            <span className="font-medium tabular-nums">{(a.fraction * 100).toFixed(1)}%</span>
            <span className="text-muted-foreground">{formatRupiah(a.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
