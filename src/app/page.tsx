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

export default function Home() {
  const { records, loading: recordsLoading } = useRecords();
  const stocksData = useStocks();

  if (recordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-100/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-2xl font-extrabold tracking-tight">Wealth Ledger</h2>
        <div className="flex items-center space-x-2">
          <BackupManager />
          <ImportCsvButton />
          <ExportCsvButton />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="shrink-0 mb-3">
        <SummaryCards data={records} stocks={stocksData.stocks} />
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* Left Col: Ledger */}
        <div className="col-span-4 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border overflow-hidden">
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

        {/* Right Col: Charts & Stocks */}
        <div className="col-span-8 flex flex-col gap-3 min-h-0">
          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-3 h-[340px] shrink-0">
             <div className="col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
               <NetWorthChart data={records} />
             </div>
             <div className="col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden">
               <StockPieChart stocks={stocksData.stocks} />
             </div>
          </div>

          {/* Stock Portfolio Row */}
          <div className="flex-1 min-h-0 flex flex-col">
            <StockPortfolio stocksData={stocksData} />
          </div>
        </div>
      </div>
    </div>
  );
}
