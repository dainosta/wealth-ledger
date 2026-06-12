'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCwIcon, CloudDownloadIcon, ShieldCheckIcon, AlertTriangleIcon } from 'lucide-react';
import { StockRecord } from '@/hooks/use-stocks';

export function DnseSyncDialog({ 
  onSyncComplete 
}: { 
  onSyncComplete: (stocks: Omit<StockRecord, 'id' | 'created_at'>[]) => Promise<void> 
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // 1. Gọi API nội bộ (đã che giấu logic) để fetch từ DNSE
      const res = await fetch('/api/stocks/sync-dnse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi kết nối tới hệ thống DNSE');
      }

      // 2. Pass dữ liệu lên component cha để ghi đè danh mục hiện tại
      await onSyncComplete(data.stocks || []);
      
      setOpen(false);
      // Reset
      setUsername('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800" })}>
        <CloudDownloadIcon className="mr-2 h-3.5 w-3.5" />
        Đồng bộ DNSE
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-emerald-700">
            <CloudDownloadIcon className="w-5 h-5 mr-2" />
            Đồng bộ từ DNSE
          </DialogTitle>
          <DialogDescription>
            Tự động tải danh mục chứng khoán thực tế từ tài khoản DNSE.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 items-start">
            <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Lưu ý:</strong> Hành động này sẽ <strong>ghi đè các mã cổ phiếu đã đồng bộ từ DNSE trước đó</strong>. Các mã bạn nhập tay (MANUAL) sẽ được giữ nguyên.
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg flex gap-3 items-start">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 font-medium leading-relaxed">
              Thông tin đăng nhập được gửi thẳng tới máy chủ Entrade để lấy phiên làm việc (Token) một lần duy nhất và <strong>không được lưu trữ dưới bất kỳ hình thức nào</strong>.
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-rose-600 bg-rose-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="dnse-username">Tên đăng nhập (SĐT / Email)</Label>
            <Input
              id="dnse-username"
              placeholder="VD: 0987654321"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSyncing}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dnse-password">Mật khẩu</Label>
            <Input
              id="dnse-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSyncing}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSyncing}>
            Hủy
          </Button>
          <Button onClick={handleSync} disabled={isSyncing || !username || !password} className="bg-emerald-600 hover:bg-emerald-700">
            {isSyncing ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Bắt đầu đồng bộ'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
