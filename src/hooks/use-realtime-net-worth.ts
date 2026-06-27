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
      liveCashBalance: 0,
      realtimeMoMChange: 0,
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
  const liveCashDebt = currentMonth.cash_debt || 0;
  const liveCreditCardDebt = currentMonth.credit_card_debt || 0;
  const liveCashBalance = currentMonth.cash_balance || 0;

  // Real-time Net Worth (Assets: Stocks + Cash)
  const realtimeNetWorth = totalStockValue + liveCashBalance - liveGoldDebt - liveCashDebt - liveCreditCardDebt;

  // Real-time MoM Change
  let realtimeMoMChange = 0;
  if (previousMonth && previousMonth.net_worth !== 0) {
    realtimeMoMChange = ((realtimeNetWorth - previousMonth.net_worth) / previousMonth.net_worth) * 100;
  }

  // Calculate Gold Debt Cost Basis (Option A)
  // Find the earliest contiguous month where gold_debt_qty > 0 to determine the cost basis
  let goldDebtCostBasis = 0;
  let goldDebtProfitLoss = 0;
  
  if (currentMonth.gold_debt_qty > 0) {
    let basisRecord = currentMonth;
    for (let i = records.length - 2; i >= 0; i--) {
      if (records[i].gold_debt_qty > 0) {
        basisRecord = records[i];
      } else {
        break; // Stop at the first month with no debt in the cycle
      }
    }
    goldDebtCostBasis = basisRecord.gold_price;
    // Profit/Loss for debt: If current price > cost basis, it's a loss (negative) because we owe more
    goldDebtProfitLoss = (goldDebtCostBasis - displayGoldPrice) * currentMonth.gold_debt_qty;
  }

  return {
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
  };
}
