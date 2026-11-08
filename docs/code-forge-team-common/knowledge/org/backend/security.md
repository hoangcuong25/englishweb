# Security — Backend (Org)

> [!NOTE]
> Cơ chế bảo mật & phân quyền **phía backend** (VDBAS). Nguồn: `README vdbas-template-be`, `ARCHITECTURE.md`.
> Baseline bảo mật org-wide (secret, OWASP, thao tác bị chặn) ở [../shared/security-policy.md](../shared/security-policy.md).
> Liên quan **Hook mức nặng** (Phase 1C) và `security-auditor` AGENT (Phase 2).

## 1. Xác thực (Authentication)

- **JWT / OAuth2 Resource Server** (Spring Security); **IdP / SSO = Keycloak** — BE đóng vai Resource Server, validate JWT do Keycloak phát. Không tự viết cơ chế auth.
- Request tới `/api/**` yêu cầu JWT hợp lệ; authorities nạp từ DB.
- Token refresh & inject Bearer header được xử lý **tự động**.
  - **NEVER** tự thêm header `Authorization` thủ công.

## 2. Phân quyền (Authorization) — Dynamic, tập trung

> [!IMPORTANT]
> Mô hình authz của VDBAS **khác** Spring Security mặc định: quyền quản lý tập trung, **không** rải `@PreAuthorize`.

- Toàn bộ quyền đi qua **`DynamicAuthorizationManager`** (tập trung).
- **NEVER** dùng `@PreAuthorize` trên từng method/controller.
- Hai loại authority:

| Loại | Format | Ví dụ |
|---|---|---|
| Role | `ROLE_<ROLE_CODE>` | `ROLE_TEMPLATE_ADMIN` |
| API Permission | `API:<METHOD>:<PATH>` | `API:GET:/api/users/**` |

- Quyền lưu ở bảng `permissions`, gán qua `role_permission` → `user_role`.

## 3. Audit Hash Chain

- Mọi **giao dịch quan trọng** phải được liên kết bằng thuật toán **băm (Hash Chain)** ở cấp độ Database.
- Nhật ký thay đổi (`audit-service`) bất biến, có thể truy vết.

## 4. Endpoint công khai vs bảo vệ

| Path | Quyền |
|---|---|
| `GET /actuator/health` | Public |
| `GET /docs/swagger-ui.html` | Public — **disabled ở prod** |
| `POST /api/**`, `/api/**` | JWT required + permission check |

- **MUST** tắt Swagger UI và Actuator endpoint nhạy cảm khi ra prod.

## 5. Bí mật & dữ liệu nhạy cảm (tham chiếu baseline)

> Chi tiết đầy đủ ở [../shared/security-policy.md](../shared/security-policy.md). Tóm tắt phía BE:

- **NEVER** commit secret. Dùng biến môi trường / `.env` (đã trong `.gitignore`).
- DB credential cấu hình qua env (`DEV_DB_HOST/NAME/USER/PASSWORD`), `application.yml` chỉ chứa placeholder `${...}`.

## 6. MUST / NEVER (tóm tắt)

- **MUST** xác thực mọi `/api/**` bằng JWT; phân quyền qua `DynamicAuthorizationManager`.
- **MUST** băm chuỗi (Hash Chain) cho giao dịch quan trọng.
- **MUST** tắt Swagger/Actuator nhạy cảm ở prod.
- **NEVER** dùng `@PreAuthorize` trên method/controller.
- **NEVER** tự thêm header `Authorization` thủ công.
- **NEVER** commit secret / hardcode credential (đồng bộ Hook 1C chặn cứng).
