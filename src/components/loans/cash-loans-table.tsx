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

export function CashLoansTable({ loansData, goldPrice = 0, goldDebtQty = 0, goldDebtCostBasis = 0 }: { loansData: any, goldPrice?: number, goldDebtQty?: number, goldDebtCostBasis?: number }) {
  const { loans, loading, error, deleteLoan, refresh, updateLoan } = loansData;

  const totalBalanceVND = loans.reduce((sum: number, loan: CashLoan) => {
    if (loan.loan_type === 'gold') {
      return sum + (loan.balance * goldPrice);
    }
    return sum + loan.balance;
  }, 0) + (goldDebtQty * goldPrice);

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
                <TableHead className="text-center font-bold text-neutral-500">Loại</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Dư nợ gốc</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Thông tin thêm</TableHead>
                <TableHead className="text-center font-bold text-neutral-500">Ngày trả lãi / Đáo hạn</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goldDebtQty > 0 && (
                <TableRow className="bg-amber-900/10 border-neutral-800 transition-colors">
                  <TableCell className="font-bold text-amber-500">Nợ Vàng (Chốt sổ)</TableCell>
                  <TableCell className="text-center">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest bg-amber-500/20 text-amber-500">
                      Vàng
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-amber-500">
                    <div className="flex flex-col items-end">
                      <span>{goldDebtQty} lg</span>
                      <span className="text-[10px] text-neutral-500 mt-1">{formatCurrency(goldDebtQty * goldPrice)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-neutral-400">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex justify-between w-32"><span className="text-neutral-500">Giá vốn:</span> <span>{formatCurrency(goldDebtCostBasis)}/l</span></div>
                      <div className="flex justify-between w-32"><span className="text-neutral-500">Giá TT:</span> <span className="text-amber-400">{formatCurrency(goldPrice)}/l</span></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-neutral-500 text-xs">
                    Cập nhật qua Chốt sổ
                  </TableCell>
                  <TableCell className="text-right">
                  </TableCell>
                </TableRow>
              )}
              {loans.length === 0 && goldDebtQty === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có khoản vay nào.'}
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan: CashLoan) => (
                  <LoanTableRow key={loan.id} loan={loan} goldPrice={goldPrice} updateLoan={updateLoan} deleteLoan={deleteLoan} />
                ))
              )}

              {loans.length > 0 && (
                <TableRow className="bg-[#0a0a0a] font-bold border-t border-neutral-800 hover:bg-transparent">
                  <TableCell colSpan={2} className="uppercase text-neutral-500">TỔNG CỘNG (Quy đổi VNĐ)</TableCell>
                  <TableCell className="text-right text-rose-400 font-mono">{formatCurrency(totalBalanceVND)}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LoanTableRow({ loan, goldPrice, updateLoan, deleteLoan }: { loan: CashLoan, goldPrice: number, updateLoan: any, deleteLoan: any }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isGold = loan.loan_type === 'gold';
  const principalVND = isGold ? loan.balance * goldPrice : loan.balance;
  const estimatedMonthlyInterest = (principalVND * loan.interest_rate) / 100 / 12;

  return (
    <TableRow className={`hover:bg-neutral-900/50 border-neutral-800 transition-colors ${isUpdating ? 'opacity-50' : ''}`}>
      <TableCell className="font-bold text-neutral-200">{loan.name}</TableCell>
      <TableCell className="text-center">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest ${isGold ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-400'}`}>
          {isGold ? 'Vàng' : 'Tiền mặt'}
        </span>
      </TableCell>
      <TableCell className={`text-right font-mono font-bold ${isGold ? 'text-amber-500' : 'text-rose-400'}`}>
        <div className="flex flex-col items-end">
          <span>{isGold ? `${loan.balance} lg` : formatCurrency(loan.balance)}</span>
          {isGold && <span className="text-[10px] text-neutral-500 mt-1">{formatCurrency(principalVND)}</span>}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-neutral-400">
        <div className="flex flex-col items-end gap-1">
          <div className="flex justify-between w-32"><span className="text-neutral-500">Lãi suất:</span> <span>{loan.interest_rate}%</span></div>
          <div className="flex justify-between w-32"><span className="text-neutral-500">Tiền lãi:</span> <span>{formatCurrency(estimatedMonthlyInterest)}</span></div>
        </div>
      </TableCell>
      <TableCell className="text-center font-mono text-xs text-neutral-400">
        <div className="flex flex-col items-center gap-1">
          <div>{loan.interest_payment_day ? `Ngày ${loan.interest_payment_day}` : '-'}</div>
          <div className="text-neutral-500">{loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString('vi-VN') : '-'}</div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-rose-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-none"
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
