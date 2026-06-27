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
    <div className="bg-[#0a0a0a] rounded-none shadow-none border border-neutral-800 overflow-hidden h-full flex flex-col">
      <div className="flex border-b border-neutral-800 bg-[#0a0a0a] pt-1 px-2 shrink-0 gap-4">
        <button 
          className={`pb-1.5 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative top-[1px] ${activeChart === 'net-worth' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          onClick={() => setActiveChart('net-worth')}
        >
          Lịch sử tài sản ròng
        </button>
        <button 
          className={`pb-1.5 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative top-[1px] ${activeChart === 'stock-performance' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
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
