'use client';

import React, { useMemo } from 'react';
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
    const data = payload[0].payload?.payload || payload[0].payload;
    const color = payload[0].color || payload[0].fill || payload[0].payload?.fill;
    
    if (!data) return null;

    return (
      <div className="bg-black text-neutral-100 p-2 rounded-none text-xs shadow-none border border-neutral-800 z-50">
        <div className="flex items-center font-bold mb-1 text-xs uppercase tracking-widest text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-none mr-2 inline-block" style={{ backgroundColor: color }}></span>
          {data.symbol}
        </div>
        <div className={`font-mono font-bold mb-1.5 text-xs ${data.profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
          {data.profit > 0 ? '+' : ''}{formatCurrency(data.profit)} ({data.profitPercent > 0 ? '+' : ''}{data.profitPercent.toFixed(2)}%)
        </div>
        <div className="text-neutral-500 space-y-0.5 text-[10px] uppercase tracking-widest font-bold">
          <div className="flex justify-between gap-4">Tỷ trọng: <span className="text-neutral-300 font-mono">{data.weight}%</span></div>
          <div className="flex justify-between gap-4">GT hiện tại: <span className="text-neutral-300 font-mono">{formatCurrency(data.currentValue)}</span></div>
          <div className="flex justify-between gap-4">KL mở: <span className="text-neutral-300 font-mono">{data.quantity.toLocaleString()}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export const StockPieChart = React.memo(function StockPieChart({ stocks }: { stocks: StockWithQuote[] }) {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[300px] bg-black p-6 text-center border border-neutral-800 rounded-none">
        <p className="text-xs font-mono font-bold text-neutral-600">NO STOCKS</p>
      </div>
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
        {chartData[index]?.symbol}
      </text>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0">
        {/* Left Column: Portfolio Summary */}
        <div className="w-full lg:w-[45%] h-auto lg:h-full flex flex-col justify-center px-6 py-4 lg:py-0 border-b lg:border-b-0 lg:border-r border-neutral-100/60 order-2 lg:order-1">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-neutral-800 mb-3">Tổng quan Phân bổ</p>
              
              <div className="flex justify-between lg:block mb-3">
                <p className="text-xs text-neutral-500 font-medium mb-0.5">Tổng giá trị danh mục</p>
                <p className="text-lg font-bold text-neutral-900">{formatCurrency(totalValue)}</p>
              </div>
              
              <div className="flex justify-between lg:block mb-4">
                <p className="text-xs text-neutral-500 font-medium mb-0.5">Số lượng mã nắm giữ</p>
                <p className="text-base font-bold text-neutral-900">{stocks.length}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 font-medium mb-2">Tỷ trọng Phân bổ %</p>
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[150px] pr-2">
                {topStocks.map((stock, index) => (
                  <div key={stock.symbol} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-none relative overflow-hidden bg-neutral-800 flex items-center justify-center text-[8px] text-white">
                        <span className="z-0 relative">{stock.symbol.charAt(0)}</span>
                        <img 
                          src={stock.custom_logo || `https://static.tcbs.com.vn/company/logo/${stock.symbol}.png`} 
                          alt={stock.symbol} 
                          className="absolute inset-0 w-full h-full object-cover bg-white z-10"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      {stock.symbol}
                    </span>
                    <span className="text-neutral-500 font-medium">{stock.weight}%</span>
                  </div>
                ))}
                {othersWeight > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-700">Khác</span>
                    <span className="text-neutral-500 font-medium">{othersWeight.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pie Chart */}
        <div className="w-full lg:w-[55%] min-h-[300px] lg:min-h-0 lg:h-full relative order-1 lg:order-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
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
        
    </div>
  );
});
