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

const TimeChart = () => {
  const timeData = [
    { time: "09:03" }, { time: "09:07" }, { time: "09:13" }, { time: "09:19" },
    { time: "09:21" }, { time: "09:25" }, { time: "09:32" }, { time: "09:34" },
    { time: "09:37" }, { time: "09:54" }, { time: "09:56" }, { time: "09:59" },
    { time: "10:00" }, { time: "10:04" }, { time: "10:05" }, { time: "10:08" },
    { time: "10:10" }, { time: "10:14" }, { time: "10:18" }, { time: "10:22" },
    { time: "10:35" }, { time: "10:41" }, { time: "10:44" }, { time: "10:50" },
    { time: "11:25" }, { time: "11:33" }, { time: "11:37" }, { time: "11:40" },
    { time: "11:42" }, { time: "11:44" }, { time: "11:45" }, { time: "11:48" },
    { time: "11:51" }, { time: "11:54" }, { time: "11:58" }, { time: "12:04" },
    { time: "12:10" }, { time: "12:14" }, { time: "12:19" }, { time: "12:28" },
    { time: "12:32" }, { time: "12:44" }, { time: "12:52" }, { time: "12:58" },
    { time: "14:55" }, { time: "15:30" }, { time: "16:50" }, { time: "17:45" },
    { time: "18:05" }, { time: "20:12" }, { time: "18:25" }, { time: "18:35" },{ time: "21:35" },
  ];

  const data = timeData.map((item) => parseTimeToHourMinute(item.time));

  const minHour = 9;
  const maxHour = Math.max(...data.map((d) => d.hour), 20);

  // Generate hour ticks explicitly
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const minutes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="bg-[#f7f9fb] rounded-2xl -mt-4">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid
            stroke="#D1D5DB"
            strokeDasharray="3 3"
            vertical
            horizontal
          />
          <XAxis
            type="number"
            dataKey="hour"
            domain={[minHour - 0.5, maxHour + 0.5]}
            ticks={hours}
            tickFormatter={formatHourTick}
            interval={0}  // 👈 Important fix
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
