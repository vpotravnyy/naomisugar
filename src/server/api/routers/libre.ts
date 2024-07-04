import { type SQL, getTableColumns, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { omit } from "lodash";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { libre, libreCurrent } from "~/server/db/schema";
import { LibreLinkUpClient } from "~/server/lib/libre";

const buildConflictUpdateColumns = <
	T extends PgTable,
	Q extends keyof T["_"]["columns"],
>(
	table: T,
	columns: Q[],
) => {
	const cls = getTableColumns(table);
	return columns.reduce(
		(acc, column) => {
			const colName = cls[column]?.name;
			acc[column] = sql.raw(`excluded.${colName}`);
			return acc;
		},
		{} as Record<Q, SQL>,
	);
};

export type TLibreDataPoint = InferSelectModel<typeof libre>;
export type TLibreResponse = {
	current: TLibreDataPoint;
	history: TLibreDataPoint[];
};

export const libreRouter = createTRPCRouter({
	read: publicProcedure.query(async ({ ctx }): Promise<TLibreResponse> => {
		const current = await ctx.db.query.libreCurrent.findFirst();
		const history = await ctx.db.query.libre.findMany({
			orderBy: (libre, { desc }) => [desc(libre.date)],
			limit: 1000,
		});

		return {
			current: omit(current, ["id"]),
			history,
		};
	}),

	update: publicProcedure.mutation(async ({ ctx }) => {
		const oldCurrent = await ctx.db.query.libreCurrent.findFirst();
		if (!oldCurrent) return { success: false, error: "No current data found" };

		if (+new Date() - +new Date(oldCurrent.date) < 60 * 1000) {
			return {
				success: false,
				error: "Cannot update more than once per minute",
			};
		}

		const libreClient = LibreLinkUpClient({
			username: env.LIBRE_USERNAME,
			password: env.LIBRE_PASSWORD,
		});
		const { current, history } = await libreClient.read();
		console.log("history", history);

		// eslint-disable-next-line drizzle/enforce-update-with-where
		await ctx.db.update(libreCurrent).set({ ...current });

		await ctx.db
			.insert(libre)
			.values(history)
			.onConflictDoUpdate({
				target: libre.date,
				set: buildConflictUpdateColumns(libre, [
					"value",
					"is_low",
					"is_high",
					"trend",
				]),
			});

		return { success: true };
	}),
});
