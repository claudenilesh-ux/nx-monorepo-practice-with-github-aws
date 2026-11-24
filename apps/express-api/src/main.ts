/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import * as path from "path";

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to express-api!" });
});

const host = process.env.HOST || "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = app.listen(port, async (error?: Error) => {
  // A failed listen also reaches the 'error' listener below
  if (error) {
    return;
  }
  console.log(`Listening at http://localhost:${port}/api`);
  // Set when Nx waits for this server to be ready
  if (process.env.NX_READY_SIGNAL_SOCKET) {
    try {
      // Function keeps TypeScript and bundlers from rewriting or bundling the import
      const load = new Function("s", "return import(s)") as (
        s: string,
      ) => Promise<{ emitReadySignal(server: unknown): boolean }>;
      (await load("@nx/js/ready-signal")).emitReadySignal(server);
    } catch {
      // @nx/js isn't installed
    }
  }
});
server.on("error", (error) => {
  console.error(error);
  // Errors after listen, such as a failed accept, leave the server running
  if (!server.listening) {
    process.exit(1);
  }
});
