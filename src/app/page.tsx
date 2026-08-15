'use client';
import { useState } from 'react';
import { useRecords } from '@/hooks/use-records';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { AssetAllocationChart } from '@/components/dashboard/asset-allocation-chart';

import { DataTable } from '@/components/ledger/data-table';
import { columns } from '@/components/ledger/columns';
import { AddRecordDialog } from '@/components/ledger/add-record-dialog';

import { StockPortfolio } from '@/components/stocks/stock-portfolio';
import { CashLoansTable } from '@/components/loans/cash-loans-table';

import { useStocks } from '@/hooks/use-stocks';
import { useLoans } from '@/hooks/use-loans';

import { useRealtimeNetWorth } from '@/hooks/use-realtime-net-worth';
import { GoalProgress } from '@/components/dashboard/goal-progress';
import { BackupManager } from '@/components/ledger/backup-manager';
import { ImportCsvButton } from '@/components/ledger/import-csv-button';
import { ExportCsvButton } from '@/components/ledger/export-csv-button';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  const { records, loading: recordsLoading } = useRecords();
  const stocksData = useStocks();
  const loansData = useLoans();
  const isAppLoading = recordsLoading || !stocksData.initialized || loansData.loading;
  
  const { realtimeNetWorth, totalStockValue, liveCashBalance, liveGoldDebt, liveGoldPrice, goldDebtCostBasis, goldDebtProfitLoss, currentMonth } = useRealtimeNetWorth(records, stocksData.stocks);

  const [activeTab, setActiveTab] = useState<'net-worth' | 'allocation' | 'stocks' | 'loans'>('net-worth');

  // No global loading blocking the layout, allowing individual components to handle loading and preserving animations.

  return (
    <div className="flex lg:h-screen min-h-screen flex-col lg:overflow-hidden overflow-auto p-2 md:p-4">
      {/* Top Bar with Brand and Actions */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-2 font-bold text-lg text-emerald-400 tracking-widest uppercase">
          <div className="w-8 h-8 rounded-none border border-emerald-500 bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono">W</div>
          <span className="hidden sm:inline">Wealth Ledger</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
          <BackupManager />
          <ImportCsvButton />
          <ExportCsvButton />
          <div className="w-px h-6 bg-neutral-800 mx-1 sm:mx-2 shrink-0" />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-400 hover:text-white rounded-none hover:bg-neutral-900 font-mono text-xs shrink-0">
            <LogOutIcon className="h-4 w-4 mr-2" /> EXIT
          </Button>
        </div>
      </div>

      {/* Top Widgets Row */}
      <div className="shrink-0 mb-3 animate-fade-in-down">
        <SummaryCards data={records} stocks={stocksData.stocks} isLoading={isAppLoading} />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:min-h-0 lg:overflow-hidden animate-fade-in-up delay-100">
        
        {/* Left Col: Ledger (Order 2 on mobile) */}
        <div className="lg:col-span-3 flex flex-col gap-3 lg:min-h-0 order-2 lg:order-1">
          {/* Ledger */}
          <div className="flex-1 flex flex-col bg-[#0a0a0a] rounded-none shadow-none border border-neutral-800 overflow-hidden min-h-[400px] lg:min-h-0">
            <div className="flex items-center justify-between p-2 border-b border-neutral-800 bg-neutral-900/50 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Sổ cái (Ledger)</h3>
              <AddRecordDialog loans={loansData.loans} />
            </div>
            <div className="flex-1 overflow-auto p-0 relative">
              <div className="absolute inset-0">
                <DataTable columns={columns} data={[...records].reverse()} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Goal Progress, Charts & Stocks (Order 1 on mobile) */}
        <div className="lg:col-span-9 flex flex-col gap-3 lg:min-h-0 order-1 lg:order-2">
          {/* Goal Progress */}
          <div className="shrink-0">
            <GoalProgress currentNetWorth={realtimeNetWorth} isLoading={isAppLoading} />
          </div>

          {/* Main Workspace Tabs */}
          {isAppLoading ? (
            <div className="flex-1 lg:min-h-0 flex flex-col min-h-[400px] lg:min-h-0 bg-black rounded-none shadow-none border border-neutral-800 overflow-hidden animate-pulse">
              <div className="h-10 bg-neutral-900/50 border-b border-neutral-800 shrink-0"></div>
              <div className="flex-1 bg-black p-4">
                <div className="h-full w-full bg-neutral-900/20"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 lg:min-h-0 flex flex-col min-h-[400px] lg:min-h-0 bg-[#0a0a0a] rounded-none shadow-none border border-neutral-800 overflow-hidden">
              <div className="flex border-b border-neutral-800 bg-[#0a0a0a] pt-2 px-2 shrink-0 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button 
                  className={`pb-2 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 relative top-[1px] ${activeTab === 'net-worth' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                  onClick={() => setActiveTab('net-worth')}
                >
                  Lịch sử tài sản ròng
                </button>
                <button 
                  className={`pb-2 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 relative top-[1px] ${activeTab === 'allocation' ? 'border-purple-500 text-purple-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                  onClick={() => setActiveTab('allocation')}
                >
                  Cơ cấu tài sản
                </button>

                <button 
                  className={`pb-2 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 relative top-[1px] ${activeTab === 'stocks' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                  onClick={() => setActiveTab('stocks')}
                >
                  Danh mục Cổ phiếu
                </button>
                <button 
                  className={`pb-2 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 relative top-[1px] ${activeTab === 'loans' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                  onClick={() => setActiveTab('loans')}
                >
                  Quản lý Khoản Vay
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative p-0 bg-black">
                {activeTab === 'net-worth' && (
                  <div className="absolute inset-0">
                    <NetWorthChart data={records} embedded={true} />
                  </div>
                )}
                {activeTab === 'allocation' && (
                  <div className="absolute inset-0 p-4">
                    <AssetAllocationChart 
                      cash={liveCashBalance} 
                      stocks={totalStockValue} 
                      gold={liveGoldDebt} 
                    />
                  </div>
                )}

                {activeTab === 'stocks' && (
                  <div className="absolute inset-0">
                    <StockPortfolio stocksData={stocksData} />
                  </div>
                )}
                {activeTab === 'loans' && (
                  <div className="absolute inset-0">
                    <CashLoansTable 
                      loansData={loansData} 
                      goldPrice={liveGoldPrice} 
                      goldDebtCostBasis={goldDebtCostBasis} 
                      goldDebtProfitLoss={goldDebtProfitLoss}
                      goldDebtQty={currentMonth?.gold_debt_qty || 0}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
