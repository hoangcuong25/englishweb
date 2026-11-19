# Domain Glossary (Project) — Phân hệ Chi (Expenditure)

> Ngôn ngữ chung cho phân hệ Chi. Nguồn: `business-spec/EXP/`.
> Mã chức năng dạng `EXP.<SCREEN>`. Prefix bảng: `EXP_*` (nghiệp vụ chi), `COMMON_*` (dùng chung).

## Viết tắt

| Từ | Nghĩa |
|---|---|
| KBNN | Kho bạc Nhà nước |
| VDBAS | Tên hệ thống (dự án) |
| EXP | Expenditure — phân hệ Chi |
| CAPEX | Chi đầu tư (hồ sơ có dự án) |
| OPEX | Chi thường xuyên (hồ sơ không gắn dự án) |
| DVC | Dịch vụ công (một nguồn gốc hồ sơ) |
| LOV | List of values — danh mục tra cứu |
| BPM | Business Process Management — quản lý quy trình phê duyệt |

## Thực thể lõi

| Thuật ngữ | Bảng | Định nghĩa |
|---|---|---|
| Hồ sơ | `EXP_DOSSIER` | Đơn vị nghiệp vụ trung tâm của phân hệ Chi. Có mã (`DOSSIER_CODE`) + phiên bản (`VERSION`); mỗi mã chỉ 1 bản đang hiệu lực (`UK_DOSSIER_ACTIVE`). |
| Loại hồ sơ | `EXP_DOSSIER_TYPE` | `CAPEX` (Chi đầu tư) / `OPEX` (Chi thường xuyên). Ràng buộc: CAPEX bắt buộc có `PROJECT_CODE`, OPEX không có (`CK_DOSSIER_PROJECT`). |
| Chứng từ | `EXP_DOCUMENT` | Chứng từ thuộc một hồ sơ; có số tiền nguyên tệ (`ORIGINAL_AMOUNT`) và số tiền VND (`BASE_AMOUNT`), ngày chứng từ, ngày hạch toán. |
| Giấy đề nghị thanh toán | `EXP_PAYMENT_REQUEST` | Chi tiết chứng từ mẫu 04.a/TT; quan hệ 1:1 dùng chung khóa chính với `EXP_DOCUMENT` (`ID` là FK → `EXP_DOCUMENT.ID`). |
| Bản nháp hồ sơ | `EXP_DOSSIER_DRAFT` | Nội dung hồ sơ đang soạn (`CONTENT` kiểu JSON native), chưa hoàn thiện. |
| File đính kèm | `EXP_DOSSIER_ATTACHMENT`, `EXP_DOCUMENT_ATTACHMENT` | File gắn theo hồ sơ / chứng từ; có cờ cho phép ký tiếp (`SIGN_ALLOW`). |
| Dự án | `COMMON_PROJECT`, `EXP_PROJECT_SPECIFIC` | Dự án (cho hồ sơ CAPEX); loại dự án Thường / Đặc thù (`EXP_PROJECT_TYPE`). |
| Thông tin chi tiết dự án | `EXP_PROJECT_DETAIL` | Thông tin dự án do Maker hoàn thiện, lưu theo version (`PROJECT_CODE` + `VERSION`). Mỗi dự án tối đa 1 version hiện hành (`STATUS = 1`, `UK_PROJECT_DETAIL_ACTIVE`); bản cũ `STATUS = 0`. Nguồn gốc version: `VERSION_ORIGIN` = `INITIAL` / `EDIT` / `ADJUST`. |

## Luồng phê duyệt & vai trò (Maker–Checker–Approver)

| Thuật ngữ | Nguồn | Định nghĩa |
|---|---|---|
| Cấu hình dây phê duyệt | `COMMON_APPROVAL_FLOW_CONFIG` | Dây duyệt theo `(MODULE_CODE, FUNCTION_CODE)`: `FLOW_CODE` (soft-ref quy trình BPM) + `APPROVAL_CHAIN` (JSON: mảng bước `{order, role, userName, email?}` hoặc object `{beneficiaryEmail?, steps}` — chi tiết `design/SHARED/EXP.BPM_INTEGRATION/API_Spec §5`). Bản sao cục bộ đồng bộ từ Quản trị tập trung. |
| Luồng BPM của hồ sơ | `EXP_DOSSIER.PROCESS_INSTANCE_ID` | ID tiến trình BPM engine trả về (`RAW(16)`, null khi chưa gửi luồng). |
| Snapshot dây phê duyệt | `EXP_DOSSIER.WORKFLOW_CONFIG_SNAPSHOT` | JSON đóng băng `APPROVAL_CHAIN` tại thời điểm Maker gửi kiểm soát (SUBMIT). |
| Maker / Checker / Approver | `EXP_DOSSIER_APPROVAL_LOG.ACTION_ROLE` | Vai trò: lập hồ sơ / kiểm soát / phê duyệt. |
| Lịch sử phê duyệt | `EXP_DOSSIER_APPROVAL_LOG` | Nhật ký từng hành động trên hồ sơ (người, vai trò, lý do, trạng thái), liên kết chuỗi qua `PARENT_ID`. |
| Người đang xử lý | `EXP_DOSSIER.ASSIGN_USER` | User hiện được giao xử lý hồ sơ. |
| Quản trị dự án (Project Admin) | — | Vai trò thấy mọi dự án và Gán / Hủy gán dự án đặc thù (`IS_SHARED`); không được sửa thông tin chi tiết dự án. |

## Trạng thái

| Thuật ngữ | Nguồn | Định nghĩa |
|---|---|---|
| Trạng thái xử lý | `COMMON_STATUS` (LOV) | Trạng thái nghiệp vụ: Chưa hoàn thiện, Đã hoàn thiện, Chờ kiểm soát, Từ chối/Hủy kiểm soát, Chờ phê duyệt, Từ chối/Hủy phê duyệt, Hoàn thành xử lý. |
| `FUNCTION_STATUS_ID` | `EXP_DOSSIER`, `EXP_DOCUMENT` | Trạng thái xử lý chính (FK → `COMMON_STATUS.ID`). |
| `ACCOUNTING_STATUS_ID` / `FUND_STATUS_ID` | `EXP_DOSSIER`, `EXP_DOCUMENT` | Trạng thái hạch toán / kiểm soát chi (FK → `COMMON_STATUS.ID`). |
| Trạng thái tích hợp theo kênh | `EXP_DOSSIER` | Tách theo kênh: `REV_INTEGRATION_STATUS_ID`, `PAY_INTEGRATION_STATUS_ID`, `PAY_BNK_INTEGRATION_STATUS_ID`, `SER_INTEGRATION_STATUS_ID` (đều FK → `COMMON_STATUS.ID`). |
| `STATUS` (hiệu lực) | mọi bảng | Cờ hiệu lực bản ghi: `0`=hết hiệu lực, `1`=hiệu lực. KHÁC với trạng thái xử lý ở trên. |

## Danh mục dùng chung (LOV)

| Danh mục | Bảng | Giá trị tiêu biểu |
|---|---|---|
| Đơn vị quan hệ ngân sách | `COMMON_ORGANIZATION` | — |
| Kho bạc | `COMMON_TREASURY` | — |
| Tiền tệ | `COMMON_CURRENCY` | — |
| Nguồn gốc hồ sơ | `EXP_DATA_SOURCE` | DVC, Thủ công, Chuyển đổi |
| Loại chứng từ | `EXP_DOCUMENT_TYPE` | Có cây Cấp 1/Cấp 2 (`DOCUMENT_LEVEL`, `PARENT_DOCUMENT_TYPE_CODE`); gắn nhóm chứng từ + nghiệp vụ (cột thêm ở migration `V1.x`). |
| Nhóm chứng từ | `EXP_DOCUMENT_GROUP` | **= "Nhóm nghiệp vụ" trong SRS** (ICP/FIP/PPP/AFCP/FCP/ADJ). `IS_COMMON=1` = nhóm dùng chung (vd ADJ) — ngoại lệ khóa 01-nhóm (BIZ-SEL-10). |
| Nghiệp vụ | `EXP_BUSINESS` | Đề nghị thanh toán / Rút vốn / Thu hồi tạm ứng… (`EXP_DOCUMENT_TYPE.BUSINESS_CODE` → đây). |
| Loại nghiệp vụ | `EXP_BUSINESS_GROUP` | **= "Loại nghiệp vụ" trong SRS** (Dự toán / Tiền gửi). Cha của `EXP_BUSINESS`. |
| Loại đính kèm | `EXP_ATTACHMENT_TYPE` | Chứng từ gốc, Hợp đồng, Hóa đơn, Bảng kê, Văn bản khác |
| Loại thanh toán | `EXP_PAYMENT_TYPE` | Tạm ứng, Thanh toán |
| Hợp đồng / Loại hợp đồng | `EXP_CONTRACT`, `EXP_CONTRACT_TYPE`, `EXP_CONTRACT_DETAIL` | Hợp đồng của dự án; chi tiết lũy kế thanh toán theo nhà thầu. |
| Ngân hàng | `COMMON_BANK` | Ngân hàng / Kho bạc (`BANK_TYPE`). |
| Nội dung kinh tế | `COMMON_COA_SEGMENT4` | Segment 4 của tài khoản kế toán. |
| Tỷ giá / Loại tỷ giá | `COMMON_EXCHANGE_RATE`, `COMMON_EXCHANGE_RATE_TYPE` | Tỷ giá theo ngày hiệu lực. |
| Năm kế hoạch vốn | `COMMON_YEAR` | Danh mục năm dùng chung, PK `YEAR_CODE` |
| Tài khoản kho bạc dự án | `SER_TREASURY_ACCOUNT` | Tài khoản mở tại kho bạc theo dự án. |

> Các danh mục phục vụ `EXP_PAYMENT_REQUEST` (nhóm ngay trên `Loại thanh toán` … `Tài khoản kho bạc dự án`) hiện là bảng nền, hoàn thiện khi có chức năng danh mục riêng.

> ⚠️ **Đảo nghĩa dễ nhầm:** SRS gọi ICP/FIP/PPP là *"Nhóm nghiệp vụ"* nhưng DB đặt ở **`EXP_DOCUMENT_GROUP`**; còn **`EXP_BUSINESS_GROUP`** (Dự toán/Tiền gửi) là *"Loại nghiệp vụ"*. Khi code phạm vi khóa BIZ-SEL-10 → dùng `DOCUMENT_GROUP_CODE`, KHÔNG dùng `BUSINESS_GROUP`.

## Mẫu chứng từ động (Dynamic Template)

| Thuật ngữ | Nguồn | Định nghĩa |
|---|---|---|
| Mẫu chứng từ (template) | `DT_TEMPLATE` (phân hệ Dynamic Template) | Biểu mẫu chứng từ theo văn bản ban hành, định danh bằng **mã mẫu** (`TEMPLATE_CODE`, ví dụ `04.a/TT`). Phân hệ Chi tra mã mẫu qua `EXP_DOCUMENT_TYPE.DOCUMENT_FORM_NO`. |
| Bản mẫu (template version) | `DT_TEMPLATE_VERSION` | Một phiên bản của mẫu; bản đã ban hành là **bất biến**, nhờ đó chứng từ lập theo mẫu cũ vẫn vẽ lại đúng. |
| Số hiệu bản mẫu | `EXP_DOCUMENT.TEMPLATE_VERSION_ID` | Định danh bản mẫu của một chứng từ — ghim một lần (lúc lập, hoặc lượt Sửa đầu tiên có gửi giá trị với chứng từ chưa ghim), đi theo bản sao khi hồ sơ nâng phiên bản. `NULL` khi chưa ghim. |
| Bộ dựng (renderer) | FE | Thành phần của Dynamic Template vẽ **thân tờ khai** từ bản mẫu. BE phân hệ Chi **không** gọi sang Dynamic Template. |

## Ký số & truy vết

| Thuật ngữ | Nguồn | Định nghĩa |
|---|---|---|
| Ký số | `EXP_DOSSIER_DIGITAL_SIGNED` | Chữ ký số trên hồ sơ: gói thông tin ký `SIGNED_PACKAGE` (JSON) + người ký / vai trò ký / ngày ký (`SIGNED_USER`, `SIGNED_ROLE`, `SIGNED_DATE`). |
| Lược đồ ký | `EXP_SIGN_SCHEMA` | Tập trường đóng băng (`SIGNED_FIELDS` JSON) để dựng chuỗi canonical cho `HASH_INFO`; `ID` (UUID) = `schemaId` ghim trong hash, chọn bản hiệu lực theo `SCHEMA_CODE` / `SCHEMA_VERSION`. |
| Chứng thư người ký | `COMMON_USER_SIGN_CERT` | Serial chứng thư số đã đăng ký của người ký đích danh (1 serial / `USER_ID`); BE đọc serial cert đang hiệu lực (`STATUS != 0`) cung cấp cho lời gọi ký. Bản sao đồng bộ từ Quản trị tập trung. |
| Ký đích danh (PERSONAL) | `app.signing.maker-sign-mode=PERSONAL` | MAKER ký bằng **chứng thư riêng** (USB token) qua Agent trên máy người dùng; ký lô lên tệp PDF + khối dữ liệu, chốt qua `signing/finalize`. Các vai duyệt sau **luôn** đích danh. |
| Ký nhân danh (ON_BEHALF) | `app.signing.maker-sign-mode=ON_BEHALF` (mặc định) · `vdbas-signer` | Hệ thống ký **khối dữ liệu** (`HASH_INFO`) bằng **chứng thư hệ thống**, server-side, gói trọn trong `/submit` (không Agent, **không** ký lên tệp PDF). |
| Hash hồ sơ | `EXP_DOSSIER.HASH_INFO` | Hash toàn bộ hồ sơ + chứng từ khi gửi phê duyệt — chống sửa đổi. Cột `VARCHAR2(2000)` lưu **base64** của cụm JSON `{schemaId, algorithm, documentHash}`. |
| Audit log | `EXP_AUDIT_LOG` | Nhật ký thay đổi hệ thống: bảng, bản ghi, loại hành động (INSERT/UPDATE/DELETE/CREATE/SUBMIT/APPROVE/REJECT), user, IP. |

## Quy ước

- Thêm thuật ngữ nghiệp vụ mới phát sinh khi thiết kế/triển khai; đổi tên/khái niệm cập nhật qua MR.
- Cột audit dùng chung mọi bảng: `CREATED_BY/CREATED_AT/UPDATED_BY/UPDATED_AT` — khớp `AbstractAuditing` của `vdbas-common-be`.
