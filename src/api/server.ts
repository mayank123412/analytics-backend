// src/api/server.ts
import { buildApp } from './app.js';
import { env } from '../config/env.js';

/**
 * Process entrypoint for the ingestion API.
 * Responsibilities: start listening, handle graceful shutdown.
 */
const app = buildApp();

async function start(): Promise<void> {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Ingestion API listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

/**
 * Graceful shutdown: stop accepting new connections, let in-flight
 * requests finish, close the server, then exit. When we add ClickHouse
 * and Redis clients, their .disconnect() calls go here too.
 */
const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;

for (const signal of shutdownSignals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      app.log.info('Server closed. Exiting.');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  });
}

void start();