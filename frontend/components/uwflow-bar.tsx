"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface UWFlowBarProps {
  value: number;
  title: string;
}

export default function UWFlowBar({ value, title }: UWFlowBarProps) {
  return (
    <BarChart
      width={200}
      height={30}
      data={[
        {
          name: title,
          value: value,
          complement: 1 - value,
        },
      ]}
      layout="vertical"
      margin={{ top: 15, right: 40 }}
    >
      <XAxis type="number" hide={true} />
      <YAxis dataKey="name" type="category" hide={true} />
      <Bar dataKey="value" stackId="a" fill="hsl(var(--chart-1))" />
      <Bar dataKey="complement" stackId="a" fill="#000000" />
      <text
        x={0}
        y={0}
        className="fill-foreground text-xs"
        dominantBaseline="hanging"
      >
        {title}
      </text>
      <text
        x={200}
        y={22.5}
        className="fill-foreground text-xs"
        textAnchor="end"
        dominantBaseline="middle"
      >
        {Math.round(value * 100)}%
      </text>
    </BarChart>
  );
}
