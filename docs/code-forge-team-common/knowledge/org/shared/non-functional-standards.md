# Non-Functional Standards (Org · Shared)

> [!NOTE]
> Quy ước **phi chức năng** (hiệu năng, độ tin cậy, khả năng vận hành) — áp dụng mọi project.
> **Living Document:** thêm mục mới khi đội gặp nhu cầu thật, mỗi mục ghi rõ phạm vi `[Chung]` / `[BE]` / `[FE]`.

---

## 1. Hiệu năng & Truy vấn · `[BE]`

### Nguyên tắc

- **Chi phí tăng theo lượng dữ liệu, không theo số dòng code.** Code chạy tốt trên 100 bản ghi có thể sập ở 100.000 — mọi API trả tập hợp phải có **chặn trên** ngay từ thiết kế, không viện "dữ liệu hiện còn ít".
- **Số lần gọi DB quan trọng hơn độ phức tạp một câu truy vấn.** Một truy vấn nặng vẫn tốt hơn 200 truy vấn nhẹ; số truy vấn phải là **hằng số**, không tăng theo số bản ghi — tăng theo N là lỗi thiết kế, không phải việc tinh chỉnh sau.
- **Lọc ở nơi có dữ liệu.** Đẩy filter / sort / aggregate xuống DB và chỉ lấy trường cần dùng; nạp về rồi lọc trong code là trả giá cho dữ liệu không dùng.
- **Đo trước khi tối ưu; không che khuyết điểm.** Tối ưu không có số liệu là phỏng đoán; cache, tăng tài nguyên hay tăng timeout không thay thế việc sửa truy vấn sai hoặc thiếu index.

### Quy định

**Phân trang**

- **MUST** phân trang mọi API trả danh sách, theo envelope `pagination` chuẩn của API Convention — không tự định nghĩa dạng khác; `size` do server chặn trên, client gửi lớn hơn thì ép về giới hạn.
- **MUST** sắp xếp tường minh — thiếu thứ tự ổn định thì dữ liệu giữa các trang có thể trùng hoặc mất.
- **NEVER** trả toàn bộ bảng cho UI. Xuất dữ liệu lớn (export/report) xử lý theo lô, không nạp hết vào bộ nhớ.

**Số lần gọi DB trong một API**

| Loại endpoint | Số truy vấn tối đa | Gồm |
|---|---|---|
| Đọc chi tiết một bản ghi | **3** | 1 bản ghi chính + tối đa 2 phụ trợ (quan hệ, dữ liệu tham chiếu) |
| Đọc danh sách (có phân trang) | **4** | 1 count + 1 data + tối đa 2 phụ trợ |
| Ghi (create / update / delete) | **6** | kiểm tra tồn tại + kiểm tra ràng buộc + lệnh ghi chính + phụ trợ (audit, quan hệ) |

- **MUST** bám ngưỡng ngay khi thiết kế và viết code. Đánh giá **không thể** đạt → **DỪNG tại thời điểm đó**, nêu nghiệp vụ nào buộc vượt · cách gộp đã thử · số truy vấn dự kiến, **chờ xác nhận mới viết tiếp**.
- **NEVER** tự vượt ngưỡng rồi giải trình sau khi code xong. Ngưỡng là baseline org — siết/nới qua MR vào tài liệu này, không quyết lẻ lúc code.
- **MUST** đếm số truy vấn thực tế bằng log SQL khi chạy thật, trước khi coi endpoint là xong — không suy luận từ code.
- **NEVER** gọi DB trong vòng lặp (kể cả gián tiếp qua getter lazy) và **NEVER** truy vấn lại dữ liệu đã nạp trong cùng request — gộp theo danh sách khóa, nạp một lần rồi truyền tiếp giá trị.

**Truy vấn**

- **MUST** nạp sẵn quan hệ cần dùng trong một truy vấn (fetch join / entity graph) và chỉ lấy trường cần dùng (projection / DTO) — tránh lazy-load lặp lại và nạp vô ích cột `CLOB`/`BLOB`.
- **MUST** ghi/cập nhật nhiều bản ghi theo lô, không mỗi bản ghi một lệnh.

**Index**

- **MUST** đảm bảo cột dùng để filter / sort / join trong truy vấn danh sách có index — thiếu thì bổ sung cùng thay đổi, qua migration có kiểm soát, không chạy tay trên môi trường.
- Index có chi phí ghi — nêu lý do khi thêm index mới.

**Ranh giới request đồng bộ**

- **NEVER** thực hiện tác vụ dài (gọi hệ thống ngoài nhiều lần, xử lý file lớn, tính toán toàn bộ dữ liệu) bên trong request đồng bộ của người dùng — tách sang bất đồng bộ / batch.
- **NEVER** giữ transaction mở trong lúc chờ I/O ngoài (HTTP, file, queue).
