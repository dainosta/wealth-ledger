'use client';

import { useState, useEffect } from 'react';
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
import { TargetIcon } from 'lucide-react';
import { useGoal, GoalSettings } from '@/hooks/use-goal';

const formatNumberWithCommas = (val: string | number) => {
  if (val === null || val === undefined || val === '') return '';
  const strVal = val.toString().replace(/,/g, '');
  if (strVal === '') return '';
  const num = Math.round(Number(strVal));
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

export function SetGoalDialog() {
  const { goal, updateGoal } = useGoal();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [targetNetWorth, setTargetNetWorth] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (open) {
      if (goal) {
        setTargetNetWorth(formatNumberWithCommas(goal.target_net_worth));
        setTargetDate(goal.target_date);
      } else {
        setTargetNetWorth('');
        setTargetDate('12-2026');
      }
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGoal({
        target_net_worth: Number(targetNetWorth.replace(/,/g, '')),
        target_date: targetDate
      });
      setOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu mục tiêu!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: 'icon', variant: 'ghost', className: 'h-8 w-8 text-neutral-400 hover:text-emerald-600' })}>
        <TargetIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex items-center">
              <TargetIcon className="mr-2 h-5 w-5 text-emerald-600" />
              Thiết lập Mục tiêu
            </DialogTitle>
            <DialogDescription>
              Đặt mục tiêu tài sản ròng bạn muốn hướng tới và hệ thống sẽ theo dõi tiến độ giúp bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="target_net_worth" className="text-sm font-semibold text-neutral-600">
                Mục tiêu Tài sản ròng (VND)
              </label>
              <Input
                id="target_net_worth"
                type="text"
                inputMode="numeric"
                className="font-bold text-lg text-emerald-700 bg-emerald-50/50"
                placeholder="Ví dụ: 1,000,000,000"
                value={targetNetWorth}
                onChange={(e) => setTargetNetWorth(formatNumberWithCommas(e.target.value))}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="target_date" className="text-sm font-semibold text-neutral-600">
                Thời hạn đạt được
              </label>
              <Input
                id="target_date"
                placeholder="MM-YYYY (Ví dụ: 12-2026)"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Đang lưu...' : 'Lưu mục tiêu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
