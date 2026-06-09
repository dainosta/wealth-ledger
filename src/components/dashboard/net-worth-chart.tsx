'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NetWorthChartProps {
  data: CalculatedMonthlyRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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
      </div>
    );
  }
  return null;
};

export function NetWorthChart({ data }: NetWorthChartProps) {
  const [filter, setFilter] = useState<'6M' | 'YTD' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL'>('ALL');

  if (!data || data.length === 0) return null;

  const getFilteredData = () => {
    if (filter === 'ALL') return data;
    
    // Assumes data is already sorted chronologically
    const lastRecord = data[data.length - 1];
    const [lastMonth, lastYear] = lastRecord.month_year.split('-');

    if (filter === 'YTD') {
      return data.filter(d => {
        const [, y] = d.month_year.split('-');
        return y === lastYear;
      });
    }

    if (filter === '6M') {
      return data.slice(Math.max(data.length - 6, 0));
    }
    if (filter === '1Y') {
      return data.slice(Math.max(data.length - 12, 0));
    }
    if (filter === '2Y') {
      return data.slice(Math.max(data.length - 24, 0));
    }
    if (filter === '3Y') {
      return data.slice(Math.max(data.length - 36, 0));
    }
    if (filter === '5Y') {
      return data.slice(Math.max(data.length - 60, 0));
    }

    return data;
  };

  const filteredData = getFilteredData();

  const chartData = filteredData.map((record) => ({
    name: record.month_year,
    'Tài sản ròng': record.net_worth,
    'Danh mục cổ phiếu': record.portfolio_value,
  }));

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none relative">
      <CardHeader className="py-3 px-4 shrink-0 flex flex-row items-center justify-between border-b border-transparent">
        <CardTitle className="text-sm">Lịch sử tài sản</CardTitle>
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
            onClick={() => setFilter('3Y')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === '3Y' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            3Y
          </button>
          <button 
            onClick={() => setFilter('5Y')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === '5Y' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            5Y
          </button>
          <button 
            onClick={() => setFilter('ALL')}
            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            ALL
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4 pb-4 pt-2">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
                tickMargin={8}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                width={55}
                tickMargin={5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              <Area
                type="monotone"
                dataKey="Tài sản ròng"
                stroke="#059669"
                fillOpacity={1}
                fill="url(#colorNetWorth)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
              <Area
                type="monotone"
                dataKey="Danh mục cổ phiếu"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
