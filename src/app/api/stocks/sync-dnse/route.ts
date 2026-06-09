import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng cung cấp tài khoản và mật khẩu DNSE' }, { status: 400 });
    }

    // 1. Lấy JWT token từ DNSE
    const authRes = await fetch('https://services.entrade.com.vn/dnse-user-service/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const authData = await authRes.json();
    
    if (!authRes.ok || !authData.token) {
      return NextResponse.json({ 
        error: authData.message || 'Sai thông tin đăng nhập hoặc tài khoản bị khóa' 
      }, { status: 401 });
    }
    
    const token = authData.token;

    // 2. Lấy danh sách tiểu khoản (Sub-accounts)
    const accRes = await fetch('https://services.entrade.com.vn/dnse-order-service/accounts', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!accRes.ok) {
      return NextResponse.json({ error: 'Không thể lấy thông tin tiểu khoản' }, { status: 500 });
    }
    
    const accData = await accRes.json();
    if (!accData.accounts || accData.accounts.length === 0) {
      return NextResponse.json({ error: 'Tài khoản DNSE không có tiểu khoản nào' }, { status: 404 });
    }
    
    // Lấy tiểu khoản đầu tiên (hoặc tiểu khoản đang có giao dịch)
    const accountId = accData.accounts[0].id;

    // 3. Lấy danh sách các giao dịch (Deals/Positions) đang mở
    const dealsRes = await fetch(`https://services.entrade.com.vn/dnse-deal-service/deals?accountNo=${accountId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!dealsRes.ok) {
      return NextResponse.json({ error: 'Không thể lấy dữ liệu danh mục đầu tư' }, { status: 500 });
    }
    
    const dealsData = await dealsRes.json();
    const deals = dealsData.deals || [];
    
    // 4. Tổng hợp các Deal cùng một mã cổ phiếu (symbol)
    const portfolioMap = new Map<string, { quantity: number; totalCost: number }>();
    
    for (const deal of deals) {
      if (deal.status !== 'OPEN' || !deal.openQuantity || deal.openQuantity <= 0) continue;
      
      const symbol = deal.symbol;
      const qty = deal.openQuantity;
      const cost = deal.costPrice * qty;
      
      if (portfolioMap.has(symbol)) {
        const existing = portfolioMap.get(symbol)!;
        existing.quantity += qty;
        existing.totalCost += cost;
      } else {
        portfolioMap.set(symbol, { quantity: qty, totalCost: cost });
      }
    }
    
    const syncedStocks = Array.from(portfolioMap.entries()).map(([symbol, data]) => ({
      symbol,
      quantity: data.quantity,
      buy_price: Math.round(data.totalCost / data.quantity) // Tính giá vốn trung bình và làm tròn thành số nguyên
    }));
    
    return NextResponse.json({ 
      success: true, 
      stocks: syncedStocks,
      message: `Đã đồng bộ thành công ${syncedStocks.length} mã cổ phiếu từ DNSE.` 
    });
    
  } catch (error: any) {
    console.error('Lỗi khi đồng bộ DNSE:', error);
    return NextResponse.json({ error: error.message || 'Lỗi kết nối tới hệ thống DNSE' }, { status: 500 });
  }
}
