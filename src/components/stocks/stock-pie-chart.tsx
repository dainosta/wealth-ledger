'use client';

import { useMemo } from 'react';
import { StockWithQuote } from '@/hooks/use-stocks';
import { formatCurrency } from '@/lib/calculations';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
  '#a855f7', // purple
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.payload;
    const color = payload[0].payload.fill;
    return (
      <div className="bg-neutral-900 text-neutral-100 p-3 rounded-xl text-xs shadow-xl border border-neutral-800 z-50">
        <div className="flex items-center font-bold mb-1 text-sm">
          <span className="w-2 h-2 rounded-full mr-2 inline-block" style={{ backgroundColor: color }}></span>
          {data.symbol}
        </div>
        <div className={`font-semibold mb-2 text-sm ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {data.profit > 0 ? '+' : ''}{formatCurrency(data.profit)} ({data.profitPercent > 0 ? '+' : ''}{data.profitPercent.toFixed(2)}%)
        </div>
        <div className="text-neutral-400 space-y-1">
          <div>Tỷ trọng: <span className="text-white font-medium">{data.weight}%</span></div>
          <div>GT hiện tại: <span className="text-white font-medium">{formatCurrency(data.currentValue)}</span></div>
          <div>KL mở: <span className="text-white font-medium">{data.quantity.toLocaleString()}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export function StockPieChart({ stocks }: { stocks: StockWithQuote[] }) {
  if (!stocks || stocks.length === 0) {
    return (
      <Card className="h-full flex flex-col border-0 shadow-none rounded-none bg-neutral-50/50">
        <CardHeader className="py-3 px-4 shrink-0">
          <CardTitle className="text-sm">Phân bổ Danh mục</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-0 px-4 pb-4">
          <p className="text-xs text-muted-foreground">Chưa có cổ phiếu</p>
        </CardContent>
      </Card>
    );
  }

  const { chartData, totalValue } = useMemo(() => {
    const validStocks = stocks.filter((s) => s.currentValue > 0).sort((a, b) => b.currentValue - a.currentValue);
    const total = validStocks.reduce((sum, s) => sum + s.currentValue, 0);
    
    return {
      totalValue: total,
      chartData: validStocks.map((stock) => ({
        ...stock,
        value: stock.currentValue,
        weight: total > 0 ? ((stock.currentValue / total) * 100).toFixed(2) : '0.00'
      }))
    };
  }, [stocks]);

  const topStocks = chartData.slice(0, 4);
  const othersWeight = chartData.slice(4).reduce((sum, s) => sum + parseFloat(s.weight), 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null; // Don't show label for very small slices
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        className="text-[11px] font-bold"
      >
        {chartData[index].symbol}
      </text>
    );
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-3 px-4 shrink-0 border-b border-transparent">
        <CardTitle className="text-sm">Phân bổ Danh mục</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 flex flex-col lg:flex-row items-center h-full">
        
        {/* Left Column: Portfolio Summary */}
        <div className="w-full lg:w-[45%] h-auto lg:h-full flex flex-col justify-center px-4 py-4 lg:py-0 border-b lg:border-b-0 lg:border-r border-neutral-100/60 order-2 lg:order-1">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-neutral-800 mb-3">Tổng quan Danh mục</p>
              
              <div className="flex justify-between lg:block mb-3">
                <p className="text-[10px] text-neutral-500 font-medium mb-0.5">Tổng giá trị</p>
                <p className="text-base font-bold text-neutral-900">{formatCurrency(totalValue)}</p>
              </div>
              
              <div className="flex justify-between lg:block mb-4">
                <p className="text-[10px] text-neutral-500 font-medium mb-0.5">Số lượng Cổ phiếu</p>
                <p className="text-sm font-bold text-neutral-900">{stocks.length}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-neutral-500 font-medium mb-2">Tỷ trọng Phân bổ %</p>
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] pr-2">
                {topStocks.map((stock, index) => (
                  <div key={stock.symbol} className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-neutral-700">{stock.symbol}</span>
                    <span className="text-neutral-500 font-medium">{stock.weight}%</span>
                  </div>
                ))}
                {othersWeight > 0 && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-neutral-700">Khác</span>
                    <span className="text-neutral-500 font-medium">{othersWeight.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pie Chart */}
        <div className="w-full lg:w-[55%] min-h-[200px] lg:min-h-0 lg:h-full relative order-1 lg:order-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="75%"
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
      </CardContent>
    </Card>
  );
}

