'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CalculatedMonthlyRecord } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { ArrowDownIcon, ArrowUpIcon, MoreHorizontal } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRecords } from '@/hooks/use-records';
import { EditRecordDialog } from '@/components/ledger/edit-record-dialog';

export const ActionsCell = ({ record }: { record: CalculatedMonthlyRecord }) => {
  const { deleteRecord } = useRecords();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      await deleteRecord(record.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Sửa bản ghi
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-rose-500">
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRecordDialog 
        record={record} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </>
  );
};

export const columns: ColumnDef<CalculatedMonthlyRecord>[] = [
  {
    accessorKey: 'month_year',
    header: 'Tháng',
    cell: ({ row }) => <div className="font-medium">{row.getValue('month_year')}</div>,
  },
  {
    accessorKey: 'portfolio_value',
    header: () => <div className="text-right whitespace-nowrap">Tổng danh mục</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('portfolio_value'));
      return <div className="text-right font-mono">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'gold_price',
    header: () => <div className="text-right whitespace-nowrap">Giá vàng</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('gold_price'));
      return <div className="text-right font-mono">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'gold_debt_qty',
    header: () => <div className="text-right whitespace-nowrap">Nợ vàng (lượng)</div>,
    cell: ({ row }) => {
      return <div className="text-right font-mono">{row.getValue('gold_debt_qty')}</div>;
    },
  },
  {
    accessorKey: 'gold_debt_value',
    header: () => <div className="text-right whitespace-nowrap">Giá trị nợ vàng</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('gold_debt_value'));
      return <div className="text-right font-mono text-rose-500">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'net_worth',
    header: () => <div className="text-right font-bold whitespace-nowrap">Tài sản ròng (Net Worth)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('net_worth'));
      return <div className="text-right font-mono font-bold">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: 'net_worth_change_value',
    header: () => <div className="text-right whitespace-nowrap">Biến động</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('net_worth_change_value'));
      const isPositive = amount >= 0;
      if (amount === 0) return <div className="text-right font-mono text-muted-foreground">-</div>;
      
      return (
        <div className={`text-right font-mono flex items-center justify-end ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpIcon className="mr-1 h-3 w-3" /> : <ArrowDownIcon className="mr-1 h-3 w-3" />}
          {formatCurrency(Math.abs(amount))}
        </div>
      );
    },
  },
  {
    accessorKey: 'net_worth_change_percent',
    header: () => <div className="text-right">%</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('net_worth_change_percent'));
      const isPositive = amount >= 0;
      if (amount === 0) return <div className="text-right font-mono text-muted-foreground">-</div>;
      
      return (
        <div className={`text-right font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {formatPercent(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Ghi chú',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell record={row.original} />,
  },
];
