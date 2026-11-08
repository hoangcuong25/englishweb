---
name: ai-writing-evaluation
description: >-
  Kỹ năng xây dựng phân hệ luyện viết IELTS Writing Task 1 & 2, đếm từ thời gian thực, tích hợp AI phân tích 4 tiêu chí và quy trình Admin phê duyệt.
---

# AI Writing Evaluation Skill

## 1. Phía Học Viên (Writing Interface)
- Lựa chọn đề bài Task 1 hoặc Task 2.
- Trình soạn thảo văn bản với bộ đếm từ tự động (Word Counter) và đồng hồ đếm ngược (40 phút Task 2, 20 phút Task 1).
- Tự động lưu bản nháp định kỳ (Auto-save draft) vào LocalStorage hoặc Server.
- Nộp bài gửi sang pipeline phân tích của AI.

## 2. Pipeline Phân Tích Bằng AI (4 Tiêu Chí IELTS Writing)
AI chấm điểm và sinh dữ liệu phân tích chi tiết:
1. **Task Achievement / Task Response (TR)**: Độ hoàn thành yêu cầu đề bài, phát triển luận điểm.
2. **Coherence & Cohesion (CC)**: Tính mạch lạc, liên kết câu, phân đoạn đoạn văn.
3. **Lexical Resource (LR)**: Độ phong phú của từ vựng, từ vựng học thuật C1/C2.
4. **Grammatical Range & Accuracy (GRA)**: Cấu trúc câu đa dạng, độ chính xác ngữ pháp.
- **Dữ liệu đầu ra**:
  - Điểm số từng tiêu chí (0.0 - 9.0).
  - Overall Band Score.
  - Nhận xét chi tiết điểm mạnh và điểm cần cải thiện.
  - Danh sách từ vựng gợi ý nâng cao (C1/C2 vocabulary recommendations).
  - Bài viết mẫu tham khảo chuẩn Band 8.0+.

## 3. Quy Trình Phê Duyệt Của Admin (Human-in-the-Loop)
- Học viên **chưa** thể xem điểm ngay sau khi AI chấm xong mà trạng thái là `AI_EVALUATED`.
- Admin truy cập danh sách chờ duyệt, xem bài làm học viên và phân tích của AI.
- Admin có quyền:
  - Giữ nguyên hoặc điều chỉnh điểm số.
  - Bổ sung nhận xét của riêng giáo viên.
  - Nhấn nút "Phê duyệt & Phát hành kết quả" ➔ Chuyển trạng thái sang `APPROVED`, gửi thông báo đến học viên.
