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
    return <div className="h-[90px] w-full bg-neutral-100 animate-pulse rounded-xl mb-3 border border-neutral-200" />;
  }

  if (!goal || goal.target_net_worth <= 0) {
    return (
      <Card className="bg-white border-neutral-200/60 shadow-sm relative overflow-hidden mb-3">
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-500">
              <FlagIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800">
                Mục tiêu Tài chính
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Hãy thiết lập mục tiêu để theo dõi tiến độ
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
    <Card className="bg-white border-neutral-200/60 shadow-sm relative overflow-hidden mb-3">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className={`p-2 rounded-xl ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            <FlagIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-800">
              Mục tiêu Tài chính: {goal.target_date}
            </h3>
            <p className="text-xs font-medium text-neutral-500 mt-0.5">
              <span className={isCompleted ? 'text-emerald-600 font-bold' : 'text-neutral-700'}>
                {formatCurrency(currentNetWorth)}
              </span>
              {' / '}
              {formatCurrency(target)}
            </p>
          </div>
        </div>

        <div className="flex-1 w-full flex items-center gap-4">
          <div className="flex-1 relative h-3 rounded-full overflow-hidden bg-neutral-100">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-sm font-bold w-12 text-right shrink-0 text-neutral-700">
            {progressPercent.toFixed(1)}%
          </div>
          <SetGoalDialog />
        </div>
      </div>
    </Card>
  );
}
