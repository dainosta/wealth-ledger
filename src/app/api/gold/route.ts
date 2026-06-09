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
      next: { revalidate: 3600 } // Cache gold price for 1 hour
    });

    if (!goldRes.ok) throw new Error('Failed to fetch gold price');
    const goldData = await goldRes.json();

    if (goldData.results && goldData.results.length > 0) {
      // Return the latest SJC price
      return NextResponse.json(goldData.results[0]);
    }

    throw new Error('No gold data returned');
  } catch (error: any) {
    console.error('Gold API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
