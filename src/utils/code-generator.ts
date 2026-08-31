import { prisma } from '../lib/prisma';

/**
 * Generates the next sequential unique business code for a given model, prefix, and column.
 * Handles alphanumeric padded sequential values (e.g., WH-0001, BIN-1234).
 * Query searches ALL records (ignoring soft-delete status) to ensure code is never reused.
 */
export async function generateNextCode(
  modelName: string,
  prefix: string,
  columnName: string,
  padLength: number = 4,
  tx?: any
): Promise<string> {
  const db = tx || prisma;
  
  // Find the highest-sorted string starting with the prefix.
  // Because code formats are padded with zeros, alphanumeric sorting is equivalent to numeric sorting.
  const lastRecord = await db[modelName].findFirst({
    where: {
      [columnName]: {
        startsWith: prefix,
      },
    },
    orderBy: {
      [columnName]: 'desc',
    },
    select: {
      [columnName]: true,
    },
  });

  let nextNum = 1;
  if (lastRecord && lastRecord[columnName]) {
    const lastCode: string = lastRecord[columnName];
    // Find any trailing numeric part of the code
    const matches = lastCode.match(/\d+$/);
    if (matches) {
      nextNum = parseInt(matches[0], 10) + 1;
    }
  }

  const paddedNum = String(nextNum).padStart(padLength, '0');
  return `${prefix}${paddedNum}`;
}

/**
 * Runs a database creation operation with automatic retries if a unique constraint violation occurs
 * due to concurrent transactions trying to insert the same sequential code.
 */
export async function createWithUniqueCode(
  modelName: string,
  prefix: string,
  columnName: string,
  insertFn: (code: string) => Promise<any>,
  padLength: number = 4
): Promise<any> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const code = await generateNextCode(modelName, prefix, columnName, padLength);
      return await insertFn(code);
    } catch (err: any) {
      // P2002 is Prisma's error code for Unique Constraint Violation
      const isUniqueConstraintError = 
        err.code === 'P2002' || 
        (err.message && err.message.includes('Unique constraint failed')) ||
        (err.message && err.message.includes('unique constraint'));
        
      if (isUniqueConstraintError && attempts < maxAttempts - 1) {
        attempts++;
        console.warn(`Unique code collision on ${modelName} for prefix ${prefix}. Retrying (Attempt ${attempts}/${maxAttempts})...`);
        // Wait a small random delay to allow other transaction to fully commit
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
        continue;
      }
      throw err;
    }
  }
}
