'use client';

import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { useRecords } from '@/hooks/use-records';
import Papa from 'papaparse';

export function ExportCsvButton() {
  const { records } = useRecords();

  const handleExport = () => {
    if (records.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Map the records to a flat format suitable for CSV
    const csvData = records.map((record) => ({
      Tháng: record.month_year,
      'Tổng danh mục': record.portfolio_value,
      'Giá vàng': record.gold_price,
      'Nợ vàng (lượng)': record.gold_debt_qty,
      'Ghi chú': record.notes || '',
    }));

    const csvString = Papa.unparse(csvData, {
      quotes: false,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      header: true,
      newline: '\r\n',
    });

    // Create a blob and download link
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF is for UTF-8 BOM so Excel opens it with correct encoding
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wealth_ledger_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
      <DownloadIcon className="mr-2 h-4 w-4" /> Xuất CSV
    </Button>
  );
}
