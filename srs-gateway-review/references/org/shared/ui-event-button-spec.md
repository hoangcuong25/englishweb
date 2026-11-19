# UI Event & Button Spec — Đặc tả Sự kiện & Nút chức năng (Org)

> [!NOTE]
> Quy ước **mã sự kiện (Event ID)**, **nút chức năng** và hành vi tương tác trên toàn bộ giao diện VDBAS.
> Nguồn: `VDBAS_SA_DacTaSuKien_NutChucNang` (SA — Đỗ Văn Ngà, v0.2, 22/05/2026). **Living Document** — cập nhật khi có màn hình/nghiệp vụ mới; mọi thay đổi qua **SA review**.
> Đối tượng: FE Developer, BE Developer, QA/Tester, SA, Tech Lead.
> Liên quan: `notification-message-validation.md` (Dialog/Toast/message), `backend/api-convention.md` (envelope & phân trang response), `frontend/tech-stack.md` (Ant Design).

## 1. Mã sự kiện (Event ID)

Event ID là **định danh duy nhất** cho mỗi hành động người dùng — dùng ở FE (emit event), BE (audit log), QA (test case ID), Analytics (tracking).

**FORMAT:** `<MOD>.<SCREEN>.<ACTION>`
Ví dụ: `PAY.PO_OUT.LIST.EXPORT_EXCEL` · `USER.NEW.SAVE` · `CONTRACT.EDIT.SUBMIT`

| Thành phần | Mô tả | Quy tắc | Ví dụ |
|---|---|---|---|
| `<MOD>` | Mã chức năng theo phân hệ | UPPER_CASE, cấu trúc `[MODULE.NGHIỆP_VỤ]` | `PAY.PO_OUT`, `PAY.PO_IN` |
| `<SCREEN>` | Màn hình / chức năng trong module | UPPER_CASE (xem §3) | `LIST`, `NEW`, `EDIT`, `APPROVE` |
| `<ACTION>` | Hành động cụ thể | UPPER_CASE, gạch dưới phân tách từ | `SAVE`, `SUBMIT`, `EXPORT_EXCEL` |

**Nguyên tắc bắt buộc:**
- Event ID **duy nhất toàn hệ thống** — không 2 sự kiện dùng chung 1 mã.
- Đã đưa vào dùng thì **không đổi tên** (mã xuyên suốt FE, BE audit log, QA test case, analytics).
- Màn hình/hành động mới chưa có trong danh sách chuẩn → **SA/Tech Lead phê duyệt + bổ sung tài liệu** trước khi implement.

## 2. Danh sách `<MOD>` — Mã phân hệ chuẩn

| Mã `<MOD>` | Tên phân hệ | Mô tả |
|---|---|---|
| `PAY` | Thanh toán | Quản lý thanh toán |
| `REV` | Thu | Quản lý thu |
| `EXP` | Chi | Quản lý chi |
| `MC` | Kiểm tra, giám sát | Kiểm tra, giám sát |
| `AD` | Quản trị dùng chung | Quản trị dùng chung, quản lý người dùng |
| `INT` | Tích hợp | Trục tích hợp |
| `SER` | Dịch vụ kho bạc | Dịch vụ Kho bạc nhà nước |
| `USER` | Người dùng | Quản lý tài khoản, hồ sơ người dùng |
| `ROLE` | Phân quyền | Quản lý vai trò và quyền hạn |
| `REPORT` | Báo cáo | Xem, xuất báo cáo các loại |
| `NOTIFY` | Thông báo | Quản lý thông báo hệ thống |
| `SYS` | Hệ thống | Cấu hình, thiết lập chung |
| `AUTH` | Xác thực | Đăng nhập, đăng xuất, đổi mật khẩu |

### 2.1 Catalog mã chức năng theo phân hệ (trích — Living Document)

> Danh mục chức năng chi tiết là registry nghiệp vụ, cập nhật liên tục. Dưới đây giữ các phân hệ đã có nội dung; `REV` (Thu), `EXP` (Chi), `SER` (Dịch vụ), `INT` (Tích hợp) **chưa cập nhật** trong bản nguồn.

**Phân hệ Thanh toán (`PAY`)** — `...` = còn mục chưa liệt kê đủ trong nguồn:

| Mã chức năng | Tên chức năng |
|---|---|
| `PAY.PO_OUT` | Lệnh thanh toán đi |
| `PAY.PO_OUT.AUTO` | Xử lý lệnh thanh toán đi tự động (đa kênh: LNH+SP+LKB) |
| `PAY.PO_OUT.MANUAL` | Lập lệnh thanh toán đi thủ công (đa kênh) |
| `PAY.PO_IN` | Lệnh thanh toán đến |
| `PAY.PO_IN.AUTO` | Nhận và hạch toán lệnh thanh toán đến tự động (đa kênh) |
| `PAY.PO_IN.MANUAL` | Nhập lệnh thanh toán đến thủ công (TTSP) |
| `PAY.PO_IN.COMPLETE` | Hoàn thiện lệnh thu khác → đẩy GL |
| `PAY.TRACE_REVERSAL` | Tra soát & Hoàn chuyển |
| `PAY.TRACE.OUT` | Lập điện tra soát đi (đa kênh) |
| `PAY.TRACE.IN` | Nhận và trả lời điện tra soát đến (đa kênh) |
| `PAY.REVERSAL.REQ` | Yêu cầu hoàn chuyển LTT (NHNN/LNH) |
| `PAY.REVERSAL.RES` | Trả lời yêu cầu hoàn chuyển (NHNN/LNH) |
| `PAY.RECON` | Đối chiếu (truyền tin / GL / chi tiết / liên kho bạc / thu hộ chi hộ / quyết toán TTLNH) |
| `PAY.ERR` | Xử lý lỗi giao diện (hàng đợi lỗi / giao diện lại / lỗi đẩy GL) |
| `PAY.INTEREST_FEE` | Lãi & Phí (tính lãi/phí đa kênh; đối chiếu lãi/phí với NHTM) |
| `PAY.QUERY_REPORT` | Tra cứu & Báo cáo (lệnh TT, tra soát, kết quả đối chiếu) |
| `PAY.REPORT` | Cụm báo cáo Quản lý thanh toán (BCSP+BCLNH+BCLKB) |
| `PAY.ECM` | Lưu trữ điện tử (`PAY.ECM.01` — lưu trữ & xuất kho điện tử) |
| `PAY.MD` | Danh mục dùng chung — Master Data (`PAY.MD.01` NH ánh xạ, `PAY.MD.02` định tuyến…) |
| `PAY.CONFIG` | Cấu hình hệ thống (`PAY.CONFIG.01` console vận hành, `PAY.CONFIG.02` dừng/kích hoạt gửi lệnh…) |

**Phân hệ Quản trị dùng chung (`AD`):**

| Mã chức năng | Tên chức năng |
|---|---|
| `AD.01.01` | Quản lý người sử dụng |
| `AD.01.02` | Quản lý nhóm người sử dụng |
| `AD.01.03` | Quản lý danh mục ứng dụng nghiệp vụ |
| `AD.01.04` | Quản trị phân quyền tập trung |
| `AD.01.05` | Đăng nhập & Giao diện Hợp nhất (SSO) |
| `AD.01.06` | Giám sát người dùng |
| `AD.01.07` | Nhật ký Hoạt động Hệ thống (Audit Log) |
| `AD.01.08` | Cấu hình tham số hệ thống dùng chung |
| `AD.01.09` | Danh sách báo cáo Quản trị dùng chung |
| `AD.01.10` | Quản lý đồng bộ phân quyền (User, Role, User_Role_Data) |
| `AD.01.11` | Quản lý đồng bộ giám sát người dùng, nhật ký hệ thống |
| `AD.02.01`–`AD.02.05` | Quản lý danh mục dùng chung (BTC quản lý / KBNN quản lý / quản trị DS danh mục / trao đổi & chia sẻ dữ liệu danh mục) |
| `AD.03.01`–`AD.03.06` | Quản lý chứng thư số (đăng ký cấp / gia hạn / khôi phục thiết bị / thu hồi / quản lý thông tin / đăng ký sử dụng) |
| `AD.04.01`–`AD.04.03` | Quản lý thông báo tập trung (DS & lịch sử / chi tiết yêu cầu gửi / cấu hình & danh mục) |
| `AD.05.01`–`AD.05.02` | Quản lý luồng phê duyệt (DS & lịch sử / chi tiết giao dịch) |

## 3. Danh sách `<SCREEN>` chuẩn

| Mã `<SCREEN>` | Tên màn hình | Mô tả |
|---|---|---|
| `LIST` | Danh sách | Hiển thị danh sách, tìm kiếm, lọc dữ liệu |
| `VIEW` | Xem chi tiết | Xem chi tiết bản ghi (read-only) |
| `NEW` | Tạo mới | Form tạo mới bản ghi |
| `EDIT` | Chỉnh sửa | Form chỉnh sửa bản ghi đã có |
| `DELETE` | Xóa | Confirm dialog xóa bản ghi |
| `APPROVE` | Phê duyệt | Màn hình phê duyệt / từ chối |
| `ATTACH` | Đính kèm | Quản lý file đính kèm |
| `PRINT` | In ấn | Preview và in bản ghi |
| `IMPORT` | Nhập dữ liệu | Import từ file Excel/CSV |
| `EXPORT` | Xuất dữ liệu | Export ra file Excel/PDF/CSV |
| `SEARCH` | Tìm kiếm | Trang tìm kiếm chuyên biệt (nếu tách riêng) |
| `PROFILE` | Hồ sơ | Màn hình hồ sơ cá nhân |
| `SETTING` | Cài đặt | Màn hình cài đặt module |
| `DASHBOARD` | Tổng quan | Dashboard, thống kê |

## 4. Danh sách `<ACTION>` chuẩn

| Mã `<ACTION>` | Tên hành động | Mô tả | Nhóm | Loại nút gợi ý |
|---|---|---|---|---|
| `OPEN` | Mở | Mở form, modal, trang mới | Navigation | Primary |
| `CLOSE` | Đóng | Đóng form, modal, drawer | Navigation | Default |
| `BACK` | Quay lại | Quay về trang trước | Navigation | Default |
| `SAVE` | Lưu | Lưu bản ghi ở trạng thái hoạt động | Write | Primary |
| `SAVE_DRAFT` | Lưu nháp | Lưu bản ghi ở trạng thái nháp | Write | Primary |
| `SUBMIT` | Gửi kiểm soát | Gửi bản ghi để người khác xem xét | Workflow | Primary |
| `APPROVE` | Phê duyệt | Chấp thuận bản ghi | Workflow | Primary |
| `REJECT` | Từ chối | Từ chối bản ghi, kèm lý do | Workflow | Danger |
| `CANCEL` | Hủy bỏ | Hủy bản ghi (không phải xóa) | Workflow | Default |
| `RECALL` | Thu hồi | Thu hồi bản ghi đã gửi | Workflow | Danger |
| `DELETE` | Xóa | Xóa bản ghi khỏi hệ thống | Write | Danger |
| `RESTORE` | Khôi phục | Khôi phục bản ghi đã xóa mềm | Write | |
| `EDIT` | Sửa | Chuyển sang chế độ chỉnh sửa | Navigation | |
| `COPY` | Sao chép | Tạo bản sao bản ghi | Write | Primary |
| `SEARCH` | Tìm kiếm | Thực hiện tìm kiếm với điều kiện | Read | |
| `RESET` | Đặt lại | Đặt lại toàn bộ filter/form | UI | |
| `REFRESH` | Làm mới | Tải lại dữ liệu từ server | Read | |
| `EXPORT_EXCEL` | Xuất Excel | Xuất dữ liệu ra `.xlsx` | Export | |
| `EXPORT_PDF` | Xuất PDF | Xuất dữ liệu ra `.pdf` | Export | |
| `EXPORT_CSV` | Xuất CSV | Xuất dữ liệu ra `.csv` | Export | |
| `IMPORT_EXCEL` | Nhập Excel | Nhập dữ liệu từ `.xlsx` | Import | |
| `PRINT` | In | In bản ghi ra máy in | Export | |
| `SEND_EMAIL` | Gửi email | Gửi email thông báo liên quan | Action | |
| `ATTACH_FILE` | Đính kèm file | Tải file lên đính kèm bản ghi | Write | |
| `REMOVE_FILE` | Xóa file | Xóa file đính kèm | Write | |
| `DOWNLOAD_FILE` | Tải file | Tải file đính kèm về máy | Export | |
| `TOGGLE_ADVANCED` | Tìm kiếm nâng cao | Mở/đóng khu vực tìm kiếm nâng cao | UI | |
| `SELECT_ALL` | Chọn tất cả | Chọn tất cả bản ghi trong trang | UI | |
| `DESELECT_ALL` | Bỏ chọn tất cả | Bỏ chọn tất cả | UI | |
| `BULK_DELETE` | Xóa hàng loạt | Xóa nhiều bản ghi đã chọn | Write | Danger |
| `BULK_APPROVE` | Duyệt hàng loạt | Duyệt nhiều bản ghi đã chọn | Workflow | |
| `CHANGE_PASSWORD` | Đổi mật khẩu | Thay đổi mật khẩu người dùng | Write | |
| `LOGOUT` | Đăng xuất | Kết thúc phiên làm việc | Auth | |

## 5. Phân loại nút (Button Type)

Hệ thống dùng **6 loại nút** chuẩn theo **Ant Design**. Dùng đúng loại = trải nghiệm nhất quán + giảm thao tác nhầm.

| Loại nút | Ant Design variant | Màu nền | Màu chữ | Khi nào dùng | KHÔNG dùng khi |
|---|---|---|---|---|---|
| **Primary** | `type="primary"` | `#1677FF` xanh dương | `#FFFFFF` trắng | Hành động CHÍNH: Lưu, Tìm kiếm, Xác nhận | Mỗi màn hình **CHỈ 1** Primary |
| **Default** | `type="default"` | `#FFFFFF` trắng | `#262626` đen đậm | Hành động phụ: Hủy, Quay lại, Đóng | Hành động chính quan trọng |
| **Danger** | `type="primary" danger` | `#FF4D4F` đỏ | `#FFFFFF` trắng | Xóa, Từ chối, Hủy không hoàn tác | Hành động thông thường |
| **Ghost** | `type="ghost"` | Trong suốt | `#1677FF` | Action trong card/table row ([Xem][Sửa][Xóa]) | Hành động chính cần nổi bật |
| **Link** | `type="link"` | Trong suốt | `#1677FF` | Điều hướng, xem chi tiết trong ô bảng | Hành động tạo/lưu/xóa có hệ quả |
| **Warning** | `type="default"` + style warning | `#FFF7E6` vàng kem | `#D97706` cam đất | Cảnh báo trước hành động nhạy cảm | Thay thế Danger trong mọi trường hợp |

**Lưu ý theo vai trò:**
- **BA:** chỉ định loại nút cho từng nút trong SRS (nhất là Primary/Danger/Warning); mỗi màn hình **đúng 1 Primary**; nút Danger **phải kèm Dialog xác nhận**.
- **FE Dev:** implement đúng `type` + `danger` prop; **không** dùng CSS tùy chỉnh giả lập màu. Không nhầm **Danger** (không hoàn tác: xóa, từ chối) với **Warning** (cảnh báo nhưng vẫn hủy được).
- **QA:** test cả đúng loại/màu nút theo bảng, không chỉ test chức năng.

## 6. Vị trí nút trên màn hình

> 📌 **Nguyên tắc chung bắt buộc:** Nhóm nút hành động chính luôn ở **CUỐI form/Dialog, căn PHẢI**. Thứ tự phải→trái theo ưu tiên: **Primary → Default**; **Danger tách sang TRÁI**. Khoảng cách giữa nút: **8px**; nhóm nút cách cạnh form/Dialog: **24px**. Nút Danger (Xóa, Từ chối) luôn bên TRÁI, tách xa nhóm chính để tránh click nhầm. Mọi ngoại lệ phải được SA phê duyệt.

| Màn hình | Bố cục nút |
|---|---|
| **LIST** | `Thêm mới` (Primary, góc trên phải, cách 24px) · `Xuất Excel/In` (Default, trái Thêm mới 8px) · `Tìm kiếm` (Primary, cuối hàng tìm kiếm, sát phải) · hàng bảng: `[Xem]`(Ghost) `[Sửa]`(Ghost) `[Xóa]`(Danger, ngoài cùng phải, có Dialog) |
| **Form (NEW/EDIT)** | `Nộp/Lưu/Xác nhận` (Primary, cuối form ngoài cùng phải) · `Lưu nháp` (Default, trái Primary) · `Hủy/Quay lại` (Default) · `Xóa/Hủy không hoàn tác` (Danger, cuối form ngoài cùng **TRÁI**) |
| **VIEW** | `In/Xuất PDF` (Default, góc trên phải) · `Phê duyệt` (Primary, cuối trang phải, role=Người duyệt & status=Submitted) · `Trả lại` (Default) · `Từ chối` (Danger, cuối trang **TRÁI**) · `Quay lại` (Default) · `Sửa` (Default, góc trên phải, role=Người lập & status=Draft/Returned) |
| **Dialog xác nhận** | `Xác nhận` (Primary **hoặc** Danger nếu không hoàn tác, cuối Dialog phải) · `Hủy` (Default, trái — luôn có) |
| **Tìm kiếm nâng cao** | Ẩn/hiện ngay tại LIST, không mở màn hình/Dialog mới. `Tìm kiếm` (Primary) · `Tìm kiếm nâng cao ▼/▲` (Default, badge số filter) · vùng nâng cao: `Tìm kiếm` (Primary, góc dưới phải) + `Xóa bộ lọc` (Default, trái). **Tối đa 2 hàng điều kiện** (quá phải rà soát với SA); hiển thị tag bộ lọc trên bảng; `[Xóa bộ lọc]` reset điều kiện nâng cao nhưng **giữ** từ khóa tìm nhanh. |
| **APPROVE** | `Phê duyệt & Ký số` (Primary, cuối trang phải, chứng thư TAD-COMM còn hiệu lực) · `Trả lại` (Default) · `Từ chối` (Danger, cuối trang **TRÁI**, phải nhập Ý kiến trước khi enable) |
| **ATTACH** | `Tải lên file mới` (Primary, góc trên phải) · hàng file: `[Xem]`(Ghost) `[Tải xuống]`(Ghost) `[Xóa]`(Danger, có Dialog, chỉ khi có quyền) |
| **PRINT** | `In ngay` (Primary, góc trên phải) · `Xuất PDF` (Default) · `Quay lại` (Default, góc trên **TRÁI**) |
| **DELETE** | Không có màn hình DELETE độc lập — nút Xóa luôn ở LIST/VIEW. **BẮT BUỘC Dialog xác nhận**, không xóa ngay. Dialog nêu tên đối tượng + cảnh báo không khôi phục; xóa thành công → Toast SUCCESS + về LIST; thất bại (đang tham chiếu) → Toast ERROR + lý do. **Khuyến nghị soft delete** (`is_deleted = true`), không xóa vật lý. |

## 7. Quy chuẩn hiển thị nút (Button Design Spec — Ant Design)

> Phiên bản Ant Design theo `frontend/tech-stack.md` (SST) — org dùng **antd 6.x** + Ant Design Form. Các giá trị token dưới đây (radius, size, spacing) là chuẩn hiển thị áp dụng trên phiên bản đó.

**Kích thước:** `large` 40px / font 16px (form lớn, Nộp/Phê duyệt/Ký số) · `middle` 32px / font 14px (mặc định: form, toolbar, filter) · `small` 24px / font 12px (hàng bảng, tag/badge). **Không mix size trong cùng nhóm nút.**

**Typography:** font Inter/System (Ant Design); weight **500 Medium** (không Bold 700, không Regular 400); text-transform **none — hoa chữ đầu** ("Nộp hồ sơ", không "NỘP HỒ SƠ"); tên nút **tối đa 3 từ**.

**Border radius & Icon:** radius **6px** (không 0px/20px); icon đặt **bên TRÁI** text; nút icon-only **bắt buộc** có `title`/tooltip; loading state = spinner thay icon + disable nút.

**Spacing:** giữa nút cùng nhóm **8px** (`gap`, không `margin-right`); nhóm nút ↔ cạnh form/Dialog **24px**; Danger tách 2 phía (`justify-content: space-between`); nút trong hàng bảng **4px**.

**States:** `default` · `hover` (sáng +10%, AntD tự xử lý) · `active` (tối +10%) · `disabled` (opacity 40%, `cursor: not-allowed`, dùng prop `disabled` không ẩn bằng CSS) · `loading` (spinner + "Đang xử lý…", **bắt buộc khi gọi API** để ngăn double submit) · `focus` (outline 2px `#1677FF`, **không được xóa** — accessibility).

> ⚠ **FE Dev:** `disabled` khi không đủ điều kiện vs `loading` khi chờ API. **Không** dùng `visibility:hidden`/`display:none` để ẩn nút — dùng điều kiện render trong JSX. **Không** override màu nút bằng CSS inline/className tùy chỉnh (ảnh hưởng design system).

## 8. Phím tắt

> Nhất quán toàn hệ thống (cùng hành động = cùng phím tắt ở mọi màn hình); không trùng phím tắt mặc định trình duyệt; hiển thị trong tooltip khi hover; vô hiệu khi nút bị disable. `Escape` luôn đóng modal/drawer/form; `F5` luôn Refresh.

| Phím tắt | Hành động | Màn hình | Ghi chú |
|---|---|---|---|
| `Ctrl + S` | Lưu | NEW, EDIT | Lưu ở trạng thái hiện có |
| `Ctrl + Shift + S` | Lưu nháp | NEW, EDIT | Chỉ lưu nháp, không submit |
| `Ctrl + Enter` (hoặc `F9`) | Gửi kiểm soát | NEW, EDIT | Gửi để phê duyệt |
| `Ctrl + N` | Tạo mới | LIST | Mở form tạo mới |
| `Ctrl + E` | Sửa | VIEW | Chuyển sang chế độ chỉnh sửa |
| `Ctrl + P` | In | VIEW, LIST | Mở trang in |
| `Ctrl + F` | Tìm kiếm (focus) | LIST | Focus ô tìm kiếm chính |
| `Ctrl + R` / `F5` | Làm mới | Tất cả | Tải lại dữ liệu từ server |
| `Escape` | Đóng / Hủy | Tất cả | Đóng modal/drawer/form |
| `Alt + A` | Phê duyệt | APPROVE, VIEW | |
| `Alt + R` | Từ chối | APPROVE, VIEW | |
| `Delete` | Xóa | LIST (đã chọn row) | Phải confirm |
| `Ctrl + A` | Chọn tất cả | LIST | Chọn tất cả row trang hiện tại |
| `Ctrl + Z` | Hoàn tác | NEW, EDIT | Hoàn tác thay đổi gần nhất trong form |
| `F1` | Trợ giúp | Tất cả | Mở tài liệu hướng dẫn màn hình |

## 9. Phân trang (Pagination)

Bắt buộc cho mọi màn hình LIST. **Cấu hình mặc định:** page size **20** (tùy chọn 10/20/50/100, lưu localStorage); luôn bắt đầu **trang 1**; thanh phân trang góc dưới phải, cách đáy bảng 16px; **bắt buộc** hiển thị tổng số bản ghi ("Tổng: 1.234 hồ sơ") và trang hiện tại ("Trang 3 / 62").

**Thành phần thanh phân trang:** tổng số bản ghi (✅) · nút Prev/Next (✅, disable ở đầu/cuối) · số trang (✅, tối đa 5 số, ẩn xa bằng "…") · input nhảy trang (⚠️ khi tổng trang > 10) · dropdown số dòng/trang (✅).

> 📌 **Hành vi bắt buộc (FE):** sau tìm kiếm/lọc → reset về trang 1; xóa bản ghi cuối của trang → tự quay về trang trước; sau thêm mới → **giữ nguyên trang** + Toast SUCCESS (không nhảy trang); đổi page size → reset trang 1; giữ điều kiện tìm kiếm khi chuyển trang; tổng bản ghi = 0 → ẩn thanh phân trang + empty state "Không tìm thấy dữ liệu phù hợp".

**Page size mặc định/tối đa theo loại:** LIST hồ sơ 20/100 · DS dự án 20/50 · Danh mục (DMHT) 50/200 · Báo cáo 20/50 · Tìm kiếm nâng cao 20/100 · Audit log 20/50.

**API request params** (FE là nguồn chuẩn cho tham số gọi):

| Tham số | Kiểu | Bắt buộc? | Mô tả |
|---|---|---|---|
| `page` | Integer | ✅ | Số trang hiện tại, **bắt đầu từ 1** (không phải 0) |
| `size` | Integer | ✅ | Số bản ghi mỗi trang (10/20/50/100) |
| `sortBy` | String | ⚠️ | Tên trường sắp xếp, ví dụ `createdDate` |
| `sortDir` | String | ⚠️ | `asc`/`desc`; mặc định `desc` |
| `[filter…]` | Varies | ⚠️ | Các điều kiện tìm kiếm đi kèm |

> [!NOTE]
> **Envelope response phân trang** theo SST `backend/api-convention.md §3.3`: `data.pagination = { totalElements, totalPages, size, number }` (`number` 0-indexed từ Spring, FE +1 để hiển thị). Bản nguồn liệt kê thêm field Spring Page (`first`, `last`). Khi mâu thuẫn cấu trúc response → ưu tiên `api-convention.md`; tài liệu này chỉ chuẩn hóa **hành vi UI + tham số request**.

**Empty state:** chưa tìm lần nào → "Nhập điều kiện tìm kiếm để bắt đầu" 🔍 · không kết quả → "Không tìm thấy dữ liệu phù hợp" 📭 · trống hoàn toàn → "Chưa có dữ liệu. Nhấn [+ Thêm mới] để bắt đầu" 📋 · lỗi tải → "Không thể tải dữ liệu. Vui lòng thử lại." ⚠️ + nút [Thử lại].

## 10. Điều kiện hiển thị / vô hiệu hóa nút

> Không ẩn nút đột ngột (luôn hiển thị nhưng có thể disable). Ngoại lệ: nút theo **quyền (Permission)** → user không có quyền thì **ẩn hẳn**. Khi disable phải có tooltip giải thích lý do. Loading → disable + spinner. Dirty form: nút Lưu enable khi có thay đổi.

| Điều kiện | Hành vi nút | Tooltip | Ví dụ |
|---|---|---|---|
| Không có quyền | **Ẩn** hoàn toàn | Không cần | Role VIEWER không thấy nút Xóa |
| Có quyền, sai trạng thái | **Disable** + tooltip | **Bắt buộc** | Nút Duyệt disable: "Bản ghi chưa được gửi kiểm soát" |
| Đang loading | Disable + spinner | Không cần | Sau click Lưu: "⟳ Đang lưu…" |
| Form chưa thay đổi | Disable (nút Lưu) | Có thể | "Chưa có thay đổi nào để lưu" |
| Form có lỗi validate | Disable submit | Không cần | Nút Gửi kiểm soát disable khi form còn lỗi |
| Chưa chọn item | Disable bulk action | Có thể | Nút Xóa hàng loạt disable khi chưa tick dòng |

## 11. Đặc tả nút theo màn hình

> Cột Event ID dùng `<MOD>` làm placeholder (thay bằng mã phân hệ thật khi implement). "Loại" = loại nút (§5). Thao tác nguy hiểm (Xóa/Từ chối/Hủy) **bắt buộc Dialog xác nhận**.

### 11.1 Màn hình danh sách — `<MOD>.LIST.*`

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện hiển thị | Hành vi |
|---|---|---|---|---|---|
| Tạo mới | `<MOD>.LIST.NEW_OPEN` | Ctrl+N | Primary | Có quyền CREATE | Mở form tạo mới (modal/navigate NEW) |
| Tìm kiếm | `<MOD>.LIST.SEARCH` | Ctrl+F | Primary | Luôn hiển thị | Tìm kiếm theo điều kiện; disable khi loading |
| Đặt lại | `<MOD>.LIST.RESET` | — | Default | Luôn hiển thị | Xóa điều kiện về mặc định, tải lại |
| Tìm kiếm nâng cao | `<MOD>.LIST.TOGGLE_ADVANCED` | — | Ghost | Luôn hiển thị | Mở/đóng vùng nâng cao; badge số filter |
| Làm mới | `<MOD>.LIST.REFRESH` | F5 | Default | Luôn hiển thị | Tải lại, giữ điều kiện hiện tại |
| Xuất Excel | `<MOD>.LIST.EXPORT_EXCEL` | — | Default | Có quyền EXPORT | Xuất kết quả đang hiển thị ra `.xlsx` |
| Xuất PDF | `<MOD>.LIST.EXPORT_PDF` | — | Default | Có quyền EXPORT | Xuất `.pdf`; confirm nếu > 1000 bản ghi |
| Nhập dữ liệu | `<MOD>.LIST.IMPORT_OPEN` | — | Default | Có quyền IMPORT | Mở modal import Excel; có template download |
| Xem chi tiết | `<MOD>.LIST.VIEW_OPEN` | — | Link | Luôn hiển thị | Navigate VIEW (click tên bản ghi cũng trigger) |
| Sửa | `<MOD>.LIST.EDIT_OPEN` | — | Ghost | Quyền EDIT + đúng trạng thái | Mở EDIT; disable nếu trạng thái không cho sửa |
| Xóa | `<MOD>.LIST.DELETE` | Delete | Danger | Quyền DELETE + đúng trạng thái | Confirm dialog trước; KHÔNG xóa ngay |
| Chọn tất cả | `<MOD>.LIST.SELECT_ALL` | Ctrl+A | Ghost | List có checkbox | Chọn tất cả trang hiện tại (click lần 2 = bỏ) |
| Xóa hàng loạt | `<MOD>.LIST.BULK_DELETE` | — | Danger | Đã chọn ≥1 + quyền DELETE | Confirm dialog kèm số lượng |
| Duyệt hàng loạt | `<MOD>.LIST.BULK_APPROVE` | — | Primary | Đã chọn ≥1 + quyền APPROVE | Confirm; chỉ duyệt bản ghi đủ điều kiện |
| In danh sách | `<MOD>.LIST.PRINT` | Ctrl+P | Default | Có quyền PRINT | Preview in danh sách theo filter hiện tại |

### 11.2 Màn hình xem chi tiết — `<MOD>.VIEW.*` (read-only)

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện hiển thị | Hành vi |
|---|---|---|---|---|---|
| Quay lại | `<MOD>.VIEW.BACK` | Backspace | Default | Luôn hiển thị | Về LIST / đóng modal |
| Sửa | `<MOD>.VIEW.EDIT_OPEN` | Ctrl+E | Primary | Quyền EDIT + đúng trạng thái | Chuyển EDIT; disable nếu không cho sửa |
| Xóa | `<MOD>.VIEW.DELETE` | Delete | Danger | Quyền DELETE + đúng trạng thái | Confirm; sau xóa redirect LIST |
| Sao chép | `<MOD>.VIEW.COPY` | — | Default | Quyền CREATE | Mở NEW với data fill sẵn |
| Gửi kiểm soát | `<MOD>.VIEW.SUBMIT` | Ctrl+Enter | Primary | Status DRAFT + quyền SUBMIT | Gửi để phê duyệt; confirm trước |
| Thu hồi | `<MOD>.VIEW.RECALL` | — | Warning | Status PENDING + quyền RECALL | Thu hồi về DRAFT; confirm trước |
| Phê duyệt | `<MOD>.VIEW.APPROVE` | Alt+A | Primary | Status PENDING + quyền APPROVE | Confirm; notify người tạo |
| Từ chối | `<MOD>.VIEW.REJECT` | Alt+R | Danger | Status PENDING + quyền APPROVE | Modal nhập lý do (bắt buộc) |
| Hủy bỏ | `<MOD>.VIEW.CANCEL` | — | Warning | Đúng trạng thái + quyền CANCEL | Hủy (không phải xóa); nhập lý do; không hoàn tác |
| Đính kèm file | `<MOD>.VIEW.ATTACH_OPEN` | — | Default | Luôn hiển thị | Mở panel đính kèm; hiện số file |
| In | `<MOD>.VIEW.PRINT` | Ctrl+P | Default | Quyền PRINT | Preview in theo mẫu |
| Xuất PDF | `<MOD>.VIEW.EXPORT_PDF` | — | Default | Quyền EXPORT | Xuất PDF theo mẫu in |
| Gửi email | `<MOD>.VIEW.SEND_EMAIL` | — | Default | Quyền SEND_EMAIL | Modal soạn email, tự điền từ bản ghi |
| Lịch sử | `<MOD>.VIEW.HISTORY_OPEN` | — | Ghost | Luôn hiển thị | Panel lịch sử thay đổi & workflow |

### 11.3 Form tạo mới — `<MOD>.NEW.*`

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện | Hành vi |
|---|---|---|---|---|---|
| Tạo mới (open) | `<MOD>.NEW.OPEN` | Ctrl+N | Primary | Trigger từ LIST | Mở form tạo mới |
| Lưu | `<MOD>.NEW.SAVE` | Ctrl+S | Primary | Form hợp lệ + quyền CREATE | Lưu ACTIVE/DRAFT tùy config; validate trước |
| Lưu nháp | `<MOD>.NEW.SAVE_DRAFT` | Ctrl+Shift+S | Default | Quyền CREATE | Lưu DRAFT; validate nhẹ (trường tối thiểu) |
| Gửi kiểm soát | `<MOD>.NEW.SUBMIT` | Ctrl+Enter | Primary | Form hợp lệ + quyền SUBMIT | Lưu + gửi duyệt 1 bước; validate đầy đủ |
| Hủy | `<MOD>.NEW.CANCEL` | Escape | Default | Luôn hiển thị | Có thay đổi → confirm "Bỏ thay đổi?"; về LIST |
| Đặt lại form | `<MOD>.NEW.RESET` | — | Default | Luôn hiển thị | Confirm; xóa data đã nhập về mặc định |
| Đính kèm file | `<MOD>.NEW.ATTACH_FILE` | — | Default | Luôn hiển thị | File picker; multi-file; validate định dạng+dung lượng |
| Xóa file đính kèm | `<MOD>.NEW.REMOVE_FILE` | — | Danger | File đã thêm | Xóa file khỏi form (chưa upload server) |
| Thêm dòng | `<MOD>.NEW.ADD_ROW` | — | Ghost | Form có bảng chi tiết | Thêm 1 dòng trống |
| Xóa dòng | `<MOD>.NEW.REMOVE_ROW` | — | Danger | Dòng tồn tại | Xóa dòng; confirm nếu có dữ liệu |
| Chọn từ danh sách | `<MOD>.NEW.LOOKUP_OPEN` | — | Ghost | Trường cần chọn từ DS | Modal tìm & chọn (khách hàng, NCC…) |

### 11.4 Form chỉnh sửa — `<MOD>.EDIT.*`

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện | Hành vi |
|---|---|---|---|---|---|
| Lưu | `<MOD>.EDIT.SAVE` | Ctrl+S | Primary | Form thay đổi hợp lệ + quyền EDIT | Lưu thay đổi; disable khi không đổi/loading |
| Lưu nháp | `<MOD>.EDIT.SAVE_DRAFT` | Ctrl+Shift+S | Default | Trạng thái cho DRAFT + quyền | Lưu nháp; validate tối thiểu |
| Gửi kiểm soát | `<MOD>.EDIT.SUBMIT` | Ctrl+Enter | Primary | Form hợp lệ + quyền SUBMIT | Lưu + gửi duyệt; validate đầy đủ |
| Hủy | `<MOD>.EDIT.CANCEL` | Escape | Default | Luôn hiển thị | Có thay đổi chưa lưu → confirm; về VIEW |
| Hoàn tác | `<MOD>.EDIT.UNDO` | Ctrl+Z | Default | Có thay đổi chưa lưu | Hoàn tác về trạng thái lúc mở form |
| Xóa | `<MOD>.EDIT.DELETE` | Delete | Danger | Quyền DELETE + đúng trạng thái | Confirm; sau xóa redirect LIST |
| Thêm dòng chi tiết | `<MOD>.EDIT.ADD_ROW` | — | Ghost | Form có bảng chi tiết | Thêm dòng mới |
| Xóa dòng chi tiết | `<MOD>.EDIT.REMOVE_ROW` | — | Danger | Dòng tồn tại | Xóa dòng; confirm nếu có dữ liệu quan trọng |
| Đính kèm file | `<MOD>.EDIT.ATTACH_FILE` | — | Default | Luôn hiển thị | Upload file mới; validate định dạng+kích thước |
| Xóa file | `<MOD>.EDIT.REMOVE_FILE` | — | Danger | File tồn tại | Confirm trước khi xóa file đã lưu server |
| Tải file | `<MOD>.EDIT.DOWNLOAD_FILE` | — | Link | File tồn tại | Tải file đính kèm về máy |

### 11.5 Form phê duyệt — `<MOD>.APPROVE.*`

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện | Hành vi |
|---|---|---|---|---|---|
| Phê duyệt | `<MOD>.APPROVE.APPROVE` | Alt+A | Primary | Status PENDING + quyền APPROVE | Confirm; notify người tạo; → APPROVED |
| Từ chối | `<MOD>.APPROVE.REJECT` | Alt+R | Danger | Status PENDING + quyền APPROVE | Modal nhập lý do (bắt buộc ≥10 ký tự); notify; → REJECTED |
| Yêu cầu bổ sung | `<MOD>.APPROVE.REQUEST_INFO` | — | Warning | Status PENDING + quyền APPROVE | Modal nhập nội dung; notify; → NEED_INFO |
| Chuyển duyệt | `<MOD>.APPROVE.REASSIGN` | — | Default | Quyền REASSIGN | Chọn người duyệt khác; confirm |
| Ủy quyền | `<MOD>.APPROVE.DELEGATE` | — | Default | Quyền DELEGATE | Ủy quyền cho người khác; nhập lý do + thời hạn |
| Xem lịch sử duyệt | `<MOD>.APPROVE.HISTORY` | — | Ghost | Luôn hiển thị | Timeline các bước duyệt |
| Quay lại | `<MOD>.APPROVE.BACK` | — | Default | Luôn hiển thị | Về LIST/trang trước, không phê duyệt |
| In phiếu duyệt | `<MOD>.APPROVE.PRINT` | Ctrl+P | Default | Quyền PRINT | In phiếu kèm chữ ký người duyệt |

### 11.6 Quản lý file đính kèm — `<MOD>.ATTACH.*`

| Tên nút | Event ID | Loại | Điều kiện | Hành vi |
|---|---|---|---|---|
| Tải lên file | `<MOD>.ATTACH.UPLOAD` | Primary | Quyền ATTACH | File picker; multi-select; validate định dạng+kích thước; progress bar |
| Tải xuống file | `<MOD>.ATTACH.DOWNLOAD` | Link | File tồn tại | Tải về máy; log audit download |
| Xem trước | `<MOD>.ATTACH.PREVIEW` | Ghost | File là image/PDF | Modal preview, không cần tải |
| Xóa file | `<MOD>.ATTACH.DELETE` | Danger | Quyền DELETE_ATTACH + file tồn tại | Confirm "Xóa file [tên]?"; xóa vĩnh viễn khỏi server |
| Đổi tên file | `<MOD>.ATTACH.RENAME` | Ghost | Quyền EDIT_ATTACH | Inline edit; Enter lưu, Esc hủy |
| Tải tất cả | `<MOD>.ATTACH.DOWNLOAD_ALL` | Default | Có ≥1 file + quyền ATTACH | Tải tất cả dạng `.zip`; progress |
| Tải template | `<MOD>.ATTACH.DOWNLOAD_TEMPLATE` | Ghost | Có template định nghĩa | Tải file mẫu để điền và upload lại |

### 11.7 Xác thực — `AUTH.*`

| Tên nút | Event ID | Phím tắt | Loại | Điều kiện | Hành vi |
|---|---|---|---|---|---|
| Đăng nhập | `AUTH.LOGIN.SUBMIT` | Enter | Primary | Form hợp lệ | Xác thực Keycloak SSO; loading; redirect trang chủ |
| Đăng xuất | `AUTH.LOGOUT` | — | Default | Đang đăng nhập | Confirm; xóa token; redirect login |
| Quên mật khẩu | `AUTH.LOGIN.FORGOT_PWD` | — | Link | Chưa đăng nhập | Sang form nhập email reset |
| Đổi mật khẩu | `AUTH.PROFILE.CHANGE_PWD` | — | Primary | Đang đăng nhập + form hợp lệ | Validate mật khẩu cũ; cập nhật mới; invalidate session khác |
| Cập nhật hồ sơ | `AUTH.PROFILE.SAVE` | Ctrl+S | Primary | Form hợp lệ + có thay đổi | Lưu thông tin cá nhân |
| Gia hạn phiên | `AUTH.SESSION.EXTEND` | — | Primary | Phiên sắp hết hạn (≤5 phút) | Hiện trong toast cảnh báo; gia hạn session |

## 12. Ma trận trạng thái – nút theo workflow

> ✅ = hiển thị & active · ⚙ = hiển thị nhưng disable · ❌ = ẩn hoàn toàn. Đây là ma trận điển hình; từng chức năng có thể bổ sung trạng thái/nút.

| Trạng thái | Loại | Sửa | Xóa | Gửi kiểm soát | Thu hồi | Phê duyệt | Từ chối | Hủy bỏ | Sao chép | In/Xuất |
|---|---|---|---|---|---|---|---|---|---|---|
| **DRAFT** (Nháp) | Giao dịch | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ⚙ |
| **CANCELLED** (Đã hủy) | Giao dịch | ❌ | ⚙ (Admin) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **NEED_INFO** (Cần bổ sung) | Giao dịch | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ⚙ |
| **COMPLETED** (Hoàn thành) | Giao dịch | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **PENDING** (Chờ duyệt) | Phê duyệt | ❌ | ❌ | ❌ | ✅ | ✅ (Người duyệt) | ✅ (Người duyệt) | ❌ | ❌ | ⚙ |
| **APPROVED** (Đã duyệt) | Phê duyệt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **REJECTED** (Từ chối) | Phê duyệt | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **PROCESSING** (Đang xử lý) | Phê duyệt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚙ | ❌ | ⚙ |

## 13. Quy tắc implement cho Developer

### 13.1 Đặt Event ID trong code Frontend

- **Khai báo tập trung, không hardcode:** mỗi Event ID khai báo 1 lần dưới dạng constant — **không** rải chuỗi string trong component. Vị trí file theo cấu trúc `frontend/coding-convention.md`: đặt trong module tương ứng (`modules/<domain>/`), hoặc `src/shared/` nếu dùng chung; tên file kebab-case (`*.constant.ts` / `*.type.ts`).
- Emit qua handler `onClick`; header `X-Event-ID` gắn tự động ở **Axios interceptor tập trung** (`core/interceptors/` — xem `frontend/security.md`). Bus sự kiện nội bộ dùng `EventBus` ở `core/services/`.
- QA dùng Event ID làm Test Case ID: `TC_PAYMENT.LIST.SEARCH_001`.

```ts
// vd: src/modules/payment/payment-events.constant.ts
export const PAYMENT_EVENTS = {
  LIST_SEARCH: 'PAYMENT.LIST.SEARCH',
  NEW_SAVE: 'PAYMENT.NEW.SAVE',
} as const;
// onClick={() => { trackEvent(PAYMENT_EVENTS.LIST_SEARCH); handleSearch(); }}
```

### 13.2 Checklist trước khi submit PR có nút mới

| # | Hạng mục | Bắt buộc? |
|---|---|---|
| 1 | Event ID đúng format `<MOD>.<SCREEN>.<ACTION>` | ✅ |
| 2 | Event ID khai báo tập trung dạng constant (vị trí theo `frontend/coding-convention.md`), không hardcode chuỗi | ✅ |
| 3 | Phím tắt đúng bảng chuẩn (§8), tooltip hiện phím tắt | ✅ |
| 4 | Loại nút (Primary/Default/Danger…) đúng quy tắc (§5) | ✅ |
| 5 | Nút có đủ trạng thái: normal, hover, loading, disabled | ✅ |
| 6 | Điều kiện hiển thị/disable đúng ma trận trạng thái (§12) | ✅ |
| 7 | Confirm dialog cho thao tác nguy hiểm (Xóa, Từ chối, Hủy) | ✅ |
| 8 | Nút disabled khi đang loading, không cho click lại | ✅ |
| 9 | Tooltip giải thích lý do khi nút bị disabled | ✅ |
| 10 | Text nút tiếng Việt, đúng tên theo đặc tả | ✅ |
| 11 | Icon nút đúng hành động (nếu có) | ⚙ Nên có |
| 12 | Vị trí nút đúng layout (§6: Hủy trái, Lưu phải) | ✅ |
| 13 | Audit log ghi đúng Event ID khi hành động thực hiện | ✅ |
| 14 | Keyboard shortcut hoạt động đúng, không xung đột | ✅ |
| 15 | Unit test cho logic hiển thị/disable nút | ⚙ Nên có |

## 14. MUST / NEVER

- **MUST** đặt Event ID theo `<MOD>.<SCREEN>.<ACTION>` (§1), duy nhất toàn hệ thống, khai báo tập trung dạng constant (vị trí theo `frontend/coding-convention.md`, không hardcode), gửi qua header `X-Event-ID`.
- **MUST** dùng đúng 6 loại nút Ant Design (§5); mỗi màn hình **đúng 1 Primary**; nút Danger **kèm Dialog xác nhận**.
- **MUST** đặt nút đúng vị trí (§6): nhóm chính căn phải cuối form, Danger tách sang trái.
- **MUST** áp dụng đúng size/typography/spacing/states theo Button Design Spec (§7); loading state khi gọi API để ngăn double submit.
- **MUST** tuân hành vi phân trang (§9) và điều kiện hiển thị/disable theo quyền + trạng thái (§10, §12).
- **MUST** qua **SA review** khi thêm `<MOD>`/`<SCREEN>`/`<ACTION>` hoặc màn hình mới trước khi implement.
- **NEVER** đổi tên Event ID đã phát hành (mã dùng xuyên suốt FE/BE audit/QA/analytics).
- **NEVER** xóa/ghi đè không hoàn tác mà không có Dialog xác nhận; **NEVER** dùng Toast cho lỗi nghiêm trọng cần đọc kỹ.
- **NEVER** nhầm Danger (không hoàn tác) với Warning (cảnh báo còn hủy được).
- **NEVER** ẩn nút bằng `display:none`/`visibility:hidden` hay override màu nút bằng CSS tùy chỉnh — dùng điều kiện render + prop chuẩn.
- **NEVER** thiết lập cấu trúc envelope response cạnh tranh với `api-convention.md` (xem §9).
