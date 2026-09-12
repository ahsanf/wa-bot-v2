import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SendMessage() {
  const [to, setTo] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!to || !message) {
      toast.error("Nomor dan pesan wajib diisi")
      return
    }
    setSending(true)
    try {
      const res = await api.waSend(to, message)
      toast.success(res.message)
      setMessage("")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kirim Pesan WhatsApp</CardTitle>
        <CardDescription>Nomor tujuan pakai format 62xxxxxxxxxx (tanpa +).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="to">Nomor Tujuan</Label>
          <Input id="to" placeholder="6281234567890" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">Pesan</Label>
          <Textarea
            id="message"
            rows={5}
            placeholder="Tulis pesan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSend} disabled={sending}>
          {sending ? "Mengirim..." : "Kirim"}
        </Button>
      </CardContent>
    </Card>
  )
}
