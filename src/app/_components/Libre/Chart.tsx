"use client";

import { Line } from "@nivo/line"
import AutoSizer from "react-virtualized-auto-sizer";
import type { TLibreDataPoint } from "~/server/api/routers/libre";

export type TChartProps = { chartData: TLibreDataPoint[], className?: string }
export default function Chart(props: TChartProps) {
    return (
        <div className={props.className}>
            <AutoSizer>
                {({ height, width }) => (
                    <Line
                        width={width}
                        height={height}
                        data={[
                            {
                                id: "history",
                                data: props.chartData.map(({ date, value }) => ({ x: date, y: value })).reverse(),
                            }
                        ]}
                        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                        xScale={{
                            format: '%h',
                            precision: 'minute',
                            type: 'time',
                            useUTC: false
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            format: '%I %p',
                            tickValues: 'every 2 hours'
                        }}

                        axisLeft={{
                            tickSize: 0,
                            tickValues: 5,
                            tickPadding: 16,
                        }}
                        colors={["#2563eb", "#e11d48"]}
                        pointSize={6}
                        useMesh={true}
                        gridYValues={6}
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
    )
}