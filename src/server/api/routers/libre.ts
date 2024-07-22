import { eq, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { omit } from "lodash";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { libre, libreCurrent } from "~/server/db/schema";
import { LibreLinkUpClient } from "~/server/lib/libre";

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const ago = (duration: number) => new Date(+new Date() - duration);

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
		const transactions = [];
		const oldCurrent = await ctx.db.query.libreCurrent.findFirst();
		if (!oldCurrent) return { success: false, error: "No current data found" };

		if (oldCurrent.date >= ago(MINUTE)) {
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

		console.log("New current value: ", current.value);
		// eslint-disable-next-line drizzle/enforce-update-with-where
		transactions.push(ctx.db.update(libreCurrent).set({ ...current }));

		const oldHistory = await ctx.db.query.libre.findMany({
			orderBy: (libre, { desc }) => [desc(libre.date)],
			where: (libre, { gte }) => gte(libre.date, ago(HOUR * 2)),
			limit: 1000,
		});

		const lastRecordedHistoryAt = oldHistory[0]?.date ?? ago(HOUR * 12);

		const recentHistory = history.filter(
			({ date }) => date > lastRecordedHistoryAt,
		);
		if (recentHistory.length) {
			console.log("New history items to add: ", recentHistory);
			transactions.push(ctx.db.insert(libre).values(recentHistory));
		}

		const rewrittenHistory = history.reduce(
			(acc, item) => {
				const matchingOldHistoryItem = oldHistory.find(
					(oldItem) => oldItem.date === item.date,
				);
				if (
					matchingOldHistoryItem &&
					matchingOldHistoryItem.value !== item.value
				) {
					acc.push(item);
				}
				return acc;
			},
			[] as typeof history,
		);

		if (rewrittenHistory.length) {
			console.log("History items to rewrite: ", rewrittenHistory);
			for (const item of rewrittenHistory) {
				transactions.push(
					ctx.db
						.update(libre)
						.set({
							value: item.value,
							is_low: item.is_low,
							is_high: item.is_high,
							trend: item.trend,
						})
						.where(eq(libre.date, item.date)),
				);
			}
		}

		await Promise.all(transactions);

		return { success: true };
	}),

	clean: publicProcedure.mutation(async ({ ctx }) => {
		const twoDaysAgo = ago(2 * 24 * HOUR);
		const deleted = await ctx.db
			.delete(libre)
			.where(lte(libre.date, twoDaysAgo))
			.returning({
				date: libre.date,
			});
		console.log(`Deleted ${deleted.length} records`);

		return { success: true };
	}),
});
