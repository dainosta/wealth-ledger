import { CalculatedMonthlyRecord } from '@/types';
import { StockWithQuote } from './use-stocks';
import { useGold } from './use-gold';

export function useRealtimeNetWorth(
  records: CalculatedMonthlyRecord[],
  stocks: StockWithQuote[]
) {
  const { goldPrice: liveGoldPrice, worldGoldPrice, worldGoldChange } = useGold();

  const totalStockValue = stocks.reduce((sum, stock) => sum + stock.currentValue, 0);

  if (!records || records.length === 0) {
    return {
      realtimeNetWorth: 0,
      totalStockValue,
      liveGoldDebt: 0,
      realtimeMoMChange: 0,
      realtimeYtdGrowth: 0,
      liveGoldPrice: 0,
      worldGoldPrice: 0,
      worldGoldChange: 0,
      currentMonth: null,
      previousMonth: null,
    };
  }

  const currentMonth = records[records.length - 1];
  const previousMonth = records.length > 1 ? records[records.length - 2] : null;

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
  const lastYearEnd = records.find(
    (d) => d.month_year === `12-${parseInt(currentYear) - 1}`
  );
  
  let realtimeYtdGrowth = 0;
  if (lastYearEnd && lastYearEnd.net_worth !== 0) {
    realtimeYtdGrowth = ((realtimeNetWorth - lastYearEnd.net_worth) / lastYearEnd.net_worth) * 100;
  }

  return {
    realtimeNetWorth,
    totalStockValue,
    liveGoldDebt,
    realtimeMoMChange,
    realtimeYtdGrowth,
    liveGoldPrice: displayGoldPrice,
    worldGoldPrice,
    worldGoldChange,
    currentMonth,
    previousMonth
  };
}
