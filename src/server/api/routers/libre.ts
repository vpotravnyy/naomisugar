import { z } from "zod";
import { omit } from "lodash"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { LibreLinkUpClient } from "~/server/lib/libre";
import { libre, libreCurrent } from "~/server/db/schema";
import { SQL, getTableColumns, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T['_']['columns']
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce((acc, column) => {
    const colName = cls[column]!.name;
    acc[column] = sql.raw(`excluded.${colName}`);
    return acc;
  }, {} as Record<Q, SQL>);
};

export const libreRouter = createTRPCRouter({
  read: publicProcedure.query(async ({ ctx }) => {
    const current = await ctx.db.query.libreCurrent.findFirst();
    const history = await ctx.db.query.libre.findMany({
      orderBy: (libre, { desc }) => [desc(libre.date)],
      limit: 1000
    });

    return {
      current: omit(current, ['id']),
      history
    }
  }),

  update: publicProcedure.mutation(async ({ ctx }) => {
    const oldCurrent = await ctx.db.query.libreCurrent.findFirst()!
    if (!oldCurrent) return { success: false, error: 'No current data found' };

    if (+new Date() - +new Date(oldCurrent.date) < 60 * 1000) {
      return { success: false, error: 'Cannot update more than once per minute' };
    }

    const libreClient = LibreLinkUpClient({ username: env.LIBRE_USERNAME, password: env.LIBRE_PASSWORD });
    let { current, history } = await libreClient.read();

    await ctx.db
      .update(libreCurrent)
      .set({ ...current })
      
  
    await ctx.db
      .insert(libre)
      .values(history)
      .onConflictDoUpdate({
        target: libre.date,
        set: buildConflictUpdateColumns(libre, ['value', 'is_low', 'is_high', 'trend'])
      });

    return { success: true };
  })
});
