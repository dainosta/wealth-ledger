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
          const fromTime = toTime - 3 * 24 * 60 * 60; // Fetch last 3 days to account for weekends
          const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromTime}&to=${toTime}&symbol=${symbol}&resolution=1`;
          
          const res = await fetch(url, { 
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(8000)
          });
          if (!res.ok) throw new Error('API fetch failed');
          
          const data = await res.json();
          if (!data || !data.c || data.c.length === 0) {
            throw new Error('No data found');
          }

          const currentPrice = data.c[data.c.length - 1]; // Last close price
          
          return {
            symbol,
            price: currentPrice * 1000, // Multiply by 1000 to get actual VND
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
