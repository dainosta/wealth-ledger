'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 lg:px-8 bg-white">
      <div className="flex items-center space-x-2 font-bold text-lg text-emerald-600">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">W</div>
        <span>Wealth Ledger</span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOutIcon className="h-4 w-4 mr-2" /> Đăng xuất
      </Button>
    </header>
  );
}
