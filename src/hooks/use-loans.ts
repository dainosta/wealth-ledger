import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CashLoan } from '@/types';

export function useLoans() {
  const [loans, setLoans] = useState<CashLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLoans = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('cash_loans')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setLoans(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Lỗi khi tải khoản vay:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const addLoan = async (loan: Omit<CashLoan, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('cash_loans').insert([loan]);
      if (error) throw error;
      await fetchLoans();
    } catch (err) {
      console.error('Error adding loan:', err);
      throw err;
    }
  };

  const updateLoan = async (id: string, updates: Partial<CashLoan>) => {
    try {
      const { error } = await supabase.from('cash_loans').update(updates).eq('id', id);
      if (error) throw error;
      await fetchLoans();
    } catch (err) {
      console.error('Error updating loan:', err);
      throw err;
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const { error } = await supabase.from('cash_loans').delete().eq('id', id);
      if (error) throw error;
      await fetchLoans();
    } catch (err) {
      console.error('Error deleting loan:', err);
      throw err;
    }
  };

  return {
    loans,
    loading,
    error,
    refresh: fetchLoans,
    addLoan,
    updateLoan,
    deleteLoan,
  };
}
