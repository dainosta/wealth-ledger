'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { CoinsIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';
import { StockWithQuote } from '@/hooks/use-stocks';
import { useGold } from '@/hooks/use-gold';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';

import { useRealtimeNetWorth } from '@/hooks/use-realtime-net-worth';

interface SummaryCardsProps {
  data: CalculatedMonthlyRecord[];
  stocks: StockWithQuote[];
  isLoading?: boolean;
}

export function SummaryCards({ data, stocks, isLoading = false }: SummaryCardsProps) {
  const {
    realtimeNetWorth,
    totalStockValue,
    liveGoldDebt,
    liveCashDebt,
    liveCreditCardDebt,
    liveCashBalance,
    realtimeMoMChange,
    goldDebtCostBasis,
    goldDebtProfitLoss,
    liveGoldPrice: displayGoldPrice,
    worldGoldPrice,
    worldGoldChange,
    currentMonth,
    previousMonth
  } = useRealtimeNetWorth(data, stocks);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* Skeleton 1: Net Worth */}
          <Card className="col-span-2 lg:col-span-1 bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col justify-end"><div className="h-7 bg-neutral-200 w-32 rounded mb-1"></div><div className="h-3 bg-neutral-200 w-20 rounded"></div></CardContent>
          </Card>
          {/* Skeleton 2: Stocks */}
          <Card className="col-span-1 bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col justify-end"><div className="h-7 bg-neutral-200 w-32 rounded mb-1"></div><div className="h-3 bg-neutral-200 w-20 rounded"></div></CardContent>
          </Card>
          {/* Skeleton 3: Cash */}
          <Card className="col-span-1 bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col justify-end"><div className="h-7 bg-neutral-200 w-32 rounded mb-1"></div><div className="h-3 bg-neutral-200 w-20 rounded"></div></CardContent>
          </Card>
          {/* Skeleton 4: Total Debt */}
          <Card className="col-span-2 lg:col-span-2 bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col">
              <div className="h-7 bg-neutral-200 w-32 rounded mb-3 mt-1"></div>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex justify-between"><div className="h-3 bg-neutral-200 w-20 rounded"></div><div className="h-3 bg-neutral-200 w-16 rounded"></div></div>
                <div className="h-6 bg-neutral-200 w-full rounded mt-1"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sparkline Data
  const netWorthHistory = data.map(d => ({ value: d.net_worth }));
  const stockHistory = data.map(d => ({ value: d.portfolio_value }));
  const debtHistory = data.map(d => ({ value: d.gold_debt_value + (d.cash_debt || 0) + (d.credit_card_debt || 0) }));
  return (
    <div className="flex flex-col w-full h-full">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
        {/* Net Worth Card */}
      <Card className="col-span-2 lg:col-span-1 bg-black border-neutral-800 rounded-none shadow-none relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase">Tài sản ròng</CardTitle>
          <WalletIcon className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="text-2xl md:text-3xl lg:text-4xl font-mono font-bold text-emerald-400 tracking-tight">
            <CountUp end={realtimeNetWorth} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
          </div>
          <div className="mt-0.5">
            <p className="text-[10px] text-neutral-500 font-bold flex items-center">
              {previousMonth ? (
                <>
                  <span className={`flex items-center font-mono ${realtimeMoMChange >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {formatPercent(realtimeMoMChange)}
                  </span>
                  <span className="ml-1 opacity-80 uppercase tracking-widest">so với tháng trước</span>
                </>
              ) : (
                <span className="opacity-80">Không có dữ liệu</span>
              )}
            </p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthHistory} margin={{ top: 10, right: 3, left: 3, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#059669" 
                strokeWidth={2} 
                fill="url(#colorNetWorth)" 
                isAnimationActive={false}
                activeDot={false}
                dot={(props: any) => props.index === netWorthHistory.length - 1 ? <circle key="dot" cx={props.cx} cy={props.cy} r={3} fill="#059669" stroke="#fff" strokeWidth={1.5} /> : null}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Stock Portfolio Card */}
      <Card className="col-span-1 bg-black border-neutral-800 rounded-none shadow-none relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase">Cổ phiếu</CardTitle>
          <TrendingUpIcon className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="text-xl font-mono font-bold text-neutral-100">
            <CountUp end={totalStockValue} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
          </div>
          <div className="mt-0.5">
            <p className="text-[10px] text-blue-600 opacity-80 font-medium">
              Cập nhật tự động (Live)
            </p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stockHistory} margin={{ top: 10, right: 3, left: 3, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2} 
                fill="url(#colorStock)" 
                isAnimationActive={false}
                activeDot={false}
                dot={(props: any) => props.index === stockHistory.length - 1 ? <circle key="dot" cx={props.cx} cy={props.cy} r={3} fill="#2563eb" stroke="#fff" strokeWidth={1.5} /> : null}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cash Balance Card */}
      <Card className="col-span-1 bg-black border-neutral-800 rounded-none shadow-none relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase">Tiền mặt</CardTitle>
          <LandmarkIcon className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="text-xl font-mono font-bold text-neutral-100">
            <CountUp end={liveCashBalance} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
          </div>
          <div className="mt-0.5">
            <p className="text-[10px] text-neutral-500 opacity-80 font-medium">
              Ví, ATM, Tiết kiệm...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Debt Card */}
      <Card className="col-span-2 bg-black border-neutral-800 rounded-none shadow-none relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-bold text-neutral-400 uppercase">Tổng Nợ</CardTitle>
          <CoinsIcon className="h-5 w-5 text-neutral-400" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
            <div className="text-xl font-mono font-bold text-neutral-100 z-20 relative flex flex-col">
              <CountUp end={liveGoldDebt + liveCashDebt + liveCreditCardDebt} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-0 z-20 relative mt-2 border border-neutral-800">
            <div className="flex flex-col bg-neutral-900/50 p-2 border-r border-neutral-800 relative">
              <span className="text-[10px] font-bold text-amber-500/80 uppercase flex items-center tracking-widest">
                Nợ Vàng
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm mt-0.5">{formatCurrency(liveGoldDebt)}</span>
              {(currentMonth?.gold_debt_qty || 0) > 0 && goldDebtCostBasis > 0 && (
                <div className="mt-0.5">
                  <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-none ${goldDebtProfitLoss > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {goldDebtProfitLoss > 0 ? '+' : ''}{formatCurrency(goldDebtProfitLoss)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-neutral-500">
                <span>{currentMonth?.gold_debt_qty || 0} lg</span>
                <span>{formatCurrency(displayGoldPrice)}/l</span>
              </div>
            </div>
            <div className="flex flex-col bg-neutral-900/50 p-2 border-r border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center tracking-widest">
                Vay Tiền mặt
              </span>
              <span className="font-mono font-bold text-neutral-300 text-sm mt-0.5">{formatCurrency(liveCashDebt)}</span>
            </div>
            <div className="flex flex-col bg-neutral-900/50 p-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center tracking-widest">
                Thẻ tín dụng
              </span>
              <span className="font-mono font-bold text-neutral-300 text-sm mt-0.5">{formatCurrency(liveCreditCardDebt)}</span>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={debtHistory} margin={{ top: 10, right: 3, left: 3, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#e11d48" 
                strokeWidth={2} 
                fill="url(#colorDebt)" 
                isAnimationActive={false}
                activeDot={false}
                dot={(props: any) => props.index === debtHistory.length - 1 ? <circle key="dot" cx={props.cx} cy={props.cy} r={3} fill="#e11d48" stroke="#fff" strokeWidth={1.5} /> : null}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>
    </div>
  );
}
