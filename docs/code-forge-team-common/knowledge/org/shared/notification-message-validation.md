# Notification, Message & Validation — Quy chuẩn Thông báo / Message / Validate (Org)

> [!NOTE]
> Quy ước **thông báo, nội dung message, validate dữ liệu và bộ mã lỗi** áp dụng chung toàn dự án VDBAS.
> Nguồn: `VDBAS_SA_Notify_Message_Validate` (SA — Đỗ Văn Ngà, v0.1, 18/05/2026).
> Đối tượng: BA, SA, Tech Lead/Developer (FE+BE), QA/Tester. **Bắt buộc tham chiếu** khi đặc tả, code, test.
> Liên quan: `backend/api-convention.md` (envelope response & mã lỗi), `frontend/tech-stack.md` (thư viện validate), `frontend/coding-convention.md`.

## 1. Chuẩn hóa Toast / Notification / Dialog

5 loại thông báo dùng xuyên suốt hệ thống:

| Loại | Icon | Màu sắc | Khi nào dùng | Tự đóng sau |
|---|---|---|---|---|
| **SUCCESS** | ✅ Check circle | `#1E8449` xanh lá | Thao tác thành công: lưu, tạo mới, cập nhật, xóa | 5 giây |
| **ERROR** | ❌ X circle | `#C0392B` đỏ | Lỗi hệ thống, lỗi server, thao tác thất bại | Không tự đóng |
| **WARNING** | ⚠️ Triangle | `#D4AC0D` vàng cam | Cảnh báo trước khi thực hiện, dữ liệu sắp hết hạn | 5 giây |
| **INFO** | ℹ️ Info circle | `#1A5276` xanh dương | Thông tin tham khảo, hướng dẫn, gợi ý | 5 giây |
| **LOADING** | ⏳ Spinner | `#6C3483` tím | Đang xử lý, chờ response từ server | Đóng khi xong |

### 1.1 Quy tắc hiển thị theo kênh

| Kênh | Quy tắc |
|---|---|
| **Toast** (nổi góc màn hình) | Vị trí mặc định **top-right**; tối đa **3 toast** cùng lúc (toast mới đẩy cũ xuống); đóng tay bằng nút X; animation slide-in từ phải, fade-out khi đóng. **KHÔNG** dùng Toast cho lỗi nghiêm trọng cần đọc kỹ → dùng Dialog. |
| **Notification** (trong hệ thống) | Hiển thị ở Notification Center (chuông 🔔 trên header); lưu lịch sử, xem lại được; phân loại read/unread + badge số chưa đọc. Thông báo quan trọng (phê duyệt, từ chối, deadline) dùng Notification. |
| **Dialog** (hộp thoại xác nhận) | Dùng khi cần xác nhận trước hành động nguy hiểm (xóa, hủy, ghi đè). **Bắt buộc 2 nút** `[Xác nhận]` + `[Hủy]` — không được chỉ 1 nút. Modal chặn thao tác đến khi xử lý xong. Tiêu đề nêu rõ hành động (*"Xác nhận xóa hồ sơ?"*); nội dung giải thích hậu quả (*"Dữ liệu sẽ không thể khôi phục sau khi xóa."*). |

## 2. Quy chuẩn nội dung message

### 2.1 Năm nguyên tắc cốt lõi

1. **Ngắn gọn, rõ ràng** — mỗi message một ý, đọc xong hiểu ngay; tránh câu dài, vòng vo, lặp.
2. **Dùng chủ thể rõ ràng** — nêu rõ đối tượng bị tác động (hồ sơ, tài khoản, giao dịch…); tránh "đã xảy ra lỗi" chung chung.
3. **Nêu hướng xử lý** — khi lỗi/cảnh báo, gợi ý bước tiếp theo (đăng nhập lại, kiểm tra kết nối, liên hệ quản trị viên…).
4. **Không dùng mã kỹ thuật** — tuyệt đối không hiện mã HTTP, stack trace, tên exception ra UI; luôn chuyển sang ngôn ngữ tự nhiên.
5. **Lịch sự, thân thiện** — không gây cảm giác bị đổ lỗi; ưu tiên *"Bạn chưa có quyền…"* thay vì *"Truy cập bị từ chối!"*.

| Nguyên tắc | Đúng ✅ | Sai ❌ |
|---|---|---|
| Ngắn gọn, rõ ràng | Lưu hồ sơ thành công. | Thao tác lưu hồ sơ của bạn đã được thực hiện thành công trong hệ thống. |
| Dùng chủ thể rõ ràng | Không tìm thấy hồ sơ này. | Đã xảy ra lỗi không xác định. |
| Nêu hướng xử lý | Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại. | Phiên làm việc đã kết thúc. |
| Không dùng mã kỹ thuật | Không có kết nối mạng. Kiểm tra lại đường truyền. | Error 503: Service Unavailable. |
| Lịch sự, thân thiện | Bạn chưa có quyền truy cập tính năng này. | Truy cập bị từ chối! |

### 2.2 Quy tắc độ dài

| Loại thông báo | Độ dài tối đa | Số dòng tối đa | Ghi chú |
|---|---|---|---|
| Toast | 80 ký tự | 1 dòng | Ngắn, đọc nhanh |
| Notification | 150 ký tự | 2 dòng | Có thể có link chi tiết |
| Dialog title | 50 ký tự | 1 dòng | Dạng câu hỏi hoặc hành động |
| Dialog content | 200 ký tự | 3 dòng | Giải thích hậu quả, hướng xử lý |
| Validate inline | 100 ký tự | 1 dòng | Hiển thị dưới input field |

### 2.3 Mẫu message theo nghiệp vụ (BẮT BUỘC dùng đúng mẫu)

> Placeholder `{}` thay bằng tên đối tượng nghiệp vụ cụ thể khi hiển thị (`{Tên đối tượng}` → "Hồ sơ", "Tài khoản"…). Team **không tự đặt nội dung tùy ý**.

| Tình huống | Loại | Nội dung mẫu |
|---|---|---|
| Tạo mới thành công | SUCCESS | `{Tên đối tượng} đã được tạo thành công.` |
| Cập nhật thành công | SUCCESS | `Thông tin {đối tượng} đã được cập nhật.` |
| Xóa thành công | SUCCESS | `{Tên đối tượng} đã được xóa khỏi hệ thống.` |
| Lỗi server | ERROR | `Hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ quản trị viên.` |
| Không có quyền | ERROR | `Bạn không có quyền thực hiện thao tác này.` |
| Hết phiên đăng nhập | WARNING | `Phiên làm việc sắp hết hạn. Vui lòng lưu dữ liệu trước khi tiếp tục.` |
| Xác nhận xóa | DIALOG | `Bạn có chắc chắn muốn xóa {tên đối tượng}? Dữ liệu sẽ không thể khôi phục sau khi xóa.` |
| Đang xử lý | LOADING | `Đang xử lý yêu cầu. Vui lòng không đóng trình duyệt...` |

**Phân nhóm:** SUCCESS xác nhận đúng hành động CRUD + kèm tên đối tượng (tránh nhầm khi thao tác nhiều mục). ERROR phân biệt *lỗi server* (gợi ý thử lại/liên hệ) vs *không có quyền* (chỉ thông báo, không thêm hướng xử lý). WARNING (hết phiên) phải nêu nguy cơ mất dữ liệu + hành động cần làm ngay.

## 3. Validate Rules — Frontend

### 3.1 Nguyên tắc

- Validate FE là **lớp đầu tiên** — UX mượt, không cần call API; **không thay thế** validate BE (cả hai đều bắt buộc).
- Hiển thị lỗi **ngay dưới input** khi user **blur** khỏi field (on-blur); **không** hiện lỗi khi field còn *untouched*.
- Cơ chế validate FE theo `frontend/tech-stack.md` (SST) — org chốt dùng **Ant Design Form** (validation tích hợp), **KHÔNG dùng thư viện form/validate ngoài**. *(Tài liệu SA nguồn có nhắc Zod, nhưng org tech-stack override → không dùng.)*

### 3.2 Bảng quy tắc theo loại trường

| Loại trường | Bắt buộc? | Min / Max | Message lỗi chuẩn |
|---|---|---|---|
| Họ và tên | ✅ Có | 2 / 100 ký tự | Họ và tên là bắt buộc / Tối đa 100 ký tự |
| Email | ✅ Có | 5 / 254 ký tự | Email là bắt buộc / Email không đúng định dạng |
| Số điện thoại | ✅ Có | 10 / 11 ký tự | Số điện thoại là bắt buộc / Số điện thoại không hợp lệ |
| Mật khẩu | ✅ Có | 8 / 128 ký tự | Mật khẩu tối thiểu 8 ký tự / Phải có chữ hoa, số, ký tự đặc biệt |
| Ngày sinh | ✅ Có | ≥ 18 tuổi | Ngày sinh không hợp lệ / Bạn phải đủ 18 tuổi |
| Số tiền | ✅ Có | ≥ 1.000 VNĐ | Số tiền là bắt buộc / Tối thiểu 1.000 VNĐ |
| Mô tả / Ghi chú | ❌ Không | 0 / 500 ký tự | Tối đa 500 ký tự |
| File upload | Tùy field | ≤ 10MB | Định dạng không hợp lệ / File vượt quá dung lượng cho phép (tối đa 10MB) |

## 4. Validate Rules — Backend

### 4.1 Nguyên tắc

- BE validate **độc lập với FE** — không tin tưởng hoàn toàn dữ liệu client.
- Dùng annotation **Jakarta Bean Validation** tích hợp Spring; đặt annotation tại **DTO class**, **không** tại Entity.
- Dùng `@Valid` trên method parameter ở Controller để trigger validation.
- Lỗi validate trả về **HTTP 400** với error body chuẩn (xem §5.4).

### 4.2 Annotation chuẩn

| Annotation | Dùng cho | Ví dụ áp dụng |
|---|---|---|
| `@NotNull` | Object, wrapper type | `@NotNull(message = "Trường này là bắt buộc")` |
| `@NotBlank` | String | `@NotBlank(message = "Tên không được để trống")` |
| `@Size` | String, Collection | `@Size(min=2, max=100, message="Tên từ 2–100 ký tự")` |
| `@Email` | String | `@Email(message = "Email không hợp lệ")` |
| `@Min` / `@Max` | Số nguyên | `@Min(value=0, message="Không được âm")` |
| `@Pattern` | String (regex) | `@Pattern(regexp="^0[3\|5\|7\|8\|9][0-9]{8}$", message="SĐT không hợp lệ")` |
| `@Positive` | Số | `@Positive(message = "Giá trị phải lớn hơn 0")` |
| `@Future` / `@Past` | Date / LocalDate | `@Future(message = "Ngày phải ở tương lai")` |

### 4.3 Ví dụ DTO chuẩn

```java
@Data
public class UserRequest {
    @NotBlank(message = "fullname.required")
    @Size(min = 2, max = 100, message = "fullname.size")
    private String fullName;

    @NotBlank(message = "email.required")
    @Email(message = "email.invalid")
    private String email;

    @NotBlank(message = "phone.required")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "phone.invalid")
    private String phone;

    @NotNull(message = "dob.required")
    @Past(message = "dob.invalid.past")
    private LocalDate dateOfBirth;
}
```

### 4.4 Custom validator

Dùng khi annotation chuẩn không đủ — ví dụ validate số CCCD, mã nghiệp vụ nội bộ.

```java
// Step 1: Tạo annotation
@Constraint(validatedBy = VietnameseIdCardValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidVietnameseId {
    String message() default "Số CCCD không hợp lệ";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Step 2: Implement ConstraintValidator
public class VietnameseIdCardValidator
        implements ConstraintValidator<ValidVietnameseId, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return false;
        return value.matches("^[0-9]{9}$|^[0-9]{12}$");
    }
}
```

## 5. Bộ mã lỗi hệ thống

### 5.1 Quy tắc đặt mã lỗi

- Format: **`[PREFIX]-[MODULE]-[CODE]`**
- `PREFIX` = `VDBAS`
- `MODULE` = 3 chữ cái in hoa (USR, BKG, PMT, AST, RPT, SYS, AUT, VAL…)
- `CODE` = 4 chữ số, tăng dần từ `0001`
- Ví dụ: `VDBAS-USR-0001`, `VDBAS-SYS-0500`

### 5.2 Mã module

**Ví dụ** một số prefix module: `USR` (User) · `BKG` (Booking) · `PMT` (Payment) · `AST` (Asset) · `RPT` (Report) · `SYS` (System) · `AUT` (Auth) · `VAL` (Validation) · `EDC` (eDoc — tài liệu điện tử) · `BPM` (Business Process Management — quản lý quy trình nghiệp vụ). Prefix module thực tế do BA/SA đặt theo quy ước §5.1 (3 chữ cái in hoa) và thống nhất với Tech Lead trước khi dùng — quản lý tại đặc tả module, không đăng ký trong tài liệu này.

### 5.3 Bảng mã lỗi (mẫu)

> [!NOTE]
> Tài liệu này chỉ định nghĩa **quy ước đặt mã lỗi** (§5.1) và cung cấp **bảng mẫu** minh họa cách đặt. **Đây KHÔNG phải nơi quản lý mã lỗi thực tế** và **không bổ sung mã lỗi thật vào bảng này**. Danh sách mã lỗi thực tế của từng module do **BA cung cấp** và quản lý tại đặc tả nghiệp vụ/module tương ứng — các mã dưới đây chỉ có giá trị tham khảo.

**Authentication & Authorization (AUT)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-AUT-0001` | 401 | Tên đăng nhập hoặc mật khẩu không đúng. | Sai credentials |
| `VDBAS-AUT-0002` | 401 | Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại. | Token expired |
| `VDBAS-AUT-0003` | 403 | Bạn không có quyền truy cập tính năng này. | Không đủ quyền |
| `VDBAS-AUT-0004` | 401 | Token không hợp lệ. Vui lòng đăng nhập lại. | Invalid token |
| `VDBAS-AUT-0005` | 423 | Tài khoản đã bị khóa. Liên hệ quản trị viên. | Account locked |

**User Management (USR)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-USR-0001` | 404 | Không tìm thấy người dùng. | User not found |
| `VDBAS-USR-0002` | 409 | Tài khoản đã tồn tại trong hệ thống. | Duplicate user |
| `VDBAS-USR-0003` | 400 | Email đã được sử dụng bởi tài khoản khác. | Duplicate email |
| `VDBAS-USR-0004` | 400 | Mật khẩu không đúng định dạng yêu cầu. | Password format |

**Validate Errors (VAL)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-VAL-0001` | 400 | Dữ liệu đầu vào không hợp lệ. | Generic validation fail |
| `VDBAS-VAL-0002` | 400 | Trường {field} là bắt buộc. | Required field |
| `VDBAS-VAL-0003` | 400 | Định dạng {field} không đúng. | Format error |
| `VDBAS-VAL-0004` | 400 | {Field} vượt quá độ dài cho phép. | Max length exceeded |

**System Errors (SYS)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-SYS-0500` | 500 | Hệ thống gặp sự cố. Vui lòng thử lại sau. | Internal server error |
| `VDBAS-SYS-0503` | 503 | Dịch vụ tạm thời không khả dụng. Thử lại sau vài phút. | Service unavailable |
| `VDBAS-SYS-0504` | 504 | Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại. | Gateway timeout |
| `VDBAS-SYS-0404` | 404 | Không tìm thấy tài nguyên yêu cầu. | Resource not found |

**eDoc — Tài liệu điện tử (EDC)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-EDC-0001` | 404 | Không tìm thấy tài liệu. | Document not found |
| `VDBAS-EDC-0002` | 409 | Tài liệu đã tồn tại. | Duplicate document |
| `VDBAS-EDC-0003` | 400 | Định dạng tệp không được hỗ trợ. | Unsupported format |
| `VDBAS-EDC-0004` | 413 | Kích thước tệp vượt quá giới hạn cho phép. | File too large |
| `VDBAS-EDC-0005` | 423 | Tài liệu đang bị khóa bởi người dùng khác. | Document locked |
| `VDBAS-EDC-0006` | 409 | Phiên bản tài liệu đã lỗi thời. | Version conflict |

**Quản lý quy trình nghiệp vụ (BPM)**

| Mã lỗi | HTTP | User Message | Ghi chú |
|---|---|---|---|
| `VDBAS-BPM-0001` | 404 | Không tìm thấy quy trình. | Process not found |
| `VDBAS-BPM-0002` | 404 | Không tìm thấy tác vụ. | Task not found |
| `VDBAS-BPM-0003` | 409 | Quy trình đã kết thúc, không thể thao tác. | Process completed |
| `VDBAS-BPM-0004` | 403 | Bạn không phải người được giao xử lý tác vụ này. | Not assignee |
| `VDBAS-BPM-0005` | 400 | Chuyển trạng thái quy trình không hợp lệ. | Invalid transition |
| `VDBAS-BPM-0006` | 409 | Tác vụ đã được xử lý. | Task already handled |

### 5.4 Error response — theo envelope chuẩn Org

> [!IMPORTANT]
> **Nguồn sự thật: `backend/api-convention.md §3`.** **Mọi** response (kể cả lỗi) dùng envelope `{code, message, data}`.
> Ánh xạ bộ mã lỗi vào envelope:
> - `code` ← mã lỗi `VDBAS-<MOD>-<CODE>` (§5.1–5.3).
> - `message` ← user message thân thiện (§5.3).
> - `data` = `null` với lỗi không có chi tiết; với lỗi validate (HTTP 400) → `data.errors = [{ field, message }]` (api-convention §3.6).
> - HTTP status theo bảng §5.3.

```json
// Lỗi nghiệp vụ (không tìm thấy) — HTTP 404
{
  "code": "VDBAS-USR-0001",
  "message": "Không tìm thấy người dùng.",
  "data": null
}
```

```json
// Lỗi validate đầu vào — HTTP 400
{
  "code": "VDBAS-VAL-0001",
  "message": "Dữ liệu đầu vào không hợp lệ.",
  "data": {
    "errors": [
      { "field": "email", "message": "Email không hợp lệ" },
      { "field": "fullName", "message": "Tên từ 2–100 ký tự" }
    ]
  }
}
```

> Tài liệu SA nguồn mô tả cấu trúc khác (`{timestamp, status, errorCode, details, path}`); Org **thống nhất theo envelope `api-convention.md`** — cấu trúc đó **không áp dụng**.

## 6. MUST / NEVER

- **MUST** dùng đúng 1 trong 5 loại thông báo (§1) theo ngữ cảnh; lỗi nghiêm trọng / hành động nguy hiểm → Dialog 2 nút, không dùng Toast.
- **MUST** viết message theo 5 nguyên tắc (§2.1) + đúng mẫu nghiệp vụ (§2.3); tôn trọng giới hạn độ dài (§2.2).
- **MUST** validate **cả FE và BE** (§3, §4) — FE không thay BE; annotation đặt tại DTO, không tại Entity.
- **MUST** đặt mã lỗi theo format `VDBAS-<MOD>-<CODE>` (§5.1) và mapping sang user message thân thiện.
- **MUST** trỏ về `frontend/tech-stack.md` cho thư viện validate và `backend/api-convention.md` cho envelope response — không chép lại giá trị quy ước.
- **NEVER** hiện mã HTTP / stack trace / tên exception ra UI người dùng cuối.
- **NEVER** dùng Dialog 1 nút cho thao tác cần xác nhận; **NEVER** xóa/ghi đè mà không có Dialog xác nhận.
- **NEVER** đổi tên/ngữ nghĩa mã lỗi đã phát hành (mã được dùng ở BE, FE mapping, QA test case).
- **NEVER** trả error response ngoài envelope `{code, message, data}` của `api-convention.md §3` (mã lỗi vào `code`, chi tiết field vào `data.errors`).
- **NEVER** dùng thư viện form/validate ngoài ở FE — theo `frontend/tech-stack.md` org chỉ dùng Ant Design Form.
