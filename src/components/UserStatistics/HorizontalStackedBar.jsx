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
  gap: "#FFFFFF",
};

const HorizontalStackedBar = ({ buildingPresenceData }) => {
  if (!buildingPresenceData) {
    return <div className="text-center text-gray-400">Ma'lumotlar yo‘q</div>;
  }

  const rawData = [
    {
      name: "To‘g‘ri bajarilganlar",
      muvofiq: buildingPresenceData.correctCompleted?.positive || 0,
      gap: 0,
      muvofiqEmas: buildingPresenceData.correctCompleted?.negative || 0,
    },
    {
      name: "Xatoliklar",
      muvofiq: buildingPresenceData.receivedReport?.positive || 0,
      gap: 0,
      muvofiqEmas: buildingPresenceData.receivedReport?.negative || 0,
    },
  ];

  const data = rawData.map((row) => {
    const total = row.muvofiq + row.muvofiqEmas;
    return {
      ...row,
      label: `${row.name} - ${total.toLocaleString()} ta`,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const filtered = payload.filter(
        (item) => item.value > 0 && item.dataKey !== "gap"
      );

      if (!filtered.length) return null;

      return (
        <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 text-sm">
          {filtered.map((item, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="font-medium" style={{ color: item.color }}>
                {item.dataKey === "muvofiq" ? "Muvofiq" : "Muvofiq emas"}
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

  const renderLabel = ({ x, y, index }) => (
    <text x={x + 0} y={y - 10} fontSize={14} fontWeight="600" fill="#374151">
      {data[index].label}
    </text>
  );

  return (
    <div className="bg-gray-50 rounded-2xl pr-6 -mt-4 w-full">
      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          layout="vertical"
          data={data}
          barCategoryGap="30%"
          barGap={0}
          margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.00)" }} />
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
            dataKey="gap"
            stackId="a"
            fill={COLORS.gap}
            radius={[12, 12, 12, 12]}
            barSize={18}
          />
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
