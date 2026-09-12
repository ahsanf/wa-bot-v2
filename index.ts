import { initWaClient } from "./src/wa-client";
import { createServer } from "./src/server";
import { startScheduledMessageLoop } from "./src/scheduled-messages";

// whatsapp-web.js occasionally throws uncaught errors from its puppeteer
// reconnect flow (e.g. duplicate exposeFunction on LOGOUT); don't let that
// take the whole API down.
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

initWaClient();
startScheduledMessageLoop();

const port = Number(process.env.PORT ?? 3001);
createServer().listen(port, () => {
  console.log(`API listening on port ${port}`);
});
