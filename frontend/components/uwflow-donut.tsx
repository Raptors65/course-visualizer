import { Pie, PieChart } from "recharts";

interface UWFlowDonutProps {
  value: number;
  title: string;
}

export default function UWFlowDonut({ value, title }: UWFlowDonutProps) {
  return (
    <PieChart width={120} height={120}>
      <Pie
        data={[
          {
            name: title,
            value: value,
            fill: "hsl(var(--chart-1))",
          },
          { name: "", value: 1 - value, fill: "hsl(var(--muted))" },
        ]}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={60}
        startAngle={90}
        endAngle={450}
        strokeWidth={0}
      />
      <text
        x={60}
        y={55}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground font-bold text-xl"
      >
        {(value * 100).toFixed(0)}%
      </text>
      <text
        x={60}
        y={75}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-xs"
      >
        {title}
      </text>
    </PieChart>
  );
}
