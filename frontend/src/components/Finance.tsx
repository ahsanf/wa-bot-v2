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

function Summary() {
  const [totals, setTotals] = useState<FinanceTotals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .financeSummary()
      .then((res) => setTotals(res.data))
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [])

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

function Recap() {
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
  }, [])

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

function History() {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))
  const [type, setType] = useState("all")
  const [rows, setRows] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.financeOrdered({ month, year, type })
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
  }, [])

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
        <Button onClick={load} disabled={loading}>
          {loading ? "Memuat..." : "Filter"}
        </Button>
      </div>
      <CategoryPieChart data={breakdown} />
      <CategoryBreakdownChart data={breakdown} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Tipe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{formatRupiah(row.amount)}</TableCell>
              <TableCell>{formatType(row.type)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function Finance() {
  return (
    <div className="flex flex-col gap-4">
      <Summary />
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
          <TabsTrigger value="recap">Rekap Tahunan</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <History />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recap">
          <Card>
            <CardContent className="pt-6">
              <Recap />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
