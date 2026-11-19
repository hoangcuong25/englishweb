# Security Policy (Org · Shared — Baseline)

> [!NOTE]
> Chính sách bảo mật **baseline org-wide**, áp dụng mọi stack. Nguồn: README `vdbas-template-be` (secret), `ARCHITECTURE.md`, GitLab CI/SAST.
> Stack-specific: [../backend/security.md](../backend/security.md) (authz BE), [../frontend/security.md](../frontend/security.md) (token/permission FE).
> Liên quan trực tiếp **Hook mức nặng** (Phase 1C — chặn cứng) và `security-auditor` AGENT (Phase 2).

## 1. Bí mật & thông tin nhạy cảm

- **NEVER** commit API key, password, token, private key, JDBC URL kèm mật khẩu vào git.
- Cấu hình bí mật qua: **biến môi trường** / file **`.env`** (đã trong `.gitignore`) / GitLab CI/CD variables (masked).
- File cấu hình chỉ chứa **placeholder**: vd `spring.datasource.password: ${DB_PASSWORD}` — không hardcode giá trị thật.
- DB credential (vd `DEV_DB_HOST/NAME/USER/PASSWORD`) cấp qua env, không ghi vào source.

## 2. Thao tác nguy hiểm (bị chặn cứng — Hook 1C)

> `dangerous-op-blocker.js` (PreToolUse) + git `pre-commit` chặn cứng, không bỏ qua được:

- **Hardcode credential** (mật khẩu, API key, private key) trong source.
- **Force push** vào nhánh được bảo vệ (`main`/`master`).
- **Xóa hàng loạt** không kiểm soát (`rm -rf` path tuyệt đối).
- **`DROP` / `TRUNCATE TABLE`** ngoài migration có kiểm soát.

## 3. Quản lý phụ thuộc & quét lỗ hổng

- **GitLab SAST** chạy trên CI để phát hiện lỗ hổng tĩnh.
- Chỉ dùng thư viện đã duyệt trong tech-stack ([../backend/tech-stack.md §5](../backend/tech-stack.md), [../frontend/tech-stack.md §3](../frontend/tech-stack.md)); thêm mới qua MR.
- Ưu tiên xử lý dependency có CVE nghiêm trọng.

## 4. Nguyên tắc OWASP (tham chiếu)

- **Injection:** dùng query tham số hóa (JPA/PreparedStatement); **cấm** nối chuỗi SQL/JPQL từ input.
- **Broken Access Control:** kiểm tra quyền ở **server**, không tin client (UI guard chỉ cho UX).
- **Sensitive Data Exposure:** mã hoá dữ liệu nhạy cảm at-rest/in-transit (TLS/HTTPS).
- **Security Misconfiguration:** tắt endpoint nhạy cảm ra ngoài (Actuator/Swagger ở prod); không trả stacktrace ra client.
- **Logging:** **NEVER** log mật khẩu / token / PII.

## 5. Biên & hạ tầng

- **IBM DataPower Gateway** tại **DMZ** — lá chắn bảo mật tập trung, định tuyến trước khi vào Core Service.
- Giao tiếp qua **HTTPS**; response theo contract chuẩn (xem [../backend/api-convention.md](../backend/api-convention.md)).

## 6. MUST / NEVER (tóm tắt)

- **MUST** cấu hình secret qua env/`.env`/CI variables; chỉ để placeholder trong config.
- **MUST** kiểm tra quyền phía server; quét SAST trên CI.
- **NEVER** commit/hardcode secret (Hook 1C chặn cứng).
- **NEVER** force push nhánh bảo vệ, xóa hàng loạt, `DROP/TRUNCATE` ngoài migration.
- **NEVER** log secret/PII; không trả stacktrace ra client.
