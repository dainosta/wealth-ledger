'use client';

import { useRecords } from '@/hooks/use-records';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { DataTable } from '@/components/ledger/data-table';
import { columns } from '@/components/ledger/columns';
import { AddRecordDialog } from '@/components/ledger/add-record-dialog';
import { ImportCsvButton } from '@/components/ledger/import-csv-button';
import { ExportCsvButton } from '@/components/ledger/export-csv-button';
import { BackupManager } from '@/components/ledger/backup-manager';

import { StockPortfolio } from '@/components/stocks/stock-portfolio';
import { StockPieChart } from '@/components/stocks/stock-pie-chart';

import { useStocks } from '@/hooks/use-stocks';

import { useRealtimeNetWorth } from '@/hooks/use-realtime-net-worth';
import { GoalProgress } from '@/components/dashboard/goal-progress';

export default function Home() {
  const { records, loading: recordsLoading } = useRecords();
  const stocksData = useStocks();
  const isAppLoading = recordsLoading || !stocksData.initialized;
  
  const { realtimeNetWorth } = useRealtimeNetWorth(records, stocksData.stocks);

  if (isAppLoading) {
    return (
      <div className="flex lg:h-screen min-h-screen flex-col lg:overflow-hidden bg-neutral-100/50 p-2 md:p-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-3 h-8">
          <div className="h-8 w-48 bg-neutral-200/70 animate-pulse rounded-md"></div>
          <div className="h-8 w-32 bg-neutral-200/70 animate-pulse rounded-md"></div>
        </div>
        
        {/* Main Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 flex flex-col gap-3 order-2 lg:order-1">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-2 gap-3 h-[200px]">
              <div className="bg-neutral-200/70 animate-pulse rounded-xl"></div>
              <div className="bg-neutral-200/70 animate-pulse rounded-xl"></div>
              <div className="bg-neutral-200/70 animate-pulse rounded-xl"></div>
              <div className="bg-neutral-200/70 animate-pulse rounded-xl"></div>
            </div>
            {/* Ledger Skeleton */}
            <div className="flex-1 bg-neutral-200/70 animate-pulse rounded-xl min-h-[400px] lg:min-h-0"></div>
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-3 order-1 lg:order-2">
            {/* Goal Progress Skeleton */}
            <div className="h-24 bg-neutral-200/70 animate-pulse rounded-xl"></div>
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[280px]">
              <div className="lg:col-span-2 bg-neutral-200/70 animate-pulse rounded-xl"></div>
              <div className="lg:col-span-1 bg-neutral-200/70 animate-pulse rounded-xl"></div>
            </div>
            {/* Portfolio Skeleton */}
            <div className="flex-1 bg-neutral-200/70 animate-pulse rounded-xl min-h-[400px] lg:min-h-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex lg:h-screen min-h-screen flex-col lg:overflow-hidden overflow-auto bg-neutral-100/50 p-2 md:p-4">
      {/* Header Toolbar */}
      <div className="flex items-center justify-end mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <BackupManager />
          <ImportCsvButton />
          <ExportCsvButton />
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:min-h-0 lg:overflow-hidden">
        
        {/* Left Col: Summary Cards & Ledger (Order 2 on mobile) */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:min-h-0 order-2 lg:order-1">
          {/* Summary Cards */}
          <div className="shrink-0">
            <SummaryCards data={records} stocks={stocksData.stocks} />
          </div>

          {/* Ledger */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between p-3 border-b bg-neutral-50 shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600">Sổ cái (Ledger)</h3>
              <AddRecordDialog />
            </div>
            <div className="flex-1 overflow-auto p-0 relative">
              <div className="absolute inset-0">
                <DataTable columns={columns} data={[...records].reverse()} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Goal Progress, Charts & Stocks (Order 1 on mobile) */}
        <div className="lg:col-span-8 flex flex-col gap-3 lg:min-h-0 order-1 lg:order-2">
          {/* Goal Progress */}
          <div className="shrink-0">
            <GoalProgress currentNetWorth={realtimeNetWorth} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:h-[280px] shrink-0">
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden h-[300px] lg:h-auto">
               <NetWorthChart data={records} />
             </div>
             <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden h-[300px] lg:h-auto">
               <StockPieChart stocks={stocksData.stocks} />
             </div>
          </div>

          {/* Stock Portfolio Row */}
          <div className="flex-1 lg:min-h-0 flex flex-col min-h-[400px] lg:min-h-0">
            <StockPortfolio stocksData={stocksData} />
          </div>
        </div>

      </div>
    </div>
  );
}
