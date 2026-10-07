# EduMind Admin Web (Next.js 14)

Hệ thống Quản trị & Điều hành nền tảng học trực tuyến thông minh EduMind.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18, TypeScript
- **Styling:** Tailwind CSS 3.4
- **State Management & Data Fetching:** Zustand 4, TanStack Query 5 (React Query)
- **Form & Validation:** React Hook Form, Zod
- **Icons:** Phosphor Icons React
- **HTTP Client:** Axios
- **Testing:** Jest, React Testing Library, User Event

## Yêu cầu môi trường
- Node.js >= 18.17 (`node -v`)
- npm >= 9.x

## Cài đặt & Khởi chạy

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

2. Cấu hình biến môi trường:
   Sao chép `.env.example` thành `.env.local` và cập nhật thông số cần thiết:
   ```bash
   cp .env.example .env.local
   ```

3. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

4. Kiểm thử (Unit Tests):
   ```bash
   npm test
   ```

5. Đóng gói kiểm tra (Production Build):
   ```bash
   npm run build
   ```
