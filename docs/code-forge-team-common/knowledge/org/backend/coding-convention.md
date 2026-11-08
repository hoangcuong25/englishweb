# Coding Convention — Backend Java (Org)

> [!NOTE]
> Quy ước coding **Java** cho dự án VDBAS (KBNN). Nguồn: `VDBAS_coding_convention_back-end_java.md` (tổng hợp đầy đủ).
> Đây là **convention chuẩn org** — *coding rules đặc thù từng project* triển khai riêng ở mức project (`.claude/rules/`).
> Bổ trợ: [tech-stack.md](tech-stack.md) (kiến trúc module), [api-convention.md](api-convention.md), [security.md](security.md).

---

## 1. Quy ước đặt tên

### 1.1 Quy tắc chung
- **MUST** đặt tên mọi định danh (class, interface, method, biến, hằng số, package, tham số) **bằng tiếng Anh** — mô tả đúng vai trò. **NEVER** đặt tên bằng tiếng Việt (có dấu hoặc không dấu) hay phiên âm (vd `danhSachNguoiDung`, `taoMoi`, `soTien`); dùng `userList`, `create`, `amount`.
- Đặt tên biến **khác nhau rõ vai trò** để code dễ đọc. **NEVER** dùng các biến chỉ phân biệt bằng HOA/thường khi triển khai quy tắc nghiệp vụ (vd `LENGTH` vs `length`).

### 1.2 Package
- **Dễ hiểu, đoán được nghiệp vụ** — chấp nhận tên hơi dài, tránh bỏ sót/hiểu lầm. **NEVER** dùng ID/số seri khó hiểu (`s0001`) trừ khi đã thống nhất nội bộ.
- **Toàn bộ chữ thường** (quy ước Java).
- **Tiền tố bằng tên miền đảo ngược** của tổ chức + tên package: `vn.com.kbnn.thu.controller`.

### 1.3 Interface & Class
- Tên **liên hệ vai trò**, mô tả rõ (kể cả dài); không ID/số seri khó hiểu.
- **PascalCase** — viết hoa ký tự đầu mỗi từ: `class Sample`, `OrderService`.

### 1.4 Phương thức
- Tên **phản ánh vai trò**, theo tiền tố quy ước:

| Cách đặt | Ví dụ |
|---|---|
| `create` + đối tượng | `createServerSocket` |
| `to` + đối tượng | `toString` |
| `get` / `set` + đối tượng | `getName`, `setName` |
| `check` / `add` / `modify` + đối tượng | `checkObject`, `addObject`, `modifyObject` |

- Phương thức trả **boolean** phải thể hiện trạng thái true/false:

| Cách đặt | Ví dụ |
|---|---|
| `is` + tính từ | `isAsleep` |
| `can` + động từ | `canSpeak` |
| `has` + quá khứ phân từ | `hasExpired` |
| động từ (ngôi 3) + danh từ | `existsMessage`, `hasValue` |

- **camelCase**: 1 từ → thường; nhiều từ → viết hoa chữ đầu từ thứ 2 trở đi.

### 1.5 Biến
- Tên **phản ánh vai trò**, càng có nghĩa càng tốt (nhất là biến cục bộ). Tên 1 ký tự (`i, j, k`) **chỉ** dùng làm index vòng lặp/mảng.
- **camelCase** (như phương thức).
- Biến boolean: tên thể hiện true/false.
- **Hằng số** (`static final`): **UPPER_SNAKE_CASE**, phân tách từ bằng `_` (`MAX_LENGTH`).

---

## 2. Định dạng (Format)

### 2.1 Thứ tự phần tử
- Mỗi file Java theo thứ tự: **tiêu đề file → khai báo `package` → khai báo `import` → khai báo class/interface**.
- Trong class/interface: **hằng số → biến → constructor → phương thức**. (Enum: hằng số enum → phương thức.)

### 2.2 Mã ký tự
- Dùng **UTF-8** để tránh ký tự bị cắt xén; xác nhận UTF-8 **trước khi review**.

### 2.3 Thụt lề
- **4 khoảng trắng**, KHÔNG tab (tab gây vỡ thụt lề tùy editor).
- Lồng thụt lề trong method **≤ 4 cấp**; sâu hơn → **tách thành method con** (sâu quá khó đọc).

### 2.4 Khoảng trống
- **Dòng trống** chèn hợp lý: sau `package`; quanh khối `import`; trước mỗi khai báo class/field/method (gồm constructor); trước/sau mỗi block trong method; trước comment.
  - **NEVER**: 2 dòng trống liên tiếp; chèn dòng trống ngay sau comment.
- **Space nửa-chiều-rộng**: trước `(` & sau `)` của câu lệnh điều khiển; sau `,`; sau `;` trong `for`; sau cast; quanh toán tử gán / nhị phân / tam phân.
  - **NEVER** space quanh `.` khi gọi method; quanh `[` `]` của mảng.

### 2.5 Ngắt dòng
- Dòng tối đa **120 ký tự**; vượt → ngắt tại keyword (`extends`/`implements`/`throws`) hoặc sau `,`, và **thụt lề** vị trí ngắt.
- **Một câu lệnh / một dòng**; KHÔNG khai báo nhiều biến trong cùng một khai báo.
- Dấu `{}` chỉ ngắt dòng khi **đóng** method/block.

### 2.6 Toán tử
- Dùng `()` chỉ rõ thứ tự khi có nhiều mức ưu tiên khác nhau (không bắt buộc cho 4 phép số học cơ bản).
- Thống nhất chiều bất đẳng thức thành `giá trị1 < giá trị2` (dùng `<` và `<=`).

### 2.7 Câu lệnh
- LUÔN dùng `{}` trong câu lệnh điều kiện — kể cả khi thân chỉ 1 dòng (tránh lỗi khi thêm block mới về sau).
- **NEVER** để thân block rỗng; nếu chờ spec → ghi comment "CẦN LÀM", thay bằng code khi spec hoàn thiện.
- **NEVER** dùng nhãn (label) cho `break`/`continue` (khó theo dõi luồng).

---

## 3. Comment

### 3.1 Quy tắc chung
- Có thể thêm **comment header** ở đầu mỗi file: `/* Copyright(c) 2025-2026 KBNN All Rights Reserved. System name: VDBAS */`.
- **NEVER**: trang trí comment quá mức (`***`, `///`) → rối mắt; lồng comment; **comment-out code** (xóa hẳn, dùng công cụ quản lý cấu hình); comment vô nghĩa/mô tả thừa thứ code đã nói.
- Trong code tạo tự động: KHÔNG thêm comment vào phần không sửa (tránh xuống cấp chất lượng).

### 3.2 Comment khi implement
- Định dạng: **`//`** cho 1 dòng, **`/* */`** cho nhiều dòng — **thống nhất** trong dự án, không trộn.
- Tiêu đề file: mô tả tên file + bản quyền.
- Thụt lề comment **khớp** khối code; đặt **ngay trước** đoạn code.

### 3.3 Javadoc
- Viết bằng **HTML**: thẻ `<code>`, `<br>`, `<p>`, `<ul><li>`; escape ký tự đặc biệt (`&amp;`, `&lt;`, `&gt;`, `&quot;`).
- **Class/Interface**: phác thảo vai trò + mô tả chi tiết nếu cần + `@author` + `@version`.
- **Field**: mô tả ngắn vai trò trường.
- **Method**: phác thảo + chi tiết (bỏ với getter/setter đơn giản) + `@param` + `@return` + `@exception`.

### 3.4 Javadoc cho Unit Test
- Ghi rõ: **Test item** (item kiểm tra), **Input Condition** (giá trị + điều kiện đầu vào), **Confirmation Content** (giá trị đầu ra cần xác nhận), **Confirmation method** (cách xác nhận kết quả).

---

## 4. Khai báo & Định nghĩa

### 4.1 Yêu cầu chung
- **Giảm phạm vi truy cập** (`private/protected/public` đúng mức). Field instance → **`private`** + getter/setter khi cần. Method/field chỉ dùng nội bộ → `private`.

### 4.2 Import
- KHÔNG import `java.lang` và class cùng package (đã import ngầm).
- KHÔNG import class không dùng.
- **KHÔNG wildcard `*`** — khai báo tường minh để biết rõ đã import gì.

### 4.3 Class
- Một class/interface **≤ 1000 dòng** (gồm comment); vượt → xem xét tách (trừ JavaBean không thể chia).

### 4.4 Constructor
- Có thể **bỏ qua** constructor mặc định — không cần định nghĩa.

### 4.5 Phương thức
- **Một vai trò** mỗi method; nhiều vai trò → tách method con.
- Overload **thận trọng**: giới hạn số tham số **< 4** (trừ lý do đặc biệt).
- Khi overload: chú ý quan hệ kế thừa giữa kiểu tham số (lựa chọn overload xảy ra lúc **biên dịch**). Thiết kế an toàn = các overload **khác nhau số lượng** tham số.

### 4.6 Biến
- **Khởi tạo khi khai báo** (kể cả giá trị mặc định) — tránh lỗi không mong muốn từ khởi tạo ngầm.
- Khai báo **generic** rõ ràng khi dùng collection (an toàn kiểu, dễ đọc).
- Thêm **`@Override`** cho method ghi đè (tăng khả năng đọc); annotation khác không bắt buộc.
- **Tránh tạo object thừa** (lãng phí bộ nhớ) — cân nhắc tái sử dụng.

---

## 5. Quy ước lập trình (Programming)

### 5.1 Yêu cầu chung
- KHÔNG dùng class/interface/field/method đã **deprecated/gỡ bỏ** (xem như lỗi hoặc sẽ bị loại bỏ).
- **LUÔN kiểm tra null** với giá trị trả về/đối số có thể null (tránh `NullPointerException`).
- **Hiểu rõ thư viện** trước khi dùng (tối thiểu nắm `java.lang`, `java.util`).
- Ưu tiên **kiểu nguyên thủy** hơn wrapper/boxed (hiệu năng + bộ nhớ; `==` trên boxed luôn sai, unboxing có thể NPE).
- KHÔNG lạm dụng `String` khi có kiểu phù hợp hơn (số → `BigDecimal`...).
- **Ưu tiên kiến trúc đúng & rõ ràng hơn tốc độ**; chỉ tối ưu hiệu năng khi đã chắc và thực sự cần.

### 5.2 Chuỗi (String)
- KHÔNG dùng ký tự phụ thuộc hệ thống (`\n`, `\r`) — dùng `System.getProperty(...)` để giữ tính linh động.
- So sánh chuỗi bằng **`equals()`**, KHÔNG `==`/`!=` (`==` so sánh tham chiếu, sinh bug).
- Ưu tiên **`"literal".equals(obj)`** để bỏ qua được null-check của đối tượng chuỗi.
- Chuỗi cập nhật/nối nhiều lần → dùng **`StringBuilder.append()`** (String bất biến → mỗi lần nối tạo object mới, giảm hiệu năng, nhất là trong vòng lặp).

### 5.3 Mảng
- Method trả mảng → trả **mảng kích thước 0**, KHÔNG `null` (đỡ buộc caller null-check).
- Sao chép mảng dùng **`System.arraycopy()`** (không tự viết vòng lặp copy — lãng phí).

### 5.4 Câu lệnh điều khiển
- Bộ đếm `for` khởi tạo **0** (trừ lý do cụ thể) — giữ khả năng đọc.
- **NEVER** thay đổi bộ đếm vòng lặp trong thân vòng lặp (khó hiểu, dễ lỗi).
- KHÔNG dùng auto-boxing/unboxing trong vòng lặp (dễ thành nút thắt hiệu năng).
- Duyệt collection/array → dùng **enhanced for**; chỉ for-index khi bắt buộc cần index.
- `switch` LUÔN có **`default`** (kể cả khi không case nào thỏa — tránh nhầm lẫn/lỗi).

### 5.5 Xử lý ngoại lệ (Exception)
- LUÔN đặt **message lỗi (hoặc ID thông báo)** khi tạo exception.
- **NEVER** khối `catch` rỗng — tối thiểu xuất log + để lại comment (không xử lý có thể sinh lỗi mới).
- `catch` **đúng kiểu cụ thể**; KHÔNG bắt chung `Exception`/`RuntimeException`/`Throwable` (sẽ không xử lý đúng loại, dễ nuốt nhầm exception đáng lẽ ném lên caller) — trừ xử lý cuối về kiến trúc trong framework.

### 5.6 Ép kiểu (Cast)
- KHÔNG dùng cast khi gán lên **kiểu cao hơn** (upcast — trình biên dịch tự xử lý tĩnh).
- Dùng **`instanceof`** kiểm tra trước khi **downcast** (tránh `ClassCastException`).

### 5.7 Generics
- Loại bỏ **unchecked warning** lúc biên dịch.
- Ưu tiên **generic `List`** hơn mảng (an toàn kiểu — phát hiện sai kiểu lúc biên dịch).

---

## 6. Truy cập dữ liệu (Persistence / Query)

> [!NOTE]
> **Convention org** (quyết định nội bộ, bổ sung ngoài tài liệu nguồn). Áp dụng cho tầng `domain` (JPA entity & Repository) — xem phân tầng ở [tech-stack.md §3b](tech-stack.md).

### 6.1 Nguyên tắc: JPA-first, Native SQL là ngoại lệ
- **MUST** tận dụng tối đa **Spring Data JPA / Hibernate**. **Native SQL chỉ dùng khi JPA thực sự không làm được** — không dùng vì "quen tay" hay "cho nhanh".
- Thứ tự ưu tiên khi viết truy vấn (chọn mức thấp nhất đủ dùng):

| Ưu tiên | Cách | Dùng khi |
|---|---|---|
| 1 | **Derived query** (`findByStatusAndType`…) | Truy vấn đơn giản theo thuộc tính |
| 2 | **JPQL** qua `@Query` (không `nativeQuery`) | Cần join/aggregate/projection ở mức entity |
| 3 | **Criteria API / `Specification`** | Điều kiện động (dynamic filter) ghép lúc runtime |
| 4 | **`@EntityGraph` / `fetch join`** | Nạp quan hệ chống **N+1** (thay vì lazy lặp) |
| 5 | **Native SQL** (`@Query(nativeQuery = true)`) | **Chỉ khi 1–4 bất khả** (xem 6.2) |

### 6.2 Khi nào được dùng Native SQL
Chấp nhận Native SQL cho các trường hợp JPA/JPQL không diễn đạt được:
- Hàm/cú pháp **đặc thù Oracle** (analytic/window function, hint, `MERGE`, `CONNECT BY`…).
- **Bulk operation** hoặc truy vấn báo cáo mà JPQL kém hiệu năng đã được đo đạc.
- Tính năng DB mà JPQL không hỗ trợ.

### 6.3 Ràng buộc khi buộc dùng Native SQL
- **MUST** tham số hóa — **NEVER** nối chuỗi giá trị từ input vào câu SQL (chống SQL injection; xem [security.md](security.md)).
- **MUST** ghi **lý do vì sao không dùng được JPA** ngay tại query (comment trên method Repository) **và** nêu trong mô tả Merge Request.
- Ưu tiên `namedParameter` (`:param`) hơn positional để dễ đọc; map kết quả về DTO/projection tường minh, tránh trả `Object[]` trần.

### 6.4 Cờ boolean (`IS_*` / `HAS_*`) — kiểu Java và kiểu cột

> [!NOTE]
> **Dự thảo do eDoc soạn theo yêu cầu của SA (06-08-2026).** Lý do và số liệu đo: eDoc
> `docs/decisions/2026-08-06-cau-hoi-SA-DBA-kieu-cot-co-boolean.md` +
> `2026-08-06-flag-type-unification-proposal.md`. `VDBAS_naming_convention_DB` v0.21 quy định **tên** cờ
> (`IS_`/`HAS_`) nhưng chưa quy định **kiểu vật lý** — mục này bù khoảng trống đó.

- **Kiểu cột (đối tượng DB MỚI): `NUMBER(1)` `NOT NULL` có `DEFAULT`** (0 hoặc 1 theo nghiệp vụ).
  **NEVER** dùng kiểu `BOOLEAN` gốc của Oracle 23ai+ cho đối tượng mới: nền tảng VDBAS đang dùng
  `NUMBER(1)` (vd phân hệ BPM dùng toàn bộ `NUMBER(1)`), và kiểu `BOOLEAN` chưa được xác nhận với công cụ
  báo cáo/BI cùng các hệ tích hợp.
- **Kiểu Java: LUÔN `Boolean`** (không `Integer`, không `int`). Cùng một khái niệm mà nơi `Integer` nơi
  `Boolean` thì JPQL viết theo trí nhớ **50% sai** — mà JPQL là chuỗi, chỉ vỡ lúc chạy.
- **Trên cột `NUMBER(1)`: BẮT BUỘC thêm `@JdbcTypeCode(SqlTypes.INTEGER)`.** Hai lý do đã đo, không phải
  đề phòng: (1) `ddl-auto=validate` (chế độ prod) đòi cột kiểu `BOOLEAN` nếu để mặc định ⇒ **service không
  khởi động**; (2) driver Oracle từ chối `setNull(Types.BOOLEAN)` nên mọi `UPDATE` để cột nullable về null
  sẽ lỗi.

```java
@JdbcTypeCode(SqlTypes.INTEGER)          // cột NUMBER(1) — BẮT BUỘC
@Column(name = "IS_ACTIVE", nullable = false)
private Boolean active = Boolean.TRUE;
```

- **JPQL / Criteria viết MỘT dạng duy nhất:** `SET e.deleted = true`, `WHERE e.active = false`,
  `cb.isFalse(root.get("deleted"))`. **NEVER** `= 1` / `= 0` hay hằng `Integer` (`FLAG_TRUE`/`FLAG_FALSE`)
  cho cờ.
- **DTO phơi ra ngoài: `Boolean`** (JSON `true`/`false`, không phải `1`/`0`) — MapStruct tự quy đổi nếu
  entity còn kiểu khác.
- **MUST** chạy phép kiểm ánh xạ ↔ schema trước khi merge thay đổi kiểu field/`@Column`/`@JdbcTypeCode`
  (test đơn vị dùng mock nên **không** bắt được lệch loại này). Mẫu script: eDoc
  `docs/test/edoc-schema-validate.sh`.
- Cột cờ **đã deploy** mà lệch chuẩn: **không** sửa lẻ — gom vào một đợt migration có cửa sổ deploy, vì
  Oracle **không** cho đổi kiểu cột đã có dữ liệu (`ORA-01439`), phải theo khuôn thêm cột → copy → xoá cột
  cũ → đổi tên.
