"use client";

import { type CustomLayerProps, Line } from "@nivo/line";
import type { ScaleLinear } from "@nivo/scales";
import AutoSizer from "react-virtualized-auto-sizer";
import type { TLibreDataPoint } from "~/server/api/routers/libre";

export type TChartProps = { chartData: TLibreDataPoint[]; className?: string };

const LOW = { MIN: 0, MAX: 4 };
const GREEN = { MIN: 4, MAX: 10 };
const HIGH = { MIN: 10, MAX: 50 };
const ALERT_LOW = 3.5;
const ALERT_HIGH = 14;

type TPoint = { x: Date; y: number | null };

type CustomLineLayerProps = Omit<CustomLayerProps, "yScale"> & {
	yScale: ScaleLinear<number>;
};

function GreenLayer(props: CustomLineLayerProps) {
	return (
		<g>
			<rect
				y={props.yScale(GREEN.MAX)}
				width={innerWidth}
				height={props.yScale(GREEN.MAX - GREEN.MIN) / 2}
				fill="#00ff00"
				opacity={0.2}
			/>
		</g>
	);
}

export default function Chart(props: TChartProps) {
	const data = props.chartData
		.map(({ date, value }) => ({ x: date, y: value }))
		.reverse();

	return (
		<div className={props.className}>
			<AutoSizer>
				{({ height, width }) => (
					<Line
						data={[
							{
								id: "sugar",
								data,
							},
						]}
						xScale={{
							format: "%h",
							precision: "minute",
							type: "time",
							useUTC: false,
						}}
						axisBottom={{
							format: "%I %p",
							tickValues: "every 2 hours",
						}}
						layers={[
							"grid",
							GreenLayer,
							"markers",
							"axes",
							"areas",
							"crosshair",
							"lines",
							"points",
							"slices",
							"mesh",
							"legends",
						]}
						yScale={{
							type: "linear",
							min: 0,
							max: 21,
						}}
						axisLeft={{
							tickSize: 0,
							tickValues: 5,
							tickPadding: 16,
						}}
						enableSlices="x"
						enableTouchCrosshair
						curve="catmullRom"
						useMesh={true}
						gridYValues={6}
						width={width}
						height={height}
						margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
						colors={["#333"]}
						lineWidth={4}
						enablePoints={false}
						// defs={[
						// 	{
						// 		colors: [
						// 			{
						// 				color: "inherit",
						// 				offset: 0,
						// 			},
						// 		],
						// 		id: "gradientA",
						// 		type: "linearGradient",
						// 	},
						// ]}
						// fill={[
						// 	{
						// 		id: "gradientA",
						// 		match: { id: "high" },
						// 	},
						// ]}
						theme={{
							tooltip: {
								chip: {
									borderRadius: "9999px",
								},
								container: {
									fontSize: "12px",
									textTransform: "capitalize",
									borderRadius: "6px",
								},
							},
							grid: {
								line: {
									stroke: "#f3f4f6",
								},
							},
						}}
						role="application"
					/>
				)}
			</AutoSizer>
		</div>
	);
}
