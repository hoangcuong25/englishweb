---
description: >
  Debug có hệ thống tầng BACKEND (server-side) theo 4 bước: Reproduce → Isolate →
  Diagnose → Fix. Kích hoạt khi "debug/lỗi/bug/exception/error/không chạy/tại sao"
  ở phía server (API, service, dữ liệu, business logic). Lỗi giao diện → skill debug-frontend.
---

# Debug Skill — Backend (server-side)

> Công cụ/chi tiết theo stack lấy từ knowledge của dự án (`backend/tech-stack.md`, `architecture.md`).
> Skill này định nghĩa quy trình + lớp cần khoanh vùng — không gắn cứng stack.

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi khi:
- Nhận "debug/lỗi/bug/sai/không chạy/exception/error/fix lỗi/tại sao lại" ở tầng backend.
- Claude định đoán nguyên nhân mà chưa reproduce — **dừng lại, theo đúng Bước 1 trước**.

**NEVER** đề xuất nguyên nhân khi chưa qua Bước 1 (Reproduce).
Lỗi tầng giao diện (UI/client) → dùng **skill `debug-frontend`**.

---

## Quy trình 4 bước (đúng thứ tự — không nhảy bước)

### Bước 1 — Reproduce
- Xác định triệu chứng cụ thể; input nào gây lỗi?
- Thu thập: stack trace đầy đủ, log quanh thời điểm lỗi, request/response nếu là API
- Tái hiện lỗi trong môi trường nhỏ nhất có thể
- **Chưa tái hiện được → không đoán nguyên nhân**

### Bước 2 — Isolate
- Xác định **tầng** xảy ra lỗi theo `architecture.md` (vd: tiếp nhận request / xử lý nghiệp vụ / truy cập dữ liệu / gọi service ngoài)
- Khoanh vùng: lỗi ở đâu — chưa cần biết tại sao
- Checklist chung tầng server:
  - Ranh giới giao dịch (transaction) đúng chỗ?
  - Dữ liệu nạp trễ (lazy) bị truy cập ngoài phạm vi cho phép?
  - Vòng đời / scope của đối tượng phù hợp?
  - Gọi service ngoài: timeout / cơ chế chịu lỗi (circuit breaker) kích hoạt?

### Bước 3 — Diagnose
- Tìm **root cause**, không chỉ triệu chứng (5 Whys)
- Công cụ chung:
  - Bật log truy vấn dữ liệu để xem câu lệnh thật (theo `backend/tech-stack.md`)
  - Endpoint health / metrics nếu là issue runtime
  - So cấu hình ứng dụng vs biến môi trường (có override nhau?)

### Bước 4 — Fix
- Viết fix nhỏ nhất giải quyết root cause
- **Không "fix" triệu chứng trong khi root cause còn đó**
- Viết test để root cause không tái diễn

## Dừng và hỏi user nếu
- Không tái hiện được lỗi (intermittent)
- Root cause nằm ở service khác (cần thêm log / context)
- Fix yêu cầu thay đổi kiến trúc lớn
- Root cause thực ra ở tầng giao diện → chuyển sang skill `debug-frontend`
