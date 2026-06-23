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
    <Card className="h-full flex flex-col border-0 shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between shrink-0 py-3 border-b border-neutral-100 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-700">Quản lý Khoản Vay</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refresh()} 
            disabled={loading}
            className="h-8 text-xs font-semibold"
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
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow>
                <TableHead className="font-semibold text-neutral-600">Tên Khoản Vay</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Dư nợ gốc</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Lãi suất (%/năm)</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Tiền lãi/tháng (ước tính)</TableHead>
                <TableHead className="text-center font-semibold text-neutral-600">Ngày trả lãi</TableHead>
                <TableHead className="text-center font-semibold text-neutral-600">Ngày đáo hạn</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Thao tác</TableHead>
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
                <TableRow className="bg-neutral-50 font-bold border-t-2 border-neutral-100">
                  <TableCell className="uppercase text-neutral-700">TỔNG CỘNG</TableCell>
                  <TableCell className="text-right text-rose-700">{formatCurrency(totalBalance)}</TableCell>
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
    <TableRow className={`hover:bg-neutral-50 transition-colors ${isUpdating ? 'opacity-50' : ''}`}>
      <TableCell className="font-medium">{loan.name}</TableCell>
      <TableCell className="text-right font-semibold text-rose-600">
        {formatCurrency(loan.balance)}
      </TableCell>
      <TableCell className="text-right font-semibold text-amber-600">
        {loan.interest_rate}%
      </TableCell>
      <TableCell className="text-right font-medium text-neutral-600 bg-neutral-50/50">
        {formatCurrency(estimatedMonthlyInterest)}
      </TableCell>
      <TableCell className="text-center text-neutral-600">
        {loan.interest_payment_day ? `Ngày ${loan.interest_payment_day}` : '-'}
      </TableCell>
      <TableCell className="text-center text-neutral-600">
        {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString('vi-VN') : '-'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
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
