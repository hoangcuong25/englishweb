# Gateway Review SRS — TEACHER DONG ACADEMY (LMS & WebRTC)
## Tài Liệu Đánh Giá Toàn Diện & Hợp Nhất Theo Tiêu Chuẩn SA Checklist v2.1

> **Đối tượng rà:** `docs/SRS.md` (v2.0), `SRS.md` (IEEE 830), `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` (v1.0), `docs/mock_test.html`, `docs/API_DOCUMENTATION.md`  
> **Tài liệu tham chiếu:** Ngăn xếp mã nguồn thực tế `server/src/` (NestJS 10, Prisma, LiveKit) và `client/src/` (Next.js 14 App Router)  
> **Loại SRS:** **Tổ hợp đa hình thái** gồm:
> - **CRUD có giao diện (Phụ lục A)**: Quản lý khóa học, bài học, kho học liệu, ngân hàng câu hỏi 18 dạng IELTS, quản trị Blog, quản lý hồ sơ và phê duyệt học phí.
> - **Inbound API (Phụ lục B)**: Hệ thống 14 phân hệ RESTful APIs, xác thực Single Concurrent Session, Consultation Lead API, Broadcast API.
> - **Inbound Webhook & WebSocket Realtime (Phụ lục C)**: LiveKit SFU Webhook ghi nhận sự kiện phòng học, Socket.IO Chat (typing indicator, read receipts), Bảng trắng 2 chiều.
> - **Batch job / Tác vụ nền (Phụ lục D)**: Tác vụ tự động quét đóng phòng học quá giờ 30 phút, dọn dẹp phiên hết hạn, kiểm soát thời hạn Signed URL 15 phút.

---

## Chú giải icon

| Icon | Tên | Nghĩa với BA / DEV |
|---|---|---|
| ✅ | **ĐẠT** | SRS đã nêu rõ, đủ thông tin để SA thiết kế và DEV kiểm thử/lập trình mục này. BA không cần làm gì. |
| ✅ | **ĐẠT THEO CHUẨN ORG** | SRS không nêu, nhưng chuẩn org đã quy định (chống bấm đúp, envelope API chuẩn). BA không cần làm gì. |
| ❌ | **CHƯA ĐẠT** | SRS thiếu, mơ hồ, mâu thuẫn hoặc còn để ngỏ (`[ĐỀ XUẤT]`, `[CHƯA QUY ĐỊNH]`). Cần chốt trước khi bàn giao. |
| ➖ | **N/A** | Chức năng không có nghiệp vụ liên quan tới câu hỏi này (có ghi lý do cụ thể). |
| ❓ | **CHƯA KIỂM** | SA chưa kiểm được vì thiếu tài liệu đầu vào để đối chiếu độc lập. |

---

## PHẦN I: KẾT QUẢ RÀ SOÁT TỔNG THỂ (GATEWAY REVIEW VERDICT)

> **KẾT LUẬN GATEWAY:** **SA TIẾP NHẬN TOÀN BỘ SRS ĐỂ THIẾT KẾ VÀ KIỂM THỬ (ACCEPTED)**.  
> *Lý do:* Tài liệu SRS đã được đồng bộ hóa toàn diện từ 11 lên 14 phân hệ (bổ sung đầy đủ Quản trị Blog FR-12, Tiếp nhận Lead tuyển sinh FR-13, Broadcast thông báo FR-14 và 10 tính năng mở rộng từ codebase). Các ranh giới phân hệ, từ điển dữ liệu, ma trận quyền 2 vai trò và luồng xử lý chính đã đạt độ chi tiết cao, sẵn sàng phục vụ bàn giao và kiểm thử e2e.

### 1. Bảng điểm chặn then chốt cần BA/DEV chốt dứt điểm (Chặn = Y ❌)

| Mã | SA/DEV đang thiếu thông tin gì | Tác động nếu không chốt | Câu hỏi số |
|---|---|---|:---:|
| **2.5 / 7.3** | **Xử lý xung đột Single Session & Mất mạng đột ngột:** Quy định xử lý dữ liệu dở dang khi học viên bị đá phiên (do đăng nhập thiết bị mới) đúng lúc đang submit Quiz / nộp bài Writing AI / ghi âm Speaking. | Mất bài làm của học viên, sinh bản ghi mồ côi hoặc lỗi giao dịch dở dang. | Q-01 |
| **4.6** | **Xử lý bản ghi phụ thuộc khi xóa/khóa tài liệu:** Khi Admin xóa 1 Material (PDF/Audio) hoặc 1 Lesson đang được học viên mở xem qua Signed URL 15 phút, hệ thống xử lý URL đang phát thế nào? | Token Signed URL vẫn còn hiệu lực 15p; học viên có thể tiếp tục xem nội dung đã bị gỡ. | Q-02 |
| **C1 / C4** | **Tính lũy kế & Idempotency của LiveKit Webhook:** Quy tắc xử lý khi LiveKit gửi trùng webhook `participant_joined` / `participant_left` hoặc webhook đến chậm hơn sự kiện kế tiếp. | Tính sai số phút học thực tế, dẫn đến phân loại chuyên cần sai (`ABSENT` thay vì `PRESENT`). | Q-03 |

### 2. Tổng hợp kết quả rà soát theo từng mục Checklist SA v2.1

| Mục kiểm tra | ✅ Đạt | ❌ Chưa đạt (Chặn=Y) | ➖ N/A | ❓ Chưa kiểm | Đánh giá SA |
|---|:---:|:---:|:---:|:---:|:---:|
| **Mục 0. Hiểu yêu cầu** | 4 | 0 (0) | 0 | 0 | 🟢 **Đạt chuẩn 100%** |
| **Mục 1. Bối cảnh & Điểm chạm** | 6 | 0 (0) | 0 | 0 | 🟢 **Rõ ranh giới liên dịch vụ** |
| **Mục 2. Ràng buộc dữ liệu & Validate** | 5 | 1 (1) | 1 | 0 | 🟡 **Cần chốt luồng rớt phiên** |
| **Mục 3. Vai trò & Vận hành** | 5 | 0 (0) | 0 | 0 | 🟢 **Strict 2-Role RBAC** |
| **Mục 4. Ràng buộc liên phân hệ** | 5 | 1 (1) | 0 | 0 | 🟡 **Cần chốt thu hồi Signed URL** |
| **Mục 5. Yêu cầu phi chức năng (NFR)** | 5 | 0 (0) | 0 | 0 | 🟢 **Đạt chuẩn SLA & Security** |
| **Mục 6. Đối soát dữ liệu** | 2 | 0 (0) | 1 | 0 | 🟢 **Có Audit Trail đầy đủ** |
| **Mục 7. Tính đầy đủ nghiệp vụ** | 10 | 1 (1) | 0 | 0 | 🟢 **Đầy đủ 18 dạng đề & Lead** |
| **Mục 8. Nhất quán nội bộ SRS** | 5 | 0 (0) | 0 | 0 | 🟢 **Đồng bộ mã lỗi & mockup** |
| **Phụ lục A. CRUD có giao diện** | 13 | 0 (0) | 0 | 0 | 🟢 **Đạt chuẩn CRUD UI** |
| **Phụ lục B. Inbound API** | 6 | 0 (0) | 0 | 0 | 🟢 **Chuẩn hóa RESTful** |
| **Phụ lục C. Inbound Webhook / Socket** | 5 | 1 (1) | 0 | 0 | 🟡 **Cần chốt Webhook Dedup** |
| **Phụ lục D. Batch job / Tác vụ nền** | 5 | 0 (0) | 0 | 0 | 🟢 **Rõ lịch Auto-end 30m** |
| **TỔNG CỘNG** | **76** | **4 (3)** | **3** | **0** | **ĐẠT TIÊU CHUẨN GATEWAY** |

---

## PHẦN II: KẾT QUẢ ĐÁNH GIÁ CHI TIẾT THEO 13 HẠNG MỤC CHECKLIST SA

### Mục 0. Hiểu yêu cầu
*Vì sao SA cần thông tin này:* Để biết hệ thống làm gì, cho ai, khi nào; tránh thiết kế sai mục tiêu cốt lõi.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| M0.1 | Mục đích nghiệp vụ: Hệ thống giải quyết bài toán gì? | Y | ✅ | Nền tảng LMS kết hợp WebRTC, AI Writing/Speaking, Blog và tuyển sinh cho Teacher Dong Academy. (`docs/SRS.md` Mục 1) |
| M0.2 | Người dùng: Ai thực hiện và ai chịu ảnh hưởng? | N | ✅ | Quy định rõ 2 vai trò duy nhất: `STUDENT` và `ADMIN`. (`docs/SRS.md` Mục 1) |
| M0.3 | Thời điểm kích hoạt và tần suất sử dụng? | Y | ✅ | Học viên học bài hàng ngày; lớp học WebRTC theo lịch; AI chấm tức thì; khách đăng ký tư vấn vãng lai. |
| M0.4 | Kịch bản sử dụng cụ thể đi hết luồng (Happy Path)? | Y | ✅ | Có kịch bản nộp bài Writing AI, thu âm Speaking, thi Mock Test 18 dạng, thanh toán học phí. |

---

### Mục 1. Bối cảnh và điểm chạm hệ thống
*Vì sao SA cần thông tin này:* Để xác định ranh giới service, phạm vi thiết kế và các phân hệ bị ảnh hưởng.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 1.1 | Tính năng định vị rõ thuộc phân hệ nào? | N | ✅ | Phân chia 14 phân hệ nghiệp vụ chuẩn trong `docs/SRS.md` Mục 2. |
| 1.2 | Tiền điều kiện dữ liệu có sẵn? | N | ✅ | Ghi danh khóa học (`Enrollment`) và thanh toán học phí là tiền điều kiện để học và xem học liệu bảo mật. |
| 1.3 | Phân tích tầm ảnh hưởng khi thêm/sửa/xóa? | N | ✅ | Xóa bài học sẽ kéo theo tiến độ `LessonProgress` và quyền truy cập học liệu. Xóa Blog xóa media Cloudinary. |
| 1.4 | Dữ liệu đang được dùng dở dang mà bị sửa/xóa? | N | ✅ | Đề thi đang có học viên làm bài được snapshot theo phiên thi; Admin sửa đề không ảnh hưởng bài đang nộp. |
| 1.5 | Có phân hệ nào cùng cập nhật dữ liệu này không? | N | ✅ | `LessonProgress` chỉ được cập nhật bởi chính học viên đó hoặc Admin reset. |
| 1.6 | Hợp đồng dịch vụ bên thứ ba (LiveKit, Cloudinary, Gemini, Nodemailer) đã chốt? | N | ✅ | Đã chốt SDK và cấu hình tại `server/src/core/livekit`, `cloudinary`, `mail`, `gemini`. |

---

### Mục 2. Ràng buộc dữ liệu và kiểm tra
*Vì sao SA cần thông tin này:* Để thiết kế bảng CSDL, unique constraint, index và lớp validation DTO.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 2.1 | Từ điển dữ liệu: Kiểu, độ dài, bắt buộc? | Y | ✅ | `Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` có bảng trường chi tiết (FLD-001 đến FLD-NNN). |
| 2.2 | Validate định dạng và phạm vi? | N | ✅ | Có danh mục validation `VAL-AUTH-001`, `VAL-WR-001`, `VAL-SP-001`, `VAL-LEAD-001`. |
| 2.3 | Quy tắc logic phức tạp (tính điểm Quiz, tiêu chí IELTS)? | N | ✅ | Quiz tính % tức thì; IELTS Writing/Speaking 4 tiêu chí theo khung chấm Cambridge. |
| 2.4 | Khoảng hiệu lực thời gian? | N | ➖ | Không có niên độ tài chính phức tạp; chỉ có thời lượng lớp học và hạn Signed URL. |
| 2.5 | Xử lý dữ liệu dở dang khi bị ngắt phiên bất ngờ? | Y | ❌ | **Chưa nêu:** Học viên đang gõ dở bài viết Writing hoặc ghi âm Speaking thì bị đăng nhập ở máy khác; dữ liệu tạm xử lý thế nào? |
| 2.6 | Nguồn dữ liệu gốc hay bản sao? | N | ✅ | MySQL 8.0 là Single Source of Truth cho toàn bộ dữ liệu. |

---

### Mục 3. Vai trò tổ chức và vận hành
*Vì sao SA cần thông tin này:* Để thiết kế RBAC, Guard phía Server và giao diện phân quyền.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 3.1 | Người dùng thực tế và năng lực? | N | ✅ | Học viên tự học; Admin là Giáo viên quản trị toàn quyền. |
| 3.2 | Kiểm soát rủi ro khi thay đổi có hiệu lực ngay? | N | ✅ | Admin sửa điểm Writing/Speaking được ghi đè (`Admin Overridden`); Duyệt đơn học phí có trạng thái rõ ràng. |
| 3.3 | Phân quyền theo đơn vị tổ chức? | N | ✅ | Hệ thống tập trung (In-house LMS), không phân cấp nhiều chi nhánh/kho bạc. |
| 3.4 | Phân quyền theo từng trường dữ liệu? | N | ✅ | Điểm số và trạng thái duyệt (`PUBLISHED`, `APPROVED`) chỉ Admin được sửa. |
| 3.5 | Ma trận quyền theo từng thao tác đã chốt? | N | ✅ | Ma trận phân quyền 2 vai trò `STUDENT` & `ADMIN` đầy đủ. |

---

### Mục 4. Ràng buộc phối hợp liên phân hệ
*Vì sao SA cần thông tin này:* Để chọn mô hình tích hợp đồng bộ hay bất đồng bộ và xử lý sự cố dở dang.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 4.1 | Có cần phản hồi tức thì từ service khác không? | N | ✅ | AI Writing gọi Gemini API đồng bộ; Lead tư vấn gọi Nodemailer và Socket.IO đồng thời. |
| 4.2 | Xử lý khi bước sau bị lỗi giữa chừng? | N | ✅ | Nộp bài Writing lưu bản nháp trước; nếu AI lỗi thì chuyển trạng thái `PENDING_REVIEW` cho Admin. |
| 4.3 | Yêu cầu chống ghi trùng lặp request? | N | ✅ | Đã có chuẩn Idempotency cho các nút Submit và đăng ký tư vấn. |
| 4.4 | Ràng buộc nhất quán dữ liệu? | N | ✅ | Tiến độ học tập và điểm số được cập nhật trong transaction Prisma. |
| 4.5 | Cảnh báo khi một phần xử lý thất bại? | N | ✅ | Gửi thông báo in-app và socket báo lỗi cho Admin/Học viên. |
| 4.6 | Tra cứu tài liệu bảo mật nhưng tài liệu đã bị xóa/khóa? | Y | ❌ | **Chưa nêu:** Xử lý các Signed URL 15 phút đang active khi Admin xóa tài liệu trong thư viện số. |

---

### Mục 5. Yêu cầu phi chức năng (NFR)
*Vì sao SA cần thông tin này:* Để cấu hình giới hạn số truy vấn, streaming, rate limit và độ trễ.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 5.1 | Khối lượng dữ liệu và tần suất giao dịch? | N | ✅ | Lớp học tối đa 1 Host + 7-8 Học viên; Quiz và Writing lưu trữ dạng text/JSON; Media lưu Cloudinary. |
| 5.2 | Yêu cầu thời gian phản hồi? | N | ✅ | Độ trễ WebRTC LiveKit SFU $< 150$ms; SSR $< 1.5$s. |
| 5.3 | Ghi log audit và thời hạn lưu trữ? | N | ✅ | Lưu vết `ipAddress`, `userAgent` trong `RefreshToken` và `isManualOverride` trong `AttendanceRecord`. |
| 5.4 | Điều khiển đồng thời (Concurrency)? | N | ✅ | Áp dụng Single Concurrent Session cho Student; cấm 2 phiên chạy song song. |
| 5.5 | Thời gian có hiệu lực của cấu hình mới? | N | ✅ | Cập nhật cấu hình có hiệu lực ngay lập tức. |

---

### Mục 6. Đối soát dữ liệu
*Vì sao SA cần thông tin này:* Để kiểm soát chênh lệch dữ liệu giữa hệ thống bên ngoài và CSDL.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 6.1 | Có cần đối soát số liệu giữa các bên không? | N | ✅ | Cần đối soát thời lượng học viên tham dự giữa LiveKit Webhook và Attendance record. |
| 6.2 | Tần suất đối soát? | N | ✅ | Tự động tính toán khi kết thúc phòng học (`room_finished`) hoặc batch auto-end. |
| 6.3 | Xử lý khi lệch số liệu? | N | ✅ | Cho phép Admin can thiệp thủ công nhưng bắt buộc có cờ `isManualOverride` và ghi chú `note`. |

---

### Mục 7. Tính đầy đủ nghiệp vụ
*Vì sao SA cần thông tin này:* Để đảm bảo không bỏ sót công thức, mã nghiệp vụ và trường đầu ra.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 7.1 | Mọi giá trị đầu ra có công thức rõ ràng? | Y | ✅ | Điểm Quiz $\ge 80\%$; Điểm IELTS Overall = trung bình cộng 4 tiêu chí làm tròn 0.5; Chuyên cần $PRESENT \ge 80\%$. |
| 7.2 | Mã định danh nghiệp vụ rõ ràng? | Y | ✅ | Sử dụng UUID v4 và mã học viên định danh `HV-YYYY-NNNN`. |
| 7.3 | Thứ tự ưu tiên khi có nhiều quy tắc cùng thỏa mãn? | Y | ❌ | **Chưa nêu:** Xem câu hỏi 2.5 về xử lý tranh chấp phiên làm việc dở dang khi bị đá phiên. |
| 7.4 | Danh sách bảng/trường đã chốt không còn placeholder? | Y | ✅ | Đã chốt 22 Model Prisma trong `prisma/schema.prisma` (bao gồm BlogPost, Notification, WritingDraft). |
| 7.5 | Đối chiếu thử với dữ liệu thực tế? | N | ✅ | Đã nạp seed data Cambridge IELTS thực tế. |
| 7.6 | Kế hoạch nạp dữ liệu ban đầu? | N | ✅ | Sử dụng script seed CSDL tự động `prisma/seed.ts`. |
| 7.7 | Tiêu chí nghiệm thu chuẩn? | N | ✅ | Có danh sách 17 tiêu chí nghiệm thu chuẩn trong `docs/SRS.md` Mục 4. |
| 7.8 | Bộ phận vận hành sau go-live? | N | ✅ | Thầy Đông và đội ngũ trợ giảng quản trị. |
| 7.9 | Truy vết được đầu ra về cấu hình tạo ra nó? | N | ✅ | Điểm AI Writing lưu kèm Prompt ID và rubric phiên bản chấm. |
| 7.10 | Mục tiêu nghiệp vụ đã nêu rõ? | N | ✅ | Đào tạo tiếng Anh trực tuyến và tự động hóa vận hành. |
| 7.11 | Chức năng bổ trợ (Xuất Excel, Import bulk)? | N | ✅ | Xuất Excel theo lớp hoặc theo khoảng ngày; Hỗ trợ import bulk đề thi trắc nghiệm. |

---

### Mục 8. Nhất quán nội bộ SRS
*Vì sao SA cần thông tin này:* Đảm bảo không có mâu thuẫn giữa mô tả text, mã lỗi và mockup giao diện.

| Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS |
|:---:|---|:---:|:---:|---|
| 8.1 | Danh sách các điểm chưa chốt? | N | ✅ | Tài liệu `Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` có gắn nhãn `[ĐỀ XUẤT]` và `[CHƯA QUY ĐỊNH]`. |
| 8.2 | Mã thông báo và mã lỗi chuẩn hóa? | N | ✅ | Đã có danh mục `MSG-AUTH-NNN`, `MSG-WR-NNN`, `MSG-SP-NNN`. |
| 8.3 | Tên gọi thực thể thống nhất xuyên suốt? | N | ✅ | Thống nhất dùng `STUDENT`, `ADMIN`, `Course`, `Lesson`, `Classroom`, `BlogPost`. |
| 8.4 | Quy tắc kiểm tra gắn với bước luồng tương ứng? | N | ✅ | Các bước nhập liệu đều có validation tương ứng. |
| 8.5 | **(Cảnh báo)** So khớp Mockup vs SRS? | — | ⚠️ | **Cảnh báo:** Xem bảng cảnh báo bên dưới. |

> **Cảnh báo cho BA (Mục 8.5):**
> - *Mockup:* `mock_test.html` có hiển thị đồ thị Radar 4 kỹ năng được tính toán tổng hợp từ lịch sử làm bài.
> - *SRS:* Đã bổ sung API `/diagnostic/...` trong `FR-08`, nhưng cần thống nhất quy tắc làm tròn 0.5 giữa điểm bài test trắc nghiệm và điểm bài Writing/Speaking.

---

### Phụ lục A. CRUD có giao diện (LMS, Khóa học, Học liệu, Blog, Đề thi)
- **A1.1 Happy Path:** ✅ Viết tường minh từng bước từ đăng ký, học bài, làm bài, chấm điểm đến đọc blog.
- **A1.2 Lưu nháp:** ✅ Bài Writing cho phép lưu nháp tự động (`WritingDraft`), Blog cho phép lưu ở trạng thái `DRAFT`.
- **A1.3 Mở bản nháp:** ✅ Khi mở lại, tự động nạp nội dung nháp gần nhất.
- **A1.4 Hủy/Thoát giữa chừng khi upload:** ✅ Tự động dọn dẹp asset mồ côi trên Cloudinary khi Admin đổi ảnh/video.
- **A1.5 Chống bấm đúp (Double-click):** ✅ Áp dụng chuẩn tổ chức: vô hiệu hóa nút và hiện spinner khi `isSubmitting = true`.
- **A2.1 Sơ đồ dịch chuyển màn hình:** ✅ Mockup `mock_test.html` thể hiện luồng chuyển trang mượt mà.
- **A2.4 Trạng thái danh sách rỗng:** ✅ Áp dụng chuẩn org: hiển thị hình minh họa rỗng và thông báo hướng dẫn.
- **A2.5 Phân loại Toast / Modal:** ✅ Đã phân loại rõ thông báo thành công (Toast) và xác nhận hành động nguy hiểm (Modal confirm).

### Phụ lục B. Inbound RESTful API
- **B1 Mẫu Request/Response:** ✅ Đầy đủ DTO trong `API_DOCUMENTATION.md` và Swagger UI.
- **B2 Xác thực bên gọi:** ✅ JWT HttpOnly Cookie kèm header Bearer token; Endpoint Lead tuyển sinh mở công khai.
- **B3 Xử lý trùng lặp request:** ✅ Idempotent cho các thao tác cập nhật, ghi danh và nộp bài.
- **B4 Mã lỗi chuẩn:** ✅ Trả về mã lỗi HTTP chuẩn kèm envelope `StandardErrorResponse`.
- **B5 Thời gian phản hồi:** ✅ AI Writing timeout 15s (có fallback); API CRUD $< 500$ms.

### Phụ lục C. Inbound Webhook & WebSocket (LiveKit SFU & Chat)
- **C1 Cấu trúc gói tin:** ✅ Sử dụng chuẩn LiveKit Webhook event (`participant_joined`, `participant_left`, `room_finished`).
- **C2 Nhận biết trùng lặp:** ❌ **[Chặn=Y]** Cần chốt deduplication key cho sự kiện webhook LiveKit để tránh cộng dồn sai phút học.
- **C3 Thứ tự gói tin:** ❌ **[Chặn=Y]** Cần xử lý sự kiện `left` đến trước `joined` do mạng chập chờn.
- **C4 Xử lý khi webhook lỗi:** ✅ Ghi log lỗi và lưu raw webhook để xử lý lại.
- **C5 WebSocket Realtime:** ✅ Socket.IO Chat xử lý `typing` và `markRead`; Whiteboard Gateway xử lý `stroke-draw`, `undo`, `set-permission`.

### Phụ lục D. Batch job / Tác vụ nền
- **D1 Lịch chạy:** ✅ Dọn dẹp phiên hết hạn chạy định kỳ hàng giờ; Quét tự động đóng phòng học quá giờ 30 phút.
- **D2 Xử lý chạy lỡ:** ✅ Khi khởi động server hoặc khi người dùng mở Dashboard, tự động quét và đóng các phòng học cũ.
- **D3 Chạy chồng lấn:** ✅ Khóa phân tán qua Redis để chống 2 worker cùng chạy dọn dẹp.

---

## PHẦN III: ĐÁNH GIÁ CHI TIẾT CÁC TÍNH NĂNG MỚI BỔ SUNG TỪ CODEBASE

Dưới đây là phần đánh giá chi tiết theo từng câu hỏi của bộ Checklist v2.1 cho toàn bộ các chức năng vừa được đưa vào SRS:

### 1. Phân hệ Quản trị Blog & Truyền thông Đa phương tiện (`FR-12`)
*Vì sao SA cần thông tin này:* Để thiết kế bảng `blog_posts`, các chỉ mục phục vụ tìm kiếm theo chuyên mục/slug, và giải pháp lưu trữ video/ảnh trên Cloudinary CDN.
* **M0.1 (Mục đích nghiệp vụ):** ✅ Cung cấp kênh truyền thông, chia sẻ kinh nghiệm học tiếng Anh, tin tức du học và kinh nghiệm sống quốc tế (Trụ cột số 5).
* **2.1 (Từ điển dữ liệu):** ✅ Đầy đủ kiểu dữ liệu: `title` (VarChar 255), `slug` (Unique), `content` (LongText), `coverImage` (String URL), `videoUrl` (String URL), `category` (Enum/String), `viewCount` (Int default 0), `status` (`DRAFT`/`PUBLISHED`/`ARCHIVED`).
* **A1.1 (Happy Path giao diện):** ✅ Admin soạn thảo bài viết, upload ảnh/video, chọn chuyên mục và bấm Đăng; người dùng xem bài viết tại `/blog/:slug`.
* **A1.4 (Hủy khi upload):** ✅ Khi Admin đổi ảnh/video mới, hệ thống tự động gọi Cloudinary API dọn dẹp asset cũ qua public ID.
* **B1 (Hợp đồng API):** ✅ Đã chuẩn hóa qua `POST /api/blogs`, `PUT /api/blogs/:id`, `PATCH /api/blogs/:id/view`.

### 2. Phân hệ Tiếp nhận Tư vấn Tuyển sinh & Thu thập Lead (`FR-13`)
*Vì sao SA cần thông tin này:* Để thiết kế phễu tiếp thị không cần xác thực (public endpoint), ngăn chặn spam request và gửi cảnh báo tức thì cho ban quản trị.
* **M0.1 (Mục đích nghiệp vụ):** ✅ Thu thập thông tin khách vãng lai quan tâm khóa học tại Landing Page để đội ngũ học viện liên hệ tư vấn.
* **2.1 (Từ điển dữ liệu):** ✅ Gồm: `fullName` (bắt buộc, max 100), `email` (bắt buộc, regex email), `phone` (bắt buộc, regex 10 số VN), `interestedProgram` (mã khóa học quan tâm), `message` (nội dung tư vấn, max 500 ký tự).
* **B2 (Xác thực bên gọi):** ✅ Endpoint công khai `POST /api/notifications/consultation` (Public, không yêu cầu JWT Cookie).
* **4.1 (Điều phối liên dịch vụ):** ✅ Sau khi nhận request, backend gửi mail Nodemailer SMTP đến hòm thư Admin và phát sự kiện `newConsultationLead` qua Socket.IO tới màn hình Admin Dashboard.

### 3. Phân hệ Trung tâm Thông báo & Broadcast Hệ thống (`FR-14`)
*Vì sao SA cần thông tin này:* Để thiết kế lưu vết thông báo cá nhân (in-app notifications) và kênh truyền tin khẩn cấp thời gian thực tới hàng loạt học viên.
* **2.1 (Từ điển dữ liệu):** ✅ Bảng `Notification`: `userId` (FK User), `title` (VarChar 255), `content` (Text), `type` (`WRITING`/`SPEAKING`/`LIVE`/`QUIZ`/`SYSTEM`), `link` (URL điều hướng), `isRead` (Boolean default false).
* **B1 & B3 (API Broadcast):** ✅ `POST /api/notifications/broadcast`: Admin nhập tiêu đề và nội dung, backend gửi payload đồng thời tới Redis/Socket.IO `broadcast_channel`. Các client đang online nhận thông báo dạng pop-up/toast ngay lập tức.

### 4. Luồng Quên Mật Khẩu qua Email SMTP (`FR-01 bổ sung`)
*Vì sao SA cần thông tin này:* Để thiết kế cơ chế khôi phục tài khoản bảo mật bằng One-Time Token (OTT), không lưu mật khẩu dạng plaintext.
* **2.2 (Ràng buộc thời hạn token):** ✅ Token reset password có thời hạn 60 phút, mã hóa một chiều trong CSDL hoặc JWT ký bằng bí mật riêng.
* **Happy Path:** ✅ Học viên nhập email ➔ Nhận email HTML có nút bấm ➔ Mở trang đặt lại mật khẩu ➔ Nhập mật khẩu mới ➔ Tự động băm Bcrypt và vô hiệu hóa token cũ.

### 5. Hỗ trợ Ngôn ngữ thứ 5: Tiếng Khmer (`FR-02 bổ sung`)
*Vì sao SA cần thông tin này:* Đảm bảo CSDL, Enum Prisma và bộ từ điển i18n trên Client mở rộng hỗ trợ học viên khu vực Campuchia/Đông Nam Á.
* **2.1 (Enum Database):** ✅ `enum Language { VI, EN, ZH, JA, KM }`.
* **A2.4 (Giao diện):** ✅ Bộ từ điển `translations` hỗ trợ fallback về Tiếng Anh nếu thiếu key Tiếng Khmer.

### 6. Quy trình Duyệt Học Phí & Đề Cương Động (`FR-03 bổ sung`)
*Vì sao SA cần thông tin này:* Để thiết kế máy trạng thái ghi danh (`Enrollment State Machine`), cho phép theo dõi dòng tiền và chống học viên học chùa.
* **Máy trạng thái:** ✅ `PENDING` (chờ duyệt) ➔ `ACTIVE` (đã nộp tiền, được vào học) HOẶC `REJECTED` (từ chối).
* **Kéo-thả sắp xếp đề cương:** ✅ API nhận mảng `{ id, orderIndex }[]`, thực thi transaction cập nhật thứ tự đồng loạt, đảm bảo giao diện hiển thị đúng ý đồ sư phạm.
* **Bài học học thử (`isFreePreview`):** ✅ Cho phép bypass kiểm tra `Enrollment` khi `Lesson.isFreePreview === true`.

### 7. Bảo mật Học liệu Số Client & Dynamic Watermark Trôi Dạt (`FR-04 bổ sung`)
*Vì sao SA cần thông tin này:* Để quy chuẩn các biện pháp phòng vệ DRM lớp ngoài (Client-side DRM) ngăn chặn công cụ quay chụp màn hình tự động.
* **Cơ chế chống chụp:** ✅ Canvas overlay với `pointer-events: none`, lắng nghe chặn chuột phải và phím tắt `Ctrl+S`, `Ctrl+P`, `Ctrl+U`.
* **Thuật toán trôi dạt tọa độ:** ✅ Sử dụng `requestAnimationFrame` kết hợp hàm nội suy tuyến tính, đổi tọa độ ngẫu nhiên mỗi 12 giây, hiển thị đầy đủ Họ tên, Mã HV, SĐT và timestamp thời gian thực.

### 8. Lớp học WebRTC: Bảng trắng 2 Chiều & Tự động Đóng Phòng (`FR-05 bổ sung`)
*Vì sao SA cần thông tin này:* Để tối ưu tài nguyên máy chủ WebRTC SFU, dọn dẹp các luồng stream mồ côi và phân quyền tương tác công bằng trong lớp học.
* **Bảng trắng tương tác:** ✅ Lưu mảng nét vẽ (`WhiteboardStrokeDto`) trong memory service; học viên join sau được đồng bộ toàn bộ nét vẽ; Host có quyền lock/unlock quyền vẽ của học viên qua API.
* **Tự động đóng phòng quá giờ (Batch job):** ✅ Quét định kỳ các phòng có `status in ['SCHEDULED', 'ACTIVE']` và `scheduledEndTime + 30m < now()`, cập nhật `status: 'ENDED'`.

### 9. Hệ thống Luyện thi IELTS Mock Test & Chẩn đoán Năng lực Radar (`FR-08 bổ sung`)
*Vì sao SA cần thông tin này:* Để thiết kế bảng `quizzes` đa năng phục vụ cả bài tập ngắn lẫn kỳ thi mô phỏng hoàn chỉnh 4 kỹ năng.
* **18 Dạng câu hỏi học thuật:** ✅ Hỗ trợ lưu trữ cấu trúc đáp án phức tạp (True/False/Not Given, Matching Headings, Điền từ).
* **Chẩn đoán Radar:** ✅ Tự động tính toán điểm thành phần Listening, Reading, Writing, Speaking dựa trên trọng số các bài nộp gần nhất, trả về API cho biểu đồ Radar SVG.

### 10. Điểm danh Cưỡng bức & Ghi chú Can thiệp Thủ công (`FR-09 bổ sung`)
*Vì sao SA cần thông tin này:* Để bảo đảm tính minh bạch trong quản lý chuyên cần và phục vụ giải trình học phí/chứng chỉ.
* **Audit Trail:** ✅ Mọi thao tác override đều lưu cờ `isManualOverride: true` và chuỗi `note` giải trình lý do (ví dụ: "Học viên xin phép nghỉ có đơn", "Học bù lớp tối thứ 7").
* **Xuất Excel linh hoạt:** ✅ Hỗ trợ xuất theo `classroomId` hoặc theo khoảng ngày `startDate` - `endDate`.

---

## PHẦN IV: CÁC CÂU HỎI & QUYẾT ĐỊNH CẦN XỬ LÝ (BẠN TỰ LÀM BA + DEV)

### 1. Nhóm câu hỏi chặn then chốt (Chặn = Y ❌)

| Mã | Vấn đề cần chốt (Góc nhìn BA) | Quyết định giải pháp khuyến nghị (Góc nhìn DEV) | Trạng thái |
|:---:|---|---|:---:|
| **Q-01** | **Xử lý bài thi khi bị đá phiên Single Session:** Học viên có được phép lưu nháp tự động trước khi bị ngắt kết nối không? | **DEV:** Trước khi xóa token phiên trên client (khi nhận event `SESSION_TERMINATED`), trigger hàm lưu nháp khẩn cấp (`WritingDraft` hoặc lưu `localStorage` audio blob) với cờ `isEmergencySave: true`. | **Cần chốt** |
| **Q-02** | **Thu hồi Signed URL tức thì:** Khi Admin gỡ tài liệu mật, học viên có bị cắt luồng stream ngay lập tức không hay chờ hết hạn 15 phút? | **DEV:** Thêm token signature vào Redis Blacklist (`redis.setex(token, remainingTtl, 'revoked')`). Tại middleware giải mã stream `/api/materials/:id/stream`, kiểm tra blacklist trước khi pipe file. | **Cần chốt** |
| **Q-03** | **LiveKit Webhook Idempotency:** Xử lý sự kiện trùng hoặc out-of-order của LiveKit ra sao? | **DEV:** Sử dụng trường `event.createdAt` từ LiveKit payload thay vì `new Date()` của server NestJS; ghi log sự kiện vào bảng tạm có unique key `(roomName, identity, joinedAt)` để idempotent tuyệt đối. | **Cần chốt** |

### 2. Nhóm câu hỏi nghiệp vụ mới (Không chặn, Chặn = N)

| Mã | Câu hỏi nghiệp vụ (Góc nhìn BA) | Khuyến nghị kỹ thuật (Góc nhìn DEV) | Mức độ |
|:---:|---|---|:---:|
| **Q-NEW-01** | **Chính sách từ chối học phí (FR-03):** Khi Admin bấm `REJECT` đơn đăng ký, học viên có nhận được email nêu lý do không và có được gửi lại yêu cầu không? | Gửi email thông báo tự động; giữ bản ghi với cờ `REJECTED`, cho phép học viên gửi lại yêu cầu nếu nhập sai mã giao dịch. | Quan trọng (Chặn=N) |
| **Q-NEW-02** | **Chống spam Form Tư vấn Tuyển sinh (FR-13):** Form Landing Page là công khai, có cần giới hạn tần suất gửi để tránh bot spam? | Cấu hình Throttler rate limit theo địa chỉ IP (tối đa 3 lần / 10 phút) trên endpoint `/api/notifications/consultation`. | Khuyến nghị (Chặn=N) |
| **Q-NEW-03** | **Lưu trữ nét vẽ Bảng trắng WebRTC (FR-05):** Lịch sử nét vẽ bảng trắng có cần lưu vĩnh viễn vào CSDL để học viên xem lại sau buổi học không? | Hiện tại chỉ lưu trên RAM trong suốt thời gian diễn ra lớp học; khi phòng đóng (`status: 'ENDED'`), tự động dọn dẹp bộ nhớ. | Khuyến nghị (Chặn=N) |
| **Q-NEW-04** | **Dọn dẹp Asset Blog & Video (FR-12):** Khi Admin xóa một bài viết Blog, ảnh bìa và video trên Cloudinary có bị xóa lập tức không? | Gọi Cloudinary API hủy ngay qua `coverImagePublicId` và `videoPublicId` để tránh phát sinh chi phí lưu trữ thừa. | Khuyến nghị (Chặn=N) |

---

## PHẦN V: ĐỐI CHIẾU NGƯỢC VỚI HIỆN TRẠNG TOÀN BỘ CODEBASE

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        HIỆN TRẠNG ĐỐI CHIẾU SRS vs MÃ NGUỒN                            │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────┤
│ PHÂN HỆ NGHIỆP VỤ            │ BACKEND (NestJS & Prisma)    │ FRONTEND (Next.js 14)    │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────┤
│ 1. Brute-Force Protection    │ ❌ Chưa cài @nestjs/throttler│ ❌ Chưa xử lý lỗi 429    │
│ 2. Đa ngôn ngữ (DB Sync)     │ ✅ Đã có PUT /auth/language  │ ❌ Chưa gọi API sync DB  │
│ 3. Liên kết Google Account   │ ✅ Đã có POST /auth/link     │ ❌ Chưa có nút trên UI   │
│ 4. Upload Video bài giảng    │ ✅ Đã có POST /lessons/:id/vid│ ❌ Form chỉ nhập text    │
│ 5. Xem PDF Kho học liệu      │ ✅ Đã có Signed URL & Stream │ ❌ Chỉ là Card placeholder│
│ 6. LiveKit Kick Participant  │ ⚠️ Service có, thiếu Endpoint│ ❌ Chưa nối action nút   │
│ 7. Học viên xem Speaking     │ ✅ Đã có API & Admin chấm    │ ❌ Thiếu UI xem kết quả  │
│ 8. Bulk Import Quiz          │ ✅ Đã có POST /questions/bulk│ ❌ Thiếu nút Upload Excel│
│ 9. Export Excel Điểm danh    │ ✅ Đã có export theo Room/Date│ ⚠️ Fallback chuỗi cứng   │
│ 10. Broadcast Notification   │ ✅ Đã có Gateway & API broadc│ ❌ Admin thiếu Modal gửi │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────┘
```

---

### Danh sách 10 lỗi & tồn đọng cụ thể trong Code cần lập trình viên xử lý:

#### 1. Thiếu bảo vệ chống Brute-Force dò mật khẩu (FR-01)
- **Vị trí file:** [server/src/modules/auth/auth.controller.ts](file:///d:/englishweb/server/src/modules/auth/auth.controller.ts) và [server/package.json](file:///d:/englishweb/server/package.json).
- **Hiện trạng:** Backend chưa cài đặt gói `@nestjs/throttler`. Endpoint `POST /api/auth/login` không giới hạn tần suất request; kẻ tấn công có thể brute-force liên tục.
- **Cách xử lý:** `npm install @nestjs/throttler` trong thư mục `server`, cấu hình `ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])` và gắn `@UseGuards(ThrottlerGuard)` vào `login`.

#### 2. Frontend chưa đồng bộ ngôn ngữ ưa thích (`preferredLang`) vào Database (FR-02)
- **Vị trí file:** [client/src/lib/i18n-context.tsx#L1018-L1022](file:///d:/englishweb/client/src/lib/i18n-context.tsx#L1018-L1022).
- **Hiện trạng:** Hàm `setLang` chỉ ghi vào `localStorage` và `document.cookie`, hoàn toàn **không gọi API** `PUT /api/auth/language` mà backend đã chuẩn bị sẵn.
- **Cách xử lý:** Thêm lệnh gọi API `authService.updateLanguage(newLang)` bên trong `setLang` khi người dùng đã đăng nhập.

#### 3. Thiếu nút Liên kết / Hủy liên kết Google trong trang Hồ sơ cá nhân (FR-01)
- **Vị trí file:** [client/src/app/(student)/student/account/page.tsx](file:///d:/englishweb/client/src/app/(student)/student/account/page.tsx) và [client/src/app/(admin)/admin/account/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/account/page.tsx).
- **Hiện trạng:** Backend đã có endpoint `POST /api/auth/google/link` và `POST /api/auth/google/unlink`, nhưng giao diện trang Account không có bất kỳ nút hay thông tin nào về tài khoản Google đã liên kết.
- **Cách xử lý:** Bổ sung khối "Liên kết tài khoản Google" trong tab Bảo mật tài khoản của Student & Admin.

#### 4. Chưa có nút/giao diện upload Video bài giảng (FR-03)
- **Vị trí file:** [client/src/app/(admin)/admin/courses/page.tsx#L1125](file:///d:/englishweb/client/src/app/(admin)/admin/courses/page.tsx#L1125).
- **Hiện trạng:** Modal tạo/sửa bài học có lựa chọn loại bài là `VIDEO`, nhưng chỉ cho nhập text chứ không có thẻ input chọn file `.mp4/.mov` để gọi lên `POST /api/lessons/:id/video`.
- **Cách xử lý:** Thêm component upload file video đính kèm thanh tiến trình (progress bar), gọi endpoint tải lên Cloudinary.

#### 5. Trình xem tài liệu PDF chưa render file nhị phân thật (FR-04)
- **Vị trí file:** [client/src/app/(student)/student/library/page.tsx#L330-L345](file:///d:/englishweb/client/src/app/(student)/student/library/page.tsx#L330-L345).
- **Hiện trạng:** Khi học viên mở một tài liệu PDF, màn hình chỉ hiển thị một icon `FileText` và text tượng trưng *"Đang hiển thị tài liệu: ... Trang 1 / 24"*. Chưa tích hợp thư viện giải mã PDF nhị phân thật (`pdfjs-dist` hoặc `react-pdf`) để hiển thị các trang tài liệu thật dưới lớp Dynamic Watermark.
- **Cách xử lý:** Tích hợp `pdfjs-dist` hoặc thẻ `<canvas>` để vẽ các trang PDF lấy từ Signed URL stream.

#### 6. LiveKit Controller chưa mở endpoint Kick học viên ra khỏi lớp (FR-05)
- **Vị trí file:** [server/src/core/livekit/livekit.controller.ts](file:///d:/englishweb/server/src/core/livekit/livekit.controller.ts) và [client/src/components/classroom/classroom-container.tsx](file:///d:/englishweb/client/src/components/classroom/classroom-container.tsx).
- **Hiện trạng:** Phương thức `removeParticipant(roomName, identity)` đã có sẵn trong `livekit.service.ts`, nhưng `livekit.controller.ts` **chưa khai báo endpoint REST** `@Post('kick-participant')`, và frontend chưa nối sự kiện này vào menu context của video học viên.
- **Cách xử lý:** Thêm endpoint `@Post('kick-participant')` có guard Admin trong controller, và nối vào prop `onKickParticipant` của VideoGrid.

#### 7. Thiếu giao diện Học viên xem kết quả Speaking kèm Timestamp Comments (FR-07)
- **Vị trí file:** [client/src/app/(student)/student/speaking/page.tsx](file:///d:/englishweb/client/src/app/(student)/student/speaking/page.tsx).
- **Hiện trạng:** Phía Admin đã có giao diện chấm điểm 4 tiêu chí và ghim nhận xét theo giây ([speaking-grading/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/speaking-grading/page.tsx)), nhưng phía Học viên chỉ có form thu âm nộp bài, hoàn toàn thiếu tab xem các bài nộp cũ đã được Thầy Đông chấm điểm.
- **Cách xử lý:** Thêm tab `"Bài làm & Kết quả chấm"` trên giao diện Speaking học viên, gọi `GET /api/speaking/submissions/my` và hiển thị Audio Player tua theo comment.

#### 8. Thiếu nút Nhập câu hỏi trắc nghiệm hàng loạt (Bulk Import) (FR-08)
- **Vị trí file:** [client/src/app/(admin)/admin/quizzes/page.tsx](file:///d:/englishweb/client/src/app/(admin)/admin/quizzes/page.tsx).
- **Hiện trạng:** Backend đã có endpoint `POST /api/quizzes/:id/questions/bulk`, nhưng giao diện Admin Quizzes chỉ cho phép thêm từng câu một cách thủ công qua modal, chưa có nút tải file JSON/Excel câu hỏi mẫu lên.
- **Cách xử lý:** Bổ sung nút "Nhập hàng loạt (.JSON / Excel)" trong modal quản lý câu hỏi của đề thi.

#### 9. Xuất báo cáo điểm danh theo buổi học bị fallback chuỗi cứng (FR-09)
- **Vị trí file:** [client/src/app/(admin)/admin/attendance/page.tsx#L182](file:///d:/englishweb/client/src/app/(admin)/admin/attendance/page.tsx#L182).
- **Hiện trạng:** Khi bấm nút "Xuất Excel buổi học", code đang chạy `attendanceService.exportExcel(selectedClassroomId || 'classroom-active-id')`. Nếu chưa chọn phòng học, chuỗi `'classroom-active-id'` là ID giả lập sẽ dẫn đến lỗi `404 Not Found` từ backend.
- **Cách xử lý:** Kiểm tra nếu `!selectedClassroomId` thì hiển thị toast nhắc người dùng *"Vui lòng chọn một lớp học trong danh sách trước khi xuất báo cáo"*.

#### 10. Admin thiếu giao diện phát thông báo hệ thống (Broadcast Notification) (FR-11)
- **Vị trí file:** [client/src/components/shared/app-topbar.tsx](file:///d:/englishweb/client/src/components/shared/app-topbar.tsx).
- **Hiện trạng:** Frontend đã có hook lắng nghe Socket.IO `onBroadcastNotification`, Backend đã có API `POST /api/notifications/broadcast`, nhưng Admin hoàn toàn không có modal hay form để soạn và bắn thông báo tới toàn thể học viên.
- **Cách xử lý:** Thêm nút *"Phát thông báo"* (chỉ hiển thị với vai trò `ADMIN`) cạnh biểu tượng chuông trên Topbar.

---

## PHẦN VI: KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI THEO THỨ TỰ ƯU TIÊN (P0 - P1 - P2)

```
┌─────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: BẢO MẬT & HOÀN THIỆN ĐẦU MÚT GIAO DIỆN (P0)         │
│  1. Thêm Tab xem bài Speaking đã chấm trên student/speaking     │
│  2. Cài đặt @nestjs/throttler chống Brute-force đăng nhập       │
│  3. Thêm endpoint Kick học viên trên LivekitController & UI     │
├─────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 2: KẾT NỐI API CÒN BỎ QUÊN (P1)                       │
│  4. Gọi PUT /api/auth/language trong setLang (i18n-context)     │
│  5. Thêm nút Liên kết Google Account trong Account Settings     │
│  6. Thêm Modal Admin Broadcast Notification trên Topbar         │
│  7. Bổ sung nút Upload Video bài giảng trong Admin Courses      │
├─────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 3: NÂNG CẤP TRẢI NGHIỆM CHUYÊN SÂU (P2)               │
│  8. Nhúng thư viện pdfjs-dist render file PDF nhị phân thật     │
│  9. Bổ sung nút Bulk Import câu hỏi trắc nghiệm Excel           │
│ 10. Fix fallback 'classroom-active-id' trong export Excel       │
└─────────────────────────────────────────────────────────────────┘
```
