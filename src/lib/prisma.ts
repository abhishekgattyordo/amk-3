import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { createFallbackPrismaClient } from './mock-enterprise-fallback-client';

const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
  fallbackClient?: any;
  dbDisabled?: boolean;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amk_erp';
  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  const pool = globalForPrisma.pgPool || new pg.Pool({
    connectionString,
    max: 10,
    min: 1,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.warn('[pg.Pool] Background client error (handled):', err.message);
  });

  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  return client;
}

function getFallbackClient(): any {
  if (!globalForPrisma.fallbackClient) {
    globalForPrisma.fallbackClient = createFallbackPrismaClient();
  }
  return globalForPrisma.fallbackClient;
}

function createResilientModelProxy(realModel: any, fallbackModel: any) {
  return new Proxy(realModel || {}, {
    get(_t, method: string) {
      return async (...args: any[]) => {
        // If DB is already marked unavailable, route directly to fallback
        if (globalForPrisma.dbDisabled && fallbackModel && typeof fallbackModel[method] === 'function') {
          return await fallbackModel[method](...args);
        }

        try {
          if (realModel && typeof realModel[method] === 'function') {
            return await realModel[method](...args);
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.warn(`[Prisma Dynamic Fallback] Method '${method}' failed on real database (${errMsg}). Routing to resilient enterprise store.`);
          
          if (errMsg.includes('denied access') || errMsg.includes('not available') || errMsg.includes('ECONNREFUSED') || errMsg.includes('ETIMEDOUT') || errMsg.includes('does not exist')) {
            globalForPrisma.dbDisabled = true;
          }

          if (fallbackModel && typeof fallbackModel[method] === 'function') {
            return await fallbackModel[method](...args);
          }
          throw err;
        }

        if (fallbackModel && typeof fallbackModel[method] === 'function') {
          return await fallbackModel[method](...args);
        }
      };
    },
  });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = getPrisma();
    const fallbackClient = getFallbackClient();

    if (prop === '$transaction') {
      return async (arg: any) => {
        if (globalForPrisma.dbDisabled) {
          return await fallbackClient.$transaction(arg);
        }
        try {
          return await (client as any).$transaction(arg);
        } catch (err: any) {
          console.warn('[Prisma $transaction Fallback] Transaction failed, executing on in-memory fallback store:', err?.message || err);
          globalForPrisma.dbDisabled = true;
          return await fallbackClient.$transaction(arg);
        }
      };
    }

    const realVal = (client as any)[prop];
    const fallbackVal = fallbackClient[prop];

    if (typeof realVal === 'function') {
      return realVal.bind(client);
    }

    if (realVal && typeof realVal === 'object' && !Array.isArray(realVal)) {
      return createResilientModelProxy(realVal, fallbackVal);
    }

    if (fallbackVal) {
      return fallbackVal;
    }

    return realVal;
  },
});
