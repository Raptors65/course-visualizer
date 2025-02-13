"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface UWFlowBarProps {
  value: number;
  title: string;
}

export default function UWFlowBar({ value, title }: UWFlowBarProps) {
  return (
    <ResponsiveContainer width="100%" height={30}>
      <BarChart
        width={200}
        height={30}
        data={[
          {
            name: title,
            value: value,
            complement: 1 - value,
            label: `${Math.round(value * 100)}%`,
          },
        ]}
        layout="vertical"
        margin={{ top: 15, right: 40 }}
      >
        <XAxis type="number" hide={true} />
        <YAxis dataKey="name" type="category" hide={true} />
        <Bar dataKey="value" stackId="a" fill="hsl(var(--chart-1))" />
        <Bar dataKey="complement" stackId="a" fill="#000000">
          <LabelList
            dataKey="label"
            position="right"
            className="fill-foreground text-xs"
            offset={10}
          />
        </Bar>
        <text
          x={0}
          y={0}
          className="fill-foreground text-xs"
          dominantBaseline="hanging"
        >
          {title}
        </text>
      </BarChart>
    </ResponsiveContainer>
  );
}
