import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Request new API key from VNAppMob
    const keyRes = await fetch('https://api.vnappmob.com/api/request_api_key?scope=gold', {
      method: 'GET',
      next: { revalidate: 3600 } // Cache key for 1 hour to avoid spamming
    });
    
    if (!keyRes.ok) throw new Error('Failed to get API key');
    const keyData = await keyRes.json();
    const apiKey = keyData.results;

    // 2. Fetch SJC Gold Price
    const goldRes = await fetch('https://api.vnappmob.com/api/v2/gold/sjc', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      next: { revalidate: 60 } // Cache gold price for 1 minute
    });

    if (!goldRes.ok) throw new Error('Failed to fetch gold price');
    const goldData = await goldRes.json();

    // 3. Fetch XAUUSD from TradingView
    let xauusdPrice = 0;
    let xauusdChange = 0;
    try {
      const tvRes = await fetch('https://scanner.tradingview.com/cfd/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers: ['FX_IDC:XAUUSD'] },
          columns: ['close', 'change']
        }),
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(3000)
      });
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        if (tvData.data && tvData.data.length > 0) {
          xauusdPrice = tvData.data[0].d[0];
          xauusdChange = tvData.data[0].d[1];
        }
      }
    } catch (e) {
      console.error('TradingView Gold Error:', e);
    }

    if (goldData.results && goldData.results.length > 0) {
      return NextResponse.json({
        ...goldData.results[0],
        xauusdPrice,
        xauusdChange
      });
    }

    throw new Error('No gold data returned');
  } catch (error: any) {
    console.error('Gold API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
