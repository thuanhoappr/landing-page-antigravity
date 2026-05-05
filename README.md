This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Production (repo thật)

1. **Environment variables** — trên Vercel (Production), set tối thiểu: Postgres (`POSTGRES_URL` / `DATABASE_URL` / `STORAGE_URL`), Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`), và các biến SePay / `NEXT_PUBLIC_*` nếu bạn dùng. Danh sách tên biến: [`.env.example`](./.env.example). Checklist tick từng mục: [`my-brain/deploy_checklist.md`](./my-brain/deploy_checklist.md).

2. **Cron email sequence** — `vercel.json` đăng ký `/api/cron/email-sequence` (schedule trong file). Gói Hobby Vercel không chạy cron mỗi giờ; schedule hiện tại là mỗi ngày. Tuỳ chọn: set `CRON_SECRET` và gửi `Authorization: Bearer …` khi gọi tay endpoint.

3. **Deploy bằng GitHub Actions** (khi Git/Deploy Hook không tạo deployment mới): workflow **Deploy Production (Vercel)** (`workflow_dispatch`). Cần secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — hướng dẫn ngắn trong comment đầu file `.github/workflows/deploy-production.yml`.

### Deploy nhanh 5 bước

1. Push code mới lên GitHub.
2. Trên Vercel, kiểm tra project đang dùng đúng domain production.
3. Điền đủ biến môi trường Production (tham khảo [`.env.example`](./.env.example)).
4. Chạy deploy:
   - Cách 1: Vercel tự deploy khi có commit mới.
   - Cách 2: GitHub Actions -> `Deploy Production (Vercel)` -> `Run workflow`.
5. Smoke test sau deploy:
   - mở `/`
   - gửi form waitlist
   - test `+test` email sequence
   - tạo đơn thử ở `/admin`

Chi tiết từng mục kiểm tra: [`my-brain/deploy_checklist.md`](./my-brain/deploy_checklist.md).
