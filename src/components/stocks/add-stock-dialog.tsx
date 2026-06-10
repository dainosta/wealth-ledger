'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { useStocks } from '@/hooks/use-stocks';

export function AddStockDialog() {
  const { addStock } = useStocks();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addStock({
        symbol: symbol.toUpperCase(),
        quantity: Number(quantity.replace(/,/g, '')),
        buy_price: Number(buyPrice.replace(/,/g, '')),
        source: 'MANUAL'
      });
      setOpen(false);
      setSymbol('');
      setQuantity('');
      setBuyPrice('');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi thêm cổ phiếu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: 'sm' })}>
        <PlusIcon className="mr-2 h-4 w-4" /> Thêm mã
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm cổ phiếu vào danh mục</DialogTitle>
            <DialogDescription>
              Nhập mã chứng khoán (VD: FPT, VCB), số lượng và giá trung bình mà bạn đã mua.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">
                Mã CK
              </Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Ví dụ: FPT"
                className="col-span-3"
                required
                maxLength={10}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Số lượng
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                placeholder="Ví dụ: 1000"
                required
                min={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buyPrice" className="text-right">
                Giá mua (đ)
              </Label>
              <Input
                id="buyPrice"
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="col-span-3"
                placeholder="Ví dụ: 130000"
                required
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
