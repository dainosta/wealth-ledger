'use client';

import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MonthlyChangeChartProps {
  data: CalculatedMonthlyRecord[];
}

export function MonthlyChangeChart({ data }: MonthlyChangeChartProps) {
  if (!data || data.length === 0) return null;

  // Bỏ qua tháng đầu tiên vì không có tháng trước để so sánh (thay đổi = 0)
  const chartData = data.slice(1).map((record) => ({
    name: record.month_year,
    change: record.net_worth_change_value,
  }));

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-3 px-4 shrink-0">
        <CardTitle className="text-sm">Biến động Tài sản</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4 pb-4">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Biến động']}
                labelStyle={{ color: 'black' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="change" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.change >= 0 ? '#10b981' : '#f43f5e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
