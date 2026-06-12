'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRecords } from '@/hooks/use-records';
import { CalculatedMonthlyRecord } from '@/types';

interface EditRecordDialogProps {
  record: CalculatedMonthlyRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecordDialog({ record, open, onOpenChange }: EditRecordDialogProps) {
  const { updateRecord } = useRecords();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [monthYear, setMonthYear] = useState(record.month_year);
  const [portfolioValue, setPortfolioValue] = useState(record.portfolio_value.toString());
  const [goldPrice, setGoldPrice] = useState(record.gold_price.toString());
  const [goldDebtQty, setGoldDebtQty] = useState(record.gold_debt_qty.toString());
  const [cashDebt, setCashDebt] = useState(record.cash_debt ? record.cash_debt.toString() : '0');
  const [creditCardDebt, setCreditCardDebt] = useState(record.credit_card_debt ? record.credit_card_debt.toString() : '0');
  const [notes, setNotes] = useState(record.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateRecord(record.id, {
        month_year: monthYear,
        portfolio_value: Number(portfolioValue),
        gold_price: Number(goldPrice),
        gold_debt_qty: Number(goldDebtQty),
        cash_debt: Number(cashDebt),
        credit_card_debt: Number(creditCardDebt),
        notes: notes,
      });
      
      onOpenChange(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật bản ghi!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoldPrice = async () => {
    try {
      const res = await fetch('/api/gold');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.sell_1l) {
        setGoldPrice(data.sell_1l.toString());
      }
    } catch (err) {
      alert('Không thể cập nhật giá vàng lúc này.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Sửa bản ghi</DialogTitle>
            <DialogDescription>
              Cập nhật số liệu tài chính của tháng. Bấm lưu để thay đổi Sổ cái.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_month_year" className="text-right text-sm font-medium">
                Tháng
              </label>
              <Input
                id="edit_month_year"
                placeholder="MM-YYYY"
                className="col-span-3"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_portfolio_value" className="text-right text-sm font-medium">
                Tổng danh mục
              </label>
              <Input
                id="edit_portfolio_value"
                type="number"
                className="col-span-3"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_gold_price" className="text-right text-sm font-medium">
                Giá vàng
              </label>
              <div className="col-span-3 flex space-x-2">
                <Input
                  id="edit_gold_price"
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={fetchGoldPrice}>
                  Tự động lấy SJC
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_gold_debt_qty" className="text-right text-sm font-medium">
                Nợ vàng (lượng)
              </label>
              <Input
                id="edit_gold_debt_qty"
                type="number"
                step="0.01"
                className="col-span-3"
                value={goldDebtQty}
                onChange={(e) => setGoldDebtQty(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_cash_debt" className="text-right text-sm font-medium">
                Nợ tiền mặt (VNĐ)
              </label>
              <Input
                id="edit_cash_debt"
                type="number"
                className="col-span-3"
                value={cashDebt}
                onChange={(e) => setCashDebt(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_credit_card_debt" className="text-right text-sm font-medium">
                Nợ thẻ TD
              </label>
              <Input
                id="edit_credit_card_debt"
                type="number"
                className="col-span-3 text-rose-700 bg-rose-50"
                value={creditCardDebt}
                onChange={(e) => setCreditCardDebt(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit_notes" className="text-right text-sm font-medium">
                Ghi chú
              </label>
              <Input
                id="edit_notes"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
