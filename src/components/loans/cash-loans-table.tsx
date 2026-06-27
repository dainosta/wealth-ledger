'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, Trash2Icon, PencilIcon, PlusIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { AddLoanDialog } from './add-loan-dialog';
import { CashLoan } from '@/types';

export function CashLoansTable({ loansData }: { loansData: any }) {
  const { loans, loading, error, deleteLoan, refresh, updateLoan } = loansData;

  const totalBalance = loans.reduce((sum: number, loan: CashLoan) => sum + loan.balance, 0);

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none overflow-hidden bg-black">
      <CardHeader className="flex flex-row items-center justify-between shrink-0 py-2 px-3 border-b border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-300">QUẢN LÝ KHOẢN VAY</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refresh()} 
            disabled={loading}
            className="h-7 text-[10px] font-bold uppercase tracking-widest rounded-none border-neutral-800 bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin text-blue-500' : 'text-neutral-500'}`} />
            Làm mới
          </Button>
          <AddLoanDialog onAdd={refresh} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0 relative">
        {error && (
          <div className="m-4 p-3 text-sm text-red-500 bg-red-50 rounded-md shrink-0">
            Lỗi tải dữ liệu: {error}
          </div>
        )}

        <div className="absolute inset-0">
          <Table className="[&_td]:py-1.5 [&_td]:px-2 [&_th]:py-2 [&_th]:px-2 border-b border-neutral-800">
            <TableHeader className="bg-[#0a0a0a] border-b border-neutral-800">
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="font-bold text-neutral-500">Tên Khoản Vay</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Dư nợ gốc</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Lãi suất (%/năm)</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Tiền lãi/tháng (ước tính)</TableHead>
                <TableHead className="text-center font-bold text-neutral-500">Ngày trả lãi</TableHead>
                <TableHead className="text-center font-bold text-neutral-500">Ngày đáo hạn</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có khoản vay nào.'}
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan: CashLoan) => (
                  <LoanTableRow key={loan.id} loan={loan} updateLoan={updateLoan} deleteLoan={deleteLoan} />
                ))
              )}

              {loans.length > 0 && (
                <TableRow className="bg-[#0a0a0a] font-bold border-t border-neutral-800 hover:bg-transparent">
                  <TableCell className="uppercase text-neutral-500">TỔNG CỘNG</TableCell>
                  <TableCell className="text-right text-rose-500 font-mono">{formatCurrency(totalBalance)}</TableCell>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LoanTableRow({ loan, updateLoan, deleteLoan }: { loan: CashLoan, updateLoan: any, deleteLoan: any }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const estimatedMonthlyInterest = (loan.balance * loan.interest_rate) / 100 / 12;

  return (
    <TableRow className={`hover:bg-neutral-900/50 border-neutral-800 transition-colors ${isUpdating ? 'opacity-50' : ''}`}>
      <TableCell className="font-bold text-neutral-200">{loan.name}</TableCell>
      <TableCell className="text-right font-mono font-bold text-rose-500">
        {formatCurrency(loan.balance)}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-amber-500">
        {loan.interest_rate}%
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-neutral-400 bg-neutral-900/30">
        {formatCurrency(estimatedMonthlyInterest)}
      </TableCell>
      <TableCell className="text-center font-mono text-neutral-400">
        {loan.interest_payment_day ? `Ngày ${loan.interest_payment_day}` : '-'}
      </TableCell>
      <TableCell className="text-center font-mono text-neutral-400">
        {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString('vi-VN') : '-'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-none"
            onClick={async () => {
              if (confirm('Bạn có chắc chắn muốn xóa khoản vay này?')) {
                setIsUpdating(true);
                try {
                  await deleteLoan(loan.id);
                } finally {
                  setIsUpdating(false);
                }
              }
            }}
            disabled={isUpdating}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
