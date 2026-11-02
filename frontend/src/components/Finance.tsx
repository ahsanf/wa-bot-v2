import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { api, type FinanceEntry, type FinanceRecapRow, type FinanceTotals } from "@/lib/api"
import { formatRupiah, formatType, parseRupiah, INDONESIAN_MONTHS } from "@/lib/format"
import { FinanceChart } from "@/components/FinanceChart"
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart"
import { CategoryPieChart } from "@/components/CategoryPieChart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const currentYear = new Date().getFullYear()

function Summary({ refreshKey }: { refreshKey: number }) {
  const [totals, setTotals] = useState<FinanceTotals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .financeSummary()
      .then((res) => setTotals(res.data))
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const selisih = totals ? parseRupiah(totals.total_income) - parseRupiah(totals.total_expense) : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Total Pemasukan</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? "..." : (totals?.total_income ?? "-")}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Pengeluaran</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? "..." : (totals?.total_expense ?? "-")}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Selisih</CardDescription>
          <CardTitle className={`text-2xl font-bold ${selisih !== null && selisih < 0 ? "text-destructive" : ""}`}>
            {loading || selisih === null ? "..." : formatRupiah(selisih)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

function Recap({ refreshKey }: { refreshKey: number }) {
  const [year, setYear] = useState(String(currentYear))
  const [rows, setRows] = useState<FinanceRecapRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.financeRecap(year)
      setRows(res.data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="grid gap-2">
          <Label htmlFor="recap-year">Tahun</Label>
          <Input id="recap-year" value={year} onChange={(e) => setYear(e.target.value)} className="w-32" />
        </div>
        <Button onClick={load} disabled={loading}>
          {loading ? "Memuat..." : "Lihat"}
        </Button>
      </div>
      <FinanceChart
        data={rows.map((row) => ({
          label: row.month_name,
          income: parseRupiah(row.income),
          expense: parseRupiah(row.expense),
        }))}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bulan</TableHead>
            <TableHead>Pemasukan</TableHead>
            <TableHead>Pengeluaran</TableHead>
            <TableHead>Selisih</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, i) => {
            const selisih = parseRupiah(row.income) - parseRupiah(row.expense)
            return (
              <TableRow key={i}>
                <TableCell>{row.month_name}</TableCell>
                <TableCell>{row.income}</TableCell>
                <TableCell>{row.expense}</TableCell>
                <TableCell className={`font-bold ${selisih < 0 ? "text-destructive" : ""}`}>
                  {formatRupiah(selisih)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function History({ refreshKey }: { refreshKey: number }) {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))
  const [type, setType] = useState("all")
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState({ name: "", amount: "", date: "", type: "expense" as "income" | "expense" })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.financeList({ month, year, type, search })
      setRows(res.data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const startEdit = (row: FinanceEntry) => {
    setEditingId(row.id)
    setDraft({ name: row.name, amount: row.amount, date: row.date, type: row.type })
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: number) => {
    if (!draft.name || !draft.amount) {
      toast.error("Nama dan jumlah wajib diisi")
      return
    }
    setSaving(true)
    try {
      const res = await api.financeUpdateEntry(id, draft.name, draft.amount, draft.type, draft.date)
      toast.success(res.message)
      setEditingId(null)
      load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: FinanceEntry) => {
    if (!window.confirm(`Hapus transaksi "${row.name}"?`)) return
    try {
      const res = await api.financeDeleteEntry(row.id)
      toast.success(res.message)
      load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const breakdown = useMemo(() => {
    const totals = new Map<string, { label: string; amount: number; type: "income" | "expense" }>()
    for (const row of rows) {
      const key = `${row.name}::${row.type}`
      const existing = totals.get(key)
      const amount = Number(row.amount) || 0
      if (existing) {
        existing.amount += amount
      } else {
        totals.set(key, { label: row.name, amount, type: row.type })
      }
    }
    return [...totals.values()]
  }, [rows])

  const filteredTotals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const row of rows) {
      const amount = Number(row.amount) || 0
      if (row.type === "income") income += amount
      else expense += amount
    }
    return { income, expense, selisih: income - expense }
  }, [rows])

  const pageSize = 10
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [rows])
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-2">
          <Label>Bulan</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDONESIAN_MONTHS.map((name, i) => (
                <SelectItem key={name} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hist-year">Tahun</Label>
          <Input id="hist-year" value={year} onChange={(e) => setYear(e.target.value)} className="w-28" />
        </div>
        <div className="grid gap-2">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="in">Pemasukan</SelectItem>
              <SelectItem value="out">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hist-search">Cari Nama</Label>
          <Input
            id="hist-search"
            placeholder="Makan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-36"
          />
        </div>
        <Button onClick={load} disabled={loading}>
          {loading ? "Memuat..." : "Filter"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pemasukan (Filter)</CardDescription>
            <CardTitle className="text-2xl">{formatRupiah(filteredTotals.income)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pengeluaran (Filter)</CardDescription>
            <CardTitle className="text-2xl">{formatRupiah(filteredTotals.expense)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Selisih (Filter)</CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${filteredTotals.selisih < 0 ? "text-destructive" : ""}`}
            >
              {formatRupiah(filteredTotals.selisih)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <CategoryPieChart data={breakdown} />
      <CategoryBreakdownChart data={breakdown} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
          {pagedRows.map((row) =>
            editingId === row.id ? (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="w-36"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={draft.amount}
                    onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v as "income" | "expense" }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" onClick={() => saveEdit(row.id)} disabled={saving}>
                    Simpan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    Batal
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{formatRupiah(row.amount)}</TableCell>
                <TableCell>{formatType(row.type)}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(row)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row)}>
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      {rows.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({rows.length} transaksi)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function todayIso() {
  return new Date().toLocaleDateString("sv-SE") // YYYY-MM-DD in local time
}

function AddEntry({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [date, setDate] = useState(todayIso())
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name || !amount) {
      toast.error("Nama dan jumlah wajib diisi")
      return
    }
    setSaving(true)
    try {
      const res = await api.financeEntry(name, amount, type, date)
      toast.success(res.message)
      setName("")
      setAmount("")
      setDate(todayIso())
      onAdded()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Transaksi</CardTitle>
        <CardDescription>Catat pemasukan atau pengeluaran baru.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-2">
        <div className="grid gap-2">
          <Label htmlFor="entry-name">Nama</Label>
          <Input
            id="entry-name"
            placeholder="Makan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="entry-amount">Jumlah</Label>
          <Input
            id="entry-amount"
            type="number"
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="grid gap-2">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="entry-date">Tanggal</Label>
          <Input id="entry-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-36" />
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  )
}

type BulkLine = {
  raw: string
  date: string | null // YYYY-MM-DD from the WhatsApp timestamp, null when the line has none
  name: string
  amount: string
  type: "income" | "expense"
}

// "[06:50, 10/31/2026] ahsanf: !out Makan-36000"
const WA_PREFIX = /^\[[^,\]]*,\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]/
const BOT_COMMAND = /!(in|out)\s+(.+)-\s*([\d.,]+)\s*$/i

function parseBulkText(text: string): BulkLine[] {
  const parsed = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .flatMap((raw) => {
      const cmd = raw.match(BOT_COMMAND)
      const amount = cmd?.[3].replace(/\D/g, "")
      if (!cmd || !amount || Number(amount) === 0) return []
      const prefix = raw.match(WA_PREFIX)
      return [
        {
          raw,
          dateParts: prefix ? [Number(prefix[1]), Number(prefix[2]), Number(prefix[3])] : null,
          name: cmd[2].trim(),
          amount,
          type: (cmd[1].toLowerCase() === "in" ? "income" : "expense") as BulkLine["type"],
        },
      ]
    })

  // WhatsApp follows the phone locale (M/D/YYYY or D/M/YYYY); infer from any
  // unambiguous line, defaulting to M/D.
  const dayFirst = parsed.some((p) => p.dateParts && p.dateParts[0] > 12)

  return parsed.map(({ dateParts, ...rest }) => {
    if (!dateParts) return { ...rest, date: null }
    const [a, b, y] = dateParts
    const [month, day] = dayFirst ? [b, a] : [a, b]
    const year = y < 100 ? 2000 + y : y
    return { ...rest, date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` }
  })
}

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function BulkEntry({ onAdded }: { onAdded: () => void }) {
  const [date, setDate] = useState("")
  const [text, setText] = useState("")
  const [excluded, setExcluded] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  const parsed = useMemo(() => parseBulkText(text), [text])

  // row indices shift whenever the text or date changes, so unchecked rows reset with them
  const changeDate = (value: string) => {
    setDate(value)
    setExcluded(new Set())
  }
  const changeText = (value: string) => {
    setText(value)
    setExcluded(new Set())
  }

  // lines without a timestamp (e.g. a plain "!out Makan-20000") take the picked date
  const matching = parsed.map((row, index) => ({ ...row, index })).filter((row) => row.date === null || row.date === date)
  const toSave = matching.filter((row) => !excluded.has(row.index))
  const total = toSave.reduce(
    (acc, row) => {
      acc[row.type] += Number(row.amount)
      return acc
    },
    { income: 0, expense: 0 }
  )

  const datesInText = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of parsed) if (row.date) counts.set(row.date, (counts.get(row.date) ?? 0) + 1)
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [parsed])

  const toggle = (index: number) =>
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  const handleSave = async () => {
    setSaving(true)
    const saved = new Set<number>()
    for (const row of toSave) {
      try {
        await api.financeEntry(row.name, row.amount, row.type, date)
        saved.add(row.index)
      } catch {
        // left in the textarea so it can be retried
      }
    }
    setSaving(false)

    const failed = toSave.length - saved.size
    if (failed === 0) toast.success(`${saved.size} transaksi disimpan`)
    else toast.error(`${saved.size} disimpan, ${failed} gagal`)

    // keep only what's still unsaved (other dates + failures) so the next date can be imported right away
    changeText(
      parsed
        .filter((_, i) => !saved.has(i) && !excluded.has(i))
        .map((row) => row.raw)
        .join("\n")
    )
    if (saved.size > 0) onAdded()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Massal</CardTitle>
        <CardDescription>
          Pilih tanggal, lalu tempel chat WhatsApp berisi perintah <code>!out Nama-Jumlah</code> /{" "}
          <code>!in Nama-Jumlah</code>. Hanya baris dengan tanggal yang dipilih yang disimpan.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bulk-date">Tanggal</Label>
          <Input id="bulk-date" type="date" value={date} onChange={(e) => changeDate(e.target.value)} className="w-36" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bulk-text">Teks</Label>
          <Textarea
            id="bulk-text"
            placeholder={date ? "[06:50, 10/31/2026] ahsanf: !out Makan-36000" : "Pilih tanggal terlebih dahulu"}
            value={text}
            onChange={(e) => changeText(e.target.value)}
            disabled={!date}
            className="max-h-60 font-mono text-xs md:text-xs"
          />
        </div>
        {datesInText.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Tanggal di teks:</span>
            {datesInText.map(([d, count]) => (
              <Button key={d} size="sm" variant={d === date ? "default" : "outline"} onClick={() => changeDate(d)}>
                {formatShortDate(d)} ({count})
              </Button>
            ))}
          </div>
        )}
        {text.trim() && matching.length === 0 && (
          <p className="text-sm text-muted-foreground">Tidak ada transaksi untuk tanggal ini.</p>
        )}
        {matching.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Nama</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tipe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matching.map((row) => (
                  <TableRow key={row.index} className={excluded.has(row.index) ? "opacity-50" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        role="checkbox"
                        className="size-4 accent-primary"
                        checked={!excluded.has(row.index)}
                        onChange={() => toggle(row.index)}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{formatRupiah(row.amount)}</TableCell>
                    <TableCell>{formatType(row.type)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {toSave.length} transaksi
                {total.expense > 0 && ` · Pengeluaran ${formatRupiah(total.expense)}`}
                {total.income > 0 && ` · Pemasukan ${formatRupiah(total.income)}`}
              </span>
              <Button onClick={handleSave} disabled={saving || toSave.length === 0}>
                {saving ? "Menyimpan..." : `Simpan ${toSave.length} Transaksi`}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function Finance() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <AddEntry onAdded={() => setRefreshKey((k) => k + 1)} />
      <BulkEntry onAdded={() => setRefreshKey((k) => k + 1)} />
      <Summary refreshKey={refreshKey} />
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
          <TabsTrigger value="recap">Rekap Tahunan</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <History refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recap">
          <Card>
            <CardContent className="pt-6">
              <Recap refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
