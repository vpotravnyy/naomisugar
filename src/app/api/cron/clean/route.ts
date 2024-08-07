import type { NextRequest } from "next/server";
import { libreRouter } from "~/server/api/routers/libre";
import { createCallerFactory, createTRPCContext } from "~/server/api/trpc";

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		console.log("Cron job: 401");
		return new Response("Unauthorized", {
			status: 401,
		});
	}
	const createCaller = createCallerFactory(libreRouter);
	const TRPCContext = await createTRPCContext({ headers: request.headers });
	const caller = createCaller(TRPCContext);
	return Response.json(await caller.clean());
}
