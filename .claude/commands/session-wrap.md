Tổng kết session, đồng bộ thay đổi vào CLAUDE.md + PROJECT_PLAN.md + SESSION_LOG.md, commit.

**Không hỏi user.** Tự thu thập từ context + git rồi thực hiện luôn.

---

## Bước 1 — Thu thập thông tin session

Chạy song song:

1. `git log --oneline <prev_wrap>..HEAD` — danh sách commits session này. Nếu không xác định được `prev_wrap`, dùng `git log --oneline -15` rồi cắt theo entry cuối trong `.claude/SESSION_LOG.md`.
2. `git status --short` — file chưa commit (cần quyết định: commit cùng wrap, hay flag là dang dở).
3. Đọc entry cuối `.claude/SESSION_LOG.md` để biết điểm bắt đầu session này.
4. Đọc `CLAUDE.md` + `PROJECT_PLAN.md` hiện tại — biết chỗ cần update.

Từ context hội thoại + git, tự tổng hợp:

- **Commits session này:** list hash + 1 dòng mô tả.
- **TC đã verify:** TC nào pass/fail (suy luận từ conversation; nếu không chắc → ghi "chưa verify").
- **Bug mới phát hiện chưa fix:** mô tả + file liên quan.
- **Quyết định kỹ thuật quan trọng / rationale:** điều gì cần nhớ cho session sau (vd: "chọn accordion thay vì modal vì giảm cognitive load", "không dùng X vì Y"). Đây là phần GIÁ TRỊ NHẤT cho session sau.
- **Next Action:** task ưu tiên cho session sau.
- **Blocker còn tồn tại:** liệt kê hoặc "không có".

---

## Bước 2 — Cập nhật file (thực hiện trực tiếp, không sinh prompt cho user)

### 2a. Cập nhật `PROJECT_PLAN.md`

- Sửa `Last Updated` → ngày hôm nay + 1 dòng tóm tắt session.
- Tick `[x]` task/TC đã hoàn thành (kèm commit hash ngắn nếu có).
- Thêm bug mới vào "Bugs phát hiện khi verify".
- Cập nhật "Next Action" cho session sau.
- Xoá/cập nhật "Blockers" nếu đã giải quyết.

### 2b. Cập nhật `CLAUDE.md`

- Thêm/cập nhật dòng `Session N (YYYY-MM-DD):` với tóm tắt 1-3 dòng + commit hash.
- Cập nhật `Stage X done/pending` nếu thay đổi.
- Cập nhật danh sách bugs nếu có (thêm bug mới hoặc đánh dấu fixed).

### 2c. Cập nhật `.claude/SESSION_LOG.md` (TẠO MỚI nếu chưa có)

Append entry mới — đây là log dài hạn giúp session sau hiểu rationale, không chỉ "đã làm gì". Format:

```markdown
## Session [N] — [YYYY-MM-DD]

**Commits:** `hash1` task A, `hash2` task B, `hash3` task C

**Done:**
- [Task A] — [1 dòng mô tả tác động]
- [Task B] — [...]

**Why / Rationale:** [Quyết định quan trọng + lý do. Phần này quan trọng nhất cho session sau. Vd: "Chọn server-side filter thay client-side để fix pagination bug khi tag filter cắt sau khi paginate", "Bỏ modal, dùng accordion vì giảm cognitive load"]

**Verified:** [TC pass / fail, hoặc "chưa verify production"]

**Bugs phát hiện mới:** [Mô tả + file, hoặc "không có"]

**Next Action:** [Task ưu tiên #1 cho session sau + scope/file đủ cụ thể để mở vào là làm được]

**Blocker:** [Nếu có, vd: "Render auto-deploy webhook hay broken — cần manual deploy"]
```

### 2d. Auto-memory check

Nếu trong session có:
- User đưa feedback/rule mới ("đừng làm X", "luôn làm Y", "từ giờ trở đi…") → đảm bảo đã lưu vào `memory/` (nếu chưa → lưu ngay + update MEMORY.md index).
- Quyết định kỹ thuật bất ngờ hoặc lý do non-obvious không thể derive từ code → cân nhắc lưu vào memory.

---

## Bước 3 — Commit

Commit tất cả thay đổi (CLAUDE.md, PROJECT_PLAN.md, SESSION_LOG.md, file memory mới nếu có) với message:

```
chore: session wrap YYYY-MM-DD — [tóm tắt 1 dòng]
```

Không commit nếu không có gì thực sự thay đổi. Lưu ý: file trong `C:\Users\Admin\.claude\projects\...\memory\` là per-user, KHÔNG nằm trong repo → không commit, chỉ ghi.

---

## Bước 4 — In tóm tắt + Compact Brief

In 2 block riêng biệt:

### 4a. Tóm tắt ngắn (cho user nắm tình hình)

```
✅ Session wrap hoàn tất.
Commits session này: [hash list]
CLAUDE.md: [thay đổi 1 dòng]
PROJECT_PLAN.md: [thay đổi 1 dòng]
SESSION_LOG.md: [entry mới — Session N]
Memory: [file mới đã lưu nếu có, hoặc "không có thay đổi"]
Next action: [bước ưu tiên #1 cho session sau, đủ cụ thể để mở vào là làm được]
```

### 4b. Compact Brief (paste cùng `/compact`)

In block dưới đây trong code fence để user copy nguyên si và paste vào ô chat **cùng với** lệnh `/compact`. Mục đích: sau khi conversation được nén, post-compaction self vẫn nắm đủ context để bắt nhịp ngay session sau mà không phải đọc lại file.

```
=== COMPACT BRIEF — Session [N] ([YYYY-MM-DD]) ===

ĐÃ LÀM:
- [Task A] (`hash1`) — [1 dòng: thay đổi gì, file chính]
- [Task B] (`hash2`) — [...]
- [...]

VÌ SAO CHỌN CÁCH NÀY (rationale — quan trọng nhất):
- [Task A]: [Lý do non-obvious. Vd: "Dùng server-side filter vì client-side cắt sau khi paginate gây lỗi đếm trang"]
- [Task B]: [Lý do non-obvious. Vd: "Bỏ modal, chọn accordion vì giảm cognitive load, expand inline trong list"]
- [Trade-off đã cân nhắc và bỏ qua + lý do, nếu có]

CẦN NHỚ CHO SESSION SAU:
- Rule/feedback mới user vừa đưa (nếu có): [vd: "Task chính phải xuất plan chi tiết trước khi code, đợi duyệt mới làm"]
- Constraint kỹ thuật mới phát hiện: [vd: "Render auto-deploy webhook hay broken — phải Manual Deploy"]
- File / state đang dở (nếu có): [vd: "qa_*.js untracked — chưa quyết định commit hay xoá"]
- TC chưa verify production: [danh sách hoặc "không có"]

BUG MỚI CHƯA FIX (nếu có):
- [Mô tả + file, hoặc "không có"]

NEXT ACTION (ưu tiên #1):
[Task cụ thể + file/scope + lý do ưu tiên. Vd: "IMP-1 — refactor frontend/src/app/(employer)/employer/jobs/[id]/applications/page.tsx thành accordion mode (compact row → expand inline), giảm cognitive load khi xử lý nhiều ứng viên"]

RULE CẦN TUÂN THỦ KHI BẮT ĐẦU TASK NÀY:
- [Liệt kê rule từ MEMORY.md áp dụng, vd: "feedback_plan_before_main_task — task chính phải plan chi tiết trước, đợi 'duyệt'/'ok' mới code"]
- [Rule khác nếu có]

=== END BRIEF ===
```

Quy tắc viết Compact Brief:
- **Ngắn nhưng đủ:** 1 brief khoảng 15-30 dòng là vừa. Đừng dài như báo cáo.
- **Rationale > diff:** diff đã có trong git, brief tập trung "vì sao". Bỏ chi tiết code, giữ quyết định.
- **Cụ thể tên file + commit hash:** để post-compact tìm lại được nhanh.
- **Không lặp PROJECT_PLAN:** brief là tinh chất, không phải bản sao checklist.

---

## Lưu ý

- Nếu CLAUDE.md / PROJECT_PLAN.md đã update liên tục trong session, chỉ bổ sung phần còn thiếu.
- Nếu `git status` còn file chưa commit không thuộc wrap (vd: feature dở) → KHÔNG tự commit, ghi rõ trong SESSION_LOG `Blocker` hoặc `Next Action`.
- Nếu thông tin TC pass/fail chỉ user mới biết → hỏi đúng 1 câu duy nhất, không hỏi tuần tự nhiều câu.
- **Mục tiêu của SESSION_LOG**: session sau đọc 2 entry gần nhất là đủ hiểu "đã đi đến đâu, vì sao chọn hướng này, đang dở gì". Không trùng lặp với PROJECT_PLAN (checklist) hay CLAUDE.md (state snapshot).