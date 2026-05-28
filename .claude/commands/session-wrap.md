Tổng kết session làm việc, đồng bộ thay đổi vào CLAUDE.md và PROJECT_PLAN.md.

**Không hỏi user.** Tự thu thập thông tin từ context hiện có, rồi thực hiện luôn.

---

## Bước 1 — Tự thu thập thông tin session

Dùng `git log --oneline` để lấy danh sách commits kể từ lần /session-wrap trước (thường là 5–15 commits gần nhất). Đọc CLAUDE.md và PROJECT_PLAN.md hiện tại để hiểu trạng thái. Từ đó tự tổng hợp:

- **Thay đổi chính:** danh sách commits/fixes/features trong session này
- **Bug mới chưa fix:** suy luận từ conversation context (nếu user đề cập bug chưa xử lý)
- **TC đã verify:** các TC được đánh dấu pass hoặc fail trong conversation
- **Lưu ý kỹ thuật:** quyết định, pattern, hoặc constraint mới phát hiện

Nếu thiếu thông tin (ví dụ TC chưa được test thực tế), ghi rõ "chưa verify" thay vì bỏ qua.

---

## Bước 2 — Cập nhật trực tiếp

Không sinh prompt để user copy. Thực hiện luôn các bước sau:

1. **Cập nhật `PROJECT_PLAN.md`:**
   - Sửa `Last Updated` thành ngày hôm nay
   - Tick `[x]` các task/TC đã hoàn thành
   - Thêm bug mới vào mục "Bugs phát hiện khi verify" (nếu có)
   - Cập nhật mục "Next Action" với bước ưu tiên cho session tiếp theo
   - Xóa hoặc cập nhật "Blockers" nếu đã giải quyết

2. **Cập nhật `CLAUDE.md`:**
   - Cập nhật dòng `Stage 5 done` và `Stage 5 pending`
   - Cập nhật danh sách bugs nếu có bug mới hoặc bug được fix

3. **Commit tất cả thay đổi** với message dạng:
   ```
   chore: session wrap 2026-MM-DD — [tóm tắt 1 dòng]
   ```

4. **In ra tóm tắt ngắn** cho user biết đã làm gì (3–5 dòng), format:
   ```
   ✅ Session wrap hoàn tất.
   Commits session này: [danh sách]
   CLAUDE.md: [thay đổi]
   PROJECT_PLAN.md: [thay đổi]
   Next action: [bước tiếp theo ưu tiên nhất]
   ```

---

## Lưu ý

- Nếu CLAUDE.md và PROJECT_PLAN.md đã được cập nhật liên tục trong session, chỉ cần kiểm tra và bổ sung phần còn thiếu (thường là "Next Action" và "Last Updated").
- Không tạo commit nếu không có gì thay đổi thực sự.
- Nếu có thông tin quan trọng mà chỉ user mới biết (ví dụ: TC pass/fail từ test thực tế), hỏi đúng 1 câu duy nhất thay vì hỏi 4 câu tuần tự.