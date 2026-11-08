# Tech Stack — Backend (Org)

> [!NOTE]
> Stack chuẩn **backend** tổ chức (KBNN / dự án VDBAS): **Java 21 + Spring Boot 4 + Maven + Oracle**,
> kiến trúc **Microservices + Clean Architecture**. Nguồn: tài liệu tech-stack & README `vdbas-template-be`.
> Mọi thay đổi qua MR (xem [../shared/git-workflow.md](../shared/git-workflow.md)).
> Project có thể bổ sung chi tiết đặc thù trong `project-knowledge/`.

## 1. Ngôn ngữ & Runtime

- **Java 21 (LTS)** — Eclipse Temurin. Tận dụng **Virtual Threads (Project Loom)** cho I/O-bound, **Pattern Matching**, **Record types**.
- Đóng gói: Spring Boot fat-jar, chạy trong Docker (base `eclipse-temurin:21-jre`).

## 2. Framework & Thư viện cốt lõi

| Phân nhóm | Công nghệ | Phiên bản | Vai trò |
|---|---|---|---|
| Core Framework | **Spring Boot** | **4.0.5** (dòng 4.x) | Nền tảng service Backend stand-alone, auto-config, DI |
| Build | **Apache Maven** | **3.9+** (multi-module) | Quản lý vòng đời build + dependency tập trung |
| API Style | **RESTful API** | Standard | HTTPS + JSON, HTTP status chuẩn, resource-oriented URL (xem [api-convention.md](api-convention.md)) |
| Security | **JWT / OAuth2 Resource Server** (IdP: **Keycloak**) | — | Xác thực & phân quyền (xem [security.md](security.md)) |
| ORM | **Spring Data JPA / Hibernate** | — | Truy cập Oracle |
| Mapping | **MapStruct** | **1.5.5** | Map DTO ↔ entity |
| Cache | **Caffeine** (dev) / **Redis** (prod) | — | Local cache / distributed cache |
| API Docs | **SpringDoc OpenAPI 3** (Swagger UI) | — | Tài liệu API; **tắt ở prod** |
| API Gateway | **IBM DataPower Gateway** | Enterprise | Lá chắn bảo mật + định tuyến tại DMZ |

## 3. Cơ sở dữ liệu

- **Oracle Database 19c+** — DB phải tồn tại trước khi khởi động service.
- ORM: JPA / Hibernate. **KHÔNG** nối chuỗi JPQL/SQL từ input — dùng query tham số hóa / derived query (xem [security.md](security.md)).
- **Ưu tiên JPA/Hibernate tối đa; Native SQL chỉ khi bất khả** — thứ tự ưu tiên truy vấn & điều kiện dùng Native: xem [coding-convention.md §6](coding-convention.md).
- `ddl-auto`: **`validate`** ở profile `prod` (không auto-update schema trên prod).
- Migration schema: **Flyway** — versioned migrations (vd `src/main/resources/db/migration`).

## 3b. Kiến trúc module — Clean Architecture (chuẩn template `vdbas-template-be`)

> Mọi service backend cô lập logic nghiệp vụ theo 4 module, **hướng phụ thuộc một chiều**:

```
api  →  application  →  domain  →  common
```

| Module | Trách nhiệm |
|---|---|
| `api` | REST Controller, Security config, `GlobalExceptionHandler` |
| `application` | Business service, DTO, hierarchy `BusinessException` |
| `domain` | JPA entity & Repository |
| `common` | Constants, Enums, Utils, `ApiPaths` (gom endpoint path — xem [api-convention.md §1b](api-convention.md)) |

- **NEVER** để module trong vi phạm hướng phụ thuộc (vd `domain` phụ thuộc `api`).
- Chi tiết kiến trúc đặc thù từng service → `project-knowledge/` (không thuộc org).

## 4. Spring Profiles

| Profile | Mục đích | Config |
|---|---|---|
| `localhost` | Máy dev | `application-localhost.yml` |
| `dev` | Server phát triển | `application-dev.yml` |
| `prod` | Production (Redis, `ddl-auto: validate`) | `application-prod.yml` |

## 5. Thư viện được duyệt (Approved Libraries)

> [!IMPORTANT]
> Ràng buộc agent `developer-backend`: **KHÔNG tự thêm dependency mới khi chưa được approve** trong bảng này.
> Đề xuất thư viện mới phải qua MR cập nhật bảng + lý do.

| Thư viện | Mục đích | Trạng thái |
|---|---|---|
| `spring-boot-starter-web` | REST API | ✅ Duyệt |
| `spring-boot-starter-security` + OAuth2 Resource Server | AuthN/AuthZ (JWT) | ✅ Duyệt |
| `spring-boot-starter-data-jpa` | Truy cập Oracle qua JPA | ✅ Duyệt |
| `spring-boot-starter-validation` | Bean Validation | ✅ Duyệt |
| `spring-boot-starter-actuator` | Health/metrics | ✅ Duyệt |
| `springdoc-openapi` | Swagger UI / OpenAPI 3 | ✅ Duyệt |
| `mapstruct` (1.5.5) | Map DTO ↔ entity | ✅ Duyệt |
| `lombok` | Giảm boilerplate (`@RequiredArgsConstructor`, `@Slf4j`...) | ✅ Duyệt |
| `flyway-core` | Migration schema Oracle (versioned) | ✅ Duyệt |
| Oracle JDBC driver (`ojdbc`, Oracle 19c+) | Kết nối Oracle | ✅ Duyệt |
| Caffeine | Local cache (dev) | ✅ Duyệt |
| Redis (Spring Data Redis) | Distributed cache (prod) | ✅ Duyệt |
| **ShedLock** (`shedlock-spring` + `shedlock-provider-jdbc-template`, 7.7.0) | Khóa lịch phân tán — tác vụ `@Scheduled` chỉ chạy trên **1 instance** khi triển khai cluster (lock qua bảng DB) | ✅ Duyệt |
| **JSON Schema validator** (`com.networknt:json-schema-validator`, 3.0.6) | Kiểm một tài liệu JSON có đúng JSON Schema **draft 2020-12** hay không. Dùng cho phân hệ có cấu trúc dữ liệu do người dùng định nghĩa rồi lưu dạng JSON — cần chặn cấu trúc sai **trước khi** ban hành, thay vì để vỡ lúc chạy | ✅ Duyệt |
| **Rhino** (`org.mozilla:rhino`, 1.9.1) | **CHỈ để đọc cây cú pháp JavaScript** (`Parser` + gói `javascript.ast`), **KHÔNG dùng để chạy mã**. Dùng làm cổng chặn: soi tĩnh biểu thức người dùng nhập, chỉ cho qua những dạng cú pháp trong danh sách trắng | ✅ Duyệt |
| **`nimbus-jose-jwt`** (10.4) | Phát và kiểm **token nội bộ do chính service ký** (JWS HMAC-SHA256) — dùng cho **vé nhiều bước** (`vdbas_common_be`, gói `stepticket`) khi một thao tác buộc chia nhiều lời gọi API. **KHÁC hoàn toàn ký số người dùng** (đó là `vdbas_signer_be`): không chứng thư, không khoá riêng, không PAdES/CMS. Vốn tới classpath **gián tiếp** qua `spring-security-oauth2-jose`, nhưng **khai tường minh** vì mã `import com.nimbusds.*` trực tiếp — ai dọn starter `oauth2-resource-server` là mất biên dịch. `spring-boot-dependencies` KHÔNG quản artifact này ⇒ version quản ở `vdbas-parent-be` | ✅ Duyệt |
| `junit-jupiter` (JUnit 5) + `mockito` + `assertj-core` | Unit test (test scope) | ✅ Duyệt |
| **`spring-boot-starter-webmvc-test`** (test scope) | **Test lát cắt web** (`@WebMvcTest`) — kiểm controller + **gate phân quyền** mà KHÔNG dựng cả ứng dụng, KHÔNG cần DB/Keycloak thật. Spring Boot 4 tách `@WebMvcTest` ra artifact riêng (`spring-boot-webmvc-test`), starter này gói kèm `resttestclient`. Dùng khi điểm chặn duy nhất của một endpoint là quyền (vd endpoint chỉ cho `ROLE_ADMIN`): mock `JwtDecoder` để không có cú gọi mạng nào tới IdP. Version do `vdbas-parent-be` quản lý — KHÔNG khai version | ✅ Duyệt |

## 6. Build & Hạ tầng

- **Build:** Maven multi-module (`mvn clean install`); chạy API: `mvn spring-boot:run -Dspring-boot.run.profiles=<profile>`.
- **Git platform:** **GitLab** self-hosted (`git.fis.vn`) — xem [../shared/git-workflow.md](../shared/git-workflow.md).
- **Container:** Docker (`Dockerfile`, `docker-compose.yml`).
- **LLM Gateway:** LiteLLM _(deploy ở Phase 3 — hiện chưa có)_.
