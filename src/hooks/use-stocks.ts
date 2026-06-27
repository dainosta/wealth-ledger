import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface StockRecord {
  id: string;
  symbol: string;
  quantity: number;
  buy_price: number;
  source?: string;
  custom_logo?: string;
  created_at: string;
}

export interface StockWithQuote extends StockRecord {
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
}

export function useStocks() {
  const [stocks, setStocks] = useState<StockWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const supabase = createClient();

  const fetchStocks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('stock_portfolio')
        .select('*')
        .order('symbol', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setStocks([]);
        return;
      }

      // Lấy giá hiện tại từ API VNStock (Thêm timestamp để chống cache trình duyệt)
      const symbols = data.map(s => s.symbol).join(',');
      const res = await fetch(`/api/stocks?symbols=${symbols}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải dữ liệu giá cổ phiếu');
      
      const quoteData = await res.json();
      const quotes = quoteData.results || [];

      // Tính toán lỗ/lãi
      const enrichedStocks = data.map((stock: StockRecord) => {
        const quote = quotes.find((q: { symbol: string; price: number }) => q.symbol === stock.symbol);
        const currentPrice = quote?.price || stock.buy_price; // Nếu lỗi mạng, dùng giá mua tạm
        const currentValue = stock.quantity * currentPrice;
        const totalCost = stock.quantity * stock.buy_price;
        const profit = currentValue - totalCost;
        const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return {
          ...stock,
          currentPrice,
          currentValue,
          profit,
          profitPercent
        };
      });

      setStocks(enrichedStocks);
      setError(null);
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh mục cổ phiếu:', err);
      setError(err instanceof Error ? err.message : String(err));
      setSyncStatus('error');
    } finally {
      if (showLoading) setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchStocks();
    
    // Auto refresh every 5 seconds without showing loading spinner
    const interval = setInterval(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchStocks(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addStock = async (record: Omit<StockRecord, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('stock_portfolio').insert([record]);
      if (error) throw error;
      await fetchStocks();
    } catch (err) {
      console.error('Error adding stock:', err);
      throw err;
    }
  };

  const updateStock = async (id: string, updates: Partial<Omit<StockRecord, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase.from('stock_portfolio').update(updates).eq('id', id);
      if (error) throw error;
      await fetchStocks();
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const deleteStock = async (id: string) => {
    try {
      const { error } = await supabase.from('stock_portfolio').delete().eq('id', id);
      if (error) throw error;
      await fetchStocks();
    } catch (err) {
      console.error('Error deleting stock:', err);
      throw err;
    }
  };

  const replacePortfolio = async (newStocks: Omit<StockRecord, 'id' | 'created_at'>[]) => {
    try {
      setLoading(true);
      // Xóa toàn bộ mã thuộc DNSE
      const { error: deleteError } = await supabase.from('stock_portfolio').delete().eq('source', 'DNSE');
      if (deleteError) throw deleteError;

      // Chèn danh sách mới (nếu có)
      if (newStocks.length > 0) {
        const { error: insertError } = await supabase.from('stock_portfolio').insert(newStocks);
        if (insertError) throw insertError;
      }
      
      await fetchStocks();
    } catch (err) {
      console.error('Error replacing portfolio:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stocks,
    loading,
    error,
    initialized,
    lastSyncTime,
    syncStatus,
    fetchStocks,
    addStock,
    updateStock,
    deleteStock,
    replacePortfolio,
    refresh: fetchStocks
  };
}
