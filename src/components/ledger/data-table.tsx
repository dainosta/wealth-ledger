'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, TrendingUpIcon, CoinsIcon, CalendarIcon } from 'lucide-react';
import { ActionsCell } from './columns';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto bg-neutral-50/50 p-3 flex flex-col gap-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const record = row.original as any;
            const isPositive = record.net_worth_change_value >= 0;
            const hasChangeData = record.net_worth_change_percent !== 0 || record.net_worth_change_value !== 0;

            return (
              <div key={row.id} className="bg-white border rounded-xl p-3 shadow-sm flex flex-col gap-2 relative group hover:border-blue-300 transition-colors">
                {/* Header: Month and Actions */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-neutral-800">Tháng {record.month_year}</span>
                  </div>
                  <ActionsCell record={record} />
                </div>

                {/* Main Stats: Net Worth & Portfolio */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center">
                      <WalletIcon className="w-3 h-3 mr-1"/> Tài sản ròng
                    </span>
                    <span className="font-bold text-[15px]">{formatCurrency(record.net_worth)}</span>
                    
                    {hasChangeData ? (
                      <div className={`text-[11px] flex items-center font-medium mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <ArrowUpIcon className="w-3 h-3 mr-0.5" /> : <ArrowDownIcon className="w-3 h-3 mr-0.5" />}
                        {formatCurrency(Math.abs(record.net_worth_change_value))} ({isPositive ? '+' : ''}{formatPercent(record.net_worth_change_percent)})
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-400 mt-1">- Không có biến động -</div>
                    )}
                  </div>
                  <div className="flex flex-col border-l border-neutral-100 pl-3">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center">
                      <TrendingUpIcon className="w-3 h-3 mr-1"/> Cổ phiếu
                    </span>
                    <span className="font-bold text-[15px] text-blue-600">{formatCurrency(record.portfolio_value)}</span>
                  </div>
                </div>

                {/* Footer: Debts and Notes */}
                {(record.gold_debt_qty > 0 || (record.cash_debt && record.cash_debt > 0) || (record.credit_card_debt && record.credit_card_debt > 0) || record.notes) && (
                   <div className="mt-2 pt-2 border-t border-neutral-100 flex flex-col gap-1.5 text-xs text-neutral-500">
                     {record.gold_debt_qty > 0 && (
                       <div className="flex items-center justify-between">
                         <div className="flex items-center">
                           <CoinsIcon className="w-3.5 h-3.5 mr-1 text-amber-500"/>
                           Nợ vàng: <span className="font-semibold text-amber-600 ml-1">{record.gold_debt_qty} lượng</span>
                         </div>
                         <span className="font-medium text-rose-500">- {formatCurrency(record.gold_debt_value)}</span>
                       </div>
                     )}
                     {(record.cash_debt && record.cash_debt > 0) ? (
                       <div className="flex items-center justify-between">
                         <div className="flex items-center">
                           <CoinsIcon className="w-3.5 h-3.5 mr-1 text-amber-600"/>
                           Nợ tiền mặt:
                         </div>
                         <span className="font-medium text-rose-500">- {formatCurrency(record.cash_debt)}</span>
                       </div>
                     ) : null}
                     {(record.credit_card_debt && record.credit_card_debt > 0) ? (
                       <div className="flex items-center justify-between">
                         <div className="flex items-center">
                           <CoinsIcon className="w-3.5 h-3.5 mr-1 text-violet-500"/>
                           Nợ thẻ tín dụng:
                         </div>
                         <span className="font-medium text-rose-500">- {formatCurrency(record.credit_card_debt)}</span>
                       </div>
                     ) : null}
                     {record.notes && (
                       <div className="bg-neutral-50 p-2 rounded text-[11px] italic text-neutral-600">
                         📝 {record.notes}
                       </div>
                     )}
                   </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl border border-dashed">
            <CalendarIcon className="w-10 h-10 text-neutral-300 mb-2" />
            <span className="text-sm text-neutral-500 font-medium">Chưa có bản ghi sổ cái nào.</span>
          </div>
        )}
      </div>
      
      {/* Pagination Container */}
      <div className="shrink-0 flex items-center justify-between border-t bg-white p-3">
        <div className="text-xs text-neutral-500 font-medium">
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs font-semibold"
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs font-semibold"
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
