import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { api, type WaStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const statusLabel: Record<WaStatus["status"], string> = {
  INITIALIZING: "Menyiapkan...",
  QR: "Menunggu scan QR",
  AUTHENTICATED: "Terautentikasi",
  READY: "Siap",
  DISCONNECTED: "Terputus",
}

const statusVariant: Record<WaStatus["status"], "default" | "secondary" | "destructive"> = {
  INITIALIZING: "secondary",
  QR: "secondary",
  AUTHENTICATED: "default",
  READY: "default",
  DISCONNECTED: "destructive",
}

export function BotControl() {
  const [status, setStatus] = useState<WaStatus | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [clientRemotePath, setClientRemotePath] = useState("")
  const [saving, setSaving] = useState(false)
  const [restarting, setRestarting] = useState(false)

  useEffect(() => {
    api
      .waGetConfig()
      .then((res) => setClientRemotePath(res.clientRemotePath))
      .catch((error: Error) => toast.error(error.message))
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const s = await api.waStatus()
        if (cancelled) return
        setStatus(s)

        if (s.status === "QR") {
          const q = await api.waQr().catch(() => null)
          if (!cancelled) setQr(q?.qr ?? null)
        } else {
          setQr(null)
        }
      } catch {
        if (!cancelled) setStatus(null)
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await api.waReset()
      toast.success(res.message)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setResetting(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const res = await api.waSetConfig(clientRemotePath)
      toast.success(res.message)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRestart = async () => {
    setRestarting(true)
    try {
      const res = await api.waRestart()
      toast.success(res.message)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setRestarting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Status Bot WhatsApp</CardTitle>
          <CardDescription>Init otomatis saat server berjalan. Scan QR untuk login.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Badge variant={status ? statusVariant[status.status] : "secondary"}>
            {status ? statusLabel[status.status] : "Menghubungi server..."}
          </Badge>

          {qr && (
            <div className="rounded-lg border bg-white p-4">
              <QRCodeSVG value={qr} size={220} />
            </div>
          )}

          {status?.status === "READY" && (
            <p className="text-sm text-muted-foreground">Bot terhubung dan siap menerima/mengirim pesan.</p>
          )}

          <Button variant="destructive" onClick={handleReset} disabled={resetting}>
            {resetting ? "Mereset..." : "Reset Auth"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Bot</CardTitle>
          <CardDescription>
            URL versi WhatsApp Web (wa-version) yang dipakai bot — berubah dari waktu ke waktu, isi ulang di sini
            tanpa perlu masuk ke server.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client-remote-path">Client Remote Path</Label>
            <Input
              id="client-remote-path"
              value={clientRemotePath}
              onChange={(e) => setClientRemotePath(e.target.value)}
              placeholder="https://raw.githubusercontent.com/.../html/2.xxxx.x.html"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={handleRestart} disabled={restarting}>
              {restarting ? "Merestart..." : "Restart Client"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Simpan dulu, lalu Restart Client untuk menerapkannya (sesi WhatsApp tetap tersimpan, tidak perlu scan QR
            ulang).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
