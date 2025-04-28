import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { useMemo } from "react";

const defaultData = [
  { name: "4-modda", Ijobiy: 94000, Salbiy: 68000 },
  { name: "5-modda", Ijobiy: 75000, Salbiy: 68000 },
  { name: "6-modda", Ijobiy: 103000, Salbiy: 68000 },
  { name: "7-modda", Ijobiy: 37000, Salbiy: 32000 },
  { name: "9-modda", Ijobiy: 67000, Salbiy: 43000 },
];

// Tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow px-3 py-1 text-sm">
        <p className="text-gray-700 font-medium">{payload[0].payload.name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-800">
            {entry.name}:{" "}
            <span className="font-semibold">
              {entry.value.toLocaleString()} ta
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ModdaStatChart({ data = defaultData }) {
  // Мемоизация данных (если они часто обновляются)
  const chartData = useMemo(() => data, [data]);

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <div className="flex items-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M29 27.031L7 26.993V27H6C5.925 27 5.85 26.991 5.778 26.975C5.31 26.891 4.955 26.481 4.956 25.989C4.956 25.887 4.972 25.789 5 25.697V4C5 3.448 4.552 3 4 3C3.448 3 3 3.448 3 4V26C3 26.796 3.316 27.559 3.879 28.121C4.441 28.684 5.204 29 6 29H28.013C28.559 28.993 29 28.548 29 28V27.031Z"
            fill="#459CFF"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M23 25.021L29 25.031V14C29 13.448 28.552 13 28 13H24C23.448 13 23 13.448 23 14V25.021Z"
            fill="#459CFF"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15 25.007L21 25.017V4C21 3.448 20.552 3 20 3H16C15.448 3 15 3.448 15 4V25.007Z"
            fill="#459CFF"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 24.993L13 25.003V10C13 9.448 12.552 9 12 9H8C7.448 9 7 9.448 7 10V24.993Z"
            fill="#459CFF"
          />
        </svg>
        <h3 className="ml-2 text-lg font-semibold text-gray-900">
          Moddalar bo‘yicha statistika
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap={20}>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#f1f1f1"
            strokeWidth={0.5}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}K`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Bar
            dataKey="Ijobiy"
            fill="#1683FF"
            radius={[18, 18, 18, 18]}
            barSize={34}
            animationDuration={800}
            isAnimationActive={true}
          />
          <Bar
            dataKey="Salbiy"
            fill="#FF8316"
            radius={[18, 18, 18, 18]}
            barSize={34}
            animationDuration={800}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
