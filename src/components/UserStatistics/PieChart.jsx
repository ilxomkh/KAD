import React from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#16A34A", "#EF4444"];

const PieChart = ({ total, completed, error }) => {
  const data = [
    { name: "To'g'ri bajarilgan", value: completed, color: "#16A34A" },
    { name: "Xatolik", value: error, color: "#EF4444" },
  ];

  const renderLabelInside = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={700}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div className="bg-[#f9fafb] py-4 px-4 rounded-2xl flex space-x-28 w-full">
      {/* Левая часть */}
      <div className="">
        <div>
          <div className="text-sm text-gray-500">Bajarilgan obyektlar soni:</div>
          <div className="text-3xl font-extrabold text-gray-900">
            {total.toLocaleString()} ta
          </div>
        </div>

        <div className="space-x-6 text-sm mt-14 flex">
          {data.map((entry, index) => (
            <div key={index} className="flex items-start gap-2">
              <span
                className="w-3 h-3 mt-1 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="text-gray-900">
                <div className="font-medium">{entry.name}:</div>
                <div className="font-semibold text-lg">
                  {entry.value.toLocaleString()} ta
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Правая часть */}
      <div className="h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={renderLabelInside}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value, name) => [`${value.toLocaleString()} ta`, name]}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;
