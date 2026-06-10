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
import { AddStockDialog } from './add-stock-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

import { DnseSyncDialog } from './dnse-sync-dialog';

import { StockPieChart } from './stock-pie-chart';

export function StockPortfolio({ stocksData }: { stocksData: any }) {
  const { stocks, loading, error, deleteStock, refresh, updateStock, replacePortfolio } = stocksData;
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const totalBuyValue = stocks.reduce((sum: any, stock: any) => sum + stock.quantity * stock.buy_price, 0);
  const totalCurrentValue = stocks.reduce((sum: any, stock: any) => sum + stock.currentValue, 0);
  const totalProfit = totalCurrentValue - totalBuyValue;
  const totalProfitPercent = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

  return (
    <Card className="h-full flex flex-col border-0 shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between shrink-0 py-3 border-b border-neutral-100 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-700">Danh mục Cổ phiếu</CardTitle>
          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Dữ liệu bảng
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'chart' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Phân bổ
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DnseSyncDialog onSyncComplete={replacePortfolio} />
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="h-8 text-xs font-semibold bg-white">
            <RefreshCwIcon className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Làm mới giá
          </Button>
          <AddStockDialog />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0 relative">
        {error && (
          <div className="m-4 p-3 text-sm text-red-500 bg-red-50 rounded-md shrink-0">
            Lỗi tải dữ liệu: {error}
          </div>
        )}

        {viewMode === 'table' ? (
        <div className="absolute inset-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow>
                <TableHead className="font-semibold text-neutral-600">Mã CK</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Số lượng</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Giá mua</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Giá HT</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Thành tiền</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Lỗ/Lãi</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">%</TableHead>
                <TableHead className="text-right font-semibold text-neutral-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có mã cổ phiếu nào trong danh mục.'}
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock: any) => (
                  <StockTableRow key={stock.id} stock={stock} updateStock={updateStock} deleteStock={deleteStock} />
                ))
              )}

              {stocks.length > 0 && (
                <TableRow className="bg-neutral-50 font-bold border-t-2 border-neutral-100">
                  <TableCell colSpan={4} className="uppercase text-neutral-700">TỔNG CỘNG</TableCell>
                  <TableCell className="text-right text-neutral-900">{formatCurrency(totalCurrentValue)}</TableCell>
                  <TableCell className={`text-right ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {totalProfit > 0 ? '+' : ''}{formatCurrency(totalProfit)}
                  </TableCell>
                  <TableCell className={`text-right ${totalProfitPercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {totalProfitPercent > 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        ) : (
        <div className="absolute inset-0">
          <StockPieChart stocks={stocks} />
        </div>
        )}
      </CardContent>
    </Card>
  );
}

function StockTableRow({ stock, updateStock, deleteStock }: { stock: any, updateStock: any, deleteStock: any }) {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [qty, setQty] = useState(stock.quantity.toString());
  const [price, setPrice] = useState(stock.buy_price.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateQuantity = async (newQty: number) => {
    if (newQty < 0) return;
    setIsUpdating(true);
    try {
      await updateStock(stock.id, { quantity: newQty });
      setQty(newQty.toString());
    } finally {
      setIsUpdating(false);
    }
  };

  const saveQuantity = async () => {
    setIsEditingQty(false);
    const newQty = parseInt(qty.replace(/,/g, ''), 10);
    if (!isNaN(newQty) && newQty !== stock.quantity) {
      await handleUpdateQuantity(newQty);
    } else {
      setQty(stock.quantity.toString());
    }
  };

  const savePrice = async () => {
    setIsEditingPrice(false);
    const newPrice = parseInt(price.replace(/,/g, ''), 10);
    if (!isNaN(newPrice) && newPrice !== stock.buy_price) {
      setIsUpdating(true);
      try {
        await updateStock(stock.id, { buy_price: newPrice });
      } finally {
        setIsUpdating(false);
      }
    } else {
      setPrice(stock.buy_price.toString());
    }
  };

  const avatarColors = ['bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-purple-600', 'bg-cyan-600'];
  const charCode = stock?.symbol?.charCodeAt(0) || 0;
  const bgColorClass = avatarColors[charCode % avatarColors.length];

  return (
    <TableRow className={`${isUpdating ? 'opacity-50' : ''} hover:bg-neutral-50/50 transition-colors`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${bgColorClass}`}>
            {stock?.symbol?.charAt(0) || '?'}
          </div>
          <span className="text-neutral-800">{stock?.symbol}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {isEditingQty ? (
          <input
            autoFocus
            className="w-20 text-right border border-blue-400 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-blue-100"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={saveQuantity}
            onKeyDown={(e) => e.key === 'Enter' && saveQuantity()}
          />
        ) : (
          <div className="flex items-center justify-end space-x-1 group">
            <button 
              className="px-1 text-[10px] font-semibold text-neutral-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleUpdateQuantity(stock.quantity - 100)}
            >-100</button>
            <span 
              className="cursor-pointer hover:underline border-b border-transparent hover:border-neutral-300 text-neutral-700" 
              onClick={() => setIsEditingQty(true)}
            >
              {stock.quantity.toLocaleString()}
            </span>
            <button 
              className="px-1 text-[10px] font-semibold text-neutral-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleUpdateQuantity(stock.quantity + 100)}
            >+100</button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditingPrice ? (
          <input
            autoFocus
            className="w-24 text-right border border-blue-400 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-blue-100"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={savePrice}
            onKeyDown={(e) => e.key === 'Enter' && savePrice()}
          />
        ) : (
          <span 
            className="cursor-pointer hover:underline border-b border-transparent hover:border-neutral-300 text-neutral-600" 
            onClick={() => setIsEditingPrice(true)}
          >
            {formatCurrency(stock.buy_price)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right font-semibold text-blue-600 bg-blue-50/20">
        {formatCurrency(stock.currentPrice)}
      </TableCell>
      <TableCell className="text-right font-semibold text-neutral-800">
        {formatCurrency(stock.currentValue)}
      </TableCell>
      <TableCell className={`text-right font-bold ${stock.profit >= 0 ? 'text-emerald-600 bg-emerald-50/30' : 'text-rose-500 bg-rose-50/30'}`}>
        {stock.profit > 0 ? '+' : ''}{formatCurrency(stock.profit)}
      </TableCell>
      <TableCell className={`text-right font-bold ${stock.profitPercent >= 0 ? 'text-emerald-600 bg-emerald-50/30' : 'text-rose-500 bg-rose-50/30'}`}>
        {stock.profitPercent > 0 ? '+' : ''}{stock.profitPercent.toFixed(2)}%
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => setIsEditingQty(true)}
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa mã ${stock.symbol} khỏi danh mục?`)) {
                deleteStock(stock.id);
              }
            }}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
