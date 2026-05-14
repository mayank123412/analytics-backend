// src/api/app.ts
import Fastify, { type FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

/**
 * Builds and configures the Fastify instance.
 * Deliberately does NOT call .listen() — that's server.ts's job.
 * Keeping construction separate means integration tests can import
 * buildApp(), hit routes via app.inject(), and never bind a port.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    // Generate a request id for tracing; we'll wire correlation IDs in properly later
    genReqId: () => crypto.randomUUID(),
  });

  // Liveness probe — is the process up at all?
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Readiness probe — stub for now. Later this checks ClickHouse + Redis
  // connectivity before reporting ready.
  app.get('/ready', async () => {
    return { status: 'ready', timestamp: new Date().toISOString() };
  });

  return app;
}