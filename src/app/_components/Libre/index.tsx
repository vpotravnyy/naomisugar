"use client";

import { api } from "~/trpc/react";

export default function Libre() {
    const utils = api.useUtils()
    const { data, isError, isLoading } = api.libre.read.useQuery();
    const updateDB = api.libre.update.useMutation({
        onSuccess: async () => {
            await utils.libre.read.invalidate();
        }
    })

    return <div>
        <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={updateDB.isPending}
            onClick={() => updateDB.mutate()}
        >
            {updateDB.isPending ? "Updating..." : "Update"}
        </button>
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    </div>
}