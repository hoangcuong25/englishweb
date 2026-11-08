---
description: >
  Debug có hệ thống tầng FRONTEND (UI / client-side) theo 4 bước: Reproduce →
  Isolate → Diagnose → Fix. Kích hoạt khi "debug/lỗi/bug/error/không chạy/tại sao"
  ở giao diện (màn hình, component, render, gọi mạng phía client). Lỗi server → skill debug-backend.
---

# Debug Skill — Frontend (UI / client-side)

> Công cụ/chi tiết theo stack lấy từ knowledge của dự án (`frontend/tech-stack.md`, `architecture.md`).
> Skill này định nghĩa quy trình + lớp cần khoanh vùng — không gắn cứng stack.

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi khi:
- Nhận "debug/lỗi/bug/sai/không chạy/error/fix lỗi/tại sao lại" ở tầng frontend.
- Claude định đoán nguyên nhân mà chưa reproduce — **dừng lại, theo đúng Bước 1 trước**.

**NEVER** đề xuất nguyên nhân khi chưa qua Bước 1 (Reproduce).
Lỗi tầng server → dùng **skill `debug-backend`**.

---

## Quy trình 4 bước (đúng thứ tự — không nhảy bước)

### Bước 1 — Reproduce
- Xác định triệu chứng cụ thể; thao tác / input nào trên UI gây lỗi?
- Thu thập: lỗi console, request/response phía mạng, bước tái hiện trên giao diện
- Tái hiện lỗi trong môi trường nhỏ nhất có thể
- **Chưa tái hiện được → không đoán nguyên nhân**

### Bước 2 — Isolate
- Xác định **tầng** xảy ra lỗi theo `architecture.md` (vd: hiển thị / quản lý state / lớp gọi API / điều hướng)
- Khoanh vùng: lỗi ở đâu — chưa cần biết tại sao
- Checklist chung tầng client:
  - Lỗi mạng / CORS? (kiểm tra status, payload, header)
  - State sai? (render ngoài ý muốn, dữ liệu cũ kẹt lại trong side-effect)
  - Xác thực / token / refresh đúng chưa? (401/403)
  - Nạp module động lỗi / lệch phiên bản phụ thuộc giữa các phần?

### Bước 3 — Diagnose
- Tìm **root cause**, không chỉ triệu chứng (5 Whys)
- Công cụ chung:
  - Công cụ dev trình duyệt: console (lỗi), mạng (request/response), kiểm tra state/props
  - Kiểm biến môi trường build đã đúng chưa
  - Dùng source map để trace lỗi về code gốc

### Bước 4 — Fix
- Viết fix nhỏ nhất giải quyết root cause
- **Không "fix" triệu chứng trong khi root cause còn đó**
- Viết test để root cause không tái diễn

## Dừng và hỏi user nếu
- Không tái hiện được lỗi (intermittent)
- Root cause nằm ở service / API phía server (cần thêm log / context)
- Fix yêu cầu thay đổi kiến trúc lớn
- Root cause thực ra ở tầng server → chuyển sang skill `debug-backend`
