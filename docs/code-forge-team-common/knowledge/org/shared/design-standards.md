# Design Standards — Chuẩn viết Tài liệu Thiết kế Kỹ thuật (Org)

> [!NOTE]
> Quy ước **cách viết** tài liệu thiết kế kỹ thuật (từ BA spec → thiết kế, trước khi code).
> Áp dụng cho agent `solution-architect` (sinh) + `architect-reviewer` (soi) + dev đọc.
> Nguồn tham chiếu chéo: `org/backend/api-convention.md`, `architecture.md`, `domain-glossary.md`.

## 0. Phạm vi theo tầng của project (QUAN TRỌNG)

Thiết kế **chỉ làm cho tầng mà project hiện tại phụ trách**:
- **BE-only** (microservice server) → chỉ thiết kế tầng server.
- **FE-only** (app/host giao diện) → chỉ thiết kế tầng giao diện; API là **hợp đồng tiêu thụ** (tham chiếu, không thiết kế guard/transaction/DDL).
- **Full-stack** (monolith) → thiết kế cả BE + FE.

Xác định phạm vi từ `architecture.md` + tech-stack + `src/`; **không rõ → hỏi user**, KHÔNG mặc định full-stack.
Phần tầng ngoài phạm vi → ghi "Ngoài phạm vi project này" (trỏ project/tài liệu liên quan nếu biết).

## 1. Một chức năng = (tối đa) 3 tài liệu, scope theo phạm vi

Mỗi chức năng (mã `<MOD>.<SCREEN>` hoặc tương đương) sinh ra tài liệu trong
`project-knowledge/design/<MÃ_CHỨC_NĂNG>/` (copy từ template `_template/`), **chỉ phần thuộc phạm vi tầng**:

| Tài liệu | Trả lời câu hỏi | Bám chuẩn |
|---|---|---|
| `API_Spec.md` | Hợp đồng ngoài: endpoint, request/response, lỗi, DDL | `api-convention.md` |
| `Component_Class_Design.md` | Cấu trúc trong: package, class, entity, DTO — **PHẦN I (BE) và/hoặc PHẦN II (FE) theo phạm vi** | `architecture.md`, `coding-convention.md` |
| `Processing_Flow.md` | Luồng chạy: tuần tự FE→API→APP→DOM→DB + transaction | `architecture.md` |

> Các tài liệu (theo phạm vi) phải **nhất quán** với nhau: endpoint/DTO/mã lỗi/tên class xuất hiện ở nhiều tài liệu phải trùng khớp.

## 2. Header chuẩn (đầu mỗi tài liệu)

Bảng metadata: **Mã chức năng · Phạm vi · Backend/FE (repo + stack) · Kiến trúc/Quy ước · CSDL (ràng buộc) · Tác giả/Ngày/Phiên bản**.

## 3. Bám quy ước Org — CHỈ trỏ tới nguồn, KHÔNG chép lại

> Các file dưới là **nguồn sự thật (SST)**. Mục này **KHÔNG lặp lại giá trị quy tắc** (tránh trôi/lệch khi
> sửa nguồn mà quên sửa ở đây) — chỉ nêu **phải tra ở đâu**. Khi mâu thuẫn → theo file nguồn.

| Khía cạnh thiết kế | Nguồn quy ước (tra giá trị cụ thể tại đây) |
|---|---|
| API: path & đặt tên endpoint | `api-convention.md §1` |
| API: nơi khai báo endpoint (tập trung `ApiPaths`) | `api-convention.md §1b` |
| API: kiểu & định dạng dữ liệu (request/response) | `api-convention.md §2` |
| API: envelope response, mã lỗi, phân trang | `api-convention.md §3` |
| Đặt tên / cấu trúc / giới hạn code, tên field DTO | `coding-convention.md` của tầng |
| Phân tầng, ranh giới module | `architecture.md` |
| Thuật ngữ nghiệp vụ | `domain-glossary.md` |

## 3.1 Bộ kiểm tuân thủ (SELF-AUDIT — BẮT BUỘC trước khi trình thiết kế)

> **Mở `api-convention.md` + `coding-convention.md` (bản hiện hành) và soi TỪNG endpoint/field đối chiếu
> MỌI quy tắc trong đó** — KHÔNG dựa trí nhớ hay "thói quen REST". Cổng cứng: còn 1 điểm lệch → **sửa ngay**,
> KHÔNG trình thiết kế. `architect-reviewer` soi lại y hệt.

Tối thiểu phải đối chiếu (tra giá trị trong file nguồn — KHÔNG chép vào đây):
- [ ] Path & đặt tên endpoint ⇄ `api-convention.md §1` — *casing tên resource là điểm hay sai nhất, soi từng segment*.
- [ ] Endpoint gom tập trung ở `ApiPaths`, không path inline ⇄ `api-convention.md §1b`.
- [ ] Response / mã lỗi / phân trang ⇄ `api-convention.md §3`.
- [ ] Kiểu & định dạng field ⇄ `api-convention.md §2`.
- [ ] Tên/cấu trúc DTO & class ⇄ `coding-convention.md`; phân tầng ⇄ `architecture.md`; thuật ngữ ⇄ `domain-glossary.md`.

> **Quy tắc vàng:** không chắc → **tra file chuẩn**. Tra không thấy → đánh dấu `[cần xác nhận]`.

## 4. Sơ đồ

> **Mermaid là canonical** — mặc định mọi sơ đồ dùng Mermaid (đọc được trên GitLab + máy parse tốt, nhất quán xuyên feature). ASCII chỉ là **fallback** khi Mermaid không diễn đạt nổi.

- **Luồng xử lý**: Mermaid `sequenceDiagram`. Fallback ASCII (cột FE | API | APP | DOM/DB) chỉ khi cần thể hiện song song nhiều tầng mà `sequenceDiagram` rối — nêu lý do ngắn khi chọn ASCII.
- **Quan hệ lớp**: Mermaid `classDiagram`. Fallback sơ đồ gọi ASCII Controller→Service→Repository chỉ khi quan hệ quá đơn giản không cần classDiagram.
- Mọi sơ đồ đặt trong code-fence ```mermaid (hoặc ``` cho ASCII).

## 5. Quy ước `[cần xác nhận]` (BẮT BUỘC)

Mọi điểm SRS yêu cầu nhưng **chưa map 1‑1** vào cột vật lý / mã trạng thái / liên kết bảng / quyền →
đánh dấu inline `[cần xác nhận]` **và** gom thành danh sách đánh số ở mục cuối mỗi tài liệu.

> Thiết kế KHÔNG được "đoán cho xong". Chỗ chưa rõ → đánh dấu để tech lead/BA chốt, KHÔNG tự quyết.

## 6. Bất biến phải nêu rõ khi có thao tác ghi

- Ranh giới `@Transactional` (bước nào all-or-nothing).
- **Optimistic lock** (`@Version` + `WHERE version=:expected`) nếu có sửa/xóa đồng thời.
- **Soft-delete** vs hard-delete; cách ẩn dữ liệu con khi không có cột soft-delete.
- **Ghi lịch sử/audit** đi kèm thao tác (cùng transaction).
- **Idempotency** cho thao tác có thể retry.

## 7. Súc tích — tối ưu cho AI đọc (không thừa, không lặp)

> Tài liệu thiết kế là **đầu vào cho `developer-*` (AI) đọc**.
> Viết để AI parse nhanh, đúng, ít token: **cô đọng, mỗi thông tin đúng một chỗ**.

- **Một thông tin = một nơi.** Trong bộ 3 tài liệu của một chức năng, mỗi endpoint / DTO / mã lỗi / ràng buộc mô tả **chi tiết ở đúng một tài liệu** (theo bảng §1); nơi khác **trỏ tới**, KHÔNG chép lại nguyên khối.
  - Chi tiết endpoint/request/response/mã lỗi → `API_Spec.md`. `Processing_Flow.md`/`Component_Class_Design.md` chỉ **nhắc tên + trỏ**, không lặp lại bảng field/JSON.
- **Không lặp trong cùng tài liệu.** Cùng một bảng field, đoạn quy ước, hay ví dụ JSON không xuất hiện nhiều lần. Nhiều thao tác dùng chung một shape → mô tả 1 lần + tham chiếu.
- **Cắt phần thừa không cần thiết.** Bỏ: diễn giải dài dòng văn phong người, nhắc lại spec BA nguyên văn, giải thích quy ước chung đã có ở file nguồn (§3), boilerplate template chưa điền, phần tầng ngoài phạm vi (chỉ ghi 1 dòng "Ngoài phạm vi project này").
- **Ưu tiên dạng máy đọc.** Bảng / danh sách / code-fence thay cho đoạn văn dài khi mô tả contract, field, luồng.

> Nguyên tắc này KHÔNG phải cổng cứng như §3.1 — vi phạm là finding MINOR/MAJOR ở `architect-reviewer`, không chặn trình thiết kế. Nhưng self-check ở Bước 4 phải rà.

## 8. Tham khảo thiết kế liên quan — chống xung đột chéo

> Trước khi thiết kế một chức năng, PHẢI đối chiếu với các thiết kế **đã có** trong `project-knowledge/design/`
> để tái dùng khái niệm chung và tránh định nghĩa lại mâu thuẫn.

- **Quét thiết kế liên quan** trong `project-knowledge/design/` — ưu tiên: cùng module (`<MOD>.*`), dùng chung entity / DTO / endpoint / mã lỗi / thuật ngữ, hoặc chức năng spec BA có trỏ tới.
- **Trùng khái niệm → trỏ / tái dùng**, KHÔNG định nghĩa lại lệch nhau. Endpoint, tên & shape DTO, mã lỗi, tên class/entity, thuật ngữ dùng chung phải **khớp** thiết kế đã có; khác đi mà không có lý do là **xung đột**.
- **Xung đột không tự hòa giải được** (vd thiết kế cũ và spec mới đòi 2 shape khác nhau cho cùng DTO) → đánh dấu `[cần xác nhận]` + nêu rõ để tech lead/BA chốt, KHÔNG tự quyết đè lên thiết kế cũ.
- Nếu chưa có thiết kế liên quan nào → ghi nhận đã kiểm tra (không có), tiếp tục bình thường.

## 9. Nhật ký thay đổi thiết kế (Design Changelog)

> Mỗi chức năng có thể có **file thứ 4** `CHANGELOG.md` trong `design/<MÃ_CHỨC_NĂNG>/` (copy từ `_template/` ở **lần sửa đầu tiên**) —
> ghi lịch sử thay đổi của bộ 3 tài liệu thiết kế để dev/AI đọc nhanh "gần đây đổi gì, có phá vỡ hành vi không".

- **Khi nào ghi:** **bản sinh lần đầu KHÔNG ghi changelog** — đó là baseline. **SAU khi** thiết kế đã lên git, mỗi lần commit **SỬA** chạm `API_Spec.md` / `Component_Class_Design.md` / `Processing_Flow.md` → thêm **1 entry block MỚI lên ĐẦU file** (mới nhất trên cùng). KHÔNG sửa/gộp/xóa entry cũ đã ghi.
- **Một entry gồm:** tiêu đề `## [vX.Y] — YYYY-MM-DD`; `type` (MAJOR|MINOR); `author`; `summary` (1 câu đọc là nắm ngay);
  danh sách **Thay đổi** — mỗi thay đổi đánh số, gồm một bảng ngắn `# · Vị trí · Loại{Thêm/Sửa/Gỡ/Đổi-nghĩa}` rồi 3 dòng nhãn **Cũ:** / **Mới:** / **Lý do:** bên dưới (tách Cũ/Mới/Lý do khỏi bảng để không nhồi văn xuôi dài vào ô — bảng chỉ giữ dữ liệu ngắn);
  **File design đã sửa**; **Ảnh hưởng** (mô tả bằng lời — màn hình/quy trình nào bị tác động; không có → ghi "Không").
- **Cột `Vị trí` = mỏ neo tham chiếu thật:** dùng **tiêu đề mục** đúng như trong tài liệu (vd `API 3 — Create`, `## Catalog mã lỗi`), **tên field** hoặc **mã lỗi/message** — KHÔNG bịa mã mục không tồn tại. Cùng quy ước mỏ neo này áp dụng khi các tài liệu trỏ chéo nhau (§7).
- **Quy ước version `MAJOR.MINOR`:**
  - **MAJOR** — thay đổi **phá vỡ hợp đồng** (breaking): xóa/đổi endpoint, đổi shape/tên DTO, đổi/bỏ mã lỗi, đổi bảng đã dùng.
  - **MINOR** — thêm mới / sửa không phá vỡ / chốt một điểm `[cần xác nhận]`.
- **Đồng bộ version:** `vX.Y` của entry mới nhất PHẢI **khớp** version ở header 3 tài liệu thiết kế — bump cùng lúc.
- **Baseline & entry đầu tiên:** bản sinh lần đầu là **baseline vX.Y**, KHÔNG tạo `CHANGELOG.md`. File changelog + entry đầu tiên chỉ xuất hiện ở **lần sửa đầu tiên sau baseline** — ghi thay đổi so với version trước.

## 10. MUST / NEVER

- **MUST** đúng **phạm vi tầng project** (BE-only không lẫn FE và ngược lại; full-stack mới có cả hai).
- **MUST** sinh tài liệu (theo phạm vi) nhất quán + header chuẩn (gồm **phạm vi tầng**) + danh sách `[cần xác nhận]`.
- **MUST** chạy **Bộ kiểm tuân thủ §3.1** (soi từng endpoint/field với `api-convention.md`) trước khi trình; còn mục ❌ → sửa, KHÔNG trình.
- **MUST** bám envelope / mã lỗi / headers / phân tầng theo Org; tham chiếu file chuẩn, không chép lệch.
- **MUST** đánh dấu `[cần xác nhận]` cho mọi điểm chưa map được — KHÔNG tự đoán cột/mã/liên kết.
- **MUST** viết **súc tích, tối ưu cho AI đọc** (§7): mỗi thông tin đúng một nơi, cắt phần thừa/lặp.
- **MUST** đối chiếu **thiết kế liên quan đã có** (§8) trước khi thiết kế; trùng khái niệm → trỏ/tái dùng.
- **MUST** cập nhật `CHANGELOG.md` (thêm 1 entry lên đầu, version khớp header) mỗi lần **SỬA** thiết kế đã có baseline trên git (§9). Sinh lần đầu: KHÔNG ghi.
- **NEVER** đổi thiết kế mà bỏ qua changelog, hoặc sửa/xóa entry changelog đã ghi (§9).
- **NEVER** thiết kế class/tầng/endpoint trái `architecture.md` + `api-convention.md` (casing/đặt tên path là chỗ hay lệch — soi kỹ).
- **NEVER** định nghĩa lại (lệch) endpoint/DTO/mã lỗi/thuật ngữ đã có ở thiết kế liên quan — xung đột không hòa giải được → `[cần xác nhận]`.
- **NEVER** suy quy ước theo "thói quen REST" thay vì tra `api-convention.md`.
- **NEVER** để thiết kế chỉ nằm trong chat — phải ghi vào `project-knowledge/design/<MÃ_CHỨC_NĂNG>/`.
