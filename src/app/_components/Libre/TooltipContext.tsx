"use client";

import type { DatumValue } from "@nivo/line";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

export type TTooltipData = {
	x: DatumValue;
	y: DatumValue;
	trend:
		| "SingleDown"
		| "FortyFiveDown"
		| "Flat"
		| "FortyFiveUp"
		| "SingleUp"
		| "NotComputable";
} | null;
const TooltipContext = createContext(
	{} as {
		tooltipData: TTooltipData;
		setTooltipData: Dispatch<SetStateAction<TTooltipData>>;
	},
);

export default function TooltipContextProvider({
	children,
}: { children: React.ReactNode }) {
	const [tooltipData, setTooltipData] = useState(null as TTooltipData);

	return (
		<TooltipContext.Provider value={{ tooltipData, setTooltipData }}>
			{children}
		</TooltipContext.Provider>
	);
}

export function useSetTooltipData(data: TTooltipData) {
	const { setTooltipData } = useContext(TooltipContext);

	useEffect(() => {
		setTooltipData(() => data);
	}, [data, setTooltipData]);

	useEffect(() => () => setTooltipData(null), [setTooltipData]);
}

export function useTooltipData() {
	const { tooltipData } = useContext(TooltipContext);
	return tooltipData;
}
