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
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 px-4 lg:px-8 bg-[#0a0a0a]">
      <div className="flex items-center space-x-2 font-bold text-lg text-emerald-500 tracking-widest uppercase">
        <div className="w-8 h-8 rounded-none border border-emerald-500 bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono">W</div>
        <span>Wealth Ledger</span>
      </div>
      <div className="flex items-center space-x-2">
        <BackupManager />
        <ImportCsvButton />
        <ExportCsvButton />
        <div className="w-px h-6 bg-neutral-800 mx-2" />
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-400 hover:text-white rounded-none hover:bg-neutral-900 font-mono text-xs">
          <LogOutIcon className="h-4 w-4 mr-2" /> EXIT
        </Button>
      </div>
    </header>
  );
}
