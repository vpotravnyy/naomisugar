"use client";

import { api } from "~/trpc/react";
import { AppleIcon, ArrowUpIcon, PencilIcon, SyringeIcon } from "../Icons";
import Chart from "./Chart";

export default function Libre() {
    const utils = api.useUtils()
    const { data, isError, isLoading } = api.libre.read.useQuery();
    const updateDB = api.libre.update.useMutation({
        onSuccess: async () => {
            await utils.libre.read.invalidate();
        }
    })

    const chartData = data && [
        data.current,
        ...data.history
            .filter(({ date }) => new Date(date).getTime() > Date.now() - 12 * 60 * 60 * 1000)
    ]

    return <div className="flex flex-col h-screen items-center w-full bg-gray-100">
        <section className="flex flex-col items-center h-40 flex-none w-full bg-green-500 text-white">
            <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm">GLUCOSE IN RANGE</span>
                <div className="flex items-center mt-2 text-6xl font-bold">
                    {data?.current?.value.toFixed(1) ?? "---"}
                    <ArrowUpIcon className="w-12 h-12 ml-2" />
                </div>
                <span className="text-lg">mmol/L</span>
            </div>
        </section>
        <section className="flex flex-col items-center flex-1 w-full bg-white">
            {chartData && (
                <Chart className="w-full flex-1 min-h-80 overflow-hidden" chartData={chartData} />
            )}
            <div className="flex items-center justify-between w-full mt-4">
                <AppleIcon className="w-6 h-6" />
                <SyringeIcon className="w-6 h-6" />
                <PencilIcon className="w-6 h-6" />
            </div>
        </section>
        <footer className="flex items-center justify-center w-full p-4 bg-gray-200">
            <button
                type='submit'
                className="flex items-center space-x-2"
                disabled={updateDB.isPending}
                onClick={() => updateDB.mutate()}
            >
                {updateDB.isPending ? "Updating..." : "Update"}
            </button>
        </footer>
    </div>
}

