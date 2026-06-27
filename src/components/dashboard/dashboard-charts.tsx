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
      <div className="flex border-b bg-white pt-2 px-4 shrink-0 gap-6">
        <button 
          className={`pb-2.5 px-1 text-sm font-semibold transition-all border-b-2 relative top-[1px] ${activeChart === 'net-worth' ? 'border-blue-600 text-blue-700' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
          onClick={() => setActiveChart('net-worth')}
        >
          Lịch sử tài sản ròng
        </button>
        <button 
          className={`pb-2.5 px-1 text-sm font-semibold transition-all border-b-2 relative top-[1px] ${activeChart === 'stock-performance' ? 'border-blue-600 text-blue-700' : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'}`}
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
