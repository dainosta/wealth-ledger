'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/calculations';

interface AssetAllocationChartProps {
  cash: number;
  stocks: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = ((data.value / data.totalAmount) * 100).toFixed(1);
    return (
      <div className="bg-black/90 border border-neutral-800 p-3 rounded-none shadow-xl">
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">{data.name}</p>
        <p className="text-white font-mono font-bold text-lg">{formatCurrency(data.value)}</p>
        <p className="text-neutral-500 font-mono text-sm mt-1">{percent}%</p>
      </div>
    );
  }
  return null;
};

export function AssetAllocationChart({ cash, stocks }: AssetAllocationChartProps) {
  const rawData = [
    { name: 'Tiền mặt', value: cash, color: '#34d399' }, // emerald-400
    { name: 'Cổ phiếu', value: stocks, color: '#60a5fa' }, // blue-400
  ].filter(item => item.value > 0);

  const total = rawData.reduce((sum, item) => sum + item.value, 0);

  const data = rawData.map(item => ({ ...item, totalAmount: total }));

  if (total === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 font-mono text-sm">
        Không có dữ liệu
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-mono text-xs font-bold drop-shadow-md">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={renderCustomizedLabel}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              content={(props) => {
                const { payload } = props;
                return (
                  <ul className="flex flex-wrap justify-center gap-4 text-xs font-mono">
                    {payload?.map((entry: any, index: number) => (
                      <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-none" style={{ backgroundColor: entry.color }} />
                        <span className="text-neutral-400">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
