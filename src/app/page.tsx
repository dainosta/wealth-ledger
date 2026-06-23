'use client';

import { useRecords } from '@/hooks/use-records';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { DataTable } from '@/components/ledger/data-table';
import { columns } from '@/components/ledger/columns';
import { AddRecordDialog } from '@/components/ledger/add-record-dialog';

import { StockPortfolio } from '@/components/stocks/stock-portfolio';
import { CashLoansTable } from '@/components/loans/cash-loans-table';

import { useStocks } from '@/hooks/use-stocks';
import { useLoans } from '@/hooks/use-loans';

import { useRealtimeNetWorth } from '@/hooks/use-realtime-net-worth';
import { GoalProgress } from '@/components/dashboard/goal-progress';

export default function Home() {
  const { records, loading: recordsLoading } = useRecords();
  const stocksData = useStocks();
  const loansData = useLoans();
  const isAppLoading = recordsLoading || !stocksData.initialized || loansData.loading;
  
  const { realtimeNetWorth } = useRealtimeNetWorth(records, stocksData.stocks);

  const [activeTab, setActiveTab] = React.useState<'stocks' | 'loans'>('stocks');

  // No global loading blocking the layout, allowing individual components to handle loading and preserving animations.

  return (
    <div className="flex lg:h-screen min-h-screen flex-col lg:overflow-hidden overflow-auto bg-neutral-100/50 p-2 md:p-4">
      {/* Main Grid: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:min-h-0 lg:overflow-hidden animate-fade-in-up delay-100">
        
        {/* Left Col: Summary Cards & Ledger (Order 2 on mobile) */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:min-h-0 order-2 lg:order-1">
          {/* Summary Cards */}
          <div className="shrink-0">
            <SummaryCards data={records} stocks={stocksData.stocks} isLoading={isAppLoading} />
          </div>

          {/* Ledger */}
          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between p-3 border-b bg-neutral-50 shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600">Sổ cái (Ledger)</h3>
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
            <GoalProgress currentNetWorth={realtimeNetWorth} isLoading={isAppLoading} />
          </div>

          {/* Charts Row */}
          <div className="shrink-0 mb-3 h-[450px]">
             <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-full">
               <NetWorthChart data={records} />
             </div>
          </div>

          {/* Portfolio & Loans Tabs */}
          <div className="flex-1 lg:min-h-0 flex flex-col min-h-[400px] lg:min-h-0 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="flex border-b bg-neutral-50/50 p-1 shrink-0">
              <button 
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'stocks' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'}`}
                onClick={() => setActiveTab('stocks')}
              >
                Danh mục Cổ phiếu
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'loans' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'}`}
                onClick={() => setActiveTab('loans')}
              >
                Quản lý Khoản Vay
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative p-0">
              {activeTab === 'stocks' ? (
                <div className="absolute inset-0">
                  <StockPortfolio stocksData={stocksData} />
                </div>
              ) : (
                <div className="absolute inset-0">
                  <CashLoansTable loansData={loansData} />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      
      {/* Floating Action Button for Chốt Sổ */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddRecordDialog loans={loansData.loans} />
      </div>
    </div>
  );
}
