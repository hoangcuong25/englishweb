# API Convention — Backend (Org)

> [!NOTE]
> Quy ước thiết kế REST API cho dự án VDBAS. Nguồn: `VDBAS_coding_convention_API.md`.
> Áp dụng cho toàn bộ team kỹ thuật. **Contract-first**: mọi response phải nhất quán cấu trúc `{code, message, data}`.

## 1. Quy ước đặt tên endpoint

- Dùng **danh từ số nhiều**, đại diện cho resource.
- Phân cấp rõ ràng, **không quá 3 lớp sau version**: `/api/v1/departments/{id}/teams/{id}/users`.
- Resource nhiều từ → **kebab-case**: `user-roles`.
- **Đặt `/api/<version>` ở đầu** endpoint: `/api/v1/...`.

| Action | METHOD | ENDPOINT | Java method | Param type | Ví dụ                          |
|---|---|---|---|---|--------------------------------|
| Lấy danh sách có tìm kiếm theo nghiệp vụ | POST | `/api/v1/<resources>/search` | `search` | Request body | `/api/v1/users/search`         |
| Lấy danh sách LOV | GET | `/api/v1/<resources>` | `search` | Request param | `/api/v1/provinces?city=HaNoi` |
| Lấy chi tiết | GET | `/api/v1/<resources>/{id}` | `index` | Path param | `/api/v1/users/1`              |
| Tạo mới | POST | `/api/v1/<resources>` | `store` | Request body | `/api/v1/users`                |
| Cập nhật toàn bộ | PUT | `/api/v1/<resources>/{id}` | `update` | Path + body | `/api/v1/users/1`              |
| Cập nhật một phần | PATCH | `/api/v1/<resources>/{id}` | `update` | Path + body | `/api/v1/users/1`              |
| Xóa | DELETE | `/api/v1/<resources>/{id}` | `destroy` | Path param | `/api/v1/users/1`              |

> [!NOTE]
> Với các trường hợp **không thể** tuân theo danh sách action ở trên (nghiệp vụ đặc thù), được phép **tự đặt** endpoint/method — nhưng **vẫn phải tuân theo quy ước chung** (prefix `/api/v1`, danh từ số nhiều, ≤ 3 lớp sau version, kebab-case cho resource nhiều từ).

## 1b. Khai báo endpoint tập trung (`ApiPaths`)

Mọi path endpoint khai báo **tập trung trong MỘT class `ApiPaths`** (module `common/`) — **KHÔNG** rải path string inline theo từng controller/chức năng. Controller và các `@*Mapping` **tham chiếu hằng số** `ApiPaths.XXX`.

- Utility class: `public final class ApiPaths` + **private constructor**; hằng số `static final String`, **UPPER_SNAKE_CASE**.
- **Tách version thành segment riêng**: gốc `API_BASE = "/api"`, rồi `API_V1 = API_BASE + "/v1"` (version mới chỉ cần thêm `API_V2 = API_BASE + "/v2"`, không đụng v1). Path resource **ghép từ hằng số version tương ứng**, không lặp literal (`FOO = API_V1 + "/foos"` → `FOO_SEARCH = FOO + "/search"`).
- Nhóm bằng comment banner theo nhóm nghiệp vụ; mỗi endpoint có Javadoc ngắn nêu vai trò.

## 2. Kiểu dữ liệu (Request/Response)

> Quy ước: **dùng kiểu dữ liệu Java tương ứng** cho từng trường (request & response). Các trường ngày/giờ serialize theo `format` quy định.

| Data type | Request type | Request format | Response type | Response format |
|---|---|---|---|---|
| Date | LocalDate | `DD-MM-YYYY` | LocalDate | `DD-MM-YYYY` |
| Date time | LocalDateTime | `DD-MM-YYYY HH:MM:ss` | LocalDateTime | `DD-MM-YYYY HH:MM:ss` |
| Array / List | List | | List | |
| Decimal | BigDecimal | | BigDecimal | |
| Integer | Integer / Long | | Integer / Long | |
| String | String | | String | |

## 3. Định dạng Response (BẮT BUỘC nhất quán)

Mọi response tuân theo một mẫu thống nhất: `code` (message code), `message`, `data`.

> [!NOTE]
> **`code` (MESSAGE_CODE) tuân theo bộ mã thống nhất** ở [`../shared/notification-message-validation.md §5`](../shared/notification-message-validation.md): format `VDBAS-<MOD>-<CODE>` + mapping sang user message. Trường `message` (hiển thị cho người dùng) bám quy chuẩn nội dung §2 cùng file đó. Lỗi validate field-level (`data.errors`) xem §5.4.

| Case | HTTP | `message` | `data` |
|---|---|---|---|
| **3.1 Void** (thành công, không trả data) | 200 | `Success` | `null` |
| **3.2 Object** (một đối tượng) | 200 | `Success` | `{}` |
| **3.3 Paging** (danh sách phân trang) | 200 | `Success` | `{ content, pagination: { totalElements, totalPages, size, number } }` |
| **3.4 Not found** | 404 | `Not found` | `null` |
| **3.5 Invalid permission** | 403 | `Forbidden` | `null` |
| **3.6 Invalid input** | 400 | `Invalid input` | `{ errors: [] }` |
| **3.7 Internal server error** | 500 | `Internal server error` | `null` |
| **3.8 List** (danh sách **không phân trang**) | 200 | `Success` | `[ ... ]` |

```json
// 3.1 — Void (thành công, không trả data)
{
  "code": "MESSAGE_CODE",
  "message": "Success",
  "data": null
}
```

```json
// 3.2 — Object (một đối tượng)
{
  "code": "MESSAGE_CODE",
  "message": "Success",
  "data": {
    "id": 1,
    "name": "example"
  }
}
```

```json
// 3.3 — Paging (danh sách phân trang)
{
  "code": "MESSAGE_CODE",
  "message": "Success",
  "data": {
    "content": [],
    "pagination": {
      "totalElements": 0,
      "totalPages": 0,
      "size": 10,
      "number": 0
    }
  }
}
```

```json
// 3.4 — Not found
{
  "code": "MESSAGE_CODE",
  "message": "Not found",
  "data": null
}
```

```json
// 3.5 — Invalid permission
{
  "code": "MESSAGE_CODE",
  "message": "Forbidden",
  "data": null
}
```

```json
// 3.6 — Invalid input
{
  "code": "MESSAGE_CODE",
  "message": "Invalid input",
  "data": {
    "errors": [
      { "field": "email", "message": "Email is invalid" }
    ]
  }
}
```

```json
// 3.7 — Internal server error
{
  "code": "MESSAGE_CODE",
  "message": "Internal server error",
  "data": null
}
```

```json
// 3.8 — List (danh sách không phân trang)
{
  "code": "MESSAGE_CODE",
  "message": "Success",
  "data": [
    { "id": 1, "name": "example" }
  ]
}
```

> [!NOTE]
> Phân biệt **§3.8 List (không phân trang)** với **§3.3 Paging**: list không phân trang trả thẳng mảng ở `data` (dùng cho LOV / danh sách nhỏ cố định — endpoint `GET /api/v1/<resources>` ở §1); khi cần phân trang thì bọc `{ content, pagination }` theo §3.3.

## 4. MUST / NEVER

- **MUST** trả về đúng cấu trúc `{code, message, data}` cho **mọi** response (kể cả lỗi), với HTTP code & `message` theo bảng §3.
- **MUST** đặt prefix `/api/v1` ở đầu, dùng danh từ số nhiều, ≤ 3 lớp **sau version**.
- **MUST** map HTTP method ↔ Java method theo bảng §1; dùng kiểu dữ liệu Java tương ứng cho từng trường (§2).
- **MUST** đặt `code` theo bộ mã `VDBAS-<MOD>-<CODE>` và viết `message` theo quy chuẩn ở [`../shared/notification-message-validation.md`](../shared/notification-message-validation.md) (§5 + §2).
- **MUST** khai báo endpoint tập trung ở `ApiPaths`; controller/`@*Mapping` tham chiếu hằng số (§1b).
- **NEVER** rải path string inline trên controller/từng chức năng.
- **NEVER** trả response không theo envelope thống nhất.
- **NEVER** lồng resource quá 3 lớp sau version.
