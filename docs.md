# Wealth Ledger (Sổ Quản Lý Tài Sản)

**Wealth Ledger** là một ứng dụng web quản lý tài chính cá nhân được thiết kế tối giản, tập trung vào việc tự động hóa tối đa quá trình theo dõi tài sản (Net Worth) thay vì bắt người dùng phải ghi chép thu chi lặt vặt từng ngày.

Ứng dụng giúp người dùng có cái nhìn tổng quan về sức khỏe tài chính thông qua việc tự động cập nhật giá trị các danh mục đầu tư (Cổ phiếu, Vàng) theo thời gian thực và tự động khấu trừ các khoản nợ.

---

## 🌟 Các tính năng chính

### 1. Bảng điều khiển (Dashboard) tự động cập nhật (Live)
- **Tài sản ròng (Net Worth):** Tự động tính toán khối tài sản thực tế theo công thức: 
  `Tài sản ròng = Tổng giá trị Cổ phiếu - (Nợ Vàng + Nợ Tiền mặt + Nợ Thẻ tín dụng)`
- **Tổng Nợ (Total Debt):** Phân rã chi tiết các khoản nợ thành:
  - **Nợ Vàng:** Tự động quy đổi số lượng vàng nợ (lượng) sang VNĐ dựa trên giá vàng SJC thời gian thực. Theo dõi song song giá XAU/USD thế giới.
  - **Nợ Tiền mặt:** Dư nợ tiền mặt thông thường.
  - **Nợ Thẻ tín dụng:** Dư nợ từ các thẻ tín dụng.
- Hiển thị phần trăm thay đổi tài sản ròng so với tháng trước (MoM) cùng với các biểu đồ dạng đường (Sparklines) để theo dõi xu hướng.

### 2. Quản lý Danh mục Cổ phiếu (Stock Portfolio)
- **Đồng bộ tự động (DNSE Sync):** Đăng nhập tài khoản chứng khoán DNSE để tự động kéo toàn bộ danh mục cổ phiếu thực tế (mã, số lượng, giá vốn) về hệ thống. Các mã từ DNSE sẽ có nhãn `(DNSE)` màu xanh lá.
- **Nhập tay (Manual):** Hỗ trợ nhập tay các mã cổ phiếu đang nắm giữ ở công ty chứng khoán khác. Có nhãn `(Nhập tay)` màu cam.
- **Live Quotes:** Hệ thống tự động fetch (lấy) giá khớp lệnh hiện tại trên thị trường chứng khoán Việt Nam mỗi 5 giây, từ đó tính toán ngay lập tức **Lỗ/Lãi (Profit/Loss)** và **Thành tiền (Current Value)** cho từng mã.
- Cung cấp tính năng xem dạng Bảng chi tiết hoặc dạng Biểu đồ Phân bổ (Pie Chart).

### 3. Sổ cái hàng tháng (Monthly Ledger)
- Thay vì ghi chép hằng ngày, người dùng chỉ cần "Chốt sổ" 1 lần/tháng.
- Các thông số được ghi nhận: Số lượng vàng đang nợ, Tiền mặt nợ, Thẻ tín dụng nợ, Ghi chú.
- Hệ thống sẽ tự động dùng giá vàng và danh mục cổ phiếu **tại thời điểm đó** để lưu cứng (snapshot) lại bức tranh tài chính của tháng.

### 4. Mục tiêu tự do tài chính (Financial Goal)
- Cho phép người dùng đặt một con số mục tiêu (Ví dụ: 10 tỷ).
- Cung cấp thanh tiến độ trực quan hiển thị % hoàn thành dựa trên Tài sản ròng thực tế hiện tại (Net worth).

---

## 🛠 Kiến trúc & Công nghệ (Tech Stack)

- **Frontend Framework:** Next.js 16 (App Router), React 19.
- **Ngôn ngữ:** TypeScript.
- **Giao diện (UI/UX):** Tailwind CSS kết hợp với Shadcn UI (dựa trên `@base-ui/react`).
- **Biểu đồ:** Recharts.
- **Cơ sở dữ liệu:** Supabase (PostgreSQL).
- **Hosting:** Vercel.
- **Tự động hóa dữ liệu (APIs):**
  - **API Chứng khoán:** Lấy thông qua hệ thống API bên thứ 3 (SSI/DNSE/Fireant).
  - **API Vàng:** Tự động lấy giá SJC và giá thế giới.

---

## 🗄 Cấu trúc Cơ sở dữ liệu (Supabase)

Ứng dụng sử dụng 3 bảng chính trên Supabase:

1. **`monthly_records`**: Bảng sổ cái hàng tháng.
   - `id` (uuid)
   - `month_year` (text - Ví dụ: "06-2026")
   - `portfolio_value` (numeric - Bức ảnh chụp giá trị cổ phiếu khi chốt)
   - `gold_price` (numeric - Bức ảnh chụp giá vàng khi chốt)
   - `gold_debt_qty` (numeric - Số lượng vàng nợ)
   - `cash_debt` (numeric - Dư nợ tiền mặt)
   - `credit_card_debt` (numeric - Dư nợ thẻ tín dụng)
   - `notes` (text - Ghi chú)

2. **`stock_portfolio`**: Bảng danh mục cổ phiếu hiện tại.
   - `id` (uuid)
   - `symbol` (text - Ví dụ: "FPT")
   - `quantity` (integer - Số lượng)
   - `buy_price` (numeric - Giá vốn)
   - `source` (text - 'DNSE' hoặc 'MANUAL')

3. **`financial_goals`**: Bảng lưu mục tiêu tài chính (chỉ có 1 dòng duy nhất).
   - `id` (uuid)
   - `target_amount` (numeric - Số tiền mục tiêu)
   - `updated_at` (timestamp)

---

## 🚀 Triển khai (Deployment)

Để triển khai dự án này tại local hoặc server mới:
1. Copy kho lưu trữ: `git clone ...`
2. Cài đặt thư viện: `npm install`
3. Cấu hình biến môi trường (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Chạy các lệnh SQL setup bảng (đã được đề cập trong các file `_sql.md`).
5. Chạy môi trường Dev: `npm run dev` hoặc Build Production: `npm run build && npm start`.
