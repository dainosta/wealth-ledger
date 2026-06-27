'use client';

import React, { useState } from 'react';
import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import {
  LineChart,
  Line,
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
  embedded?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-3 rounded-none border border-neutral-800 text-sm z-50 shadow-none">
        <p className="font-bold text-neutral-500 mb-2 text-xs uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: entry.color }}></span>
              <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">{entry.name}</span>
              <span className="font-mono font-bold text-neutral-100 ml-auto pl-4">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const NetWorthChart = React.memo(function NetWorthChart({ data, embedded }: NetWorthChartProps) {
  const [filter, setFilter] = useState<'6M' | 'YTD' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL'>('ALL');

  if (!data || data.length === 0) {
    return (
      <Card className="h-full flex flex-col shadow-none border-0 bg-black animate-pulse rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
          <div className="h-4 bg-neutral-900 w-32 rounded-none"></div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="h-full w-full bg-neutral-900 rounded-none"></div>
        </CardContent>
      </Card>
    );
  }

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
        {!embedded && <CardTitle className="text-sm">Lịch sử tài sản</CardTitle>}
        <div className="flex gap-0 bg-neutral-900 border border-neutral-800 p-0.5 rounded-none">
          {['6M', 'YTD', '1Y', '2Y', '3Y', '5Y', 'ALL'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-[9px] font-bold px-3 py-1 rounded-none transition-all uppercase tracking-widest ${filter === f ? 'bg-black text-neutral-100 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300 border border-transparent'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4 pb-4 pt-2">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#262626" />
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
              <Line
                type="monotone"
                dataKey="Tài sản ròng"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff', fill: '#059669' }}
              />
              <Line
                type="monotone"
                dataKey="Danh mục cổ phiếu"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
