"use client";

import { useEffect } from "react";
import type { TLibreResponse } from "~/server/api/routers/libre";
import { api } from "~/trpc/react";
import { AppleIcon, ArrowUpIcon, PencilIcon, SyringeIcon } from "../Icons";
import Banner from "./Banner";
import Chart from "./Chart";
import TooltipContextProvider from "./TooltipContext";

export default function Libre() {
	const { data, isError, isLoading } = api.libre.read.useQuery(undefined, {
		refetchInterval: 60000,
	});

	if (!data) return null;

	return (
		<TooltipContextProvider>
			<div className="flex flex-col h-screen items-center w-full bg-gray-100">
				<Banner current={data.current} />
				<section className="flex flex-col items-center flex-1 w-full bg-white">
					{data && (
						<Chart
							className="w-full flex-1 min-h-80 overflow-hidden"
							data={data}
						/>
					)}
					{/* <div className="flex items-center justify-between w-full mt-4">
                        <AppleIcon className="w-6 h-6" />
                        <SyringeIcon className="w-6 h-6" />
                        <PencilIcon className="w-6 h-6" />
                    </div> */}
				</section>
				{/* <footer className="flex items-center justify-center w-full p-4 bg-gray-200">
                    <button
                        type='submit'
                        className="flex items-center space-x-2"
                        disabled={updateDB.isPending}
                        onClick={() => updateDB.mutate()}
                    >
                        {updateDB.isPending ? "Updating..." : "Update"}
                    </button>
                </footer> */}
			</div>
		</TooltipContextProvider>
	);
}
