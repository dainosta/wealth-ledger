export interface MonthlyRecord {
  id: string; // uuid
  month_year: string; // Format: MM-YYYY
  portfolio_value: number; // Tổng giá trị danh mục đầu tư
  stock_cost_basis?: number; // Tổng vốn đầu tư cổ phiếu
  cash_balance?: number; // Tiền mặt hiện có
  gold_price: number; // Giá vàng tại thời điểm
  gold_debt_qty: number; // Số lượng vàng nợ (lượng/chỉ)
  cash_debt: number; // Tổng nợ tiền mặt (VNĐ)
  cash_interest_paid?: number; // Tiền lãi đã trả trong tháng
  credit_card_debt: number; // Tổng nợ thẻ tín dụng (VNĐ)
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

export interface CashLoan {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  interest_payment_day: number | null;
  maturity_date: string | null;
  created_at?: string;
}
