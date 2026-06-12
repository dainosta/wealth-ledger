export interface MonthlyRecord {
  id: string; // uuid
  month_year: string; // Format: MM-YYYY
  portfolio_value: number; // Tổng giá trị danh mục đầu tư
  gold_price: number; // Giá vàng tại thời điểm
  gold_debt_qty: number; // Số lượng vàng nợ (lượng/chỉ)
  cash_debt: number; // Tổng nợ tiền mặt (VNĐ)
  notes: string;
  created_at: string;
}

export interface CalculatedMonthlyRecord extends MonthlyRecord {
  portfolio_change: number;
  gold_debt_value: number;
  net_worth: number;
  net_worth_change_value: number;
  net_worth_change_percent: number;
}
