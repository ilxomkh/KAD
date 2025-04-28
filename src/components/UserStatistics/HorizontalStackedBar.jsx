import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

const COLORS = {
  muvofiq: "#16A34A",
  muvofiqEmas: "#F97316",
};

const rawData = [
  {
    name: "To‘g‘ri bajarilganlar",
    muvofiq: 115000,
    muvofiqEmas: 25000,
  },
  {
    name: "Xatoliklar",
    muvofiq: 70000,
    muvofiqEmas: 10000,
  },
];

// 🔢 Используем реальные количества
const data = rawData.map((row) => {
  const total = row.muvofiq + row.muvofiqEmas;
  return {
    ...row,
    // ❗️ никаких процентов, оставляем реальные значения
    label: `${row.name} - ${total.toLocaleString()} ta`,
  };
});

// 📌 Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 text-sm">
        {payload.map((item, i) => (
          <div key={i} className="flex justify-between gap-4">
            <span className="font-medium" style={{ color: item.color }}>
              {item.name === "muvofiq" ? "Muvofiq" : "Muvofiq emas"}
            </span>
            <span className="text-gray-700 font-semibold">
              {item.value.toLocaleString()} ta
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 📌 Label над баром
const renderLabel = ({ x, y, index }) => {
  return (
    <text x={x + 0} y={y - 15} fontSize={14} fontWeight="600" fill="#374151">
      {data[index].label}
    </text>
  );
};

const HorizontalStackedBar = () => {
  return (
    <div className="bg-gray-50 rounded-2xl pr-6 -mt-4 w-full">
      <div className="flex items-center mb-4">
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          layout="vertical"
          data={data}
          barCategoryGap="30%"
          barGap={0}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            // ❗️ Убираем проценты
            tickFormatter={(v) => v.toLocaleString()}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey=" "
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.00)" }}/>
          <Bar
            dataKey="muvofiq"
            stackId="a"
            fill={COLORS.muvofiq}
            radius={[12, 12, 12, 12]}
            barSize={18}
          >
            <LabelList content={renderLabel} />
          </Bar>
          <Bar
            dataKey="muvofiqEmas"
            stackId="a"
            fill={COLORS.muvofiqEmas}
            radius={[12, 12, 12, 12]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalStackedBar;
