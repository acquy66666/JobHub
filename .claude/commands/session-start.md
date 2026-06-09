Khởi động session mới — đọc trạng thái dự án + ngữ cảnh các session trước rồi xuất plan cụ thể.

**Không hỏi user.** Tự thu thập thông tin rồi xuất plan ngay.

---

## Bước 1 — Thu thập trạng thái (chạy song song tối đa)

1. Đọc `CLAUDE.md` — stage hiện tại, done/pending, bugs đang mở.
2. Đọc `PROJECT_PLAN.md` — "Next Action", task chưa tick `[ ]`, blockers.
3. Đọc `.claude/SESSION_LOG.md` nếu tồn tại — đọc 2 entry gần nhất (= 2 session vừa rồi). File này quan trọng nhất để hiểu **rationale**, không chỉ "đã làm gì".
4. Đọc `C:\Users\Admin\.claude\projects\d--Desktop-New-folder\memory\MEMORY.md` — xác định feedback rule nào sẽ áp dụng session này (đặc biệt: rule về plan-before-code, rule về tools cấm dùng, rule về demo-prep).
5. `git log --oneline -10` — 10 commit gần nhất.
6. `git status --short` — file đang dở (uncommitted) hoặc untracked nghi vấn (qa_*.js, debug script).

---

## Bước 2 — Phân tích (nội bộ, không in ra)

Tự trả lời 5 câu hỏi:

1. **Trạng thái hiện tại?** Stage X, % hoàn thành, phase nào.
2. **Session trước kết thúc ở đâu?** Commit cuối + entry SESSION_LOG cuối. Có việc dang dở (uncommitted có ý nghĩa, hay task chưa tick mà commit message cho thấy đã định làm)?
3. **Việc cần làm ngay?** Ưu tiên #1 từ Next Action. Nếu Next Action không khớp với task `[ ]` còn lại → flag conflict.
4. **Blocker / rủi ro?** Bug mở, deploy chưa verify, uncommitted thay đổi vướng task mới, dependency thiếu, env vars cần set.
5. **Feedback rule nào kích hoạt?** Liệt kê rule từ MEMORY.md sẽ áp dụng cho task #1 (vd: "task chính → plan chi tiết trước, đợi duyệt").

---

## Bước 3 — Xuất Session Plan

In ra plan theo format này (không hỏi user, không chờ xác nhận ở bước này):

```
## Session [ngày hôm nay] — Kế hoạch làm việc

**Trạng thái:** [Stage X — tên stage, % hoặc phase]
**Session trước:** [1 câu — commit cuối + điều dang dở nếu có]
**Context kế thừa:** [1 câu rút từ 1-2 entry SESSION_LOG gần nhất — quyết định/lý do quan trọng còn ảnh hưởng tới task hôm nay]

### Ưu tiên làm ngay
1. **[Task cụ thể]** — [lý do ưu tiên + file/scope nếu rõ]
2. [Task tiếp theo nếu có]
3. [Task tiếp theo nếu có]

### Rule áp dụng cho session này
- [Rule từ MEMORY.md, vd: "Task chính → plan chi tiết trước, đợi duyệt mới code (feedback_plan_before_main_task)"]
- [Rule khác nếu liên quan]

### Blocker / rủi ro cần xử lý trước
- [Mô tả hoặc "Không có"]
- [Uncommitted file đáng ngờ — vd: "qa_*.js còn untracked, cần quyết định commit hay xoá"]

### Bỏ qua trong session này
- [Việc đã planned nhưng không urgent — tránh context drift]

---
Gõ "ok" để bắt đầu với ưu tiên #1, hoặc chỉ định task khác.
```

---

## Quy tắc quan trọng

- **Cụ thể hơn chung chung:** "Refactor `applications/page.tsx` thành accordion mode" tốt hơn "làm IMP-1".
- **Không liệt kê lại toàn bộ lịch sử:** focus delta từ session trước → hiện tại.
- **Không tự thêm scope:** chỉ lấy task từ Next Action + `[ ]` còn lại.
- **Phát hiện mismatch:** nếu Next Action trỏ task A nhưng SESSION_LOG cho thấy user đã chuyển hướng sang B → ghi rõ trong plan và đề xuất user xác nhận.
- **Stage COMPLETE + Next Action trống:** in "Dự án đã hoàn thành tất cả task đã plan. Bạn muốn làm gì tiếp theo?" rồi dừng.
- **Sau khi user gõ "ok":** nếu task #1 là task chính (QW/IMP/E*/feature/bugfix lớn) → BẮT BUỘC xuất plan chi tiết task đó trước rồi đợi duyệt lần 2 (per feedback_plan_before_main_task), KHÔNG code ngay.