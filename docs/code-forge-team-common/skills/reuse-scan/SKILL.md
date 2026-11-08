---
description: >
  Quét tìm code/thành phần ĐÃ CÓ (trong project và trong các thư viện dùng chung project
  đang dùng) TRƯỚC khi viết code mới, để không viết lại thứ đã tồn tại. Kích hoạt trước khi
  tạo mới util/helper/mapper/converter/formatter/validator/constant/hàm xử lý chung, hoặc khi
  nghe "có sẵn chưa", "đã có hàm nào", "tránh trùng", "viết lại hay dùng lại". Xuất Reuse
  Report 3 nhóm (dùng lại / mở rộng / viết mới) và ghi vào current-task.md.
---

# Reuse Scan Skill

## MUST trigger (tự động — không chờ user yêu cầu)

**MUST** thực thi skill này khi:
- Sắp **tạo mới** bất kỳ thành phần mang tính dùng chung: util / helper / mapper / converter /
  formatter / validator / constant / enum / hằng cấu hình / hàm xử lý lặp lại được (format tiền,
  ngày tháng, chuỗi mã, phân trang, retry, gọi HTTP, xử lý lỗi chung, chuyển đổi DTO…).
- Agent `developer-backend` / `developer-frontend` bước lập **Kế hoạch chi tiết** (Bước 2) — luôn chạy,
  kể cả khi "cảm giác" là không có sẵn.

**NEVER** viết một thành phần dùng chung mới khi chưa có **Reuse Report** cho thành phần đó.
**NEVER** kết luận "không có sẵn" mà không ghi rõ **đã quét ở đâu, bằng cách nào**.

---

## Mục đích

Chống trùng lặp cách xử lý: code mới lặp lại logic đã có trong project hoặc trong thư viện dùng chung
của tổ chức. Skill này biến "tìm trước khi viết" thành bước có **dấu vết kiểm chứng được**, thay vì
phụ thuộc trí nhớ.

> Skill này **không gắn cứng thư viện nào** và **không đọc danh sách thư viện chép trong tài liệu**.
> Nguồn tái sử dụng luôn được xác định lại **từ source/manifest mới nhất của chính project** (Bước 0) —
> tài liệu mô tả thư viện trôi dạt rất nhanh, source thì không.

---

## Quy trình

### Bước 0 — Xác định NGUỒN tái sử dụng (quét ở đâu)

> **NEVER** dựa vào danh sách thư viện chép sẵn trong tài liệu (README, wiki, ghi chú kiến trúc) để kết
> luận "có gì / không có gì". **Căn cứ duy nhất là trạng thái source hiện tại của project.**

**Kết quả cần đạt** (cách làm do bạn tự chọn — xem "Nguyên tắc chọn cách làm" bên dưới):

- Biết project **thực sự** đang dùng những thư viện / module dùng chung nào, ở **phiên bản nào**.
- Biết nguồn nào **đọc được nội dung** (có source hoặc API doc sinh từ source) và nguồn nào không.
- Nguồn không đọc được → ghi là **vùng mù**, KHÔNG được coi như "đã quét".

### Bước 1 — Trích từ khóa tra cứu

Từ việc sắp làm, lập bộ từ khóa (đừng chỉ dùng 1 từ):
- **Khái niệm nghiệp vụ**: tên thực thể / nghiệp vụ, cả tiếng Việt lẫn tiếng Anh (theo `domain-glossary.md`).
- **Động từ kỹ thuật**: validate, format, parse, convert, map, build, resolve, paging, sort, retry,
  encrypt, mask, upload, export…
- **Biến thể đặt tên** theo convention của stack (`coding-convention.md`): `XxxUtil(s)`, `XxxHelper`,
  `XxxMapper`, `XxxConverter`, `XxxFactory`, `useXxx`, `formatXxx`, `isXxx`, `toXxx`.

### Bước 2 — Tra cứu

**Kết quả cần đạt:** với mỗi thành phần định viết, trả lời được "đã có thứ tương đương chưa, ở đâu" —
dựa trên **nội dung source hiện tại**, không dựa trí nhớ hay mô tả viết tay.

#### Nguyên tắc chọn cách làm (áp cho cả Bước 0 và Bước 2)

> **Không quy định công cụ.** Tự chọn cách tối ưu với **công cụ thực tế đang có trong phiên** — chỉ số
> mạnh yếu của từng công cụ thay đổi theo project, theo phiên, nên khoá cứng một trình tự là sai ngay từ đầu.

Ba tiêu chí để tự chọn và tự đánh giá:

1. **Phản ánh source hiện tại** — cách nào cho kết quả khớp trạng thái source đang dùng thì tin trước.
   Kết quả từ nguồn gián tiếp (index/cache/đồ thị dựng sẵn, tài liệu sinh sẵn) chỉ tin khi còn khớp source;
   nghi ngờ lệch → **kiểm chứng chéo** bằng một cách đọc trực tiếp.
2. **Đủ rộng trước, đủ sâu sau** — bắt đầu bằng cách phủ được nhiều nguồn nhất để không bỏ sót vùng nào,
   rồi mới đào sâu vào ứng viên tìm được.
3. **Ghi lại được** — **MUST** ghi vào Reuse Report: đã dùng **cách nào**, quét **nguồn nào**, bằng **từ khóa nào**.
   Đây là căn cứ để reviewer và user đánh giá độ tin cậy của kết luận "không có sẵn"; cách nào không ghi lại
   được thì không dùng làm căn cứ kết luận.

### Bước 3 — Phân loại kết quả

Xếp mỗi thành phần định viết vào đúng 1 trong 3 nhóm:

| Nhóm | Nghĩa | Bắt buộc ghi kèm |
|---|---|---|
| **DÙNG LẠI** | Đã có thứ đáp ứng đúng nhu cầu | Vị trí `path#symbol` + cách gọi |
| **MỞ RỘNG** | Đã có thứ gần đúng — bổ sung/tham số hoá thay vì viết bản song song | Vị trí + thay đổi dự kiến; thư viện dùng chung → nêu rõ cần MR sang repo đó |
| **VIẾT MỚI** | Thật sự chưa có | **Lý do** + **đã quét gì mà không thấy** (nguồn + từ khóa) |

> **Không thấy ≠ không tồn tại.** Nghi ngờ có thứ tương đương nhưng chưa xác nhận được (vùng mù ở
> Bước 0, không truy cập được source) → **DỪNG, hỏi user**, không tự xếp vào VIẾT MỚI.

### Bước 4 — Ghi Reuse Report vào state

Ghi vào mục **"## Tái sử dụng"** của `.claude/state/<dev-id>/current-task.md` (namespace xác định như
skill `task-state-init` Bước 0):

```markdown
## Tái sử dụng
> Quét ngày <YYYY-MM-DD> · Nguồn đã quét: <liệt kê + phiên bản> · Cách đã tra: <ghi đúng cách thực tế đã dùng>
> Từ khóa: <bộ từ khóa> · Vùng mù: <nguồn không truy cập được — hoặc `không`>

| Thành phần cần | Nhóm | Vị trí đã có / Lý do viết mới |
|---|---|---|
| <format tiền tệ> | DÙNG LẠI | `<lib>/…/MoneyUtils#format` |
| <validate mã dự toán> | MỞ RỘNG | `src/…/CodeValidator` — thêm rule X (MR sang lib nếu dùng chung) |
| <tính hạn mức theo kỳ> | VIẾT MỚI | Đã quét <nguồn> với <từ khóa>, không có thành phần tương đương |
```

**NEVER** để Reuse Report chỉ nằm trong chat — `code-reviewer-*` (chiều 5) đối chiếu bảng này.

---

## Liên kết

- Chi tiết hoá kế hoạch & viết code → agent `developer-backend` / `developer-frontend` (Bước 2a gọi skill này)
- Phân tầng / ranh giới module để biết chỗ đặt code → `project-knowledge/architecture.md` (kiến trúc, **không** phải danh sách thư viện)
- Đối chiếu khi review → agent/skill `code-review-backend` / `code-review-frontend` (chiều 5 — Reuse & Duplication)
- Khởi tạo state chứa mục "Tái sử dụng" → skill `task-state-init`
