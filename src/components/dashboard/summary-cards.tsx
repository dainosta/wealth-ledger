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
          <Card className="bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col justify-end"><div className="h-7 bg-neutral-200 w-32 rounded mb-1"></div><div className="h-3 bg-neutral-200 w-20 rounded"></div></CardContent>
          </Card>
          {/* Skeleton 2: Stocks */}
          <Card className="bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
            <CardHeader className="pb-0 pt-3 flex-row items-center justify-between"><div className="h-4 bg-neutral-200 w-24 rounded"></div><div className="w-4 h-4 bg-neutral-200 rounded-full"></div></CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col justify-end"><div className="h-7 bg-neutral-200 w-32 rounded mb-1"></div><div className="h-3 bg-neutral-200 w-20 rounded"></div></CardContent>
          </Card>
          {/* Skeleton 3: Total Debt (Taller, col-span-2) */}
          <Card className="col-span-2 bg-neutral-100 border-neutral-200 shadow-sm relative overflow-hidden animate-pulse flex flex-col">
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
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Net Worth Card */}
      <Card className="bg-emerald-50/60 border-emerald-200/60 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-semibold text-emerald-800 uppercase">Tài sản ròng</CardTitle>
          <WalletIcon className="h-3.5 w-3.5 text-emerald-600" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="text-xl font-bold text-emerald-700">
            <CountUp end={realtimeNetWorth} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
          </div>
          <div className="mt-0.5">
            <p className="text-[10px] text-emerald-600 font-medium flex items-center">
              {previousMonth ? (
                <>
                  <span className={`flex items-center ${realtimeMoMChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(realtimeMoMChange)}
                  </span>
                  <span className="ml-1 opacity-80">so với tháng trước</span>
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
      <Card className="bg-blue-50/60 border-blue-200/60 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-semibold text-blue-800 uppercase">Danh mục Cổ phiếu</CardTitle>
          <TrendingUpIcon className="h-3.5 w-3.5 text-blue-600" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="text-xl font-bold text-blue-700">
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

      {/* Total Debt Card */}
      <Card className="col-span-2 bg-white border-neutral-200 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 z-10 relative">
          <CardTitle className="text-xs font-semibold text-neutral-800 uppercase">Tổng Nợ</CardTitle>
          <CoinsIcon className="h-3.5 w-3.5 text-neutral-500" />
        </CardHeader>
        <CardContent className="pb-3 z-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
            <div className="text-2xl font-bold text-neutral-900 z-20 relative flex flex-col">
              <CountUp end={liveGoldDebt + liveCashDebt + liveCreditCardDebt} separator="." decimal="," suffix=" ₫" duration={1.5} preserveValue />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 z-20 relative mt-2">
            <div className="flex flex-col bg-neutral-50/80 p-2 rounded-lg border border-neutral-100 hover:border-rose-200 transition-colors group relative cursor-help">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                Nợ Vàng
              </span>
              <span className="font-bold text-rose-700 text-sm mt-0.5">{formatCurrency(liveGoldDebt)}</span>
              <div className="flex items-center justify-between mt-1 text-[9px] text-neutral-500">
                <span>{currentMonth?.gold_debt_qty || 0} lượng</span>
                <span>{formatCurrency(displayGoldPrice)}/lượng</span>
              </div>
              {/* Tooltip for Cost Basis */}
              {(currentMonth?.gold_debt_qty || 0) > 0 && goldDebtCostBasis > 0 && (
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-[10px] p-2 rounded -top-12 left-0 min-w-40 z-50 pointer-events-none shadow-xl">
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-300">Giá vốn vay:</span>
                    <span className="font-semibold">{formatCurrency(goldDebtCostBasis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Lãi/Lỗ:</span>
                    <span className={`font-semibold ${goldDebtProfitLoss < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {goldDebtProfitLoss < 0 ? '' : '+'}{formatCurrency(goldDebtProfitLoss)}
                    </span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute w-2 h-2 bg-neutral-800 rotate-45 -bottom-1 left-4"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col bg-neutral-50/80 p-2 rounded-lg border border-neutral-100 hover:border-amber-200 transition-colors">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                Vay Tiền mặt
              </span>
              <span className="font-bold text-amber-700 text-sm mt-0.5">{formatCurrency(liveCashDebt)}</span>
            </div>
            <div className="flex flex-col bg-neutral-50/80 p-2 rounded-lg border border-neutral-100 hover:border-violet-200 transition-colors">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5"></span>
                Thẻ tín dụng
              </span>
              <span className="font-bold text-violet-700 text-sm mt-0.5">{formatCurrency(liveCreditCardDebt)}</span>
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
