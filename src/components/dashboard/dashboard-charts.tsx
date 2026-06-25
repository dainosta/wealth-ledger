'use client';

import React, { useState } from 'react';
import { CalculatedMonthlyRecord } from '@/types';
import { NetWorthChart } from './net-worth-chart';
import { StockPerformanceChart } from './stock-performance-chart';

interface DashboardChartsProps {
  data: CalculatedMonthlyRecord[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const [activeChart, setActiveChart] = useState<'net-worth' | 'stock-performance'>('net-worth');

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-full flex flex-col">
      <div className="flex border-b bg-neutral-50/50 p-1 shrink-0">
        <button 
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeChart === 'net-worth' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'}`}
          onClick={() => setActiveChart('net-worth')}
        >
          Lịch sử tài sản ròng
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeChart === 'stock-performance' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'}`}
          onClick={() => setActiveChart('stock-performance')}
        >
          Hiệu quả cổ phiếu
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {activeChart === 'net-worth' ? (
          <NetWorthChart data={data} embedded={true} />
        ) : (
          <StockPerformanceChart data={data} />
        )}
      </div>
    </div>
  );
}
