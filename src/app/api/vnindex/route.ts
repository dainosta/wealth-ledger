import { NextResponse } from 'next/server';
import { Vnstock } from 'vnstock-ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end dates are required' }, { status: 400 });
  }

  try {
    const vn = new Vnstock();
    const history = await vn.stock('VNINDEX').quote.history(start, end, '1D');
    return NextResponse.json({ data: history });
  } catch (error: any) {
    console.error('VNINDEX API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
