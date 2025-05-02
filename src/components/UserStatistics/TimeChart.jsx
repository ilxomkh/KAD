import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Tooltip,
} from "recharts";

const parseTimeToHourMinute = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return { hour: h, minute: m, originalTime: timeStr };
};

const formatHourTick = (h) => `${String(h).padStart(2, "0")}:00`;
const formatMinuteTick = (m) => String(m).padStart(2, "0");

const Dot = ({ cx, cy }) => (
  <circle cx={cx} cy={cy} r={8} fill="#1683FF" fillOpacity={0.9} />
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const point = payload[0]?.payload;
    return (
      <div className="bg-white px-3 py-2 rounded-xl shadow-md text-sm text-gray-800">
        Yuklangan vaqti: <span className="font-semibold">{point.originalTime}</span>
      </div>
    );
  }
  return null;
};

const TimeChart = ({ timeData }) => {
  const data = timeData.map((item) => parseTimeToHourMinute(item.time));

  const minHour = 9;
  const maxHour = Math.max(...data.map((d) => d.hour), 20);

  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const minutes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="bg-[#f7f9fb] rounded-2xl -mt-4">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid stroke="#D1D5DB" strokeDasharray="3 3" vertical horizontal />
          <XAxis
            type="number"
            dataKey="hour"
            domain={[minHour - 0.5, maxHour + 0.5]}
            ticks={hours}
            tickFormatter={formatHourTick}
            interval={0}
            tick={{ fontSize: 14, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="minute"
            domain={[0, 60]}
            ticks={minutes}
            tickFormatter={formatMinuteTick}
            interval={0}
            tick={{ fontSize: 14, fill: "#4B5563" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} shape={<Dot />} animationDuration={500} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeChart;
