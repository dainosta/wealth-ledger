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
  const { stocks, loading, error, deleteStock, refresh, updateStock, replacePortfolio, lastSyncTime, syncStatus } = stocksData;
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const totalBuyValue = stocks.reduce((sum: any, stock: any) => sum + stock.quantity * stock.buy_price, 0);
  const totalCurrentValue = stocks.reduce((sum: any, stock: any) => sum + stock.currentValue, 0);
  const totalProfit = totalCurrentValue - totalBuyValue;
  const totalProfitPercent = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none overflow-hidden bg-black">
      <CardHeader className="flex flex-row items-center justify-between shrink-0 py-2 px-3 border-b border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-300">DANH MỤC CỔ PHIẾU</CardTitle>
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-none p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all ${viewMode === 'table' ? 'bg-black border border-neutral-700 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300 border border-transparent'}`}
            >
              DỮ LIỆU BẢNG
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all ${viewMode === 'chart' ? 'bg-black border border-neutral-700 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300 border border-transparent'}`}
            >
              PHÂN BỔ
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastSyncTime && (
            <div className="hidden md:flex items-center text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 mr-2 bg-neutral-900 px-2 py-1 rounded-none border border-neutral-800">
              <span className={`w-1.5 h-1.5 rounded-none mr-1.5 ${syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              Cập nhật lúc: {lastSyncTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
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
          <DnseSyncDialog onSyncComplete={replacePortfolio} />
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
          <Table className="[&_td]:py-1.5 [&_td]:px-2 [&_th]:py-2 [&_th]:px-2 border-b border-neutral-800">
            <TableHeader className="bg-[#0a0a0a] border-b border-neutral-800">
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="font-bold text-neutral-500">Mã CK</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Số lượng</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Giá mua</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Giá HT</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Thành tiền</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Lỗ/Lãi</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">%</TableHead>
                <TableHead className="text-right font-bold text-neutral-500 w-24">Tỷ trọng</TableHead>
                <TableHead className="text-right font-bold text-neutral-500">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có mã cổ phiếu nào trong danh mục.'}
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((stock: any) => (
                  <StockTableRow key={stock.id} stock={stock} totalValue={totalCurrentValue} updateStock={updateStock} deleteStock={deleteStock} />
                ))
              )}

              {stocks.length > 0 && (
                <TableRow className="bg-[#0a0a0a] font-bold border-t border-neutral-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="uppercase text-neutral-500">TỔNG CỘNG</TableCell>
                  <TableCell className="text-right font-mono text-neutral-200">{formatCurrency(totalCurrentValue)}</TableCell>
                  <TableCell className={`text-right font-mono ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {totalProfit > 0 ? '+' : ''}{formatCurrency(totalProfit)}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${totalProfitPercent >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {totalProfitPercent > 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell></TableCell>
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

function StockTableRow({ stock, totalValue, updateStock, deleteStock }: { stock: any, totalValue: number, updateStock: any, deleteStock: any }) {
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
    <TableRow className={`${isUpdating ? 'opacity-50' : ''} border-neutral-800 hover:bg-neutral-900/50 transition-colors`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-none flex items-center justify-center text-[10px] font-bold text-white ${bgColorClass}`}>
            {stock?.symbol?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-200 leading-none">{stock?.symbol}</span>
            {stock?.source === 'DNSE' ? (
              <span className="text-[9px] font-bold text-emerald-500 mt-0.5">DNSE</span>
            ) : (
              <span className="text-[9px] font-bold text-amber-500 mt-0.5">NHẬP TAY</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {isEditingQty ? (
          <input
            autoFocus
            className="w-20 text-right font-mono bg-black border border-blue-500 rounded-none px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 text-neutral-200"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onBlur={saveQuantity}
            onKeyDown={(e) => e.key === 'Enter' && saveQuantity()}
          />
        ) : (
          <div className="flex items-center justify-end space-x-1 group">
            <button 
              className="px-1 text-[10px] font-bold text-neutral-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleUpdateQuantity(stock.quantity - 100)}
            >-100</button>
            <span 
              className="cursor-pointer font-mono hover:underline border-b border-transparent hover:border-neutral-500 text-neutral-300" 
              onClick={() => setIsEditingQty(true)}
            >
              {stock.quantity.toLocaleString()}
            </span>
            <button 
              className="px-1 text-[10px] font-bold text-neutral-600 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleUpdateQuantity(stock.quantity + 100)}
            >+100</button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditingPrice ? (
          <input
            autoFocus
            className="w-24 text-right font-mono bg-black border border-blue-500 rounded-none px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 text-neutral-200"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={savePrice}
            onKeyDown={(e) => e.key === 'Enter' && savePrice()}
          />
        ) : (
          <span 
            className="cursor-pointer font-mono hover:underline border-b border-transparent hover:border-neutral-500 text-neutral-400" 
            onClick={() => setIsEditingPrice(true)}
          >
            {formatCurrency(stock.buy_price)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-blue-400">
        {formatCurrency(stock.currentPrice)}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-neutral-200">
        {formatCurrency(stock.currentValue)}
      </TableCell>
      <TableCell className={`text-right font-mono font-bold ${stock.profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
        {stock.profit > 0 ? '+' : ''}{formatCurrency(stock.profit)}
      </TableCell>
      <TableCell className={`text-right font-mono font-bold ${stock.profitPercent >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
        {stock.profitPercent > 0 ? '+' : ''}{stock.profitPercent.toFixed(2)}%
      </TableCell>
      <TableCell className="text-right text-neutral-500 text-xs w-24">
        <div className="flex items-center justify-end gap-2 w-full">
          <div className="w-10 bg-neutral-800 rounded-none h-1.5 overflow-hidden flex-shrink-0">
            <div 
              className="h-full bg-blue-500 rounded-none" 
              style={{ width: `${(stock.currentValue / totalValue) * 100}%` }}
            />
          </div>
          <span className="w-9 text-right font-mono font-bold text-neutral-400">
            {((stock.currentValue / totalValue) * 100).toFixed(1)}%
          </span>
        </div>
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
