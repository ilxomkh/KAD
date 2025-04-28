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
import IconSet from "../../assets/IconSet.svg";

const StatusChart = () => {
  const data = [
    {
      label: "Moderatsiyada",
      Moderatsiyada: 16271,
      Surishda: 0,
      Solishtirishda: 0,
      Agentlikda: 0,
      Tayyor: 0,
      Kadastr: 0,
    },
    {
      label: "Surishda",
      Moderatsiyada: 0,
      Surishda: 6271,
      Solishtirishda: 0,
      Agentlikda: 0,
      Tayyor: 0,
      Kadastr: 0,
    },
    {
      label: "Solishtirishda",
      Moderatsiyada: 0,
      Surishda: 0,
      Solishtirishda: 14271,
      Agentlikda: 0,
      Tayyor: 0,
      Kadastr: 0,
    },
    {
      label: "Agentlik tekshiruvda",
      Moderatsiyada: 0,
      Surishda: 0,
      Solishtirishda: 0,
      Agentlikda: 22271,
      Tayyor: 0,
      Kadastr: 0,
    },
    {
      label: "Tayyor holatdagi",
      Moderatsiyada: 0,
      Surishda: 0,
      Solishtirishda: 0,
      Agentlikda: 0,
      Tayyor: 18271,
      Kadastr: 0,
    },
    {
      label: "Kadastrga yuborilgan",
      Moderatsiyada: 0,
      Surishda: 0,
      Solishtirishda: 0,
      Agentlikda: 0,
      Tayyor: 0,
      Kadastr: 12271,
    },
  ];

  const COLORS = {
    Moderatsiyada: "#FF8316",
    Surishda: "#1683FF",
    Solishtirishda: "#E8BD14",
    Agentlikda: "#B821EA",
    Tayyor: "#009451",
    Kadastr: "#E63946",
  };

  // Найти максимальное значение суммы
  const maxValue = Math.max(
    ...data.map(
      (item) =>
        (item.Moderatsiyada || 0) +
        (item.Surishda || 0) +
        (item.Solishtirishda || 0) +
        (item.Agentlikda || 0) +
        (item.Tayyor || 0) +
        (item.Kadastr || 0)
    )
  );

  const roundedMax = Math.ceil(maxValue / 5000) * 5000;

  const ticks = [];
  for (let i = 0; i <= roundedMax; i += 5000) {
    ticks.push(i);
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const filtered = payload.filter((item) => item.value > 0);

      if (!filtered.length) return null;

      return (
        <div className="bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 text-sm">
          {filtered.map((item, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="font-medium" style={{ color: item.color }}>
                {item.name}
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

  const renderCustomLabel = ({ x, y, index }) => {
    const row = data[index];
    const total =
      (row.Moderatsiyada || 0) +
      (row.Surishda || 0) +
      (row.Solishtirishda || 0) +
      (row.Agentlikda || 0) +
      (row.Tayyor || 0) +
      (row.Kadastr || 0);

    return (
      <text x={x + 0} y={y - 8} fontSize={14} fontWeight="600" fill="#374151">
        {`${row.label} - ${total.toLocaleString()} ta`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <div className="flex items-center mb-4">
        <img src={IconSet} alt="Icon" />
        <h3 className="ml-2 text-lg font-semibold text-gray-900">
          Holatlar bo‘yicha
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={375}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, roundedMax]}
            ticks={ticks}
            tickFormatter={(val) => `${val / 1000}K`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis type="category" dataKey="label" hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0)" }}
          />

          {/* Бары */}
          <Bar
            dataKey="Moderatsiyada"
            stackId="a"
            fill={COLORS.Moderatsiyada}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          >
            <LabelList content={renderCustomLabel} />
          </Bar>
          <Bar
            dataKey="Surishda"
            stackId="a"
            fill={COLORS.Surishda}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          />
          <Bar
            dataKey="Solishtirishda"
            stackId="a"
            fill={COLORS.Solishtirishda}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          />
          <Bar
            dataKey="Agentlikda"
            stackId="a"
            fill={COLORS.Agentlikda}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          />
          <Bar
            dataKey="Tayyor"
            stackId="a"
            fill={COLORS.Tayyor}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          />
          <Bar
            dataKey="Kadastr"
            stackId="a"
            fill={COLORS.Kadastr}
            radius={[12, 12, 12, 12]}
            barSize={20}
            isAnimationActive
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
