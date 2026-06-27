'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { useLoans } from '@/hooks/use-loans';

export function AddLoanDialog({ onAdd }: { onAdd: () => void }) {
  const { addLoan } = useLoans();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [loanType, setLoanType] = useState<'cash'|'gold'>('cash');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestPaymentDay, setInterestPaymentDay] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    setLoading(true);
    try {
      await addLoan({
        name,
        loan_type: loanType,
        balance: loanType === 'gold' ? Number(balance.replace(/,/g, '')) : Number(balance.replace(/,/g, '')),
        interest_rate: Number(interestRate.replace(/,/g, '')) || 0,
        interest_payment_day: interestPaymentDay ? parseInt(interestPaymentDay) : null,
        maturity_date: maturityDate || null,
      });
      setOpen(false);
      setName('');
      setLoanType('cash');
      setBalance('');
      setInterestRate('');
      setInterestPaymentDay('');
      setMaturityDate('');
      onAdd();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi thêm khoản vay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: 'sm', variant: 'default' })}>
        <PlusIcon className="mr-1 h-4 w-4" />
        Thêm khoản vay
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Khoản Vay</DialogTitle>
            <DialogDescription>
              Nhập chi tiết khoản vay để theo dõi dư nợ và tính toán tiền lãi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Loại</Label>
              <div className="col-span-3 flex gap-2">
                <Button 
                  type="button" 
                  variant={loanType === 'cash' ? 'default' : 'outline'} 
                  onClick={() => setLoanType('cash')}
                  className="w-full text-xs"
                >Tiền mặt</Button>
                <Button 
                  type="button" 
                  variant={loanType === 'gold' ? 'default' : 'outline'} 
                  onClick={() => setLoanType('gold')}
                  className="w-full text-xs"
                >Vàng</Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên khoản vay
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Vay mua nhà BIDV"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Dư nợ gốc
              </Label>
              <Input
                id="balance"
                type="text"
                inputMode="decimal"
                value={balance}
                onChange={(e) => {
                  if (loanType === 'gold') {
                    // Allow decimal for gold
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setBalance(val);
                  } else {
                    const val = e.target.value.replace(/\D/g, '');
                    setBalance(val ? Number(val).toLocaleString('en-US') : '');
                  }
                }}
                placeholder={loanType === 'gold' ? 'VD: 2.5 (lượng)' : 'VNĐ'}
                className="col-span-3 font-semibold text-rose-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rate" className="text-right">
                Lãi suất
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="VD: 6.5"
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-sm text-neutral-500">% /năm</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Ngày trả lãi
              </Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={interestPaymentDay}
                onChange={(e) => setInterestPaymentDay(e.target.value)}
                placeholder="Từ ngày 1 đến 31"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maturity" className="text-right">
                Ngày đáo hạn
              </Label>
              <Input
                id="maturity"
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm khoản vay'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
