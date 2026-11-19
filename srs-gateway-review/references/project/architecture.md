# Architecture (Project) — vdbas-expenditure-service-be

> Kiến trúc đặc thù của service Phân hệ **Chi** (Expenditure). Ghi đè Org khi mâu thuẫn (§6).

## 1. Tổng quan

- **Service:** `vdbas-expenditure-service-be` — microservice backend phân hệ Chi (VDBAS/KBNN). **BE-only** (không có tầng UI).
- **Stack:** Java 21 · Spring Boot 4.0.6 · Maven multi-module · Oracle 26ai · Spring Data JPA · MapStruct · Caffeine/Redis.
- **Maven:** `com.fis.vdbas.expenditure:vdbas-expenditure-service-be` (parent `com.fis.vdbas:vdbas-parent-be` quản lý toàn bộ version — service con KHÔNG khai version).
- **Base package:** `com.fis.vdbas.expenditure`. **Entry point:** `api/.../ExpenditureApplication.java`.

## 2. Module (Clean Architecture)

Hướng phụ thuộc một chiều: `api → application → domain → common`.

| Module | Package | Trách nhiệm |
|---|---|---|
| `api` | `...expenditure.api` (**gom theo nhóm nghiệp vụ**: `lov/ dossier/ …` + `config/`) | REST Controller, entry point; `config/` = config riêng app (vd `ValidationConfig`). Security đến từ lib (§3) |
| `application` | `...expenditure.application` (**trải phẳng theo type**: `dto/ mapper/ service/ service.impl/ support/`) | Business service, DTO, MapStruct mapper, cache; `support/` = helper thuần (vd `SortResolver`, `LovSortResolver`) |
| `domain` | `...expenditure.domain` (**trải phẳng theo type**: `entity/ projection/ repository/`) | JPA Entity & Repository (map schema Oracle); `projection/` = projection read-only cho truy vấn list (vd `CapexDossierListRow`) |
| `common` | `...expenditure.common` | Hằng số, enum, util |

> **NEVER** vi phạm hướng phụ thuộc (vd `domain` import `api`). MapStruct + Lombok processor cấu hình ở `application/pom.xml`.

> **Quy ước tổ chức package (BẮT BUỘC — nhất quán mọi feature):**
> - **`api` chia theo nhóm nghiệp vụ** (feature-slice: `api/lov`, `api/dossier`…) — tầng này đông controller, gom theo vùng nghiệp vụ/URL cho dễ điều hướng.
> - **`application` & `domain` trải phẳng theo type** (`dto/ mapper/ service/ service.impl/ support/`, `entity/ projection/ repository/`) — KHÔNG lồng feature-slice.
> - **Lý do phẳng ở domain:** entity là *shared kernel* — nhiều feature cùng tham chiếu một entity danh mục (`Treasury`, `Project`, `CommonStatus`…); không nhốt entity trong package của một feature (vd tránh `domain/lov/entity/Treasury`).
> - **Ngoại lệ cho phép sub-package trong `application/support`: nhóm hạ tầng kỹ thuật dùng chung** (không gắn feature nào, nhiều feature cùng gọi) — vd `support/export/` (bộ sinh file Excel/PDF/CSV), `support/bpm/` (port `BpmWorkflowPort` + adapter tích hợp BPM). Điều kiện: (1) là **năng lực kỹ thuật**, KHÔNG phải feature-slice (`support/dossier/` vẫn bị cấm); (2) nội dung generic, **không** import DTO/entity của một feature — phần riêng của feature (vd bộ cột `CapexDossierExportColumn`) để **phẳng** ở `support/`; (3) đủ lớn để tách có ích (≥ ~5 file). Mục đích: thấy ngay ranh giới generic ↔ feature, và khi chuyển lên lib dùng chung `vdbas-common-be` thì move nguyên thư mục.
> - **Kỷ luật đặt tên** trong thư mục phẳng: class prefix theo feature/miền (`LovItemDto`, `StatusItemDto`, `ExpDossier`…) để tra cứu được.
> - Sub-package trong module KHÔNG đổi hướng phụ thuộc `api → application → domain → common`.

## 3. Thư viện dùng chung — `vdbas-common-be`

`com.fis.vdbas:vdbas-common-be` (package `com.fis.vdbas.common`), auto-config qua `VdbasCommonAutoConfiguration`. Mọi module phụ thuộc; bean `@ConditionalOnMissingBean` → override bằng bean cùng kiểu.

> ⚠️ Sources jar trên đĩa **đã cũ, lệch binary** → đọc API bằng `javap -cp <jar> -public <class>` trên `vdbas-common-be-1.0.0-SNAPSHOT.jar` (~/.m2), KHÔNG dùng sources jar.

Dùng sẵn (KHÔNG tự viết lại):

- **Response envelope** (`api-convention §3`): `ApiResponse<T>{code,message,data}` + `ApiResponseAdvice` tự bọc → controller trả thẳng DTO. Phân trang `PageResponseDto<T>{content, pagination{totalElements,totalPages,size,number}}`.
- **Exception → `GlobalExceptionHandler`** (trả `ApiResponse`): `ResourceNotFound`→404 · `Duplicate`/`DatabaseConstraint`/`DataIntegrity`/`OptimisticLock`→409 · `InvalidOperation`/`BusinessException`/validation→400 · `AccessDenied`→403 · còn lại→500. Validation kèm `ValidationErrorData{errors:[{field,message}]}`.
- **Mã lỗi nghiệp vụ (catalog tập trung)** → §6 (ghi đè Org). Khai trong `common.enums`: interface `ErrorCatalog{getErrorCode(), getMessageKey()}` + enum `ErrorCodeEnum implements ErrorCatalog` (dải hồ sơ `VDBAS-EXP-0001..0099`). Enum **chỉ** giữ `errorCode` (→ `ApiResponse.code`) + `messageKey` (i18n) — **không** nội tuyến httpStatus/message. **Thêm mã mới:** thêm hằng enum (mã duy nhất, tăng dần) + message key ở **cả 3** `api/.../messages{,_vi,_en}.properties`, rồi ném qua subclass `BusinessException` phù hợp (subclass quyết định HTTP status theo bảng trên). Cho phép tách nhiều enum theo feature (vd `DocumentErrorCode`) cùng implement `ErrorCatalog`.
- **Security:** `SecurityConfig` (stateless, CORS từ `app.cors.*`, `/api/**`=authenticated) + `GatewayAuthFilter` (`X-Internal-Token`/`X-User-Id`) + Keycloak JWT (`KeycloakJwtAuthenticationConverter`, `AudienceValidator`, `AuthoritiesConstants.ROLE_*`).
- **Client liên service:** `VdbasRestClientFactory.create(baseUrl)` → RestClient + `TokenRelayInterceptor`; bóc envelope bằng `RestClientSupport.getData(...)`. **Ngoại lệ:** lời gọi nằm **trong ranh giới transaction ghi** → tự dựng `RestClient` có `connect/read timeout` (factory không phơi timeout ⇒ hệ ngoài chậm sẽ giữ transaction), tự forward Bearer token qua `TokenUtils.getTokenValue()`/header `Authorization`. Vd `EdocFileClient` — `design/CAPEX_DOSSIER/EXP.CAPEX_DOSSIER.NEW/API_Spec.md #17`.
- **Auditing:** `AbstractAuditing`/`AbstractAuditingCreate` (cột `created_by/created_at/updated_by/updated_at`, auditor = `TokenUtils.getUsername`); DTO `BaseAuditingDto`. Cột DDL phân hệ Chi khớp lib (`CREATED_BY/CREATED_AT/UPDATED_BY/UPDATED_AT`).
- **Mapper:** `BooleanIntegerMapper` (Boolean↔Integer 1/0 cho Oracle).
- **DTO:** `BaseSearchDto{page,size,sortBy,sortDirection}`, `FieldErrorDto`, `PaginationDto`.
- **Util:** `TokenUtils` (JWT: username/userId/roles/isAdmin…), `DateTimeUtils`, `VnStringUtils`, `UUIDUtils`, `Constants.FLAG_TRUE=1/FLAG_FALSE=0`.
- **Config tự nạp:** `JacksonConfig` (định dạng ngày `api-convention §2`), `CacheConfig` (Caffeine/Redis), `AsyncConfig`, `LocaleConfig`, `LoggingInterceptor`/`LoggingAspect`.
- **Vé phiên ký:** `StepTicketService` (HMAC, ô neo một-lần trên Redis) — cấp vé cho lượt ký đích danh khi cờ `vdbas.step-ticket.enabled=true`; **tắt** (`STEP_TICKET_ENABLED=false` ⇒ bean vắng) ⇒ BE **bỏ qua toàn bộ xử lý vé**, đích danh **fail-open** (chống trùng vẫn giữ nhờ khóa lạc quan mức DB). Giá trị bật/tắt do `application.yml` chủ quản.

## 4. Tích hợp & cấu hình

- **Gateway (IBM DataPower):** lá chắn DMZ, inject `X-Internal-Token` + `X-User-Id`.
- **Xác thực:** qua `SecurityConfig` của lib. Cấu hình cả hai đường: Keycloak JWT `spring.security.oauth2.resourceserver.jwt.issuer-uri` (`KEYCLOAK_ISSUER_URI`, mặc định realm `vdbas_dev`) + `app.gateway.internal-token` (`GATEWAY_INTERNAL_TOKEN`). DEV để trống internal-token = bỏ qua kiểm tra ở Gateway filter.
- **CSDL:** Oracle 26ai (`OracleDialect`, `ojdbc11`), `ddl-auto=validate`.
- **Ký số:** chế độ ký MAKER qua `app.signing.maker-sign-mode` — `ON_BEHALF` (mặc định) ký **nhân danh** khối dữ liệu bằng chứng thư hệ thống qua thư viện `vdbas-signer` in-process (`app.signer.on-behalf.enabled=true`); `PERSONAL` ký **đích danh** qua Agent (USB token) + `signing/finalize`. Chi tiết: `design/SHARED/EXP.SIGNING/` + `design/CAPEX_DOSSIER/EXP.CAPEX_DOSSIER.APPROVAL/`.
- **Thư viện tích hợp (ngoài `vdbas-common-be`):** `vdbas-signer` (ký nhân danh in-process); `vdbas-bpm-client-be` (proxy đọc trace + `start/approve/reject` BPM — `BPM_APP_KEY`+`BPM_APP_PRIVATE_KEY` là điều kiện boot); `vdbas-grid-config-be` (cá nhân hoá cột lưới, `vdbas.grid-config.enabled`); `vdbas-qtdc-sync-be` (nhận đồng bộ dữ liệu từ Quản trị tập trung, `vdbas.qtdc-sync.enabled` — `guides/VDBAS_QTDC_SYNC_Integration_Guide.md`); eDoc client (`app.edoc.base-url`, chốt/xoá file đính kèm).
- **Mẫu chứng từ động (Dynamic Template):** thân tờ khai của chứng từ do **bộ dựng phía FE** vẽ từ mẫu lưu ở `vdbas_dynamic_template_be`. BE phân hệ Chi **KHÔNG gọi REST của DT, không cấu hình địa chỉ DT, không giữ bản sao mẫu** — chỉ ghim `EXP_DOCUMENT.TEMPLATE_VERSION_ID` và tra mã mẫu qua `EXP_DOCUMENT_TYPE.DOCUMENT_FORM_NO`. Hợp đồng + bất biến: `design/SHARED/EXP.DYNAMIC_TEMPLATE/`.
- **Cache & Redis:** `app.cache.type=memory` (Caffeine, mặc định) / `redis`. **Redis auto-config KHÔNG exclude** — bean vé phiên ký PING Redis lúc boot ⇒ Redis phải sống; không dùng ký đích danh thì đặt `STEP_TICKET_ENABLED=false`.
- **i18n:** `default-locale: vi`. `spring.messages.basename = messages, vdbas_common_messages, vdbas_grid_config_messages` (bundle service + message lỗi lib chung + mã lỗi grid-config).
- **Swagger/Actuator:** `SWAGGER_ENABLED=false` mặc định; Actuator chỉ expose `health,info`.
- **Đóng gói:** Docker chỉ build module `api` (cổng `8081:8080`). Local: `mvn spring-boot:run` (8080).
- **Config:** điều khiển qua env (single `application.yml`). Namespace riêng `app.*` (`app.code=EXPENDITURE`, `app.cache`, `app.cors`, `app.gateway`).

## 5. Quyết định kiến trúc

> ADR chi tiết ở `project-knowledge/decisions/` (format Michael Nygard).

- **ADR-0001** — Quản lý mã lỗi nghiệp vụ qua catalog tập trung (`ErrorCatalog` + `messageKey` i18n). Xem §3, §6.
- **ADR-0002** — **Khóa chính sinh mới dùng UUID version 7 (time-ordered)**: cơ chế Hibernate `@UuidGenerator(style = VERSION_7)` trên `@Id` (Hibernate ORM 7.2), giữ nguyên map `UUID ↔ RAW(16)` (`@JdbcTypeCode(VARBINARY)`) — **không** gán tay `UUID.randomUUID()` (v4). Byte layout không đổi → không ảnh hưởng DDL/serialize/read path.
- **ADR-0003** *(Proposed)* — **Xuất dữ liệu ra file qua một tiện ích dùng chung** (Strategy + Factory + Template Method): phần generic ở `application/support/export/`, enum định dạng ở `common`; mỗi màn hình chỉ khai bộ cột. Kèm **ngoại lệ sub-package** ở §2 và lộ trình 2 nhịp (làm trong service trước, chuyển lên `vdbas-common-be` sau).
- **ADR-0004** *(Accepted)* — **Tích hợp BPM hai hướng (tập trung / nhúng) qua một port trung lập + hai adapter**: port nghiệp vụ `BpmWorkflowPort` (`start/approve/reject`) ở `application/support/bpm/`; `CentralizedBpmAdapter` (bọc `BpmClient` REST) và `EmbeddedBpmAdapter` (bọc `WorkflowService` in-process), chọn bean theo cờ `vdbas.bpm.embedded.enabled` (`@ConditionalOnProperty`). Mã nghiệp vụ chỉ gọi port. **Sửa đổi 15-10-2026:** gọi lại sau rollback dựa vào chống trùng/đối soát của BPM (không outbox); lệch còn lại do vận hành xử lý. Xem `design/SHARED/EXP.BPM_INTEGRATION/`.
- **ADR-0005** *(Accepted)* — **Ký số hồ sơ: hai chế độ MAKER + toolkit dùng chung + canonical hướng dữ liệu, không port**: cờ `app.signing.maker-sign-mode` (`ON_BEHALF` mặc định ký nhân danh in-process qua `vdbas-signer` / `PERSONAL` đích danh qua Agent), vai duyệt sau luôn đích danh; canonical đọc tập trường đóng băng từ `EXP_SIGN_SCHEMA` (thay `@SignedField`); gọi thẳng toolkit `application/support/sign/` (KHÔNG port — chỉ một hướng hạ tầng); chữ ký cộng dồn theo chuỗi `previous`. **Sửa đổi 28-08-2026:** kiểm toàn vẹn là **cổng chặn cứng ở mọi đường chuyển trạng thái, kể cả đường không ký** (`/reject`) — kèm ràng buộc xuyên chức năng: `DossierVersioningService.cloneDossier` **không được giữ `CREATED_BY` gốc**, và mọi đường ghi `EXP_DOSSIER` phải gác đủ `checkOwner` + `checkMakerActionAllowed` + `checkHeldByMaker`. **Sửa đổi 09-10-2026:** toolkit chỉ nhận dữ liệu thuần, điều phối chuyển sang ADR-0008. Xem `design/SHARED/EXP.SIGNING/` + §4.
- **ADR-0006** *(Accepted)* — **Thực thi biểu thức điều kiện của danh mục bằng SpEL trong ngữ cảnh chỉ-đọc**: `ConditionExpressionEvaluator` (`application/support/`) đánh giá `EXP_DOCUMENT_TYPE.CONDITION_EXPRESSION` bằng `SimpleEvaluationContext.forReadOnlyDataBinding()` + cache `Expression`; `NULL`/rỗng ⇒ `true`; lỗi parse = lỗi cấu hình danh mục (500). Chuỗi quy tắc là **dữ liệu do BA quản lý** nên ngữ cảnh chỉ-đọc là điều kiện bắt buộc. **Chủ sở hữu: `design/CAPEX_DOSSIER/EXP.DOC_SELECTING/API_Spec.md §5`** (vai gác bật/khoá checkbox Cấp 2 — SRS v4.0 `BIZ-SEL-11`; đổi chủ 21-08-2026, xem hàng *Sửa đổi* của ADR) — hợp đồng đánh giá + danh sách biến ở mục đó; `design/CAPEX_DOSSIER/EXP.CAPEX_DOSSIER.2.3/API_Spec.md §9` chỉ là con trỏ.
- **ADR-0007** *(Accepted)* — **Trường `BigDecimal` trên API truyền dạng chuỗi JSON** (cả request lẫn response) để FE không bị làm tròn số quá 15 chữ số: annotation `@JsonFormat(shape = STRING)` trên từng trường DTO API; **cấm** đổi shape `BigDecimal` toàn cục trên `ObjectMapper` dùng chung (chỉ bật `WRITE_BIGDECIMAL_AS_PLAIN`) và **cấm** gắn lên lớp ảnh chụp ký (giữ canonical/`HASH_INFO`). Xem §6.
- **ADR-0008** *(Accepted)* — **Khung phê duyệt có ký số dùng chung**: `ApprovalEngine` ở `application/support/approval/` điều phối SUBMIT/OPEN/FINALIZE/REJECT qua **mô hình trung lập** (`ApprovalState`) + **7 port theo vai trò**; mỗi chức năng một `ApprovalTarget` gom adapter, mặt tiền chỉ đổi DTO. Khung không biết bảng/cột; bộ ký `support/sign/` chỉ nhận dữ liệu thuần; không có thao tác duyệt không ký. Xem `design/SHARED/EXP.APPROVAL_ENGINE/`.

## 6. Quy ước đặc thù (ghi đè Org)

| Quy ước | Org | Project | Lý do |
|---|---|---|---|
| Phân quyền | `DynamicAuthorizationManager` + permission `API:METHOD:PATH` | Không có manager tập trung. Auth = Gateway filter và/hoặc Keycloak JWT role (`AuthoritiesConstants.ROLE_*`); authz nghiệp vụ tự code trong service | Cơ chế của `vdbas-common-be` |
| Migration | Flyway versioned | Flyway versioned ở `api/src/main/resources/db/migration/`, `ddl-auto=validate` (Flyway tạo schema, Hibernate chỉ validate). Xem `guides/VDBAS_DB_Migration_Flyway_Standard.md` | Đã wire Flyway; bám chuẩn Org |
| Quản lý mã lỗi | Enum `ErrorCode(httpStatus, code, userMessage)` — httpStatus + userMessage nội tuyến (`notification-message-validation.md §5.1`) | Interface `ErrorCatalog` (`common.enums`): enum chỉ giữ `errorCode` (`VDBAS-EXP-<CODE>`) + `messageKey`. HTTP status do subclass `BusinessException` chọn khi ném; message resolve qua `MessageSource` + `messages*.properties` (§3) | Bám envelope `{code,message,data}` + `GlobalExceptionHandler` của `vdbas-common-be`; hỗ trợ i18n (vi/en) |
| Số thập phân trên API | Decimal ↔ `BigDecimal` (`api-convention.md §2`), không quy định dạng JSON | Kiểu Java giữ `BigDecimal`; trên dây là **chuỗi JSON thập phân dạng thường** (`"5000000000"`), cả request lẫn response; BE vẫn nhận số JSON. Lớp ảnh chụp ký giữ dạng số. Chi tiết: ADR-0007 | JS `Number` chỉ chính xác ~15 chữ số, cột tiền `NUMBER(25)`/`NUMBER(27,2)` |
| Thư mục thiết kế | `design/<MÃ_CHỨC_NĂNG>/` | `design/<CỤM>/<MÃ_CHỨC_NĂNG>/`; thư mục chức năng giữ nguyên mã đầy đủ. Cụm: chức năng nghiệp vụ theo màn gốc, trùng tên thư mục `business-spec/EXP/` (`CAPEX_DOSSIER`, `CAPEX_PROJECT`), chứng từ con và popup đi theo màn mở ra chúng; nền kỹ thuật dùng chung vào `SHARED`. `_template/` giữ ở gốc `design/` | Thư mục phẳng khó điều hướng khi số chức năng tăng; tên cụm khớp `business-spec/EXP/` |
