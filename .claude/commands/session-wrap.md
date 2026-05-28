Tổng kết session làm việc, đồng bộ thay đổi vào CLAUDE.md và PROJECT_PLAN.md.

Thực hiện tuần tự các bước sau:

---

## Bước 1 — Thu thập thông tin session

Hỏi user tuần tự từng câu, chờ trả lời trước khi hỏi câu tiếp theo:

**Câu 1:**
> "Session này bạn đã làm gì? Liệt kê ngắn gọn các thay đổi, tính năng đã thêm, hoặc bug đã fix."

**Câu 2:**
> "Có bug mới hoặc vấn đề nào phát hiện ra nhưng chưa fix không? Mô tả ngắn và file liên quan nếu biết."

**Câu 3:**
> "Có test case nào đã verify thành công hoặc thất bại không? (TC1, TC2a, TC3, v.v.)"

**Câu 4:**
> "Có quyết định kỹ thuật, lưu ý đặc biệt, hoặc điều gì cần nhớ cho session sau không?"

---

## Bước 2 — Tổng hợp và sinh prompt

Từ câu trả lời của user, tổng hợp theo format:

```
Session [ngày hôm nay]: [các thay đổi chính, cách nhau bằng dấu chấm phẩy].
Bug mới: [mô tả hoặc "không có"].
TC đã verify: [danh sách hoặc "không có"].
Lưu ý: [ghi chú hoặc "không có"].
```

Sau đó **in ra màn hình** prompt hoàn chỉnh dưới đây để user copy-paste vào thanh chat:

```
/compact [NỘI DUNG TỔNG HỢP]. Từ thông tin này, hãy cập nhật @CLAUDE.md và @PROJECT_PLAN.md: (1) trong CLAUDE.md cập nhật mục Stage 5 pending/done và danh sách bugs nếu có thay đổi; (2) trong PROJECT_PLAN.md tick [x] các task/TC đã hoàn thành, thêm bug mới vào mục "Bugs phát hiện khi verify", cập nhật "Next Action" cho session tiếp theo. Commit tất cả thay đổi với message mô tả session này.
```

---

## Bước 3 — Hướng dẫn user

In ra:

```
✅ Copy đoạn /compact phía trên và paste vào thanh chat, rồi nhấn Enter.
```

---

## Ví dụ output thực tế

```
/compact Session 2026-05-28: fix middleware AUTH_ONLY không chặn /login và /register nữa; thêm useEffect auto-redirect trong LoginForm khi user đã có session; AuthProvider gọi clearAuth() khi refresh thất bại. Bug mới: không có. TC đã verify: TC2b employer login thành công. Lưu ý: cookie refreshToken maxAge 7 ngày, cần logout trước khi test tài khoản khác. Từ thông tin này, hãy cập nhật @CLAUDE.md và @PROJECT_PLAN.md: (1) trong CLAUDE.md cập nhật mục Stage 5 pending/done và danh sách bugs nếu có thay đổi; (2) trong PROJECT_PLAN.md tick [x] các task/TC đã hoàn thành, thêm bug mới vào mục "Bugs phát hiện khi verify", cập nhật "Next Action" cho session tiếp theo. Commit tất cả thay đổi với message mô tả session này.
```