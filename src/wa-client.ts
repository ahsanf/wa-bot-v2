import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import * as fs from "fs";
import * as path from "path";
import * as qrcodeTerminal from "qrcode-terminal";
import { config } from "./config/config";
import { BotController } from "./controller/controller";
import { SchedulerController } from "./controller/scheduler";
import { buildTicketWarReply } from "./service/ticket_war_service";

export type BotStatus = "INITIALIZING" | "QR" | "AUTHENTICATED" | "READY" | "DISCONNECTED";

const AUTH_PATH = path.resolve(".wwebjs_auth");

let client: Client;
let scheduler: SchedulerController | null = null;
let status: BotStatus = "INITIALIZING";
let qr: string | null = null;
let ticketWarReplySent = false;

function create() {
  status = "INITIALIZING";
  qr = null;

  client = new Client({
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
      executablePath: config.puppeteerExecutablePath,
    },
    webVersionCache: {
      type: "remote",
      remotePath: config.clientRemotePath,
    },
  });

  client.on("qr", (q) => {
    qr = q;
    status = "QR";
    qrcodeTerminal.generate(q, { small: true });
  });

  client.on("authenticated", () => {
    status = "AUTHENTICATED";
    qr = null;
    console.log("Authenticated");
  });

  client.on("ready", () => {
    status = "READY";
    console.log("Client is ready!");
  });

  client.on("disconnected", (reason) => {
    status = "DISCONNECTED";
    console.log("Client disconnected:", reason);
  });

  client.on("message", async (msg) => {
    const { body, from } = msg;
    console.log("Received message from", from, "with body:", body, "at", new Date().toISOString());

    if (config.ticketWarAutoReplyEnabled && !ticketWarReplySent) {
      const isForm =
        (body.toLowerCase().includes("nama pserta") || body.toLowerCase().includes("nama peserta")) &&
        body.includes("PT RAMAH JAYA JELAJAH");
      if (isForm) {
        ticketWarReplySent = true;
        console.log("Ticket war sending reply at", new Date().toISOString());
        await client.sendMessage(from, buildTicketWarReply(body));

        const passportPaths = [config.ticketWarParticipant1Passport, config.ticketWarParticipant2Passport].filter(Boolean);
        for (const passportPath of passportPaths) {
          const media = MessageMedia.fromFilePath(path.resolve(passportPath));
          await client.sendMessage(from, media);
        }
      }
    }
  });

  new BotController(client).init();

  scheduler?.stopAll();
  scheduler = new SchedulerController(client);
  scheduler.startScheduler();
  scheduler.startTicketWarScheduler();

  client.initialize();
}

export function initWaClient() {
  create();
}

export function getStatus() {
  return { status, hasQr: !!qr };
}

export function getQr() {
  return qr;
}

export async function resetAuth(): Promise<void> {
  try {
    await client.destroy();
  } catch (error) {
    console.error("Error destroying client:", error);
  }
  if (fs.existsSync(AUTH_PATH)) {
    fs.rmSync(AUTH_PATH, { recursive: true, force: true });
  }
  create();
}

// re-creates the client with the current config (e.g. a new clientRemotePath)
// but keeps the existing WhatsApp session — no new QR needed.
export async function restartClient(): Promise<void> {
  try {
    await client.destroy();
  } catch (error) {
    console.error("Error destroying client:", error);
  }
  create();
}

export async function sendWaMessage(to: string, message: string): Promise<void> {
  const chatId = to.includes("@") ? to : `${to}@c.us`;
  await client.sendMessage(chatId, message);
}
