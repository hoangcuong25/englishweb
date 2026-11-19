# Báo Cáo Gateway Review SRS — Phân Hệ FR-12: Quản Lý Blog & Media Cloudinary

> **Dự án**: Teacher Dong Academy – Nền tảng đào tạo trực tuyến chuẩn EdTech  
> **Đối tượng rà soát**: `docs/SRS.md`, `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` (Mục 3.12: Quản lý Blog & Media Cloudinary)  
> **Bộ checklist áp dụng**: Solution Architect Gateway Review Checklist v2.1 (Phân hệ Quản lý nội dung học viện)  
> **Loại SRS**: CRUD có giao diện (Phụ lục A) & Inbound RESTful API (Phụ lục B)  
> **Ngày thực hiện**: 19/11/2026  

---

## BẢNG CHÚ GIẢI ICON (GATEWAY REVIEW STANDARDS)

| Icon | Tên | Nghĩa với Đội ngũ Phát triển & Nghiệp vụ |
|:---:|---|---|
| ✅ | **ĐẠT** | SRS đã nêu rõ ràng, SA có đầy đủ thông tin để tiến hành thiết kế kỹ thuật. Không cần làm rõ thêm. |
| ✅ | **ĐẠT THEO CHUẨN ORG** | SRS không nhắc lại nhưng tổ chức đã có chuẩn chung áp dụng mặc định (chuẩn nút, mã lỗi, bảo mật, responsive). |
| ❌ | **CHƯA ĐẠT** | SRS thiếu, mơ hồ, mâu thuẫn hoặc còn để ngỏ. Nếu thuộc câu Chặn=Y thì SA không tiếp nhận cho đến khi được bổ sung. |
| ➖ | **N/A** | Chức năng không phát sinh nghiệp vụ liên quan đến câu hỏi này (kèm lý do cụ thể). |
| ❓ | **CHƯA KIỂM** | Chưa đủ tài liệu đầu vào để kiểm chứng. |

---

## KẾT LUẬN GATEWAY REVIEW

> **KẾT LUẬN CHÍNH THỨC: SA TIẾP NHẬN THIẾT KẾ VÀ TRIỂN KHAI**  
> - **100% các câu hỏi thuộc cột Chặn=Y** đều đạt trạng thái ✅ ĐẠT hoặc ➖ N/A.
> - Toàn bộ 17 kịch bản kiểm thử tích hợp E2E (`server/test/blogs.e2e-spec.ts`) đã được thực thi và **PASS 100%**.
> - Tài liệu đặc tả `docs/SRS.md` và `docs/Teacher_Dong_Academy_Chi_Tiet_Dac_Ta.md` đã được đồng bộ chuẩn xác với cấu trúc monorepo và mã nguồn thực tế.

---

## PHẦN A. CORE CHECKLIST (ĐÁNH GIÁ MỤC 0 ĐẾN MỤC 8)

### Mục 0. Hiểu Yêu Cầu
*Vì sao SA cần thông tin này:* Để nắm rõ mục đích giải quyết vấn đề gì, phục vụ ai và ngữ cảnh kích hoạt trước khi đi sâu vào chi tiết kỹ thuật.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **M0.1** | Mục đích nghiệp vụ: Chức năng giải quyết vấn đề gì, vì sao cần làm? | Y | ✅ ĐẠT | `docs/SRS.md` mục FR-12 & `Chi_Tiet_Dac_Ta.md` mục 3.12: Cung cấp kho tài liệu bài viết chuyên sâu về kỹ năng IELTS (Writing, Speaking, R&L), phương pháp học và tin tức học viện, nâng cao khả năng tiếp cận và SEO cho học viện. |
| **M0.2** | Người dùng: Ai thực hiện và ai chịu ảnh hưởng bởi kết quả? | N | ✅ ĐẠT | Phân quyền 2 vai trò nghiêm ngặt: `ADMIN` (giảng viên kiêm quản trị viên soạn thảo, quản trị) và `STUDENT`/`GUEST` (học viên, khách vãng lai đọc bài viết). |
| **M0.3** | Thời điểm: Sự kiện nào kích hoạt việc dùng chức năng, tần suất? | Y | ✅ ĐẠT | Admin đăng tải bài viết định kỳ; Học viên tra cứu theo nhu cầu học tập 24/7. |
| **M0.4** | Kịch bản sử dụng cụ thể đi hết luồng (đầu vào, kết quả mong đợi)? | Y | ✅ ĐẠT | Có kịch bản hoàn chỉnh: Admin soạn thảo $\rightarrow$ Tải ảnh/video Cloudinary $\rightarrow$ Live Preview $\rightarrow$ Xuất bản $\rightarrow$ Học viên đọc bài $\rightarrow$ Tự động tăng lượt đọc (+1 viewCount). |

---

### Mục 1. Ranh Giới & Tích Hợp Hệ Thống
*Vì sao SA cần thông tin này:* Xác định phạm vi dữ liệu nội bộ và các dịch vụ bên thứ ba để thiết kế adapter và cơ chế dự phòng.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **1.1** | Ranh giới dữ liệu và quyền sở hữu thực thể? | Y | ✅ ĐẠT | Thực thể `BlogPost` lưu trữ tại MySQL qua Prisma ORM, thuộc phân hệ `server/src/modules/blogs`. |
| **1.2** | Tích hợp dịch vụ lưu trữ ngoài (Cloudinary)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Tích hợp qua `CloudinaryService` tại `core/cloudinary`. Ảnh bìa lưu tại `teacher_dong_academy/blogs/covers`, video lưu tại `teacher_dong_academy/blogs/videos`. |
| **1.3** | Cơ chế giải phóng tài nguyên khi xóa bài viết? | Y | ✅ ĐẠT | Tự động gọi `cloudinaryService.deleteAsset()` xóa ảnh và video trên Cloudinary khi Admin xóa bài viết (`DELETE /api/blogs/:id`). |
| **1.4** | Tích hợp bộ đệm hiệu năng (Caching)? | N | ✅ ĐẠT THEO CHUẨN ORG | Áp dụng `RedisService` bộ nhớ đệm danh sách blog, tự động xóa cache pattern `cache:blogs:*` khi có hành động thêm/sửa/xóa. |

---

### Mục 2. Dữ Liệu & Từ Điển Thực Thể
*Vì sao SA cần thông tin này:* Để thiết kế bảng MySQL, Migration Prisma và Validation DTOs không bị thiếu trường hoặc sai kiểu dữ liệu.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **2.1** | Từ điển dữ liệu chi tiết cho từng trường? | Y | ✅ ĐẠT | Bảng từ điển dữ liệu mục 3.12 đầy đủ 16 trường: `id`, `title`, `slug`, `summary`, `content`, `coverImage`, `videoUrl`, `category`, `tags`, `status`, `isFeatured`, `viewCount`, `authorId`, `publishedAt`, `createdAt`, `updatedAt`. |
| **2.2** | Ràng buộc độ dài và tính duy nhất (Uniqueness)? | Y | ✅ ĐẠT | `title` (3-255 ký tự), `content` (tối thiểu 10 ký tự), `slug` là UNIQUE và tuân thủ định dạng kebab-case. |
| **2.3** | Quy tắc sinh giá trị tự động (Auto-generation)? | Y | ✅ ĐẠT | Slug tự động tạo từ title bằng thuật toán chuyển đổi tiếng Việt có dấu sang không dấu (`tieng-viet-khong-dau-kebab-case`) nếu người dùng không nhập slug tùy chỉnh. |
| **2.4** | Định dạng giá trị mặc định (Defaults)? | N | ✅ ĐẠT | `status = DRAFT`, `isFeatured = false`, `viewCount = 0`. |

---

### Mục 3. Bảo Mật & Phân Quyền (RBAC)
*Vì sao SA cần thông tin này:* Đảm bảo tuân thủ nghiêm ngặt nguyên tắc 2 vai trò (`STUDENT` và `ADMIN`), ngăn chặn rò rỉ bản thảo chưa phát hành.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **3.1** | Kiểm soát quyền truy cập theo vai trò (RBAC)? | Y | ✅ ĐẠT | Sử dụng `JwtAuthGuard` và `RolesGuard` với decorator `@Roles(Role.ADMIN)` cho các thao tác `POST`, `PUT`, `DELETE`, `Upload Cover`, `Upload Video`. |
| **3.2** | Bảo vệ bài viết bản nháp (DRAFT protection)? | Y | ✅ ĐẠT | Khách vãng lai và `STUDENT` bị chặn (trả về 404 Not Found) khi cố tình truy cập bài viết có `status = DRAFT` hoặc `ARCHIVED`. |
| **3.3** | Cơ chế nhận diện người dùng tùy chọn (Optional Auth)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Sử dụng `OptionalJwtAuthGuard` trên các endpoint đọc (`GET /api/blogs` và `GET /api/blogs/:slugOrId`), cho phép người dùng ẩn danh đọc bài công khai, đồng thời nhận diện được Admin để hiển thị bản nháp. |

---

### Mục 4. Luồng Xử Lý & Vòng Đời Trạng Thái
*Vì sao SA cần thông tin này:* Xây dựng State Machine rõ ràng cho bài viết.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **4.1** | Vòng đời trạng thái bài viết (State Machine)? | Y | ✅ ĐẠT | `DRAFT` $\rightarrow$ `PUBLISHED` (tự động cập nhật `publishedAt = now()`) $\rightarrow$ `ARCHIVED`. |
| **4.2** | Cơ chế tăng lượt đọc (viewCount)? | Y | ✅ ĐẠT | Tự động tăng +1 lượt đọc trong MySQL Prisma (`viewCount: { increment: 1 }`) mỗi khi có request đọc chi tiết bài viết hợp lệ. |

---

### Mục 5. Phi Chức Năng & Hiển Thị Di Động
*Vì sao SA cần thông tin này:* Tránh lỗi tràn giao diện (horizontal blowout) và đảm bảo tốc độ phản hồi.

| Mã | Câu hỏi checklist | Chặn? | Trạng thái | Căn cứ & Ghi chú đối chiếu |
|:---:|---|:---:|:---:|---|
| **5.1** | Tương thích thiết bị di động (Responsive / iPhone 16)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Đã tối ưu Navbar fit hoàn hảo trên iPhone 16 (393px): ẩn phụ đề dài, co giãn tiêu đề bằng `truncate`, nút vai trò nhỏ gọn, khóa tràn chiều ngang bằng `overflow-x-hidden w-full max-w-full`. |
| **5.2** | Hiệu năng phân trang (Pagination)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Hỗ trợ tham số `page` và `limit` (giới hạn tối đa 100 bài/lần tải), phân trang chuẩn SQL `skip` / `take`. |

---

## PHẦN B. ĐỐI CHIẾU PHỤ LỤC THEO LOẠI CHỨC NĂNG

### Phụ Lục A: CRUD Có Giao Diện (Admin Portal & Public Portal)

| Mã | Nội dung kiểm tra | Chặn? | Trạng thái | Đánh giá thực tế |
|:---:|---|:---:|:---:|---|
| **A1.1** | Chống bấm đúp (Double-click prevention)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Form Admin quản lý Blog sử dụng state `isSubmitting = true`, vô hiệu hóa nút đăng và hiển thị icon xoay Loader. |
| **A1.2** | Trạng thái rỗng (Empty State)? | Y | ✅ ĐẠT THEO CHUẨN ORG | Khi không có bài viết phù hợp với bộ lọc/tìm kiếm, hiển thị màn hình Empty State thân thiện kèm nút "Xem tất cả bài viết". |
| **A1.3** | Bộ phân tích cú pháp Markdown AST? | Y | ✅ ĐẠT | Client tích hợp parser AST thông minh, tự động xử lý ảnh ngắt dòng `![alt]\n(url)`, tiêu đề H2-H4, Blockquote, Danh sách và Code inline. |
| **A1.4** | Bố cục hiển thị cổng thông tin bài viết? | Y | ✅ ĐẠT | Thiết kế 2 cột chuẩn báo điện tử: Cột trái (8/12) hiển thị bài mới nhất trên cùng và các bài tiếp theo; Cột phải (4/12) hiển thị danh sách bài xem nhiều có gạch chân xanh. |

---

### Phụ Lục B: Inbound RESTful API Contract

| Mã | Endpoint & Hợp đồng API | Chặn? | Trạng thái | Đánh giá kiểm thử E2E |
|:---:|---|:---:|:---:|---|
| **B.1** | `POST /api/blogs` | Y | ✅ ĐẠT | 201 Created (Admin) / 400 Bad Request (Thiếu trường) / 403 Forbidden (Học viên). |
| **B.2** | `GET /api/blogs` | Y | ✅ ĐẠT | 200 OK, lọc theo `category`, `search`, phân trang `items` và `total`. |
| **B.3** | `GET /api/blogs/:slugOrId` | Y | ✅ ĐẠT | 200 OK, tự động tăng `viewCount` +1, chặn 404 với bản nháp đối với khách. |
| **B.4** | `PUT /api/blogs/:id` | Y | ✅ ĐẠT | 200 OK (Admin cập nhật nội dung, thăng cấp DRAFT $\rightarrow$ PUBLISHED) / 403 (Học viên). |
| **B.5** | `DELETE /api/blogs/:id` | Y | ✅ ĐẠT | 200 OK (Admin xóa bài) / 403 (Học viên) / 404 sau khi đã xóa. |

---

## BẢNG TỔNG HỢP KẾT QUẢ CHECKLIST THEO MỤC

| Nhóm Tiêu Chí Checklist | Tổng số câu | ✅ ĐẠT | ✅ THEO CHUẨN ORG | ❌ CHƯA ĐẠT (Chặn=Y) | ❌ CHƯA ĐẠT (Chặn=N) | ➖ N/A | ❓ CHƯA KIỂM |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Mục 0. Hiểu yêu cầu** | 4 | 4 | 0 | 0 | 0 | 0 | 0 |
| **Mục 1. Ranh giới & Tích hợp** | 4 | 2 | 2 | 0 | 0 | 0 | 0 |
| **Mục 2. Dữ liệu & Thực thể** | 4 | 4 | 0 | 0 | 0 | 0 | 0 |
| **Mục 3. Bảo mật & Phân quyền** | 3 | 2 | 1 | 0 | 0 | 0 | 0 |
| **Mục 4. Luồng & Vòng đời** | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| **Mục 5. Phi chức năng & Mobile** | 2 | 0 | 2 | 0 | 0 | 0 | 0 |
| **Phụ lục A. CRUD Giao diện** | 4 | 2 | 2 | 0 | 0 | 0 | 0 |
| **Phụ lục B. Inbound REST API** | 5 | 5 | 0 | 0 | 0 | 0 | 0 |
| **TỔNG CỘNG** | **28** | **21** | **7** | **0** | **0** | **0** | **0** |

---

## KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (TEST SUITE EXECUTION)

```bash
PASS test/blogs.e2e-spec.ts (12.128 s)
  Blog & Media Content Management E2E Suite (FR-12)
    1. POST /api/blogs - Create Blog Post
      √ should fail with 401 if unauthenticated (24 ms)
      √ should fail with 403 if authenticated as STUDENT (19 ms)
      √ should fail with 400 if required fields are missing (24 ms)
      √ should allow ADMIN to create a PUBLISHED blog post (20 ms)
      √ should allow ADMIN to create a DRAFT blog post (15 ms)
    2. GET /api/blogs - List Blog Posts
      √ should return published posts for public guest/student (13 ms)
      √ should filter posts by category (12 ms)
      √ should filter posts by search query keyword (12 ms)
      √ should allow ADMIN to view draft posts by query status=DRAFT (11 ms)
    3. GET /api/blogs/:slugOrId - View Blog Detail & Increment ViewCount
      √ should view published post by slug and auto-increment viewCount (17 ms)
      √ should return 404 when public student requests non-existent post (8 ms)
      √ should return 404 when public student attempts to read DRAFT post (8 ms)
      √ should allow ADMIN to read DRAFT post (8 ms)
    4. PUT /api/blogs/:id - Update Blog Post
      √ should fail with 403 if STUDENT attempts to update (10 ms)
      √ should allow ADMIN to update blog content and promote DRAFT to PUBLISHED (20 ms)
    5. DELETE /api/blogs/:id - Delete Blog Post
      √ should fail with 403 if STUDENT attempts to delete (10 ms)
      √ should allow ADMIN to delete blog post (18 ms)

Test Suites: 4 passed, 4 total
Tests:       214 passed, 214 total
Snapshots:   0 total
Time:        24.138 s
```
