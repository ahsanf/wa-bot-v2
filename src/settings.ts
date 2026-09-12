import * as fs from "fs";
import * as path from "path";
import { config } from "./config/config";

const ENV_PATH = path.resolve(".env");

export function getClientRemotePath(): string {
  return config.clientRemotePath;
}

// updates the running config immediately (takes effect on the next client
// restart) and rewrites .env so it survives a process restart too.
export function setClientRemotePath(value: string) {
  config.clientRemotePath = value;

  const line = `CLIENT_REMOTE_PATH=${value}`;
  const content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const updated = /^CLIENT_REMOTE_PATH=.*$/m.test(content)
    ? content.replace(/^CLIENT_REMOTE_PATH=.*$/m, line)
    : `${content.trimEnd()}\n${line}\n`;
  fs.writeFileSync(ENV_PATH, updated);
}
