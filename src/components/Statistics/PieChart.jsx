import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useState } from "react";

const pieData = [
  { name: "Bajarilgan", value: 149821, color: "#00A359" },
  { name: "Xatolik", value: 47689, color: "#E63946" },
  { name: "Moderatsiyada", value: 22017, color: "#FFD016" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={18}
      fontWeight="bold"
      pointerEvents="none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = () => (
  <ul className="text-sm space-y-8 ml-22">
    {pieData.map((entry, index) => (
      <li key={index} className="flex flex-col items-start justify-center w-48">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 text-lg">{entry.name}:</span>
        </div>
        <span className="font-semibold text-gray-900 text-xl">
          {entry.value.toLocaleString()} ta
        </span>
      </li>
    ))}
  </ul>
);

export default function CustomPieChart() {
  const total = pieData.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="focus:outline-none">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.5526 18.2054C30.2907 20.6798 29.3394 23.0169 27.8008 24.9641C27.4921 25.3554 27.065 25.5792 26.5676 25.6111C26.5275 25.6137 26.4874 25.6149 26.4481 25.6149C25.9976 25.6149 25.5894 25.4479 25.2613 25.1272L19.2419 19.2504C18.7337 18.7542 18.5843 18.0372 18.8523 17.3799C19.1203 16.7218 19.7275 16.3129 20.4381 16.3129H28.8494C29.3482 16.3129 29.7882 16.5091 30.1221 16.8799C30.4562 17.2511 30.6044 17.7092 30.5526 18.2054ZM17.9373 15.1911H28.1144C28.6132 15.1911 29.0532 14.9955 29.3868 14.6241C29.7207 14.2536 29.8695 13.7954 29.8177 13.2999C29.5042 10.3204 28.1608 7.50862 26.0346 5.38187C23.9075 3.2548 21.0956 1.91187 18.1163 1.59874C17.6204 1.54599 17.1622 1.69543 16.7914 2.0293C16.4209 2.36293 16.2249 2.80287 16.2249 3.30168V13.4786C16.2249 14.4228 16.9929 15.1911 17.9373 15.1911ZM15.3175 17.2449C15.1711 17.1017 15.1031 16.9397 15.1031 16.7356V5.85662C15.1031 5.3578 14.9069 4.91787 14.5361 4.58368C14.1652 4.2498 13.7074 4.10155 13.2116 4.15368C9.9955 4.49112 7.02369 6.00305 4.84306 8.40987C2.64687 10.8342 1.4375 13.9724 1.4375 17.2461C1.4375 24.5054 7.34356 30.4118 14.6029 30.4118C17.6631 30.4118 20.6437 29.338 22.9969 27.3879C23.3811 27.0698 23.595 26.6381 23.6149 26.1392C23.6357 25.6404 23.4576 25.1929 23.1008 24.8443L15.3175 17.2449Z"
              fill="#459CFF"
            />
          </svg>
          Umumiy statistika
        </h2>
        <p className="text-gray-400 mt-1">Obyektlar soni:</p>
        <p className="text-4xl font-bold text-gray-900">
          {total.toLocaleString()} ta
        </p>
      </div>
      <div className="flex items-center">
        <PieChart width={320} height={320}>
          <Tooltip
            formatter={(value, name) => [`${value.toLocaleString()} ta`, name]}
            contentStyle={{ borderRadius: "8px", fontSize: "14px" }}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={1}
            outerRadius={130}
            labelLine={false}
            label={renderCustomizedLabel}
            paddingAngle={1}
            isAnimationActive={true}
            animationDuration={400}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                cornerRadius={6}
                style={{
                  transform: activeIndex === index ? "scale(1.06)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 0.3s ease",
                }}
              />
            ))}
          </Pie>
        </PieChart>
        <CustomLegend />
      </div>
    </div>
  );
}
