# Quy tắc bắt buộc

Mức ưu tiên cao nhất — áp dụng cho mọi thay đổi.

## Screenshot so sánh design

Sau mỗi thay đổi lớn về UI:
1. Chụp screenshot lưu vào `screenshots/`
2. So sánh với `status.app__ref=godly.png`
3. Tinh chỉnh cho đến khi sát design gốc rồi mới tiếp tục

## Scroll animation bắt buộc

Mọi section trên tất cả các trang phải có animation khi scroll:
- Vanilla JS: `IntersectionObserver` với `threshold: 0.07`, `rootMargin: '0px 0px -30px 0px'`
- Next.js: Framer Motion `whileInView` + `viewport={{ once: true }}`
- Hiệu ứng chuẩn: `fadeUp` (translateY 36px→0), `fadeLeft`, `fadeRight`, `scaleIn`
- Grid/list items dùng staggered delay tăng dần `0.1s`
- Không có section nào render tĩnh hoàn toàn

## Bảo mật

- Không bao giờ trả `passwordHash` trong API response
- Không log token, password ra console
