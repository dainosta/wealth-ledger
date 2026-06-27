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
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, TrendingUpIcon, CoinsIcon, CalendarIcon, FilterIcon } from 'lucide-react';
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

  const years = React.useMemo(() => {
    const uniqueYears = new Set<string>();
    data.forEach((d: any) => {
      const year = d.month_year.split('-')[1];
      if (year) uniqueYears.add(year);
    });
    const currentYear = new Date().getFullYear().toString();
    uniqueYears.add(currentYear);
    return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const [selectedYear, setSelectedYear] = React.useState<string>(years[0] || new Date().getFullYear().toString());

  const filteredData = React.useMemo(() => {
    if (selectedYear === 'ALL') return data;
    return data.filter((d: any) => d.month_year.endsWith(`-${selectedYear}`));
  }, [data, selectedYear]);

  // Update table data when filter changes
  React.useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data: filteredData,
    }));
  }, [filteredData, table]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-[-36px] right-2 z-10 flex items-center">
        <div className="flex items-center bg-black border border-neutral-800 rounded-none overflow-hidden text-[10px] font-bold uppercase">
          <div className="px-2 py-1 bg-neutral-900 border-r border-neutral-800 flex items-center text-neutral-400">
            <FilterIcon className="w-3 h-3 mr-1" /> NĂM
          </div>
          <select 
            className="px-2 py-1 outline-none bg-transparent cursor-pointer text-neutral-300 font-mono"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="ALL">ALL</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-black p-2 flex flex-col gap-2">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const record = row.original as any;
            const isPositive = record.net_worth_change_value >= 0;
            const hasChangeData = record.net_worth_change_percent !== 0 || record.net_worth_change_value !== 0;

            return (
              <div key={row.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-none p-2 flex flex-col gap-1.5 relative group hover:border-neutral-600 transition-colors">
                {/* Header: Month and Actions */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-neutral-900 text-neutral-400 p-1 rounded-none border border-neutral-800">
                      <CalendarIcon className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest text-neutral-300">THÁNG {record.month_year}</span>
                  </div>
                  <ActionsCell record={record} />
                </div>

                {/* Main Stats: Net Worth & Portfolio */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5 flex items-center">
                      Tài sản ròng
                    </span>
                    <span className="font-mono font-bold text-[14px] text-emerald-400">{formatCurrency(record.net_worth)}</span>
                    
                    {hasChangeData ? (
                      <div className={`text-[10px] flex items-center font-mono mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(record.net_worth_change_value)} ({formatPercent(record.net_worth_change_percent)})
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-neutral-600 mt-0.5">0</div>
                    )}
                  </div>
                  <div className="flex flex-col border-l border-neutral-800 pl-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5 flex items-center">
                      Cổ phiếu
                    </span>
                    <span className="font-mono font-bold text-[14px] text-blue-400">{formatCurrency(record.portfolio_value)}</span>
                  </div>
                </div>

                {/* Footer: Debts and Notes */}
                {(record.gold_debt_qty > 0 || (record.cash_debt && record.cash_debt > 0) || (record.credit_card_debt && record.credit_card_debt > 0) || record.notes) && (
                   <div className="mt-1 pt-1.5 border-t border-neutral-800 flex flex-col gap-1 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                     {record.gold_debt_qty > 0 && (
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center">
                           Nợ vàng <span className="text-amber-500 ml-1">({record.gold_debt_qty} LG)</span>
                         </div>
                         <span className="font-mono text-amber-500 text-right">{formatCurrency(record.gold_debt_value)}</span>
                       </div>
                     )}
                     {(record.cash_debt && record.cash_debt > 0) ? (
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center">Nợ tiền mặt</div>
                         <span className="font-mono text-neutral-300 text-right">{formatCurrency(record.cash_debt)}</span>
                       </div>
                     ) : null}
                     {(record.credit_card_debt && record.credit_card_debt > 0) ? (
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center">Thẻ tín dụng</div>
                         <span className="font-mono text-neutral-300 text-right">{formatCurrency(record.credit_card_debt)}</span>
                       </div>
                     ) : null}
                     {record.notes && (
                       <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-none text-[9px] text-neutral-400 mt-1 lowercase normal-case font-mono">
                         &gt; {record.notes}
                       </div>
                     )}
                   </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-black border border-neutral-800 rounded-none">
            <span className="text-xs text-neutral-600 font-mono">NO RECORDS</span>
          </div>
        )}
      </div>
      
      {/* Pagination Container */}
      <div className="shrink-0 flex items-center justify-between border-t border-neutral-800 bg-[#0a0a0a] p-2">
        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
          PAGE <span className="font-mono">{table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
        </div>
        <div className="space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest rounded-none border-neutral-800 bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            PREV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest rounded-none border-neutral-800 bg-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  );
}
