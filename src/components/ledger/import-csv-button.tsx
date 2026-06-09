'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { useRecords } from '@/hooks/use-records';
import Papa from 'papaparse';

export function ImportCsvButton() {
  const { overwriteAllRecords, saveBackup } = useRecords();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data as any[];
          
          const newRecords = parsedData.map((row) => ({
            month_year: row['Tháng'] || row['month_year'] || '',
            portfolio_value: Number(row['Tổng danh mục'] || row['portfolio_value'] || 0),
            gold_price: Number(row['Giá vàng'] || row['gold_price'] || 0),
            gold_debt_qty: Number(row['Nợ vàng (lượng)'] || row['gold_debt_qty'] || 0),
            notes: row['Ghi chú'] || row['notes'] || '',
          })).filter(r => r.month_year !== ''); // Bỏ qua dòng rỗng

          if (newRecords.length === 0) {
            alert('File CSV không hợp lệ hoặc trống.');
            setLoading(false);
            return;
          }

          if (confirm(`Tìm thấy ${newRecords.length} bản ghi trong file CSV.\nCẢNH BÁO: Thao tác này sẽ XÓA SẠCH dữ liệu hiện tại và thay thế bằng dữ liệu trong file CSV. Bạn có chắc chắn muốn ghi đè toàn bộ sổ cái không?`)) {
            // Tự động tạo một backup dự phòng trước khi ghi đè
            try {
              await saveBackup(`Tự động backup trước khi nhập CSV (${new Date().toLocaleString('vi-VN')})`);
            } catch (backupErr) {
              console.error('Không thể tạo backup dự phòng', backupErr);
            }
            
            await overwriteAllRecords(newRecords);
            alert('Nhập dữ liệu và ghi đè thành công!');
          }
        } catch (error) {
          console.error(error);
          alert('Có lỗi xảy ra khi nhập dữ liệu.');
        } finally {
          setLoading(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error('Lỗi parse CSV:', error);
        alert('File không đúng định dạng CSV.');
        setLoading(false);
      }
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" size="sm" className="h-8" onClick={handleClick} disabled={loading}>
        <UploadIcon className="mr-2 h-4 w-4" /> 
        {loading ? 'Đang nhập...' : 'Nhập CSV'}
      </Button>
    </>
  );
}
