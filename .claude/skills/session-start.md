# Session Start Skill

Khởi động session mới — đọc trạng thái dự án + ngữ cảnh session trước rồi xuất plan cụ thể.

**Không hỏi user.** Tự thu thập thông tin rồi xuất plan ngay.

---

## Bước 1 — Thu thập trạng thái (chạy song song, MINIMAL READS)

**KHÔNG đọc lại CLAUDE.md + MEMORY.md** — chúng đã có trong context qua `claudeMd` auto-inject. Đọc lại = tốn token trùng lặp.

1. Đọc `PROJECT_PLAN.md` (chỉ phần Stage hiện tại + Next Action + backlog, head 50 dòng).
2. Đọc `.claude/SESSION_LOG.md` — 2 entry gần nhất (head ~80 dòng).
3. `git log --oneline -5` — 5 commit gần nhất là đủ.
4. `git status --short | grep -v "^??"` — chỉ file modified/staged, lọc untracked (screenshots/qa-scripts đã .gitignore).

Nếu phát hiện untracked nghi vấn (vd: file code không trong qa-scripts/screenshots) → mới chạy `git status --short` full.

---

## Bước 2 — Phân tích

Tự trả lời 5 câu hỏi (không in ra, dùng để xây plan):

1. **Trạng thái hiện tại?** — Stage X, % hoàn thành, phase nào.
2. **Session trước kết thúc ở đâu?** — Commit cuối + entry SESSION_LOG cuối. Có việc dang dở (uncommitted files có ý nghĩa, hay task chưa tick mà commit message cho thấy đã định làm)?
3. **Việc cần làm ngay?** — Ưu tiên #1 từ Next Action. Nếu Next Action không khớp với task `[ ]` còn lại → flag conflict.
4. **Blocker / rủi ro?** — Bug mở, deploy chưa verify, uncommitted thay đổi sẽ vướng task mới, dependency thiếu.
5. **Feedback rule nào kích hoạt?** — Liệt kê rule từ MEMORY.md sẽ áp dụng cho task #1 (vd: "task chính → phải plan chi tiết trước").

---

## Bước 3 — Xuất Session Plan

In ra plan theo format sau (không hỏi user, không chờ xác nhận ở bước này):

```
## Session [ngày hôm nay] — Kế hoạch làm việc

**Trạng thái:** [Stage X — tên stage, % hoặc phase]
**Session trước:** [1 câu — commit cuối + điều dang dở nếu có]
**Context từ SESSION_LOG:** [1 câu rút từ 1-2 entry gần nhất — quyết định/lý do quan trọng còn ảnh hưởng]

### Ưu tiên làm ngay
1. **[Task cụ thể]** — [lý do ưu tiên + file/scope nếu rõ]
2. [Task tiếp theo nếu có]
3. [Task tiếp theo nếu có]

### Rule áp dụng cho session này
- [Rule từ MEMORY.md, vd: "Task chính → plan chi tiết trước, đợi duyệt mới code (feedback_plan_before_main_task)"]
- [Rule khác nếu liên quan]

### Blocker / rủi ro cần xử lý trước
- [Mô tả blocker hoặc "Không có"]
- [Uncommitted file đáng ngờ nếu có — vd: "qa_*.js còn untracked, cần quyết định commit hay xoá"]

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
- **Phát hiện mismatch:** nếu Next Action trỏ task A nhưng SESSION_LOG cho thấy user đã chuyển hướng sang B → ghi rõ trong plan và đề xuất xác nhận lại.
- **Nếu stage COMPLETE và Next Action trống:** in "Dự án đã hoàn thành tất cả task đã plan. Bạn muốn làm gì tiếp theo?" rồi dừng.
- **Sau khi user gõ "ok":** nếu task #1 là task chính (QW/IMP/E*/feature/bugfix lớn) → BẮT BUỘC xuất plan chi tiết task đó trước rồi đợi duyệt lần 2 (per feedback_plan_before_main_task), KHÔNG code ngay.