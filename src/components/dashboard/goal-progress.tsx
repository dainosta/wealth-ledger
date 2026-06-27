'use client';

import { Card } from '@/components/ui/card';
import { useGoal } from '@/hooks/use-goal';
import { formatCurrency } from '@/lib/calculations';
import { SetGoalDialog } from './set-goal-dialog';
import { FlagIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GoalProgressProps {
  currentNetWorth: number;
  isLoading?: boolean;
}

export function GoalProgress({ currentNetWorth, isLoading = false }: GoalProgressProps) {
  const { goal, loading } = useGoal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || isLoading) {
    return <div className="h-[72px] w-full bg-black animate-pulse rounded-none mb-3 border border-neutral-800" />;
  }

  if (!goal || goal.target_net_worth <= 0) {
    return (
      <Card className="bg-[#0a0a0a] border-neutral-800 shadow-none rounded-none relative overflow-hidden mb-3">
        <div className="flex items-center justify-between p-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-black border border-neutral-800 text-neutral-500">
              <FlagIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
                Mục tiêu Tài chính
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                &gt; HÃY THIẾT LẬP MỤC TIÊU ĐỂ THEO DÕI TIẾN ĐỘ
              </p>
            </div>
          </div>
          <SetGoalDialog />
        </div>
      </Card>
    );
  }

  const target = goal.target_net_worth;

  const progressPercent = Math.min((currentNetWorth / target) * 100, 100);
  const isCompleted = currentNetWorth >= target;

  return (
    <Card className="bg-[#0a0a0a] border-neutral-800 shadow-none rounded-none relative overflow-hidden mb-3">
      <div className="flex flex-col md:flex-row items-center justify-between p-3 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className={`p-2 rounded-none border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'}`}>
            <FlagIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Mục tiêu Tài chính: <span className="font-mono">{goal.target_date}</span>
            </h3>
            <p className="text-[10px] font-bold text-neutral-500 mt-0.5 uppercase tracking-widest">
              <span className={`font-mono ${isCompleted ? 'text-emerald-500' : 'text-neutral-200'}`}>
                {formatCurrency(currentNetWorth)}
              </span>
              {' / '}
              <span className="font-mono">{formatCurrency(target)}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center gap-4">
          <div className="flex-1 relative h-2 rounded-none overflow-hidden bg-neutral-900 border border-neutral-800">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs font-mono font-bold w-12 text-right shrink-0 text-neutral-300">
            {progressPercent.toFixed(1)}%
          </div>
          <SetGoalDialog />
        </div>
      </div>
    </Card>
  );
}
