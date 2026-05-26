# UI Check Skill

Thực hiện kiểm tra UI theo quy tắc bắt buộc của dự án JobHub.
Được gọi bằng lệnh `/ui-check` hoặc khi user yêu cầu "kiểm tra design", "so sánh với reference".

## Các bước thực hiện

### 1. Xác định target

Hỏi user (hoặc đọc từ argument của lệnh):
- File HTML hoặc localhost URL cần kiểm tra (mặc định: `index.html`)
- Trang cụ thể nếu là Next.js app (mặc định: trang chủ `/`)

### 2. Chụp screenshot bằng Playwright

```js
// Chạy script Node.js với Playwright đã cài sẵn trong project
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();

// Desktop
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(TARGET_URL);
await page.waitForTimeout(2000); // chờ animation load
await page.screenshot({ path: `screenshots/${DATE}_${PAGE_NAME}_desktop.png`, fullPage: false });

// Mobile
await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(800);
await page.screenshot({ path: `screenshots/${DATE}_${PAGE_NAME}_mobile.png`, fullPage: false });

await browser.close();
```

- `DATE` format: `YYYY-MM-DD`
- `PAGE_NAME` ví dụ: `home`, `jobs`, `login`, `employer-dashboard`
- Lưu tất cả vào thư mục `screenshots/`

### 3. Đọc và so sánh

Đọc cả 2 ảnh:
- Screenshot vừa chụp
- `status.app__ref=godly.png` (design reference)

### 4. Báo cáo theo bảng

| Yếu tố | Reference | Hiện tại | Đánh giá |
|---|---|---|---|
| Background color | `#07070D` near-black | ? | ✅/⚠️/❌ |
| Hero typography | 900 weight, clamp 46–74px | ? | ✅/⚠️/❌ |
| Gradient accent | `#7C3AED` → `#3B82F6` | ? | ✅/⚠️/❌ |
| Card surface | `#13131E` + border `#252538` | ? | ✅/⚠️/❌ |
| Section tag pill | Purple tint, uppercase, 12px | ? | ✅/⚠️/❌ |
| Scroll animations | Tất cả section đều có | ? | ✅/⚠️/❌ |
| Navbar | Frosted glass, fixed, 64px | ? | ✅/⚠️/❌ |
| Button primary | Gradient + box-shadow tím | ? | ✅/⚠️/❌ |
| Responsive mobile | Layout không vỡ ở 375px | ? | ✅/⚠️/❌ |

### 5. Danh sách issues theo độ ưu tiên

Liệt kê theo format:

```
🔴 CRITICAL  — [mô tả vấn đề] → [cách fix]
🟡 MINOR     — [mô tả vấn đề] → [cách fix]
🟢 GOOD      — [những điểm đã đúng]
```

### 6. Hỏi user

Kết thúc bằng câu hỏi:
> "Tôi fix ngay các lỗi CRITICAL bây giờ không?"

---

## Lưu ý

- Nếu Playwright chưa cài: chạy `npm install playwright` và `npx playwright install chromium` trong thư mục project
- Nếu là Next.js dev server: đảm bảo `npm run dev` đang chạy trước khi chụp
- Mỗi lần chạy `/ui-check` đều tạo file screenshot mới, không ghi đè file cũ