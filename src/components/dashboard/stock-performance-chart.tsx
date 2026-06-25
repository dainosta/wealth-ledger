'use client';

import React, { useState } from 'react';
import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StockPerformanceChartProps {
  data: CalculatedMonthlyRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const costBasis = payload.find((p: any) => p.dataKey === 'Vốn đầu tư')?.value || 0;
    const marketValue = payload.find((p: any) => p.dataKey === 'Giá trị thị trường')?.value || 0;
    const profit = marketValue - costBasis;
    const roi = costBasis > 0 ? (profit / costBasis) * 100 : 0;

    return (
      <div className="bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 text-sm z-50">
        <p className="font-semibold text-neutral-500 mb-2 text-xs">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-neutral-600 font-medium">{entry.name}</span>
              <span className="font-bold text-neutral-900 ml-auto pl-4">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-neutral-600 font-medium text-xs">Lỗ/Lãi:</span>
          <div className="text-right">
            <span className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
            </span>
            <span className={`text-[10px] ml-1 font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ({profit >= 0 ? '+' : ''}{roi.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StockPerformanceChart = React.memo(function StockPerformanceChart({ data }: StockPerformanceChartProps) {
  const [filter, setFilter] = useState<'6M' | 'YTD' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL'>('ALL');

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col p-4 bg-white animate-pulse">
        <div className="h-full w-full bg-neutral-200/50 rounded-xl"></div>
      </div>
    );
  }

  const getFilteredData = () => {
    if (filter === 'ALL') return data;
    
    const now = new Date();
    let monthsToSubtract = 0;
    
    switch (filter) {
      case '6M': monthsToSubtract = 6; break;
      case '1Y': monthsToSubtract = 12; break;
      case '2Y': monthsToSubtract = 24; break;
      case '3Y': monthsToSubtract = 36; break;
      case '5Y': monthsToSubtract = 60; break;
      case 'YTD': 
        monthsToSubtract = now.getMonth();
        break;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);

    return data.filter(record => {
      const [month, year] = record.month_year.split('-');
      const recordDate = new Date(parseInt(year), parseInt(month) - 1);
      return recordDate >= cutoffDate;
    });
  };

  const chartData = getFilteredData().map(record => ({
    name: record.month_year,
    'Vốn đầu tư': record.stock_cost_basis || 0,
    'Giá trị thị trường': record.portfolio_value || 0,
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="py-3 px-4 shrink-0 flex flex-row items-center justify-end border-b border-transparent">
        <div className="flex gap-1 bg-neutral-100/80 p-1 rounded-lg">
          <button 
            onClick={() => setFilter('6M')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === '6M' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            6M
          </button>
          <button 
            onClick={() => setFilter('YTD')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === 'YTD' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            YTD
          </button>
          <button 
            onClick={() => setFilter('1Y')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === '1Y' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            1Y
          </button>
          <button 
            onClick={() => setFilter('2Y')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === '2Y' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            2Y
          </button>
          <button 
            onClick={() => setFilter('ALL')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            ALL
          </button>
        </div>
      </div>
      <div className="flex-1 pb-4 px-4 pt-2">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
                tickMargin={12}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                width={60}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
              <Area
                type="monotone"
                dataKey="Vốn đầu tư"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorCost)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Giá trị thị trường"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorMarket)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
