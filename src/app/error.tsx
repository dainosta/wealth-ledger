'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Global Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
        <div className="bg-rose-100 p-3 rounded-full mb-4">
          <AlertTriangleIcon className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Đã xảy ra lỗi!</h2>
        <p className="text-sm text-neutral-600 mb-4 text-left p-3 bg-neutral-50 rounded-lg w-full overflow-auto max-h-40 border font-mono">
          {error.message || 'Lỗi không xác định'}
        </p>
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1 h-10"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10"
            onClick={() => reset()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
}
