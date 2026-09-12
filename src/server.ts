import express from "express";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { config } from "./config/config";
import { getStatus, getQr, resetAuth, restartClient, sendWaMessage } from "./wa-client";
import { listScheduled, addScheduled, cancelScheduled } from "./scheduled-messages";
import { getClientRemotePath, setClientRemotePath } from "./settings";

export function createServer() {
  const app = express();
  app.use(express.json());

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.options("*", (_req, res) => res.sendStatus(204));

  app.get("/api/wa/status", (_req, res) => {
    res.json(getStatus());
  });

  app.get("/api/wa/qr", (_req, res) => {
    const qr = getQr();
    if (!qr) return res.status(404).json({ message: "No QR code available" });
    res.json({ qr });
  });

  app.post("/api/wa/reset", async (_req, res) => {
    try {
      await resetAuth();
      res.json({ message: "Reset started, scan the new QR code" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wa/config", (_req, res) => {
    res.json({ clientRemotePath: getClientRemotePath() });
  });

  app.post("/api/wa/config", (req, res) => {
    const { clientRemotePath } = req.body ?? {};
    if (typeof clientRemotePath !== "string" || !clientRemotePath) {
      return res.status(400).json({ message: "clientRemotePath is required" });
    }
    setClientRemotePath(clientRemotePath);
    res.json({ message: "Saved. Restart the client to apply it." });
  });

  app.post("/api/wa/restart", async (_req, res) => {
    try {
      await restartClient();
      res.json({ message: "Client restarted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wa/send", async (req, res) => {
    const { to, message } = req.body ?? {};
    if (!to || !message) {
      return res.status(400).json({ message: "to and message are required" });
    }
    try {
      await sendWaMessage(to, message);
      res.json({ message: "Message sent" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/scheduled-messages", (_req, res) => {
    res.json({ data: listScheduled() });
  });

  app.post("/api/scheduled-messages", (req, res) => {
    const { to, message, sendAt } = req.body ?? {};
    if (!to || !message || !sendAt) {
      return res.status(400).json({ message: "to, message and sendAt are required" });
    }
    res.json({ data: addScheduled(to, message, sendAt) });
  });

  app.delete("/api/scheduled-messages/:id", (req, res) => {
    const ok = cancelScheduled(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found or already sent" });
    res.json({ message: "Cancelled" });
  });

  const financeApi = axios.create({ baseURL: `${config.apiUrl}/personal-finance` });

  app.get("/api/finance/summary", async (_req, res) => {
    try {
      const { data } = await financeApi.get("/get-all");
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/finance/recap", async (req, res) => {
    try {
      const { data } = await financeApi.get("/recap", { params: req.query });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/finance/list", async (req, res) => {
    try {
      // the finance API expects an empty type for "all", not the literal string
      const { month, year, type, search } = req.query;
      const finalType = type === "all" ? "" : type === "in" ? "income" : type === "out" ? "expense" : type;
      const { data } = await financeApi.get("/list", { params: { month, year, type: finalType, search } });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/finance/entry", async (req, res) => {
    try {
      const { data } = await financeApi.post("/store", req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/finance/entry/:id", async (req, res) => {
    try {
      const { data } = await financeApi.put(`/update/${req.params.id}`, req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/finance/entry/:id", async (req, res) => {
    try {
      const { data } = await financeApi.delete(`/delete/${req.params.id}`);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // serves the built dashboard (frontend/dist) if present, so the whole
  // app can run as one process on one port — e.g. behind Tailscale.
  const frontendDist = path.resolve(__dirname, "..", "frontend", "dist");
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (_req, res) => res.sendFile(path.join(frontendDist, "index.html")));
  }

  return app;
}
