import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface GoalSettings {
  target_net_worth: number;
  target_date: string;
}

export function useGoal() {
  const [goal, setGoal] = useState<GoalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error; // Ignore not found error
      }
      
      if (data) {
        setGoal({
          target_net_worth: data.target_net_worth,
          target_date: data.target_date
        });
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu mục tiêu:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (settings: GoalSettings) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ id: 1, ...settings });
        
      if (error) throw error;
      setGoal(settings); // Optimistic UI update
      await fetchGoal();
    } catch (err) {
      console.error('Lỗi khi cập nhật mục tiêu:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  return { goal, loading, updateGoal };
}
