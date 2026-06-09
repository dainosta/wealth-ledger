'use client';

import { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DatabaseIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import { useRecords } from '@/hooks/use-records';
import { format } from 'date-fns';

export function BackupManager() {
  const { getBackups, saveBackup, restoreBackup } = useRecords();
  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBackups = async () => {
    setLoading(true);
    const data = await getBackups();
    setBackups(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open]);

  const handleCreateBackup = async () => {
    const name = prompt('Nhập tên cho bản sao lưu này (VD: Trước khi thử nghiệm):');
    if (!name) return;
    
    setLoading(true);
    try {
      await saveBackup(name);
      await loadBackups();
      alert('Tạo bản sao lưu thành công!');
    } catch (err) {
      alert('Lỗi khi tạo bản sao lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId: string, name: string) => {
    if (!confirm(`CẢNH BÁO: Dữ liệu hiện tại sẽ bị GHI ĐÈ hoàn toàn bởi bản sao lưu "${name}". Bạn có chắc chắn muốn khôi phục không?`)) {
      return;
    }

    setLoading(true);
    try {
      await restoreBackup(backupId);
      alert('Khôi phục dữ liệu thành công!');
      setOpen(false);
    } catch (err) {
      alert('Lỗi khi khôi phục bản sao lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-8' })}>
        <DatabaseIcon className="mr-2 h-4 w-4" /> Sao lưu
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quản lý Sao lưu</DialogTitle>
          <DialogDescription>
            Tạo và khôi phục các phiên bản Sổ cái của bạn.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Danh sách bản sao lưu</h4>
            <Button size="sm" onClick={handleCreateBackup} disabled={loading}>
              <SaveIcon className="mr-2 h-4 w-4" /> Tạo sao lưu mới
            </Button>
          </div>
          
          <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
            {loading && backups.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">Đang tải...</div>
            ) : backups.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">Chưa có bản sao lưu nào.</div>
            ) : (
              backups.map(backup => (
                <div key={backup.id} className="p-3 flex items-center justify-between hover:bg-neutral-50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{backup.name}</p>
                    <p className="text-xs text-neutral-500">
                      {format(new Date(backup.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRestore(backup.id, backup.name)}
                    disabled={loading}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <RotateCcwIcon className="mr-2 h-4 w-4" /> Khôi phục
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
