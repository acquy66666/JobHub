# Progress Skill

Cập nhật tiến độ dự án cuối mỗi ngày làm việc.
Được gọi bằng lệnh `/progress`.

## Các bước thực hiện

### 1. Đọc roadmap hiện tại

Đọc file `.claude/rules/roadmap.md` để lấy toàn bộ danh sách task và trạng thái checkbox hiện tại (`[ ]` chưa xong, `[x]` đã xong).

### 2. Hỏi user

Hỏi tuần tự:

> **Hôm nay là ngày mấy, tuần mấy của dự án?**
> (Ví dụ: Tuần 2, ngày 24/05/2026)

> **Hôm nay bạn đã hoàn thành những task nào?**
> (Liệt kê hoặc mô tả tự do — tôi sẽ map vào roadmap)

> **Có task nào bị block hoặc gặp khó khăn không?**

### 3. Cập nhật roadmap

- Tick `[x]` cho các task đã hoàn thành vào file `.claude/rules/roadmap.md`
- Nếu user mô tả task không có trong roadmap → thêm vào đúng giai đoạn phù hợp

### 4. Tính % hoàn thành

Đếm tổng số task và số task đã tick, tính theo từng giai đoạn và tổng thể:

```
Giai đoạn 1 — Nền tảng:        [█████░░░░░]  5/8 tasks  (62%)
Giai đoạn 2 — Core Features:   [██░░░░░░░░]  2/8 tasks  (25%)
Giai đoạn 3 — Enhanced:        [░░░░░░░░░░]  0/7 tasks  (0%)
Giai đoạn 4 — Polish & Deploy: [░░░░░░░░░░]  0/8 tasks  (0%)

Tổng tiến độ: ████░░░░░░  7/31 tasks  (22%)
```

### 5. Ước tính timeline

Dựa trên tốc độ hiện tại (task/ngày), ước tính:
- Dự kiến hoàn thành giai đoạn hiện tại: **DD/MM/YYYY**
- Dự kiến hoàn thành toàn bộ: **DD/MM/YYYY**
- So sánh với deadline đồ án (nếu đã ghi trong `.claude/memory.md`)

### 6. Báo cáo tóm tắt

Kết thúc bằng block tóm tắt ngắn:

```
📅 Ngày: DD/MM/YYYY
✅ Hoàn thành hôm nay: N tasks
🔴 Đang bị block: [mô tả nếu có]
📊 Tiến độ tổng: X%
🎯 Task tiếp theo: [task đầu tiên chưa tick trong roadmap]
```

---

## Lưu ý

- Luôn lưu thay đổi vào `.claude/rules/roadmap.md` sau khi tick xong
- Nếu tiến độ chậm hơn kế hoạch > 20%, cảnh báo và gợi ý điều chỉnh scope
- Gọi `/progress` vào cuối mỗi ngày làm việc để giữ roadmap luôn cập nhật