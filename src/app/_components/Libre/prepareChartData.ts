import {
	addMinutes,
	differenceInMinutes,
	subHours,
	subMinutes,
} from "date-fns";
import type {
	TLibreDataPoint,
	TLibreResponse,
} from "~/server/api/routers/libre";
import type { LibreCgmData } from "~/server/lib/libre/types/client";

export type TChartData = {
	x: Date;
	y: number | null;
	trend: LibreCgmData["trend"];
};

type TLibreEmptyDataPoint = Omit<TLibreDataPoint, "value"> & { value: null };

function fillHolesWithEmptyPoints(
	events: TLibreDataPoint[],
	from: Date,
	to: Date,
) {
	let pointer: Date = from;
	const result = [] as (TLibreDataPoint | TLibreEmptyDataPoint)[];

	while (pointer < to) {
		const closestEvent = events.find(
			(item) => Math.abs(differenceInMinutes(pointer, item.date)) < 8,
		);

		if (closestEvent) {
			result.push(closestEvent);
			pointer = addMinutes(closestEvent.date, 15); // Move pointer 15 minutes ahead
		} else {
			result.push({
				date: pointer,
				value: null,
				trend: "NotComputable",
				is_high: false,
				is_low: false,
			});
			pointer = addMinutes(pointer, 15); // Move pointer 15 minutes ahead
		}
	}
	return result;
}

function libreToChartData(
	point: TLibreDataPoint | TLibreEmptyDataPoint,
): TChartData {
	return { x: point.date, y: point.value, trend: point.trend };
}
export default function prepareChartData({
	current,
	history,
}: TLibreResponse): TChartData[] {
	const now = new Date();

	if (!history[0]) return [];

	const enrichedHistory = fillHolesWithEmptyPoints(
		history,
		subHours(now, 12),
		history[0].date,
	);

	const result = enrichedHistory.map(libreToChartData);
	result.push(libreToChartData(current));

	result.push();

	return result;
}
