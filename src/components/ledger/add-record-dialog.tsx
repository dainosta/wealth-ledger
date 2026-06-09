'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ZapIcon, RefreshCwIcon, CheckCircle2Icon } from 'lucide-react';
import { useRecords } from '@/hooks/use-records';
import { useStocks } from '@/hooks/use-stocks';
import { formatCurrency } from '@/lib/calculations';

const formatNumberWithCommas = (val: string | number) => {
  if (val === null || val === undefined || val === '') return '';
  const strVal = val.toString().replace(/,/g, '');
  if (strVal === '') return '';
  const num = Math.round(Number(strVal));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

export function AddRecordDialog() {
  const { addRecord, updateRecord, records } = useRecords();
  const { stocks } = useStocks();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingGold, setFetchingGold] = useState(false);
  
  // Calculate Live Portfolio Value
  const totalStockValue = stocks ? stocks.reduce((sum, stock) => sum + stock.currentValue, 0) : 0;

  // Form state
  const [monthYear, setMonthYear] = useState('');
  const [portfolioValue, setPortfolioValue] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [goldDebtQty, setGoldDebtQty] = useState('');
  const [notes, setNotes] = useState('');

  const fetchGoldPrice = async () => {
    setFetchingGold(true);
    try {
      const res = await fetch('/api/gold');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.sell_1l) {
        setGoldPrice(formatNumberWithCommas(data.sell_1l));
      }
    } catch (err) {
      console.error('Không thể cập nhật giá vàng lúc này.', err);
    } finally {
      setFetchingGold(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Auto pre-fill data
      setMonthYear(format(new Date(), 'MM-yyyy'));
      setPortfolioValue(formatNumberWithCommas(totalStockValue));
      
      if (records.length > 0) {
        const latestRecord = records[records.length - 1];
        setGoldDebtQty(latestRecord.gold_debt_qty.toString());
      } else {
        setGoldDebtQty('');
      }
      setNotes('');
      
      // Auto-fetch gold price
      fetchGoldPrice();
    }
  }, [open, records, totalStockValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const existingRecord = records.find(r => r.month_year === monthYear);
      const payload = {
        month_year: monthYear,
        portfolio_value: Number(portfolioValue.replace(/,/g, '')),
        gold_price: Number(goldPrice.replace(/,/g, '')),
        gold_debt_qty: Number(goldDebtQty),
        notes: notes,
      };

      if (existingRecord) {
        if (confirm(`Tháng ${monthYear} đã có bản ghi. Bạn có muốn ghi đè lên bản ghi cũ không?`)) {
          await updateRecord(existingRecord.id, payload);
        } else {
          setLoading(false);
          return;
        }
      } else {
        await addRecord(payload);
      }
      
      setOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu bản ghi!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: 'sm', variant: 'default' })}>
        <ZapIcon className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-500" />
        Chốt sổ tháng này
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">Chốt Sổ (Snapshot)</DialogTitle>
            <DialogDescription>
              Hệ thống đã tự động tổng hợp số liệu hiện tại của bạn. Bạn chỉ cần xem lại và ấn chốt sổ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="month_year" className="text-right text-sm font-semibold text-neutral-600">
                Tháng
              </label>
              <Input
                id="month_year"
                placeholder="MM-YYYY"
                className="col-span-3 font-bold"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                required
              />
            </div>
            
            {/* Portfolio Value */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="portfolio_value" className="text-right text-sm font-semibold text-neutral-600 mt-2">
                Tổng danh mục
              </label>
              <div className="col-span-3 relative">
                <Input
                  id="portfolio_value"
                  type="text"
                  inputMode="numeric"
                  className="font-bold pr-10 text-blue-700 bg-blue-50/50"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(formatNumberWithCommas(e.target.value))}
                  required
                />
                <div className="absolute top-2 right-3">
                  <CheckCircle2Icon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center">
                  <RefreshCwIcon className="h-3 w-3 mr-1" />
                  Tự động đồng bộ từ Danh mục Cổ phiếu
                </p>
              </div>
            </div>

            {/* Gold Price */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="gold_price" className="text-right text-sm font-semibold text-neutral-600 mt-2">
                Giá vàng SJC
              </label>
              <div className="col-span-3 relative">
                <Input
                  id="gold_price"
                  type="text"
                  inputMode="numeric"
                  className="font-bold pr-10 text-emerald-700 bg-emerald-50/50"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(formatNumberWithCommas(e.target.value))}
                  required
                />
                <div className="absolute top-2 right-3">
                  {fetchingGold ? (
                    <RefreshCwIcon className="h-5 w-5 text-emerald-500 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center">
                  <RefreshCwIcon className="h-3 w-3 mr-1" />
                  {fetchingGold ? 'Đang lấy giá mới nhất...' : 'Tự động lấy giá vàng mới nhất'}
                </p>
              </div>
            </div>

            {/* Gold Debt */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="gold_debt_qty" className="text-right text-sm font-semibold text-neutral-600 mt-2">
                Nợ vàng (lượng)
              </label>
              <div className="col-span-3">
                <Input
                  id="gold_debt_qty"
                  type="number"
                  step="0.01"
                  className="font-bold text-rose-700 bg-rose-50/50"
                  value={goldDebtQty}
                  onChange={(e) => setGoldDebtQty(e.target.value)}
                  required
                />
                <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center">
                  Kế thừa từ tháng trước
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right text-sm font-semibold text-neutral-600">
                Ghi chú
              </label>
              <Input
                id="notes"
                placeholder="Ví dụ: Nạp thêm 20tr"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading || fetchingGold} className="bg-neutral-900">
              {loading ? 'Đang chốt sổ...' : 'Xác nhận Chốt Sổ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
