import { useState, useEffect } from 'react';

export interface VnindexData {
  time: string; // ISO date string or timestamp
  close: number;
}

export function useVnindexHistory(startDate: string, endDate: string) {
  const [data, setData] = useState<VnindexData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vnindex?start=${startDate}&end=${endDate}`);
        const json = await res.json();
        if (json.data && isMounted) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch VNINDEX history', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  return { data, loading };
}
