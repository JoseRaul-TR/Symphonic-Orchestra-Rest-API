// src/server.ts
import "dotenv/config";
import app from "./app.ts";
import { testConnection, pool } from "./config/db.ts";
import { Server } from "node:http";
import { validateEnv, config } from "./config/env.ts";
import { terminal } from "./utils/terminalColors.ts";

let server: Server;
let isShuttingDown = false; // <- guard: prevents concurrent shutdown calls

// --- Controlled Server Shutdown (one entry point, three triggers)---
const shutdownServer = async (trigger: string) => {
  // If already shutting down, ignore subsequent calls.
  if (isShuttingDown) return;
  isShuttingDown = true;
  process.stdin.pause(); // stop reading stdin during async shutdown

  terminal.shutdown(`Avslutar servern (${trigger})...\n`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        // Force-close after 5s if keep-alive connections are still open
        const timeout = setTimeout(() => {
          terminal.warning("Tvingad stängning (timeout efter 5s).");
          resolve();
        }, 5_000);

        server.close((err) => {
          clearTimeout(timeout);
          err ? reject(err) : resolve();
        });
      });
    }
    await pool.end();
    terminal.success("Servern och databasen stängda. ¡Hasta la vista!\n");
    process.exit(0);
  } catch (err: any) {
    terminal.error(`Fel vid nedstängning: ${err.message}`);
    process.exit(1);
  }
};

// Way 1 – OS signals: SIGTERM is used by Docker/PM2, SIGINT by Ctrl+C
process.on("SIGTERM", () => shutdownServer("SIGTERM"));
process.on("SIGINT", () => shutdownServer("SIGINT"));

// Way 2 – Terminal text input
// ─────────────────────────────────────────────────────────────────────
// Only active in PRODUCTION (node dist/server.js).
//
// In development, `tsx watch` runs server.ts as a child process and
// automatically restarts it whenever the child exits — including on a
// clean process.exit(0). Registering this listener in dev mode would
// cause tsx to restart the server instead of shutting it down.
//
// In containerised environments (Docker / Railway) stdin is not connected
// to a terminal, so this listener would never fire anyway.
//
// → In development use Ctrl+C (SIGINT) to stop cleanly.
// ─────────────────────────────────────────────────────────────────────
if (config.isProd) {
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
    validateEnv(); // 1. Verify all required env variables exist
    await testConnection(); // 2. Verify MySQL connectivity
    terminal.db("Databasanslutning lyckades.");

    // 3. Start the server
    server = app.listen(config.port, () => {
      terminal.startup(
        `-> Server körs på http://localhost:${config.port} i ${config.env}–läge <-`,
      );
      // Display shutdown info for each environment
      terminal.info(
        config.isProd
          ? 'Skriv "exit" för att stänga ner kontrollerat.'
          : "Tryck Ctrl+C för att stänga ner kontrollerat.",
      );
    });
  } catch (err: any) {
    terminal.error(`Kunde inte starta servern: ${err.message}`);
    process.exit(1);
  }
};

startServer();
