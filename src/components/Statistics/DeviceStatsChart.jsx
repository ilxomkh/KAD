import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from "recharts";
import { BarChart2 } from "lucide-react";

const DeviceStatsChart = () => {
  const success = 12271;
  const failure = 18637;
  const building = 2000;

  const data = [
    {
      label: "Muvofiq",
      Muvofiq: success,
      Muvofiq_emas: 0,
      Qurilishda: 0,
    },
    {
      label: "Muvofiq emas",
      Muvofiq: 0,
      Muvofiq_emas: failure,
      Gap: 200,
      Qurilishda: building,
    },
  ];

  // ⬆️ Считаем сумму всех чисел по строке
  const renderCustomLabel = ({ x, y, index }) => {
    const row = data[index];
    const total =
      (row.Muvofiq || 0) + (row.Muvofiq_emas || 0) + (row.Qurilishda || 0);

    return (
      <text x={x + 0} y={y - 15} fontSize={14} fontWeight="600" fill="#374151">
        {`${row.label} - ${total.toLocaleString()} ta`}
      </text>
    );
  };

  // 🎨 Кастомный tooltip (только активные части)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const filtered = payload.filter(
        (item) => item.value > 0 && item.dataKey !== "Gap"
      );

      if (!filtered.length) return null;

      return (
        <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 text-sm">
          {filtered.map((item, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="font-medium" style={{ color: item.color }}>
                {item.name === "Muvofiq"
                  ? "Muvofiq"
                  : item.name === "Muvofiq_emas"
                  ? "Muvofiq emas"
                  : "Qurilishda"}
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
            d="M28 14V18C28 18.2652 27.8946 18.5196 27.7071 18.7071C27.5196 18.8946 27.2652 19 27 19H6V21H17C17.2652 21 17.5196 21.1054 17.7071 21.2929C17.8946 21.4804 18 21.7348 18 22V25C18 25.2652 17.8946 25.5196 17.7071 25.7071C17.5196 25.8946 17.2652 26 17 26H6V27C6 27.2652 5.89464 27.5196 5.70711 27.7071C5.51957 27.8946 5.26522 28 5 28C4.73478 28 4.48043 27.8946 4.29289 27.7071C4.10536 27.5196 4 27.2652 4 27V5C4 4.73478 4.10536 4.48043 4.29289 4.29289C4.48043 4.10536 4.73478 4 5 4C5.26522 4 5.51957 4.10536 5.70711 4.29289C5.89464 4.48043 6 4.73478 6 5V6H21C21.2652 6 21.5196 6.10536 21.7071 6.29289C21.8946 6.48043 22 6.73478 22 7V10C22 10.2652 21.8946 10.5196 21.7071 10.7071C21.5196 10.8946 21.2652 11 21 11H6V13H27C27.2652 13 27.5196 13.1054 27.7071 13.2929C27.8946 13.4804 28 13.7348 28 14Z"
            fill="#459CFF"
          />
        </svg>
        <h3 className="ml-2 text-lg font-semibold text-gray-900">
          Qurilma bo‘yicha statistika
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={375}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 90, left: 10, bottom: 0 }}
          barCategoryGap="50%"
        >
          <CartesianGrid stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 22000]}
            ticks={[0, 5500, 11000, 16500, 22000]}
            tickFormatter={(val) => `${val / 1000}K`}
            tick={{ fontSize: 12 }}
            axisLine={false} // бордер по X
            tickLine={false}
          />
          <YAxis type="category" dataKey="" hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.00)" }}
          />
          {/* Muvofiq */}
          <Bar
            dataKey="Muvofiq"
            stackId="a"
            fill="#E63946"
            radius={[12, 12, 12, 12]}
            barSize={55}
            isAnimationActive={true}
            animationDuration={600}
          >
            <LabelList content={renderCustomLabel} />
          </Bar>
          {/* Muvofiq emas — часть 1 (зелёный) */}
          <Bar
            dataKey="Muvofiq_emas"
            stackId="a"
            fill="#00A359"
            radius={[12, 12, 12, 12]}
            barSize={55}
            isAnimationActive={true}
            animationDuration={600}
          />
          <Bar dataKey="Gap" stackId="a" fill="#fff" barSize={55} />{" "}
          {/* белый разделитель */}
          {/* Muvofiq emas — часть 2 (оранжевый) */}
          <Bar
            dataKey="Qurilishda"
            stackId="a"
            fill="#FF8316"
            radius={[12, 12, 12, 12]}
            barSize={55}
            isAnimationActive={true}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceStatsChart;
