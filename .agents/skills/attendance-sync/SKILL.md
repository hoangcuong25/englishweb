---
name: attendance-sync
description: >-
  Kỹ năng tự động tính toán và đồng bộ dữ liệu điểm danh qua LiveKit Webhook, phân loại PRESENT/LATE/ABSENT và xuất báo cáo Excel (.xlsx).
---

# Attendance Sync & Reporting Skill

## 1. Công Thức & Quy Tắc Xác Định Chuyên Cần
Khi nhận webhook `participant_left` từ LiveKit SFU:
- Tính tổng số phút tham gia: `totalMinutes = round((leftAt - joinedAt) / 60000)`.
- **PRESENT (Có mặt)**:
  - Học viên tham gia phòng trong vòng **15 phút đầu tiên** kể từ giờ bắt đầu buổi học.
  - VÀ tổng thời gian tham gia đạt ít nhất **80% thời lượng buổi học**.
- **LATE (Đi muộn)**:
  - Học viên tham gia sau 15 phút đầu tiên của buổi học.
- **ABSENT (Vắng mặt)**:
  - Không tham gia phòng học HOẶC thời gian tham gia **dưới 30% thời lượng buổi học**.

## 2. Quản Trị Viên Điều Chỉnh Thủ Công (Manual Override)
- Admin có quyền chỉnh sửa trạng thái điểm danh của từng học viên (ví dụ do lỗi đường truyền, có phép).
- Khi sửa, cập nhật:
  - `status`: Giá trị mới (PRESENT / LATE / ABSENT).
  - `isManualOverride`: `true`.
  - `note`: Lý do điều chỉnh của Admin.

## 3. Xuất Báo Cáo Excel (.xlsx)
- Admin có thể xuất báo cáo chuyên cần theo từng buổi học hoặc theo toàn bộ khóa học.
- Định dạng xuất: File Excel (`.xlsx`) chứa: Mã học viên, Họ tên, Email, Giờ vào đầu tiên, Giờ ra cuối cùng, Tổng số phút học, Tỷ lệ %, Trạng thái chuyên cần, Ghi chú.
