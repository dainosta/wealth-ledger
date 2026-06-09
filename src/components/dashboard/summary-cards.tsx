'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { CoinsIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';
import { StockWithQuote } from '@/hooks/use-stocks';
import { useGold } from '@/hooks/use-gold';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';

const GoalProgress = dynamic(
  () => import('./goal-progress').then((mod) => mod.GoalProgress),
  { ssr: false }
);

interface SummaryCardsProps {
  data: CalculatedMonthlyRecord[];
  stocks: StockWithQuote[];
}

export function SummaryCards({ data, stocks }: SummaryCardsProps) {
  const totalStockValue = stocks.reduce((sum, stock) => sum + stock.currentValue, 0);

  if (!data || data.length === 0) return null;

  const currentMonth = data[data.length - 1];
  const previousMonth = data.length > 1 ? data[data.length - 2] : null;

  const { goldPrice: liveGoldPrice } = useGold();
  const displayGoldPrice = liveGoldPrice || currentMonth.gold_price;
  const liveGoldDebt = currentMonth.gold_debt_qty * displayGoldPrice;

  // Real-time Net Worth (Assets are entirely stocks)
  const realtimeNetWorth = totalStockValue - liveGoldDebt;

  // Real-time MoM Change
  let realtimeMoMChange = 0;
  if (previousMonth && previousMonth.net_worth !== 0) {
    realtimeMoMChange = ((realtimeNetWorth - previousMonth.net_worth) / previousMonth.net_worth) * 100;
  }

  // Real-time YTD (Year-to-date)
  const currentYear = currentMonth.month_year.split('-')[1];
  const lastYearEnd = data.find(
    (d) => d.month_year === `12-${parseInt(currentYear) - 1}`
  );
  
  let realtimeYtdGrowth = 0;
  if (lastYearEnd && lastYearEnd.net_worth !== 0) {
    realtimeYtdGrowth = ((realtimeNetWorth - lastYearEnd.net_worth) / lastYearEnd.net_worth) * 100;
  }

  // Sparkline Data
  const netWorthHistory = data.map(d => ({ value: d.net_worth }));
  const stockHistory = data.map(d => ({ value: d.portfolio_value }));
  const debtHistory = data.map(d => ({ value: d.gold_debt_value }));
  const ytdHistory = data.map(d => ({ value: d.net_worth })); // Use net worth trend for YTD card as well

  return (
    <div className="flex flex-col w-full">
      <GoalProgress currentNetWorth={realtimeNetWorth} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Net Worth Card */}
      <Card className="bg-emerald-50/60 border-emerald-200/60 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 z-10 relative">
          <CardTitle className="text-sm font-semibold text-emerald-800">Tài sản ròng</CardTitle>
          <WalletIcon className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent className="pb-4 z-10 relative">
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(realtimeNetWorth)}</div>
          <div className="mt-1">
            <p className="text-xs text-emerald-600 font-medium flex items-center">
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
        <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60 pointer-events-none">
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 z-10 relative">
          <CardTitle className="text-sm font-semibold text-blue-800">Danh mục Cổ phiếu</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="pb-4 z-10 relative">
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="mt-1">
            <p className="text-xs text-blue-600 opacity-80 font-medium">
              Cập nhật tự động (Live)
            </p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60 pointer-events-none">
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

      {/* Gold Debt Card */}
      <Card className="bg-rose-50/60 border-rose-200/60 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 z-10 relative">
          <CardTitle className="text-sm font-semibold text-rose-800">Nợ vàng</CardTitle>
          <CoinsIcon className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent className="pb-4 z-10 relative">
          <div className="text-2xl font-bold text-rose-700 mb-2 z-20 relative">
            {formatCurrency(liveGoldDebt)}
          </div>
          <div className="flex flex-col gap-2 z-20 relative">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700/70">
              <span className="uppercase tracking-wider">Số lượng đang nợ:</span>
              <span className="text-rose-800 font-bold">{currentMonth.gold_debt_qty} lượng</span>
            </div>
            <div className="flex items-center justify-between bg-amber-100/80 px-2.5 py-2 rounded-md border border-amber-200/80">
              <span className="text-[11px] uppercase tracking-wider text-amber-700/90 flex items-center font-bold"><CoinsIcon className="w-3.5 h-3.5 mr-1"/>Giá Live SJC:</span>
              <span className="text-amber-900 font-extrabold text-sm">{formatCurrency(displayGoldPrice)} <span className="text-[11px] font-semibold text-amber-700/80">/ lượng</span></span>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60 pointer-events-none">
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

      {/* YTD Growth Card */}
      <Card className="bg-white border-neutral-200 shadow-sm relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 z-10 relative">
          <CardTitle className="text-sm font-semibold text-neutral-800">Tăng trưởng YTD</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent className="pb-4 z-10 relative">
          <div className="text-2xl font-bold text-neutral-900">
            {formatPercent(realtimeYtdGrowth)}
          </div>
          <div className="mt-1">
            <p className="text-xs text-neutral-500 font-medium">
              So với cuối năm trước
            </p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-40 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ytdHistory} margin={{ top: 10, right: 3, left: 3, bottom: 0 }}>
              <defs>
                <linearGradient id="colorYtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52525b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#52525b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#52525b" 
                strokeWidth={2} 
                fill="url(#colorYtd)" 
                isAnimationActive={false}
                activeDot={false}
                dot={(props: any) => props.index === ytdHistory.length - 1 ? <circle key="dot" cx={props.cx} cy={props.cy} r={3} fill="#52525b" stroke="#fff" strokeWidth={1.5} /> : null}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>
    </div>
  );
}
