# Session Wrap Skill

Tổng kết session, đồng bộ thay đổi vào CLAUDE.md + PROJECT_PLAN.md + SESSION_LOG.md, commit.

**Không hỏi user.** Tự thu thập từ context + git rồi thực hiện luôn.

---

## Bước 1 — Thu thập thông tin session

Chạy song song:

1. `git log --oneline <prev_wrap>..HEAD` — danh sách commits session này. Nếu không xác định được `prev_wrap`, dùng `git log --oneline -15` rồi cắt theo entry cuối trong `SESSION_LOG.md`.
2. `git status --short` — file chưa commit (cần quyết định: commit cùng wrap, hay flag là dang dở).
3. Đọc entry cuối `SESSION_LOG.md` để biết điểm bắt đầu session này.
4. Đọc `CLAUDE.md` + `PROJECT_PLAN.md` hiện tại — biết chỗ cần update.

Từ context hội thoại + git, tự tổng hợp:

- **Commits session này:** list hash + 1 dòng mô tả.
- **TC đã verify:** TC nào pass/fail (suy luận từ conversation; nếu không chắc → ghi "chưa verify").
- **Bug mới phát hiện chưa fix:** mô tả + file liên quan.
- **Quyết định kỹ thuật quan trọng / rationale:** điều gì cần nhớ cho session sau (vd: "chọn accordion thay vì modal vì giảm cognitive load", "không dùng X vì Y").
- **Next Action:** task ưu tiên cho session sau.
- **Blocker còn tồn tại:** liệt kê hoặc "không có".

---

## Bước 2 — Cập nhật file

Thực hiện trực tiếp (không sinh prompt cho user copy):

### 2a. Cập nhật `PROJECT_PLAN.md`

- Sửa `Last Updated` → ngày hôm nay + 1 dòng tóm tắt session.
- Tick `[x]` task/TC đã hoàn thành (kèm commit hash ngắn nếu có).
- Thêm bug mới vào mục "Bugs phát hiện khi verify".
- Cập nhật "Next Action" cho session sau.
- Xoá/cập nhật "Blockers" nếu đã giải quyết.

### 2b. Cập nhật `CLAUDE.md`

- Thêm/cập nhật dòng `Session N (YYYY-MM-DD):` với tóm tắt 1-3 dòng + commit hash.
- Cập nhật `Stage X done/pending` nếu thay đổi.
- Cập nhật danh sách bugs nếu có thay đổi (thêm bug mới hoặc đánh dấu fixed).

### 2c. Cập nhật `.claude/SESSION_LOG.md` (TẠO MỚI nếu chưa có)

Append entry mới theo format chuẩn — đây là log dài hạn giúp session sau hiểu rationale, không chỉ "đã làm gì":

```markdown
## Session [N] — [YYYY-MM-DD]

**Commits:** `hash1` task A, `hash2` task B, `hash3` task C

**Done:**
- [Task A] — [1 dòng mô tả tác động]
- [Task B] — [...]

**Why / Rationale:** [Quyết định quan trọng + lý do — phần này quan trọng nhất cho session sau. Vd: "Chọn server-side filter thay client-side để fix pagination bug khi tag filter cắt sau khi paginate"]

**Verified:** [TC pass / fail, hoặc "chưa verify production"]

**Bugs phát hiện mới:** [Mô tả + file, hoặc "không có"]

**Next Action:** [Task ưu tiên #1 cho session sau + scope/file]

**Blocker:** [Nếu có, vd: "Render auto-deploy webhook hay broken — cần manual deploy"]
```

### 2d. Auto-memory check

Nếu trong session có:
- User đưa feedback/rule mới ("đừng làm X", "luôn làm Y", "từ giờ trở đi…") → đảm bảo đã lưu vào `memory/` rồi (nếu chưa → lưu ngay).
- Quyết định kỹ thuật bất ngờ hoặc lý do non-obvious không thể derive từ code → cân nhắc lưu vào memory.

---

## Bước 3 — Commit

Commit tất cả thay đổi (CLAUDE.md, PROJECT_PLAN.md, SESSION_LOG.md) với message:

```
chore: session wrap YYYY-MM-DD — [tóm tắt 1 dòng]
```

Không commit nếu không có gì thực sự thay đổi.

---

## Bước 4 — In tóm tắt + Compact Brief

### 4a. Tóm tắt ngắn

```
✅ Session wrap hoàn tất.
Commits session này: [hash list]
CLAUDE.md: [thay đổi 1 dòng]
PROJECT_PLAN.md: [thay đổi 1 dòng]
SESSION_LOG.md: [entry mới — Session N]
Next action: [bước ưu tiên #1 cho session sau]
```

### 4b. Compact Brief (paste cùng `/compact`)

In code fence để user copy nguyên si paste cùng `/compact`. Post-compaction self sẽ đọc brief này để bắt nhịp ngay, không phải đọc lại file.

```
=== COMPACT BRIEF — Session [N] ([YYYY-MM-DD]) ===

ĐÃ LÀM:
- [Task] (`hash`) — [thay đổi gì, file chính]

VÌ SAO CHỌN CÁCH NÀY:
- [Task]: [Lý do non-obvious + trade-off đã cân nhắc]

CẦN NHỚ CHO SESSION SAU:
- Rule/feedback mới: [hoặc "không có"]
- Constraint kỹ thuật mới: [hoặc "không có"]
- File/state dang dở: [hoặc "không có"]
- TC chưa verify: [hoặc "không có"]

BUG MỚI CHƯA FIX:
- [Mô tả + file, hoặc "không có"]

NEXT ACTION:
[Task cụ thể + file/scope + lý do ưu tiên]

RULE CẦN TUÂN THỦ:
- [Rule từ MEMORY.md áp dụng cho task next]

=== END BRIEF ===
```

Brief 15-30 dòng. Rationale > diff. Cụ thể file + hash. Không lặp PROJECT_PLAN.

---

## Lưu ý

- Nếu CLAUDE.md / PROJECT_PLAN.md đã update liên tục trong session, chỉ bổ sung phần còn thiếu.
- Nếu `git status` còn file chưa commit không thuộc wrap (vd: feature dở) → KHÔNG tự commit, ghi rõ trong SESSION_LOG `Blocker` hoặc `Next Action`.
- Nếu thông tin TC pass/fail chỉ user mới biết → hỏi đúng 1 câu duy nhất, không hỏi tuần tự nhiều câu.
- **Mục tiêu của SESSION_LOG**: session sau đọc 2 entry gần nhất là đủ hiểu "đã đi đến đâu, vì sao chọn hướng này, đang dở gì". Không trùng lặp với PROJECT_PLAN (checklist) hay CLAUDE.md (state snapshot).