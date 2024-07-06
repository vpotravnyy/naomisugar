import type { NextRequest } from "next/server";
import { libreRouter } from "~/server/api/routers/libre";
import { createCallerFactory, createTRPCContext } from "~/server/api/trpc";

export async function GET(request: NextRequest) {
	const createCaller = createCallerFactory(libreRouter);
	const TRPCContext = await createTRPCContext({ headers: request.headers });
	const caller = createCaller(TRPCContext);
	return Response.json(await caller.read());
}
