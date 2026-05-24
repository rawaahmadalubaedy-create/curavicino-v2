import http from "http";
import app from "./app";
import { realtime } from "./lib/realtime";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

/* Attach WebSocket server to the same HTTP server */
realtime.attach(server);

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

/* Graceful shutdown */
function shutdown() {
  logger.info("Shutting down…");
  realtime.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
