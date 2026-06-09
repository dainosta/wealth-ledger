import { useState, useEffect, useCallback } from 'react';
import { MonthlyRecord, CalculatedMonthlyRecord } from '@/types';
import { calculateRecords } from '@/lib/calculations';
import { createClient } from '@/utils/supabase/client';

export function useRecords() {
  const supabase = createClient();
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [calculatedRecords, setCalculatedRecords] = useState<CalculatedMonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!supabase) {
      setError('Supabase client chưa được cấu hình.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('monthly_records')
        .select('*')
        .order('month_year', { ascending: true }); // Có thể phải parse date để order chính xác hơn nếu chuỗi text không chuẩn, nhưng tạm thời dùng MM-YYYY, lý tưởng là YYYY-MM

      if (fetchError) throw fetchError;
      
      setRecords(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    // Sắp xếp records theo thời gian (dựa trên MM-YYYY) trước khi tính toán
    const sortedRecords = [...records].sort((a, b) => {
      const [monthA, yearA] = a.month_year.split('-');
      const [monthB, yearB] = b.month_year.split('-');
      const dateA = new Date(Number(yearA), Number(monthA) - 1).getTime();
      const dateB = new Date(Number(yearB), Number(monthB) - 1).getTime();
      return dateA - dateB;
    });
    
    setCalculatedRecords(calculateRecords(sortedRecords));
  }, [records]);

  const addRecord = async (record: Omit<MonthlyRecord, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('monthly_records')
        .insert([record])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setRecords((prev) => [...prev, data].sort((a, b) => a.month_year.localeCompare(b.month_year)));
    } catch (err: any) {
      console.error('Error adding record:', err);
      throw err;
    }
  };

  const addRecords = async (newRecords: Omit<MonthlyRecord, 'id' | 'created_at'>[]) => {
    try {
      const { data, error: insertError } = await supabase
        .from('monthly_records')
        .insert(newRecords)
        .select();
      
      if (insertError) throw insertError;
      
      setRecords((prev) => [...prev, ...data].sort((a, b) => a.month_year.localeCompare(b.month_year)));
    } catch (err: any) {
      console.error('Error adding records:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, updated: Partial<MonthlyRecord>) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('monthly_records').update(updated).eq('id', id);
      if (error) throw error;
      await fetchRecords(); // Tải lại danh sách
    } catch (err) {
      console.error('Error updating record:', err);
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from('monthly_records').delete().eq('id', id);
      if (error) throw error;
      await fetchRecords(); // Tải lại danh sách
    } catch (err) {
      console.error('Error deleting record:', err);
      throw err;
    }
  };

  const overwriteAllRecords = async (newRecords: Omit<MonthlyRecord, 'id' | 'created_at'>[]) => {
    try {
      // 1. Lấy user_id hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // 2. Xóa toàn bộ dữ liệu của user này
      const { error: deleteError } = await supabase
        .from('monthly_records')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;

      // 3. Chèn dữ liệu mới
      const { data, error: insertError } = await supabase
        .from('monthly_records')
        .insert(newRecords)
        .select();
      
      if (insertError) throw insertError;
      
      await fetchRecords();
    } catch (err: any) {
      console.error('Error overwriting records:', err);
      throw err;
    }
  };

  const getBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('ledger_backups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching backups:', err);
      return [];
    }
  };

  const saveBackup = async (name: string) => {
    try {
      // Lưu danh sách records hiện tại (loại bỏ id và created_at, user_id để khi restore tạo bản ghi mới sạch)
      const dataToBackup = records.map(r => ({
        month_year: r.month_year,
        portfolio_value: r.portfolio_value,
        gold_price: r.gold_price,
        gold_debt_qty: r.gold_debt_qty,
        notes: r.notes
      }));

      const { error } = await supabase
        .from('ledger_backups')
        .insert([{ name, data: dataToBackup }]);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving backup:', err);
      throw err;
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const { data: backup, error: fetchError } = await supabase
        .from('ledger_backups')
        .select('data')
        .eq('id', backupId)
        .single();
        
      if (fetchError || !backup) throw fetchError || new Error('Backup not found');
      
      // Ghi đè toàn bộ dữ liệu bằng dữ liệu từ backup
      await overwriteAllRecords(backup.data);
    } catch (err) {
      console.error('Error restoring backup:', err);
      throw err;
    }
  };

  return {
    records: calculatedRecords,
    loading,
    error,
    addRecord,
    addRecords,
    updateRecord,
    deleteRecord,
    overwriteAllRecords,
    getBackups,
    saveBackup,
    restoreBackup,
    refresh: fetchRecords
  };
}
