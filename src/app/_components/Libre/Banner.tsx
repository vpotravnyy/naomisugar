import type { TLibreDataPoint } from "~/server/api/routers/libre";
import { ArrowUpIcon } from "../Icons";
import { useTooltipData } from "./TooltipContext";

const LOW = { MIN: 0, MAX: 4 };
const GREEN = { MIN: 4, MAX: 10 };
const HIGH = { MIN: 10, MAX: 50 };
const ALERT_LOW = 3.5;
const ALERT_HIGH = 14;

const COLORS = {
	LOW: "#f55",
	GREEN: "#22c55e",
	HIGH: "#f95",
};

const arrowStyle = {
	SingleDown: { transform: "rotate(180deg)" },
	FortyFiveDown: { transform: "rotate(135deg)" },
	Flat: { transform: "rotate(90deg)" },
	FortyFiveUp: { transform: "rotate(45deg)" },
	SingleUp: { transform: "rotate(0deg)" },
	NotComputable: { display: "none" },
};
const millisecondsPerSecond = 1000;
const secondsPerMinute = 60;
const minutesPerHour = 60;
const hoursPerDay = 24;
const daysPerWeek = 7;
const relativeDateFormat = new Intl.RelativeTimeFormat("en", { style: "long" });

function formatRelativeTime(createTime: Date) {
	const diff = +createTime - +new Date();
	const intervals = {
		week:
			millisecondsPerSecond *
			secondsPerMinute *
			minutesPerHour *
			hoursPerDay *
			daysPerWeek,
		day:
			millisecondsPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay,
		hour: millisecondsPerSecond * secondsPerMinute * minutesPerHour,
		minute: millisecondsPerSecond * secondsPerMinute,
		second: millisecondsPerSecond,
	};
	for (const interval in intervals) {
		const i =
			intervals[interval as "week" | "day" | "hour" | "minute" | "second"];
		if (i <= Math.abs(diff)) {
			return relativeDateFormat.format(
				Math.trunc(diff / i),
				interval as "week" | "day" | "hour" | "minute" | "second",
			);
		}
	}
	return relativeDateFormat.format(diff / 1000, "second");
}
export default function Banner({ current }: { current: TLibreDataPoint }) {
	const tooltipData = useTooltipData();
	const value = tooltipData ? Number(tooltipData?.y as number) : current?.value;
	const trend = tooltipData ? tooltipData.trend : current?.trend;
	const date = tooltipData
		? new Date(tooltipData.x).toLocaleString("en", {
				hour: "numeric",
				minute: "2-digit",
			})
		: current.date.toLocaleString("en", {
				hour: "numeric",
				minute: "2-digit",
			});
	const since = formatRelativeTime(
		tooltipData ? new Date(tooltipData.x) : current.date,
	);
	new Intl.RelativeTimeFormat("en", { style: "short" });

	let color = "";
	if (Number(value) < LOW.MAX) {
		color = COLORS.LOW;
	} else if (Number(value) < GREEN.MAX) {
		color = COLORS.GREEN;
	} else if (Number(value) < ALERT_HIGH) {
		color = COLORS.HIGH;
	} else {
		color = COLORS.LOW;
	}
	return (
		<section
			className="flex flex-col items-center h-40 flex-none w-full text-white"
			style={{ backgroundColor: color }}
		>
			<div className="flex flex-col items-center justify-center h-full">
				<span className="text-sm">GLUCOSE IN RANGE</span>
				<div className="flex items-center mt-2 text-6xl font-bold">
					{value?.toFixed(1) ?? "---"}
					<ArrowUpIcon className="w-12 h-12 ml-2" style={arrowStyle[trend]} />
				</div>
				<div className="flex flex-row items-center justify-center gap-2">
					<span className="text-lg">{date}</span>
					<span className="text-sm">({since})</span>
				</div>
			</div>
		</section>
	);
}
