Khởi động session mới — đọc trạng thái dự án và lên kế hoạch làm việc cụ thể.

**Không hỏi user.** Tự thu thập thông tin rồi xuất plan ngay.

---

## Bước 1 — Thu thập trạng thái

Chạy song song:

1. Đọc `CLAUDE.md` — lấy: stage hiện tại, những gì đã done, những gì pending, bugs đang mở.
2. Đọc `PROJECT_PLAN.md` — lấy: mục "Next Action", các task chưa tick `[ ]`, blockers.
3. Chạy `git log --oneline -10` — lấy 10 commit gần nhất để biết session trước kết thúc ở đâu.

---

## Bước 2 — Phân tích và tổng hợp

Từ dữ liệu trên, tự trả lời 4 câu hỏi:

1. **Trạng thái hiện tại là gì?** — Stage nào, % hoàn thành, đang ở phase nào.
2. **Session trước kết thúc ở đâu?** — Commit cuối làm gì, còn việc dang dở không (dựa vào git log + Next Action).
3. **Việc cần làm ngay là gì?** — Ưu tiên cao nhất từ Next Action + task chưa tick.
4. **Có blocker hoặc rủi ro nào không?** — Bug mở, deploy chưa verify, dependency bị thiếu.

---

## Bước 3 — Xuất Session Plan

In ra plan theo format sau (không hỏi user, không chờ xác nhận):

```
## Session [ngày hôm nay] — Kế hoạch làm việc

**Trạng thái:** [Stage X — tên stage, % hoàn thành hoặc phase đang chạy]
**Session trước:** [1 câu tóm tắt commit cuối + điều còn dang dở nếu có]

### Ưu tiên làm ngay
1. [Task cụ thể nhất, lấy từ Next Action] — [lý do ưu tiên]
2. [Task tiếp theo nếu có]
3. [Task tiếp theo nếu có]

### Blocker / Rủi ro cần xử lý trước
- [Mô tả blocker hoặc ghi "Không có blocker"]

### Bỏ qua trong session này
- [Những thứ đã planned nhưng không urgent — để tránh context drift]

---
Gõ "ok" để bắt đầu với ưu tiên #1, hoặc chỉ định task khác.
```

---

## Quy tắc quan trọng

- **Cụ thể hơn chung chung:** "Fix bug CompareBar mobile" tốt hơn "fix bug". "Verify F6 trên production" tốt hơn "verify tính năng".
- **Không liệt kê lại toàn bộ lịch sử:** Chỉ focus vào delta từ session trước đến giờ.
- **Không đề xuất việc ngoài scope:** Chỉ lấy từ Next Action và task `[ ]` còn lại — không tự thêm feature mới.
- **Nếu Next Action trống hoặc stage đã COMPLETE:** Báo rõ "Dự án đã hoàn thành tất cả task đã plan. Bạn muốn làm gì tiếp theo?" rồi dừng.