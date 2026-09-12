import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api, type ScheduledMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ScheduleMessage() {
  const [to, setTo] = useState("")
  const [message, setMessage] = useState("")
  const [sendAt, setSendAt] = useState("")
  const [creating, setCreating] = useState(false)
  const [rows, setRows] = useState<ScheduledMessage[]>([])

  const load = () => {
    api
      .scheduledList()
      .then((res) => setRows(res.data))
      .catch((error: Error) => toast.error(error.message))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10_000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    if (!to || !message || !sendAt) {
      toast.error("Nomor, pesan, dan waktu wajib diisi")
      return
    }
    setCreating(true)
    try {
      await api.scheduledCreate(to, message, new Date(sendAt).toISOString())
      toast.success("Pesan dijadwalkan")
      setMessage("")
      setSendAt("")
      load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await api.scheduledCancel(id)
      toast.success("Jadwal dibatalkan")
      load()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Jadwalkan Pesan</CardTitle>
          <CardDescription>Pesan akan dikirim otomatis pada waktu yang ditentukan.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="s-to">Nomor Tujuan</Label>
            <Input id="s-to" placeholder="6281234567890" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-message">Pesan</Label>
            <Textarea id="s-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-time">Kirim Pada</Label>
            <Input
              id="s-time"
              type="datetime-local"
              value={sendAt}
              onChange={(e) => setSendAt(e.target.value)}
              className="w-fit"
            />
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Menjadwalkan..." : "Jadwalkan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tujuan</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Kirim Pada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada jadwal
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.to}</TableCell>
                  <TableCell className="max-w-48 truncate">{row.message}</TableCell>
                  <TableCell>{new Date(row.sendAt).toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge variant={row.sent ? "default" : row.error ? "destructive" : "secondary"}>
                      {row.sent ? "Terkirim" : row.error ? "Gagal, dicoba lagi" : "Terjadwal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!row.sent && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(row.id)}>
                        Batalkan
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
