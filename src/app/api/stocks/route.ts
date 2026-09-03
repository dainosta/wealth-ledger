import { NextResponse } from 'next/server';

export const revalidate = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json({ error: 'Symbols are required' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
  
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const toTime = Math.floor(Date.now() / 1000);
          // 1. Thử lấy nến 1 phút trong 3 ngày gần nhất (tối ưu tốc độ và độ trễ khi thị trường đang mở phiên)
          const fromTimeShort = toTime - 3 * 24 * 60 * 60;
          const url1m = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromTimeShort}&to=${toTime}&symbol=${symbol}&resolution=1`;
          
          let res = await fetch(url1m, { 
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(8000)
          });
          let data = res.ok ? await res.json() : null;

          // 2. Nếu không có dữ liệu (cuối tuần dài hoặc nghỉ lễ như Tết, 30/4, 2/9), fallback sang nến ngày 1D trong 30 ngày
          if (!data || !data.c || data.c.length === 0) {
            const fromTimeLong = toTime - 30 * 24 * 60 * 60;
            const url1D = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromTimeLong}&to=${toTime}&symbol=${symbol}&resolution=1D`;
            res = await fetch(url1D, { 
              next: { revalidate: 10 },
              signal: AbortSignal.timeout(8000)
            });
            data = res.ok ? await res.json() : null;
          }
          
          if (!data || !data.c || data.c.length === 0) {
            throw new Error('No data found');
          }

          const currentPrice = data.c[data.c.length - 1]; // Last close price
          
          return {
            symbol,
            price: Math.round(currentPrice * 1000), // Multiply by 1000 to get actual VND
            companyName: symbol, // DNSE chart API doesn't return company name, fallback to symbol
            error: null
          };
        } catch (err: any) {
          return {
            symbol,
            price: 0,
            companyName: symbol,
            error: err.message || 'Not found'
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Stocks API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
