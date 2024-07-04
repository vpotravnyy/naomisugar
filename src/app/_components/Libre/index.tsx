"use client";

import { api } from "~/trpc/react";
import { AppleIcon, ArrowUpIcon, PencilIcon, SyringeIcon } from "../Icons";
import Banner from "./Banner";
import Chart from "./Chart";
import TooltipContextProvider from "./TooltipContext";

export default function Libre() {
	const utils = api.useUtils();
	const { data, isError, isLoading } = api.libre.read.useQuery(undefined, {
		refetchInterval: 60000,
	});
	const updateDB = api.libre.update.useMutation({
		onSuccess: async () => {
			await utils.libre.read.invalidate();
		},
	});

	if (!data) return null;

	const chartData = data && [
		data.current,
		...data.history.filter(
			({ date }) => new Date(date).getTime() > Date.now() - 12 * 60 * 60 * 1000,
		),
	];

	return (
		<TooltipContextProvider>
			<div className="flex flex-col h-screen items-center w-full bg-gray-100">
				<Banner current={data.current} />
				<section className="flex flex-col items-center flex-1 w-full bg-white">
					{chartData && (
						<Chart
							className="w-full flex-1 min-h-80 overflow-hidden"
							chartData={chartData}
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
