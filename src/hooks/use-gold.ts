import { useState, useEffect } from 'react';

export function useGold() {
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoldPrice = async () => {
    try {
      const res = await fetch('/api/gold?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('Lỗi fetch giá vàng');
      const data = await res.json();
      if (data.sell_1l) {
        setGoldPrice(data.sell_1l);
      }
    } catch (err) {
      console.error('Không thể lấy giá vàng SJC Live:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchGoldPrice();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { goldPrice, loading };
}
