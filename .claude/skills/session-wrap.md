# Session Wrap Skill

Tổng kết session làm việc, đồng bộ thay đổi vào CLAUDE.md và PROJECT_PLAN.md.
Được gọi bằng lệnh `/session-wrap` vào cuối mỗi session.

---

## Các bước thực hiện

### Bước 1 — Thu thập thông tin session

Hỏi user tuần tự các câu sau (chờ trả lời từng câu, không hỏi tất cả cùng lúc):

**Câu 1:**
> "Session này bạn đã làm gì? Liệt kê ngắn gọn các thay đổi, tính năng đã thêm, hoặc bug đã fix."

**Câu 2:**
> "Có bug mới hoặc vấn đề nào phát hiện ra nhưng chưa fix không? Mô tả ngắn và file liên quan nếu biết."

**Câu 3:**
> "Có test case nào đã verify thành công hoặc thất bại không? (TC1, TC2a, TC3, v.v.)"

**Câu 4:**
> "Có quyết định kỹ thuật, lưu ý đặc biệt, hoặc điều gì cần nhớ cho session sau không?"

---

### Bước 2 — Tổng hợp và sinh prompt

Từ câu trả lời của user, tổng hợp thành 1 đoạn mô tả súc tích rồi **in ra màn hình** prompt sau để user copy-paste vào thanh chat:

```
/compact [NỘI DUNG TỔNG HỢP]. Từ thông tin này, hãy cập nhật @CLAUDE.md và @PROJECT_PLAN.md: (1) trong CLAUDE.md cập nhật mục "Stage 5 pending/done" và danh sách bugs nếu có thay đổi; (2) trong PROJECT_PLAN.md tick [x] các task/TC đã hoàn thành, thêm bug mới vào mục "Bugs phát hiện khi verify", cập nhật "Next Action" cho session tiếp theo. Commit tất cả thay đổi với message mô tả session này.
```

Trong đó `[NỘI DUNG TỔNG HỢP]` được thay bằng đoạn tổng hợp thực tế từ câu trả lời của user.

---

### Bước 3 — Hướng dẫn user

In ra hướng dẫn:

```
✅ Prompt đã sẵn sàng — copy đoạn trên và paste vào thanh chat, rồi nhấn Enter.
   Lệnh /compact sẽ nén lịch sử hội thoại và tự động cập nhật CLAUDE.md + PROJECT_PLAN.md.
```

---

## Quy tắc tổng hợp nội dung

Khi viết đoạn `[NỘI DUNG TỔNG HỢP]`, tuân theo format:

```
Session [ngày hiện tại]: [danh sách thay đổi chính, mỗi item cách nhau bằng dấu chấm phẩy]. 
Bug mới: [mô tả hoặc "không có"]. 
TC đã verify: [danh sách hoặc "không có"]. 
Lưu ý: [ghi chú đặc biệt hoặc "không có"].
```

Ví dụ output thực tế:

```
/compact Session 2026-05-28: fix middleware AUTH_ONLY không chặn /login và /register nữa; thêm useEffect auto-redirect trong LoginForm khi user đã có session; AuthProvider gọi clearAuth() khi refresh thất bại. Bug mới: không có. TC đã verify: TC2b (employer login) thành công. Lưu ý: cookie refreshToken có maxAge 7 ngày nên cần logout trước khi test tài khoản khác. Từ thông tin này, hãy cập nhật @CLAUDE.md và @PROJECT_PLAN.md: (1) trong CLAUDE.md cập nhật mục "Stage 5 pending/done" và danh sách bugs nếu có thay đổi; (2) trong PROJECT_PLAN.md tick [x] các task/TC đã hoàn thành, thêm bug mới vào mục "Bugs phát hiện khi verify", cập nhật "Next Action" cho session tiếp theo. Commit tất cả thay đổi với message mô tả session này.
```

---

## Lưu ý

- Skill này chỉ **sinh ra prompt**, không tự chỉnh sửa file. User cần paste prompt vào chat để thực hiện.
- Nếu user không nhớ hết, có thể bỏ qua câu nào bằng cách trả lời "không có" hoặc "bỏ qua".
- Gọi `/session-wrap` trước khi đóng tab hoặc kết thúc ngày làm việc.