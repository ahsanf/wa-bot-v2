import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotControl } from "@/components/BotControl"
import { Finance } from "@/components/Finance"
import { SendMessage } from "@/components/SendMessage"
import { ScheduleMessage } from "@/components/ScheduleMessage"

function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">WA Bot Dashboard</h1>

      <Tabs defaultValue="bot">
        <TabsList>
          <TabsTrigger value="bot">Bot</TabsTrigger>
          <TabsTrigger value="finance">Keuangan</TabsTrigger>
          <TabsTrigger value="send">Kirim Pesan</TabsTrigger>
          <TabsTrigger value="schedule">Jadwal Pesan</TabsTrigger>
        </TabsList>
        <TabsContent value="bot">
          <BotControl />
        </TabsContent>
        <TabsContent value="finance">
          <Finance />
        </TabsContent>
        <TabsContent value="send">
          <SendMessage />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleMessage />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
