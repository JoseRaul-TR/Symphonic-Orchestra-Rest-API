// src/server.ts
import "dotenv/config";
import app from "./app.ts";
import { testConnection, pool } from "./config/db.ts";
import { Server } from "node:http";
import { validateEnv } from "./config/env.ts";

const PORT = process.env.PORT ?? 3000;
let server: Server;

// --- Controlled Server Shutdown (one function, three ways of input) ---
const shutdownServer = async (trigger: string) => {
  console.log(`Avslutar servern (${trigger})...\n`);

  try {
    if (server) {
      // Stop accepting new connections and wait until the active ones end
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
    }
    await pool.end();
    console.log("Servern och database stängda. ¡Hasta la vista!\n");
    process.exit(0);
  } catch (err: any) {
    console.error("Fel vid nedstängning:", err.message);
    process.exit(1);
  }
};

// Way 1 – Signs from OS (SIGTERM y SIGINT)
process.on("SIGTERM", () => shutdownServer("SIGTERM")); // Docker/PM2
process.on("SIGINT", () => shutdownServer("SIGINT")); // Ctrl+C

// Way 2 – Text input from terminal (custom flags)
process.stdin.on("data", (data) => {
  const input = data.toString().trim().toLowerCase();
  if (
    ["quit", "close", "bye", "exit", "ciao", "hasta la vista", "vi ses"].includes(input)
  ) {
    shutdownServer("stdin");
  }
});

const startServer = async () => {
  try {
    // 1. Check that all the environment variables exist.
    await validateEnv();
    // 2. Check that connection with DB
    await testConnection();
    console.log("Databasanslutning lyckades.");
    // 3. Start the server
    server = app.listen(PORT, () => {
      console.log(`-> Server körs på http://localhost:${PORT} <–`);
      console.log('Skriv "exit" för att stänga ner kontrollerat.');
    });
  } catch (err: any) {
    console.error("Kunde inte starta servern:", err.message);
    process.exit(1);
  }
};

startServer();
