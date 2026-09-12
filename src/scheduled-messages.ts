import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { sendWaMessage } from "./wa-client";

export type ScheduledMessage = {
  id: string;
  to: string;
  message: string;
  sendAt: string;
  sent: boolean;
  error?: string;
};

const STORE_PATH = path.resolve("data/scheduled-messages.json");
const CHECK_INTERVAL_MS = 30_000;

function load(): ScheduledMessage[] {
  if (!fs.existsSync(STORE_PATH)) return [];
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
}

function save() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(messages, null, 2));
}

let messages: ScheduledMessage[] = load();

export function listScheduled(): ScheduledMessage[] {
  return [...messages].sort((a, b) => a.sendAt.localeCompare(b.sendAt));
}

export function addScheduled(to: string, message: string, sendAt: string): ScheduledMessage {
  const entry: ScheduledMessage = { id: randomUUID(), to, message, sendAt, sent: false };
  messages.push(entry);
  save();
  return entry;
}

export function cancelScheduled(id: string): boolean {
  const idx = messages.findIndex((m) => m.id === id && !m.sent);
  if (idx === -1) return false;
  messages.splice(idx, 1);
  save();
  return true;
}

export function startScheduledMessageLoop() {
  setInterval(async () => {
    const now = Date.now();
    const due = messages.filter((m) => !m.sent && new Date(m.sendAt).getTime() <= now);
    if (due.length === 0) return;

    for (const m of due) {
      try {
        await sendWaMessage(m.to, m.message);
        m.sent = true;
        m.error = undefined;
      } catch (error: any) {
        // left unsent — retried on the next tick once the bot is ready again
        m.error = error.message;
      }
    }
    save();
  }, CHECK_INTERVAL_MS);
}
