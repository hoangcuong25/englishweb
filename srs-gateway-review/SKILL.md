---
name: srs-gateway-review
description: Review file SRS của dự án VDBAS (phân hệ Chi) theo checklist gatekeeper v2.1 của SA, để kết luận SRS đã đủ thông tin cho SA thiết kế chưa. Dùng khi nghe "review SRS", "SA review SRS", "chạy checklist SRS", "SRS đủ để SA thiết kế chưa", "kiểm tra SRS trước khi bàn giao SA", "gateway review".
---

# Gateway Review SRS (VDBAS)

Trả lời đúng một câu hỏi: **SRS đã đủ thông tin để SA tiếp nhận và bắt đầu thiết kế chưa?**
Không thiết kế thay SA, không đề xuất giải pháp, không viết lại SRS, không sửa SRS.

## Nguồn kiến thức đi kèm (đọc khi cần)

Tất cả nằm trong thư mục `references/` của skill này.

| File | Vai trò | Đọc khi nào |
|---|---|---|
| `references/checklist.md` | **Checklist v2.1 đầy đủ**: Phần 0 (ký hiệu, cột Chặn, quy tắc phán định), 0A (hướng dẫn và quy tắc bắt buộc), Phần A (Mục 0 đến 8), Phần B (Phụ lục A đến D), Phần C, Phần E (mẫu kết quả) | **Luôn đọc toàn bộ trước khi review** |
| `references/org/shared/ui-event-button-spec.md` | Chuẩn nút, sự kiện, trạng thái rỗng, phân trang, chống bấm đúp | Đánh giá A1.5, A2.4 và các câu về giao diện |
| `references/org/shared/notification-message-validation.md` | Chuẩn mã thông báo, mã lỗi, nội dung thông báo | Đánh giá 8.2, A2.5, B4 |
| `references/org/shared/non-functional-standards.md` | Ngưỡng số truy vấn, phân trang, chỉ mục, tác vụ dài | Đánh giá Mục 5 |
| `references/org/shared/security-policy.md` | Chính sách bảo mật, OWASP | Đánh giá Mục 3 và các câu liên quan bảo mật |
| `references/org/backend/api-convention.md` | Hợp đồng API, envelope, mã lỗi | Đánh giá Phụ lục B |
| `references/project/architecture.md` | Kiến trúc service phân hệ Chi, thư viện dùng chung, quyết định kiến trúc (ADR) | Đánh giá Mục 1, 4 và để hiểu ranh giới phân hệ |
| `references/project/domain-glossary.md` | Thuật ngữ nghiệp vụ, bảng và danh mục của phân hệ Chi | Đối chiếu tên gọi (8.3) và hiểu thực thể |

Trong `checklist.md`, đường dẫn dạng `code-forge-team-common/knowledge/org/<x>` tương ứng `references/org/<x>` trong skill này.

## Quy trình

1. Đọc toàn bộ `references/checklist.md`.
2. Xin đủ đầu vào theo mục 0A.1: file SRS (bắt buộc, đọc toàn bộ), issues log, mockup, danh mục mã lỗi/thông báo của dự án. Thiếu tài liệu nào thì vẫn làm tiếp và đánh ❓ CHƯA KIỂM cho các mục cần tài liệu đó.
3. Xác định loại SRS (CRUD có giao diện / Inbound API / Inbound MQ / Batch, có thể nhiều loại). Không rõ thì hỏi người dùng một câu.
4. Đi qua **từng câu** của Phần A và các phụ lục áp dụng, theo mục 0A.2 đến 0A.7 của checklist. Không bỏ câu nào.
5. Chỉ đánh "ĐẠT THEO CHUẨN ORG" khi đã mở file chuẩn tương ứng trong `references/org/` và trích được dòng. Chưa đọc được thì ❓.
6. Áp quy tắc phán định ở mục 0.4, xuất kết quả theo mẫu Phần E.

## Quy tắc bắt buộc (tóm tắt, bản đầy đủ ở mục 0A.6 của checklist)

- Không suy luận thay BA. Thiếu thì ghi "SRS không nêu".
- Mỗi ❌ phải trích đúng chỗ SRS thiếu hoặc mâu thuẫn; trước khi đánh ❌ phải tìm lại toàn bộ SRS.
- Điều suy ra gắn **[Inference]**; điều không kiểm chứng được gắn **[Unverified]**.
- Không đổi cột Chặn của checklist; nhận xét đưa vào mục "Đề xuất điều chỉnh checklist".
- Câu hỏi cho BA: chỉ hỏi điều BA quyết được, câu hỏi mở. **Không** đưa phương án trả lời hay ví dụ gợi ý đáp án (kể cả trong ngoặc "vd:", "hay...?"), **không** dùng thuật ngữ kỹ thuật (bind, cache, API, index...); thay bằng ngôn ngữ nghiệp vụ. Câu nhiều ý tách thành câu con a, b, c.
- Câu hỏi về kiểu dữ liệu (câu 2.1): hỏi BA mô tả từ điển dữ liệu (kiểu mức nghiệp vụ, độ dài tối đa, bắt buộc, giá trị mặc định nếu có) cho từng trường còn thiếu. Không hỏi BA về tiến độ DBA hay kiểu Oracle; phần đó SA và DBA làm.
- Mục 8.5 chỉ là cảnh báo, không chấm điểm. Chỉ ghi điểm lệch tìm thấy khi đối chiếu trực tiếp SRS với mockup; ghi rõ trích dẫn hai bên. Nếu một mục khác (vd A2.2) đã nêu mockup và SRS khác nhau, nhắc lại ở mục "Cảnh báo cho BA".
- Không bịa chi tiết thiết kế không có trong SRS hay chuẩn (đường dẫn endpoint, tên bảng, mã quyền...). Chỉ nêu những gì có nguồn và dẫn nguồn.
- **Bảng tổng hợp theo mục:** sau khi điền xong bảng chi tiết, đếm lại từng ô ✅ / ❌ / ➖ / ❓ và số câu Chặn=Y ❌ từ chính bảng chi tiết (Chặn lấy theo checklist). Tổng số câu Chặn=Y ❌ phải bằng tổng các ô trong bảng và bằng danh sách "Điểm chặn cần BA chốt".

## Đầu ra

Kết quả theo mẫu Phần E của checklist, bằng tiếng Việt. Đặt bảng chú giải icon (mục 0A.7) ở đầu kết quả.

Nơi lưu kết quả:
- Nếu người dùng đã chỉ định file hoặc thư mục (vd "ghi vào ... cùng folder này") hoặc đã chọn thư mục làm việc: **ghi file `<MÃ_CHỨC_NĂNG>_SRS_SA_Review.md` thẳng vào thư mục chứa SRS**, không hỏi lại. Ghi xong, nêu đường dẫn đầy đủ.
- Nếu không ghi được vào thư mục đó (không có quyền, thư mục chỉ đọc): nói rõ không ghi được và lý do, rồi tạo file ở nơi cho phép để người dùng tải về. Không im lặng chuyển sang chế độ chỉ tải về.
- Nếu người dùng không chỉ định nơi lưu và không có thư mục làm việc: trình bày kết quả trong chat, cuối kết quả hỏi có muốn xuất ra file không.
