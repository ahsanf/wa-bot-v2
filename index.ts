import { Client, LocalAuth } from "whatsapp-web.js";
import * as qrcode from "qrcode-terminal";
import { BotController } from "./src/controller/controller";
import { config } from "./src/config/config";
import { SchedulerController } from "./src/controller/scheduler";

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

client.initialize();

new BotController(client).init();
new SchedulerController(client).startScheduler();
