import { NextResponse } from 'next/server';
// @ts-ignore
import { quickQuote } from 'vnstock-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
          const quote = await quickQuote(symbol);
          return {
            symbol,
            price: (quote?.price || 0) * 1000, // Multiply by 1000 to get actual VND
            companyName: quote?.companyName || symbol,
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
