---
description: >
  Sinh tài liệu thiết kế kỹ thuật từ spec của BA TRƯỚC khi viết code. Kích hoạt khi
  nghe "thiết kế [X]", "design API", "thiết kế API/luồng/class", "từ spec làm thiết kế",
  "solution design", "đặc tả API cho [X]". Sinh 3 tài liệu (API Spec, Component & Class
  Design, Processing Flow) vào project-knowledge/design/<MÃ_CHỨC_NĂNG>/ theo template chuẩn.
---

# Technical Design Skill

## MUST trigger (tự động)

**MUST** thực thi skill này khi nhận request **thiết kế từ spec** (không phải viết code ngay):
"thiết kế [X]", "design API/luồng/class cho [X]", "làm đặc tả từ spec này", "solution design".

> Phân biệt với `task-state-init`/`developer`: skill này tạo ra **bản thiết kế** (tài liệu), chưa viết code.
> Sau khi thiết kế xong + được duyệt → mới sang `developer-*`.

## Mục đích
Biến spec BA thành tài liệu thiết kế (theo phạm vi tầng) **nhất quán, bám chuẩn Org**, persist vào
`project-knowledge/design/<MÃ_CHỨC_NĂNG>/` — làm đầu vào tin cậy cho `developer-*`.

## Quy trình

### Bước 1 — Đọc context
- Spec BA từ `project-knowledge/business-spec/<MÃ_CHỨC_NĂNG>/` (nếu có) hoặc user cung cấp (hỏi nếu thiếu).
- `project-knowledge/architecture.md` — phân tầng, ranh giới module.
- `project-knowledge/domain-glossary.md` — thuật ngữ nghiệp vụ.
- `code-forge-team-common/knowledge/org/backend/api-convention.md` — chuẩn API/envelope/mã lỗi.
- `.../org/{backend,frontend}/coding-convention.md` + `.../tech-stack.md` — cấu trúc & stack.
- `.../org/shared/design-standards.md` — **chuẩn viết thiết kế** (3 tài liệu, header, `[cần xác nhận]`, súc tích §7, tham khảo chéo §8).
- **Thiết kế liên quan đã có** trong `project-knowledge/design/` (cùng module / dùng chung DTO/endpoint/thuật ngữ) — tái dùng/trỏ, tránh xung đột (`design-standards §8`).

### Bước 2 — Xác định phạm vi & mã chức năng
- Chốt **mã chức năng** (`<MOD>.<SCREEN>`) + danh sách thao tác (List/View/Create/Update/Delete/…).
- **Xác định phạm vi tầng của project hiện tại**: BE-only / FE-only / full-stack (căn cứ `architecture.md`,
  tech-stack, `src/`). Không rõ → hỏi user, KHÔNG mặc định full-stack. → quyết định thiết kế tầng nào.
- Tạo thư mục `project-knowledge/design/<MÃ_CHỨC_NĂNG>/` bằng cách **copy `_template/`** — chỉ **3 tài liệu thiết kế**. **KHÔNG** copy `CHANGELOG.md` khi sinh lần đầu (changelog chỉ tạo khi quay lại SỬA thiết kế đã có trên git — xem Bước 3).

### Bước 3 — Sinh tài liệu (giao agent `solution-architect`) — CHỈ tầng thuộc phạm vi
Điền lần lượt, giữ nhất quán endpoint/DTO/mã lỗi/tên class giữa các file:
1. `API_Spec.md` — BE/full-stack: đặc tả đầy đủ (endpoint, DTO, envelope, mã lỗi, DDL). FE-only: chỉ hợp đồng API tiêu thụ (hoặc tham chiếu spec BE).
2. `Component_Class_Design.md` — chỉ giữ PHẦN thuộc phạm vi: BE-only → PHẦN I; FE-only → PHẦN II; full-stack → cả hai.
3. `Processing_Flow.md` — luồng theo phạm vi: BE-only → API→APP→DOM→DB; FE-only → page→hook→api; full-stack → đầy đủ.
- Phần tầng ngoài phạm vi → ghi "Ngoài phạm vi project này", KHÔNG thiết kế chi tiết.
- Mọi điểm chưa map được → đánh dấu `[cần xác nhận]` + gom danh sách cuối mỗi file.
- **Sinh lần đầu KHÔNG ghi changelog** (bản đẩy git là baseline vX.Y). Nếu đây là **SỬA thiết kế đã có baseline trên git**: tạo `CHANGELOG.md` từ `_template/` (nếu chưa có) → thêm **1 entry** ghi thay đổi + bump version header 3 tài liệu (`design-standards §9`).

### Bước 4 — Tự kiểm + đề xuất review
Checklist trước khi trình ra:
- [ ] **COMPLIANCE GATE** — đã mở lại `api-convention.md` + `coding-convention.md` và chạy **Bộ kiểm tuân thủ `design-standards.md §3.1`** trên TỪNG endpoint/field; 0 điểm lệch (casing/đặt tên path soi kỹ).
- [ ] **Đúng phạm vi tầng project** — BE-only không lẫn thiết kế FE và ngược lại; full-stack mới có cả hai.
- [ ] Đủ tài liệu + header chuẩn (mã chức năng, phạm vi tầng, repo/stack, tác giả/ngày/phiên bản).
- [ ] Endpoint/DTO/tên class **trùng khớp** giữa các tài liệu.
- [ ] Sơ đồ luồng + sơ đồ lớp có mặt và đọc được.
- [ ] Bám phân tầng `architecture.md`, thuật ngữ `domain-glossary.md`.
- [ ] Đã gom danh sách `[cần xác nhận]`.
- [ ] Thao tác ghi: nêu rõ guard order + ranh giới `@Transactional` + optimistic lock/idempotency.
- [ ] **Súc tích (`design-standards §7`)** — mỗi thông tin đúng một nơi; không lặp bảng field/JSON/quy ước giữa & trong tài liệu; cắt phần thừa. *(Self-check, không phải cổng cứng.)*
- [ ] **Nhất quán chéo (`design-standards §8`)** — endpoint/DTO/mã lỗi/thuật ngữ khớp thiết kế liên quan đã có; xung đột → `[cần xác nhận]`.
- [ ] **Changelog (`design-standards §9`)** — *chỉ khi SỬA thiết kế đã có baseline*: `CHANGELOG.md` có entry mới cho thay đổi; `vX.Y` khớp version header. (Sinh lần đầu: bỏ qua.)
- Gợi ý user chạy agent **`architect-reviewer`** để soi trước khi `developer-*` code.

## Ràng buộc
- **KHÔNG** tự đoán cột/mã trạng thái/liên kết bảng chưa rõ → dùng `[cần xác nhận]`.
- **KHÔNG** thiết kế trái `architecture.md` + `api-convention.md`.
- **NEVER** để thiết kế chỉ nằm trong chat — phải ghi vào `project-knowledge/design/<MÃ_CHỨC_NĂNG>/`.

## Liên kết
- Sinh thiết kế → agent `solution-architect`
- Soi thiết kế → agent `architect-reviewer`
- Viết code bám thiết kế → agent `developer-backend` / `developer-frontend` (Bước 1 đọc design doc)
- Chuẩn viết thiết kế → `org/shared/design-standards.md`
- Quy tắc changelog thiết kế (khi sửa) → `org/shared/design-standards.md §9`
