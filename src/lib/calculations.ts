import { MonthlyRecord, CalculatedMonthlyRecord } from '@/types';

/**
 * Tính toán các giá trị phái sinh từ một mảng các bản ghi hàng tháng.
 * Yêu cầu mảng đầu vào phải được sắp xếp theo thứ tự thời gian tăng dần (cũ nhất -> mới nhất).
 */
export function calculateRecords(records: MonthlyRecord[]): CalculatedMonthlyRecord[] {
  const calculated: CalculatedMonthlyRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const current = records[i];
    const prev = i > 0 ? calculated[i - 1] : null;

    const gold_debt_value = current.gold_price * current.gold_debt_qty;
    // Tương thích ngược: nếu cash_debt chưa có trong DB, coi như là 0
    const cash_debt = current.cash_debt || 0;
    const net_worth = current.portfolio_value - gold_debt_value - cash_debt;

    let portfolio_change = 0;
    let net_worth_change_value = 0;
    let net_worth_change_percent = 0;

    if (prev) {
      portfolio_change = current.portfolio_value - prev.portfolio_value;
      net_worth_change_value = net_worth - prev.net_worth;
      if (prev.net_worth !== 0) {
        net_worth_change_percent = (net_worth_change_value / prev.net_worth) * 100;
      }
    }

    calculated.push({
      ...current,
      gold_debt_value,
      net_worth,
      portfolio_change,
      net_worth_change_value,
      net_worth_change_percent,
    });
  }

  return calculated;
}

/**
 * Định dạng tiền tệ VND
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Định dạng phần trăm
 */
export function formatPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
