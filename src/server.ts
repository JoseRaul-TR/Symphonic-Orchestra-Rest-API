// src/server.ts
import "dotenv/config";
import app from "./app.ts";
import { testConnection, pool } from "./config/db.ts";
import { Server } from "node:http";
import { validateEnv, config } from "./config/env.ts";
import { terminal } from "./utils/terminalColors.ts";

let server: Server;

// --- Controlled Server Shutdown (one entry point, three triggers)---
const shutdownServer = async (trigger: string) => {
  terminal.shutdown(`Avslutar servern (${trigger})...\n`);
  try {
    if (server) {
      // Stop accepting new connections and wait for actives ones to finish
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
    }
    await pool.end();
    terminal.success("Servern och database stängda. ¡Hasta la vista!\n");
    process.exit(0);
  } catch (err: any) {
    terminal.error(`Fel vid nedstängning: ${err.message}`);
    process.exit(1);
  }
};

// Way 1 – OS signals: SIGTERM is used by Docker/PM2, SIGINT by Ctrl+C
process.on("SIGTERM", () => shutdownServer("SIGTERM"));
process.on("SIGINT", () => shutdownServer("SIGINT"));

// Way 2 – Interactive terminal input during development
if (config.isDev) {
  process.stdin.on("data", (data) => {
    const input = data.toString().trim().toLowerCase();
    if (
      [
        "quit",
        "close",
        "bye",
        "exit",
        "ciao",
        "hasta la vista",
        "vi ses",
      ].includes(input)
    ) {
      shutdownServer("stdin");
    }
  });
}

const startServer = async () => {
  try {
    validateEnv(); // 1. Verify all required env vars exist
    await testConnection(); // 2. Verify MySQL connectivity
    terminal.db("Databasanslutning lyckades.");
    // 3. Start the server
    server = app.listen(config.port, () => {
      terminal.startup(
        `-> Server körs på http://localhost:${config.port} i ${config.env}–läge <-`,
      );
      terminal.info('Skriv "exit" för att stänga ner kontrollerat.');
    });
  } catch (err: any) {
    terminal.error(`Kunde inte starta servern: ${err.message}`);
    process.exit(1);
  }
};

startServer();
