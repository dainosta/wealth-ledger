'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BackupManager } from '@/components/ledger/backup-manager';
import { ImportCsvButton } from '@/components/ledger/import-csv-button';
import { ExportCsvButton } from '@/components/ledger/export-csv-button';

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
      <div className="flex items-center space-x-2">
        <BackupManager />
        <ImportCsvButton />
        <ExportCsvButton />
        <div className="w-px h-6 bg-neutral-200 mx-2" />
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 hover:text-neutral-700">
          <LogOutIcon className="h-4 w-4 mr-2" /> Đăng xuất
        </Button>
      </div>
    </header>
  );
}
