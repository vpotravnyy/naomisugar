"use client";

import { DotsItem } from "@nivo/core";
import {
	type CustomLayer,
	type CustomLayerProps,
	Line,
	type SliceTooltipProps,
} from "@nivo/line";
import type { ScaleLinear } from "@nivo/scales";
import AutoSizer from "react-virtualized-auto-sizer";
import type { TLibreDataPoint } from "~/server/api/routers/libre";
import { type TTooltipData, useSetTooltipData } from "./TooltipContext";

export type TChartProps = { chartData: TLibreDataPoint[]; className?: string };

const LOW = { MIN: 0, MAX: 4 };
const GREEN = { MIN: 4, MAX: 10 };
const HIGH = { MIN: 10, MAX: 50 };
const ALERT_LOW = 3.5;
const ALERT_HIGH = 14;

const COLORS = {
	LOW: "#f55",
	GREEN: "#5f5",
	HIGH: "#f95",
};

type TPoint = { x: Date; y: number | null };

type CustomLineLayerProps = Omit<CustomLayerProps, "yScale"> & {
	yScale: ScaleLinear<number>;
};

type CurrentSlice = {
	currentSlice: SliceTooltipProps["slice"];
};

function GreenLayer(props: CustomLineLayerProps) {
	return (
		<g>
			<rect
				y={props.yScale(GREEN.MAX)}
				width={innerWidth}
				height={props.yScale(GREEN.MIN) - props.yScale(GREEN.MAX)}
				fill="#00ff00"
				opacity={0.2}
			/>
		</g>
	);
}

function ActivePoint({
	currentSlice,
	...props
}: CustomLineLayerProps & CurrentSlice) {
	useSetTooltipData(
		(currentSlice?.points[0]?.data as unknown as TTooltipData) ?? null,
	);
	return (
		<g>
			{currentSlice?.points.map((point) => {
				let color = "";
				if (Number(point.data.y) < LOW.MAX) {
					color = COLORS.LOW;
				} else if (Number(point.data.y) < GREEN.MAX) {
					color = COLORS.GREEN;
				} else if (Number(point.data.y) < ALERT_HIGH) {
					color = COLORS.HIGH;
				} else {
					color = COLORS.LOW;
				}
				const borderColor = Number(point.data.y) < ALERT_LOW ? "#c00" : "#333";
				return (
					<DotsItem
						key={point.id}
						x={point.x}
						y={point.y}
						datum={point.data}
						size={12}
						color={color}
						borderWidth={2}
						borderColor={borderColor}
					/>
				);
			})}
		</g>
	);
}

export default function Chart(props: TChartProps) {
	const data = props.chartData
		.map(({ date, value, trend }) => ({ x: date, y: value, trend }))
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
							ActivePoint as unknown as CustomLayer,
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
							tickValues: 20,
							tickPadding: 16,
						}}
						enableGridY={false}
						markers={[
							{
								axis: "y",
								lineStyle: {
									stroke: "#F55",
									strokeWidth: 1,
									strokeDasharray: "6 3",
								},
								value: ALERT_LOW,
							},
							{
								axis: "y",
								lineStyle: {
									stroke: "#F55",
									strokeWidth: 1,
									strokeDasharray: "6 3",
								},
								value: ALERT_HIGH,
							},
						]}
						enableSlices="x"
						enableTouchCrosshair
						sliceTooltip={() => null}
						curve="catmullRom"
						animate={false}
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
