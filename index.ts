import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import * as path from "path";
import * as qrcode from "qrcode-terminal";
import { BotController } from "./src/controller/controller";
import { config } from "./src/config/config";
import { SchedulerController } from "./src/controller/scheduler";
import { buildTicketWarReply } from "./src/service/ticket_war_service";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-zygote",
      "--no-first-run",
      "--single-process",
      "--disable-gpu",
    ],
    headless: true,
  },
  webVersionCache: {
    type: "remote",
    remotePath: config.clientRemotePath,
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Authenticated");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

let ticketWarReplySent = false

client.on("message", async (msg) => {
  const { body, from } = msg
  console.log('Received message from', from, 'with body:', body, 'at', new Date().toISOString())

  if (config.ticketWarAutoReplyEnabled && !ticketWarReplySent) {
    const isForm =
      (body.toLowerCase().includes('nama pserta') ||
       body.toLowerCase().includes('nama peserta')) &&
      body.includes('PT RAMAH JAYA JELAJAH')
    if (isForm) {
      ticketWarReplySent = true
      console.log('Ticket war sending reply at', new Date().toISOString())
      await client.sendMessage(from, buildTicketWarReply(body))

      const passportPaths = [
        config.ticketWarParticipant1Passport,
        config.ticketWarParticipant2Passport,
      ].filter(Boolean)

      for (const passportPath of passportPaths) {
        const media = MessageMedia.fromFilePath(path.resolve(passportPath))
        await client.sendMessage(from, media)
      }
      return
    }
  }
})

client.initialize();

new BotController(client).init();

const scheduler = new SchedulerController(client)
scheduler.startScheduler()
scheduler.startTicketWarScheduler()
