# Security — Frontend (Org)

> [!NOTE]
> Bảo mật & phân quyền **phía frontend** (VDBAS micro-frontend). Nguồn: README `vdbas_host`, `ARCHITECTURE.md`, FE convention (`core/`).
> Baseline bảo mật org-wide ở [../shared/security-policy.md](../shared/security-policy.md). Cơ chế authz backend: [../backend/security.md](../backend/security.md).

## 1. Xác thực & Token

- **IdP / SSO: Keycloak** — access/refresh token có nguồn từ Keycloak; FE đăng nhập qua endpoint `/api/auth/*`.
- Auth xử lý tại `core/auth/` + `core/session/`: login, **refresh token**, JWT decode, logout, timeout session.
- API auth (Host gọi backend):
  - `POST /api/auth/login` → `{ access_token, refresh_token }`
  - `POST /api/auth/refresh` → `{ access_token, refresh_token }`
  - `POST /api/auth/logout`
- **Token được gắn tự động** qua **Axios interceptor** (`core/interceptors/` — `AuthInterceptor`); refresh token xử lý ngầm.
  - **NEVER** tự thêm header `Authorization` thủ công trong component/api call.

## 2. Phân quyền UI (Permission-driven)

- `PermissionManifest` fetch từ API: `GET /api/permissions/manifest` (Bearer token) → cây `apps → features → actions`.
- **Guard** ở `core/guards/`: `AuthGuard`, `PermissionGuard`, `RoleGuard` (dùng trong React Router / ProtectedRoute).
- **`PermissionGuard`** (HOC) bảo vệ theo 3 mức:

```tsx
<PermissionGuard app="hrm">…</PermissionGuard>                          // page
<PermissionGuard app="hrm" feature="payroll">…</PermissionGuard>        // feature
<PermissionGuard app="hrm" feature="employee" action="delete">…</PermissionGuard> // ẩn nút nếu thiếu quyền
```

- Quyền **kiểm ở cả client (UX) lẫn server (bảo mật thật)** — client guard chỉ để trải nghiệm, **không thay** kiểm tra quyền phía backend.

## 3. Bí mật phía client

- Cấu hình qua biến môi trường (`REACT_APP_API_BASE`), KHÔNG hardcode endpoint/bí mật nhạy cảm.
- **NEVER** đặt secret thật (API key, credential) trong code FE — mọi thứ build ra client đều lộ.
- Tuân thủ baseline [../shared/security-policy.md](../shared/security-policy.md) (không commit secret, hook 1C chặn cứng).

## 4. MUST / NEVER (tóm tắt)

- **MUST** gắn token qua Axios interceptor tập trung; refresh tự động.
- **MUST** bảo vệ route/feature/action bằng `PermissionGuard`/guard ở `core/guards`.
- **MUST** dựa kiểm tra quyền thật vào backend; client guard chỉ cho UX.
- **NEVER** tự thêm header `Authorization` thủ công.
- **NEVER** lưu secret thật trong code/bundle FE.
