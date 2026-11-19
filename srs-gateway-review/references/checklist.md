# Checklist Gatekeeper Review SRS - VDBAS (bản hợp nhất)

> Phiên bản 2.1, ngày 2026-11-02. Bản hợp nhất dùng làm kiến thức cho skill `srs-gateway-review`. Các đánh dấu *(v2.1)* và *(bổ sung)* chỉ nguồn gốc câu hỏi, không ảnh hưởng cách chấm.

Bộ checklist này dùng để SA (Solution Architect) kiểm tra SRS do BA gửi sang, **trước khi** nhận làm thiết kế kỹ thuật, áp dụng cho dự án VDBAS (hệ thống quản lý kế toán kho bạc nhà nước, nhiều phân hệ, kiến trúc microservices). Tài liệu này không gắn với chức năng cụ thể nào; kết quả review của từng SRS được lưu riêng.

**Cấu trúc**

- **Phần 0 và phần "Cách đánh giá"**: câu hỏi của gateway, ký hiệu, cột Chặn, quy tắc phán định, quy tắc bắt buộc cho Claude.
- **Phần A. Core Checklist**: áp dụng cho MỌI loại SRS (Mục 0–8; Mục 0 là cổng "hiểu yêu cầu").
- **Phần B. Phụ lục theo loại chức năng**: CRUD có giao diện / Inbound API / Inbound MQ / Batch job. Một SRS có thể cần nhiều hơn một phụ lục (vd: CRUD UI + có gọi MQ ngầm).
- **Phần C. Việc SA tự xử khi thiết kế**, **Phần D. Hướng dẫn sử dụng**, **Phần E. Mẫu kết quả review**.

---

## PHẦN 0. CÂU HỎI CỦA GATEWAY VÀ CÁCH ĐÁNH GIÁ

### 0.1 Câu hỏi của gateway

**SRS đã đủ thông tin để SA tiếp nhận và bắt đầu thiết kế chưa?** Chỉ trả lời câu hỏi này. Không thiết kế thay SA, không đề xuất giải pháp, không viết lại SRS.

### 0.2 Cách đánh giá mỗi câu hỏi

| Ký hiệu | Tên | Nghĩa |
|---|---|---|
| ✅ | **ĐẠT** | Thông tin đã rõ, đủ để SA thiết kế mà không cần đoán |
| ✅ | **ĐẠT THEO CHUẨN ORG** | SRS chưa nêu, nhưng tổ chức đã có chuẩn chung áp dụng mặc định (vd: chặn double-click, thông báo khi kết quả rỗng). Không cần hỏi lại BA; SA ghi chú đang áp chuẩn nào. **Chỉ được đánh khi đã mở đọc file chuẩn và trích được dòng.** Không đọc được chuẩn thì đánh ❓ CHƯA KIỂM |
| ❌ | **CHƯA ĐẠT** | Thiếu, mâu thuẫn, mơ hồ, hoặc còn đánh dấu chưa chốt (`[Inference]`, `[Đề xuất]`, `[cần xác nhận]`). Ghi rõ lý do để BA biết sửa gì |
| ➖ | **N/A** | Chức năng không phát sinh nghiệp vụ liên quan tới câu hỏi. **Bắt buộc ghi lý do cụ thể** (vd: "Lưu quy tắc không gọi service khác, xem VAL-11"); không được bỏ qua im lặng |
| ❓ | **CHƯA KIỂM** | Chưa có đủ tài liệu để kiểm (vd: chưa đọc mockup, chưa đọc được file chuẩn org). Không phải lỗi của SRS; ghi rõ cần tài liệu gì để kiểm |

**Nguyên tắc riêng cho tính năng phụ/tùy chọn** (sao chép bản ghi, xuất Excel, import hàng loạt, và các tiện ích tương tự không phải nghiệp vụ cốt lõi): nếu SRS không mô tả, mặc định hiểu là chức năng KHÔNG có tính năng đó, đánh **➖ N/A**, không cần hỏi lại BA. Chỉ hỏi lại khi có dấu hiệu tính năng thực sự tồn tại nhưng mô tả thiếu (vd: mockup có nút Xuất Excel nhưng SRS không nói rõ phạm vi cột/số dòng). Nếu chưa đọc mockup thì không kết luận được dấu hiệu này: đánh ❓. Nguyên tắc này KHÔNG áp dụng cho hành vi bắt buộc của nghiệp vụ cốt lõi (luồng chính, dữ liệu, tích hợp...): im lặng ở các câu đó vẫn là ❌, không phải N/A.

### 0.3 Cột "Chặn? (Y/N)"

Cố định sẵn trong checklist, không đổi theo từng lần review:

- `Y`: nếu câu này ❌, SA không thể bắt đầu thiết kế (thiếu mô hình dữ liệu, luồng xử lý, hoặc để lại rủi ro nghiệp vụ nghiêm trọng).
- `N`: nếu câu này ❌, SA vẫn tiếp nhận được. SA ghi giả định rõ ràng, BA chốt lại trước khi bàn giao DEV, thay đổi sau đó xử lý qua CR.

Claude **không đổi** cột Chặn. Nếu thấy cột Chặn không hợp với SRS đang review, ghi nhận xét ở mục "Đề xuất điều chỉnh checklist" trong kết quả để người duy trì checklist xem xét.

### 0.4 Quy tắc phán định (áp dụng sau khi điền hết checklist)

| Kết luận | Điều kiện |
|---|---|
| **SA tiếp nhận** | Mọi câu đều ✅ (ĐẠT hoặc ĐẠT THEO CHUẨN ORG) hoặc ➖ N/A |
| **SA tiếp nhận để thiết kế, còn điểm cần làm rõ** | Mọi câu Chặn=Y đã ✅ hoặc ➖; còn câu Chặn=N ở ❌. SA ghi giả định, BA chốt trước khi bàn giao DEV |
| **SA không nhận SRS** | Còn ít nhất một câu Chặn=Y ở ❌. Trả lại BA |

Câu Chặn=Y ở ❓ CHƯA KIỂM: chưa kết luận được. SA kiểm xong mục đó trước khi chốt kết luận; nếu phải kết luận trước, ghi kết luận là "tạm thời" và nêu rõ mục ❓.

---

## PHẦN 0A. HƯỚNG DẪN CHO CLAUDE KHI REVIEW

### 0A.1 Đầu vào cần có

| Đầu vào | Bắt buộc | Ghi chú |
|---|---|---|
| File SRS của chức năng | Có | Đọc **toàn bộ** file, không đọc một phần |
| Issues log của chức năng | Nên có | Để biết điểm đã chốt, điểm còn mở |
| Mockup | Nên có | Chưa đọc thì các mục cần mockup ghi ❓ CHƯA KIỂM |
| Danh mục mã lỗi/thông báo chuẩn của dự án | Nên có | Để kiểm 8.2; thiếu thì ghi rõ chưa đối chiếu được |
| Chuẩn org (xem 0A.3) | Có khi dùng "ĐẠT THEO CHUẨN ORG" | Phải mở đọc file chuẩn và trích dòng trước khi kết luận |

### 0A.2 Quy trình

1. Xác định loại SRS: **CRUD có giao diện** (Phụ lục A), **Inbound API** (B), **Inbound MQ** (C), **Batch job** (D). Một SRS có thể thuộc nhiều loại; nếu không rõ thì nêu giả định ở đầu kết quả hoặc hỏi người dùng. Phần A áp dụng cho mọi loại.
2. Đọc SRS và các tài liệu kèm theo.
3. Đi qua **từng câu hỏi** của Phần A và các phụ lục áp dụng. Không bỏ câu nào; câu không áp dụng thì ➖ N/A kèm lý do.
4. Với mỗi câu, đánh giá theo 0.2, kèm **căn cứ trích từ SRS** (mã mục/BIZ/VAL/dòng).
5. Với mỗi mục ❌, viết chi tiết theo mẫu ở 0A.4.
6. Áp quy tắc phán định ở 0.4.
7. Tạo danh sách câu hỏi cho BA theo 0A.5.
8. Xuất kết quả theo mẫu ở Phần E, trình bày theo 0A.7.

### 0A.3 Đối chiếu chuẩn org

Các file chuẩn thường dùng, nằm trong `code-forge-team-common/knowledge/org/`:

| Chủ đề | File |
|---|---|
| Nút, sự kiện, trạng thái rỗng, phân trang, chống bấm đúp | `shared/ui-event-button-spec.md` |
| Mã thông báo, mã lỗi, nội dung thông báo | `shared/notification-message-validation.md` |
| Ngưỡng số truy vấn, phân trang, chỉ mục, tác vụ dài | `shared/non-functional-standards.md` |
| Bảo mật, bí mật, OWASP | `shared/security-policy.md` |
| Hợp đồng API, envelope, mã lỗi | `backend/api-convention.md` |

Thư mục rỗng hoặc không đọc được thì ghi rõ ở đầu kết quả và đánh ❓ cho các mục cần chuẩn; không suy đoán nội dung chuẩn.

### 0A.4 Mẫu chi tiết cho mục ❌

```
- **<mã>.** *Thiếu gì:* <trích SRS: mục/BIZ/VAL nào, nói gì hoặc không nói gì>.
  *Ví dụ minh hoạ:* <tình huống cụ thể, ngắn; ghi rõ là ví dụ dựng, số liệu giả định>.
  *Nếu không rõ:* <hệ quả với thiết kế/nghiệp vụ; gắn [Inference] nếu là suy luận>.
```

### 0A.5 Nguyên tắc câu hỏi cho BA

- Chỉ hỏi điều BA có thể quyết: nghiệp vụ, phạm vi, dữ liệu, vận hành.
- Mỗi câu dẫn mã mục của checklist và mã BIZ/VAL/mục SRS liên quan; gộp các câu trùng ý; câu có nhiều ý thì tách thành câu con (a, b, c) để BA trả lời và theo dõi từng điểm.
- Câu hỏi mở. **Không đưa phương án trả lời, không đề xuất giải pháp.**
- BA không cần chọn giải pháp kỹ thuật (REST hay MQ, SAGA hay gì); chỉ mô tả ràng buộc nghiệp vụ. SA chọn kiến trúc.
- Xếp câu hỏi chặn thiết kế lên đầu và gắn nhãn.

### 0A.6 Quy tắc bắt buộc

1. **Không suy luận thay BA.** Thiếu thì ghi "SRS không nêu"; không tự điền giá trị, không coi điều hợp lý là điều đã chốt.
2. Mỗi kết luận ❌ phải trích rõ phần SRS thiếu hoặc mâu thuẫn. Phân biệt "SRS thiếu" với "SRS có nhưng chưa đọc kỹ": trước khi đánh ❌ phải tìm lại toàn bộ SRS (kể cả bảng validation, bảng thông báo, phụ lục).
3. Điều suy ra mà chưa có bằng chứng thì gắn **[Inference]**; điều không kiểm chứng được thì gắn **[Unverified]**.
4. Không dùng từ khẳng định tuyệt đối khi không có nguồn.
5. Không đề xuất đổi quyết định BA đã chốt (đổi hướng thiết kế đi qua CR, ngoài phạm vi gateway).
6. Việc kỹ thuật SA tự xử khi thiết kế (xem Phần C) không đưa vào câu hỏi cho BA; chỉ liệt kê ở mục "Việc SA tự xử".
7. Không sửa file SRS, không sửa issues log.

### 0A.7 Trình bày kết quả (bắt buộc)

1. **Chú giải icon ở đầu kết quả.** Ngay sau dòng "Đối tượng rà" và "Loại SRS", trước "Kết quả rà soát", đặt nguyên văn bảng sau để BA đọc được mà không cần mở checklist:

| Icon | Tên | Nghĩa với BA |
|---|---|---|
| ✅ | **ĐẠT** | SRS đã nêu rõ, SA đủ thông tin để thiết kế mục này. BA không cần làm gì |
| ✅ | **ĐẠT THEO CHUẨN ORG** | SRS không nêu, nhưng chuẩn org đã quy định và SA đã đọc chuẩn đó. BA không cần làm gì |
| ❌ | **CHƯA ĐẠT** | SRS thiếu, mơ hồ, mâu thuẫn hoặc còn đánh dấu chưa chốt. BA cần bổ sung hoặc sửa. Nếu cột Chặn = Y thì SA chưa thể bắt đầu thiết kế |
| ➖ | **N/A** | Chức năng không có nghiệp vụ liên quan tới câu hỏi này (có ghi lý do). BA không cần làm gì |
| ❓ | **CHƯA KIỂM** | SA chưa kiểm được vì thiếu tài liệu đầu vào (ví dụ chưa đọc mockup). Không phải lỗi của SRS; SA đối chiếu sau |

2. **"Vì sao SA cần thông tin này" ở mỗi mục lớn.** Mỗi Mục 0–8 và mỗi phụ lục/nhóm áp dụng mở đầu bằng một dòng `*Vì sao SA cần thông tin này:*` viết cho BA hiểu: SA dùng thông tin này để thiết kế phần nào, và thiếu thì hậu quả gì. Dùng câu mẫu trong checklist, được điều chỉnh theo SRS cụ thể nhưng không bỏ.
3. Mục ➖ phải ghi lý do; mục ❓ phải ghi cần tài liệu gì để kiểm.
4. *(v2.1)* Mục 8.5 chỉ là **cảnh báo**, không dùng icon chấm điểm: ghi các điểm lệch giữa mockup và SRS vào mục "Cảnh báo cho BA" của kết quả (xem Phần E), kèm trích dẫn hai bên; không đưa vào cột Chặn, không đổi kết luận ở 0.4.

---

# PHẦN A. CORE CHECKLIST (áp dụng cho MỌI loại SRS)

## Mục 0. Hiểu yêu cầu *(v2.1)*

*Vì sao SA cần thông tin này:* để biết chức năng làm gì, cho ai, khi nào, trước khi đi vào chi tiết. Thiếu thì SA có thể đạt hầu hết các mục sau mà vẫn thiết kế lệch mục tiêu, và không có cách kiểm kết quả thiết kế đúng hay sai.

> Mã câu hỏi dùng tiền tố M0 để không trùng các mục 0.1–0.4 của Phần 0. Chỉ lấy câu trả lời từ SRS; thiếu thì ❌ và hỏi BA, không tự suy. M0.2 ở mức "Quan trọng": tính là Chặn=N (không chặn thiết kế) nhưng BA nên bổ sung trước khi bàn giao DEV, vì phân quyền Maker/Checker thuộc phạm vi phân hệ QTDC.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| M0.1 | Mục đích nghiệp vụ: chức năng giải quyết vấn đề gì, vì sao cần làm (không chỉ mô tả chức năng làm gì)? | Y | | |
| M0.2 | Người dùng: ai thực hiện (đơn vị, chức danh) và ai chịu ảnh hưởng bởi kết quả? | N (Quan trọng) | | |
| M0.3 | Thời điểm: sự kiện hoặc điều kiện nào kích hoạt việc dùng chức năng, tần suất ra sao? | Y | | |
| M0.4 | Có ít nhất một kịch bản sử dụng cụ thể đi hết luồng (đầu vào, kết quả mong đợi) để SA hiểu và kiểm chứng thiết kế? | Y | | |

## Mục 1. Bối cảnh và điểm chạm hệ thống

*Vì sao SA cần thông tin này:* để xác định ranh giới service, phạm vi thiết kế và những chức năng bị ảnh hưởng. Thiếu thì SA có thể thiết kế sai biên hoặc bỏ sót tác động tới chức năng khác.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 1.1 | Tính năng đã được định vị rõ thuộc phân hệ nào, chịu tác động của luồng nghiệp vụ cha nào? | N | | |
| 1.2 | Tiền điều kiện: hệ thống/dữ liệu nào phải có sẵn trước khi tính năng bắt đầu? | N | | |
| 1.3 | Phân tích tầm ảnh hưởng: khi thêm/sửa/xóa (kể cả xóa mềm), đã liệt kê tính năng/phân hệ/nhóm khác bị ảnh hưởng và giải pháp chưa? **Dữ liệu hoặc kết quả của chức năng được chức năng nào sử dụng, và chức năng đó lấy dữ liệu theo cách nào (xem trên màn hình, nhận file, tra cứu khi xử lý...)?** *(v2.1: phần in đậm là bổ sung)* | N | | |
| 1.4 | Khi dữ liệu danh mục/cấu hình đang được một giao dịch/chứng từ khác sử dụng dở dang, nếu người dùng sửa hoặc xóa bản ghi đó, nghiệp vụ mong muốn xử lý thế nào? **Hệ thống xác định thế nào là "đang được dùng" và trường nào bị khoá? Khi dữ liệu cha ngừng hiệu lực hoặc thay đổi thì dữ liệu con/phụ thuộc xử lý ra sao?** *(v2.1: phần in đậm là bổ sung)* | N | | |
| 1.5 | Chức năng này thuộc phân hệ nào (vd: phân hệ Chi)? Có phân hệ hoặc chức năng nào khác cũng cùng xem hoặc cùng cập nhật chính dữ liệu này không? | N | | |
| 1.6 *(bổ sung)* | Các chức năng/danh mục mà chức năng này phụ thuộc đã sẵn sàng và hợp đồng đã ổn định chưa (không chỉ liệt kê tiền điều kiện ở 1.2)? | N | | |

## Mục 2. Ràng buộc dữ liệu và kiểm tra (áp dụng chung mọi loại)

*Vì sao SA cần thông tin này:* để thiết kế mô hình dữ liệu, ràng buộc duy nhất, chỉ mục và nơi đặt validate. Thiếu thì SA phải đoán quy tắc dữ liệu và có thể phải sửa bảng sau khi đã thiết kế.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 2.1 | Từ điển dữ liệu: mọi trường đã định nghĩa kiểu (mức nghiệp vụ: chuỗi, số, ngày...), độ dài tối đa, bắt buộc/không bắt buộc chưa? *(BA mô tả ở mức từ điển dữ liệu; kiểu dữ liệu vật lý trong CSDL do SA cùng DBA chốt khi thiết kế. Chỉ tính ❌ khi trường thiếu mô tả nghiệp vụ (kiểu, độ dài hoặc phạm vi, bắt buộc). Trường BA đã mô tả đủ mức nghiệp vụ mà chỉ còn kiểu vật lý ghi "chờ DBA" thì không tính ❌, SA và DBA tự xử. Trường kỹ thuật (vd phiên bản bản ghi cho khoá lạc quan) không thuộc phạm vi BA.)* | Y | | |
| 2.2 | Validate định dạng và phạm vi (regex, so sánh ngày, giá trị >0...) đã đủ cho các trường đặc thù chưa? | N | | |
| 2.3 | Quy tắc logic phức tạp (công thức, điều kiện do người dùng tự lập): thời điểm kiểm tra là lúc Lưu cấu hình hay lúc vận hành sau này, **và hành vi khi lỗi là gì**? *(phần in đậm là bổ sung)* **Nếu người dùng nhập biểu thức hoặc quy tắc: quy tắc đó dùng những thông tin nào để tính (giá trị lấy từ đâu), và khi có lỗi lúc vận hành thì xử lý ra sao? Chỉ áp dụng khi chức năng có yếu tố này, không có thì ➖.** *(v2.1)* | N | | |
| 2.4 | Có khoảng hiệu lực (From Date - To Date) thì đã có quy tắc chặn trùng/chồng lấp chưa? | N | | |
| 2.5 | Quy tắc ưu tiên so khớp khi có giá trị đại diện chung (ALL, NA) đã rõ thứ tự ưu tiên chưa? Trường hợp 2 bản ghi khớp một phần (chồng lấp không hoàn toàn, vd A=1,B=NA và A=NA,B=2) xử lý thế nào? | Y | | |
| 2.6 | Dữ liệu này có phải nguồn dữ liệu gốc do chính chức năng này quản lý không, hay chỉ là bản sao từ nguồn khác (phân hệ/hệ thống khác)? Nếu là bản sao từ nguồn khác, được cập nhật theo cách nào, và chấp nhận chậm bao lâu so với nguồn dữ liệu gốc? | N | | |

## Mục 3. Vai trò tổ chức và vận hành thực tế

*Vì sao SA cần thông tin này:* để thiết kế phân quyền, kiểm tra quyền phía server và phần hỗ trợ vận hành. Thiếu thì quyền và cách đưa vào dùng có thể sai đối tượng.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 3.1 | Ngoài phân quyền kỹ thuật Maker/Checker/Viewer, đã định nghĩa rõ ai là người dùng thực tế (chuyên viên phòng ban nào, cần năng lực gì) chưa? *(v2.1: nếu đã ❌ ở M0.2 vì cùng lý do, ghi "xem M0.2" để không tính hai điểm; ở đây hỏi thêm về năng lực cần có.)* | N | | |
| 3.2 | Nếu mô hình không có bước phê duyệt trực tuyến (lưu là có hiệu lực ngay), nghiệp vụ có yêu cầu gì về quy trình kiểm soát rủi ro trước và sau khi đưa vào vận hành thật không (kể cả cách phát hiện và xử lý khi cấu hình sai đã có hiệu lực)? | N | | |
| 3.3 | Phân quyền có giới hạn theo đơn vị tổ chức không (user chỉ thấy/sửa dữ liệu của đơn vị/kho bạc mình)? | N | | |
| 3.4 | Có trường/thao tác nào trong chức năng chỉ một số vai trò cụ thể được thấy hoặc sửa (phân quyền theo từng trường), khác với phân quyền theo chức năng chung không? | N | | |
| 3.5 *(bổ sung)* | Ma trận quyền theo từng thao tác (vai trò × thao tác) và mã quyền đã chốt chưa? | N | | |

## Mục 4. Ràng buộc phối hợp giữa các phân hệ

*Vì sao SA cần thông tin này:* để chọn cách các phân hệ phối hợp với nhau (đồng bộ hay trễ, thử lại, xử lý lỗi một phần) và hành vi khi bên khác gọi vào chức năng này. BA chỉ cần nêu ràng buộc nghiệp vụ; SA chọn giải pháp kỹ thuật. Thiếu thì SA phải tự đoán hành vi khi có lỗi, rủi ro cao với hệ thống kế toán.

> Lưu ý nguyên tắc: BA KHÔNG cần chọn sẵn giải pháp kỹ thuật (REST hay MQ, SAGA hay gì). BA chỉ cần mô tả **ràng buộc nghiệp vụ**; SA dựa vào đó để chọn kiến trúc phù hợp.

> *Lưu ý riêng: nếu chức năng không gọi sang service nào khác, đánh ➖ N/A cho 4.1–4.5 nhưng phải ghi rõ lý do (trích dẫn mã nghiệp vụ/validation xác nhận không có gọi ngoài); không được bỏ trống hoặc bỏ qua im lặng. **4.6 xét theo hướng ngược lại** (bên khác gọi vào chức năng này) nên không N/A vì lý do "không gọi ra ngoài"; chỉ N/A nếu dữ liệu của chức năng không được chức năng/service nào khác tiêu thụ, kèm lý do.*

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 4.1 | Tính năng này có cần dữ liệu/phản hồi từ phân hệ khác ngay lập tức để hoàn tất thao tác không, hay có thể xử lý trễ (vài giây, vài phút, cuối ngày)? | N | | |
| 4.2 | Nếu một bước xử lý thuộc phân hệ khác bị lỗi hoặc không phản hồi giữa chừng (sau khi bước trước đã ghi dữ liệu thành công), nghiệp vụ mong muốn: hủy toàn bộ giao dịch, hay giữ lại ở trạng thái "lỗi một phần" chờ xử lý thủ công, hay tự động thử lại? | N | | |
| 4.3 | Có yêu cầu bắt buộc không được phép ghi trùng dữ liệu nếu một yêu cầu bị gửi lại nhiều lần (do lỗi đường truyền, do hệ thống bên kia gửi lại) không? | N | | |
| 4.4 | Có ràng buộc về tính nhất quán dữ liệu giữa các phân hệ không (vd: số dư không được phép sai lệch dù chỉ tạm thời)? | N | | |
| 4.5 | Nếu giao dịch đi qua nhiều phân hệ, khi một phần đã xử lý xong còn phần sau thất bại, nghiệp vụ có yêu cầu gì về việc thông báo/cảnh báo cho người vận hành biết không? | N | | |
| 4.6 | Khi chức năng/phân hệ khác tra cứu dữ liệu của chức năng này nhưng không tìm thấy bản ghi phù hợp (không phải do lỗi hệ thống, mà do chưa có/đã bị xóa/đã hết hiệu lực), nghiệp vụ mong muốn xử lý thế nào? **Cách chức năng đó tra cứu (tra theo thông tin nào) đã nêu đủ để xác định thế nào là "không tìm thấy" chưa? Gồm cả trường hợp tra ra kết quả rỗng và trường hợp nơi dùng đã lưu một giá trị mà nay giá trị đó hết hiệu lực.** *(v2.1: phần in đậm là bổ sung)* | Y | | |

## Mục 5. Yêu cầu phi chức năng

*Vì sao SA cần thông tin này:* để chọn cách truy vấn, phân trang, chỉ mục, ghi vết và kiểm tra thiết kế có đạt ngưỡng số truy vấn của chuẩn org hay không. Không có số liệu thì SA dùng quy mô giả định và dừng hỏi lại BA nếu không đạt ngưỡng.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 5.1 | Khối lượng dữ liệu/tần suất giao dịch dự kiến (số bản ghi/ngày, số user thao tác đồng thời) có được ước lượng không? | N | | |
| 5.2 | Có yêu cầu thời gian phản hồi cụ thể không (vd: tra cứu phải trả kết quả trong X giây)? | N | | |
| 5.3 | Có yêu cầu ghi log audit (ai sửa gì, lúc nào, giá trị cũ/mới) không? Nếu có, mức độ chi tiết, thời hạn giữ log, ai được xem? Nếu chức năng có xóa mềm, bản ghi xóa được giữ bao lâu trước khi dọn hẳn? | N | | |
| 5.4 | Có yêu cầu đặc biệt về điều khiển đồng thời không: khi 2 user khác nhau cùng mở 1 bản ghi để sửa cùng lúc, nghiệp vụ mong muốn xử lý thế nào (báo lỗi, khóa, ghi đè)? | N | | |
| 5.5 *(bổ sung)* | Sau khi sửa cấu hình/dữ liệu, bao lâu thì có hiệu lực với giao dịch mới (ngay, hay chấp nhận trễ)? | N | | |

## Mục 6. Đối soát dữ liệu

*Vì sao SA cần thông tin này:* để thiết kế cơ chế đối soát và xử lý lệch số liệu (tần suất, ai được cảnh báo, tự điều chỉnh hay xử lý thủ công). Chỉ áp dụng khi chức năng có yêu cầu đối soát giữa các phân hệ; không có thì đánh ➖ N/A, kèm lý do.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 6.1 | Chức năng này có cần đối soát số liệu với phân hệ khác không (vd: cuối ngày, cuối kỳ)? | N | | |
| 6.2 | Nếu có, tần suất đối soát là gì (realtime, cuối ngày, cuối kỳ)? | N | | |
| 6.3 | Khi phát hiện lệch số liệu lúc đối soát, nghiệp vụ xử lý thế nào (cảnh báo cho ai, có tự động điều chỉnh không hay bắt buộc xử lý thủ công)? | N | | |

## Mục 7. Tính đầy đủ nghiệp vụ

*Vì sao SA cần thông tin này:* để xác định khoá, các cột cần có và đầu ra được tính từ đâu; đây là phần quyết định thiết kế dữ liệu chính. Thiếu thì thiết kế có thể đúng về kỹ thuật nhưng cho kết quả nghiệp vụ sai, và sửa sau rất tốn kém. Các mục 1–6 hỏi theo khuôn chung; mục này bắt các thiếu sót mà khuôn chung không thấy.

> Nhóm có tỷ lệ phát hiện lỗi chặn thiết kế cao nhất trong thực tế; kiểm tra kỹ trước khi chuyển sang phần khác.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 7.1 | Mọi giá trị đầu ra (bao gồm số tiền/giá trị tính toán, không chỉ các trường hiển thị) đều có công thức hoặc nguồn xác định rõ từ dữ liệu đầu vào chưa? | Y | | |
| 7.2 | Mã định danh nghiệp vụ (mã dùng để nhận ra từng đối tượng/chứng từ) dùng để phân biệt các đối tượng/chứng từ có rõ ràng, không trùng lặp hoặc mơ hồ giữa các loại khác nhau không? | Y | | |
| 7.3 | Khi nhiều quy tắc/bản ghi cấu hình cùng khớp một đối tượng xử lý, đã có quy tắc ưu tiên chọn rõ ràng chưa (kể cả trường hợp khớp từng phần)? *(Trùng nội dung với 2.5: đánh giá một lần ở 2.5, ở đây ghi "xem 2.5" để không tính hai điểm chặn cho cùng một vấn đề.)* | Y | | |
| 7.4 | Danh sách bảng/trường/giá trị được phép sử dụng làm nguồn dữ liệu hoặc điều kiện trong chức năng đã chốt đầy đủ chưa (không còn placeholder, "[TỰ SINH]", "chờ DBA" hay tương tự)? *(Chỉ xét danh sách bảng, trường, giá trị làm nguồn dữ liệu hoặc điều kiện. Kiểu dữ liệu vật lý của các cột trong bảng của chức năng xét ở 2.1, không tính lại ở đây.)* | Y | | |
| 7.5 | Dữ liệu nghiệp vụ thực tế (mẫu thật) đã được đối chiếu thử với các quy tắc/ràng buộc trong SRS để tránh lỗi khi vận hành thật chưa? | N | | |
| 7.6 | Nếu chức năng cần nạp dữ liệu ban đầu (chuyển dữ liệu nghiệp vụ đang có từ nguồn khác sang), đã có kế hoạch nạp và cách đối soát sau khi nạp chưa? | N | | |
| 7.7 | Tiêu chí nghiệm thu / bộ test case nghiệp vụ cho chức năng đã có chưa? | N | | |
| 7.8 | Sau khi go-live, đơn vị/phòng ban nào tiếp nhận vận hành chức năng và xử lý khi phát sinh vấn đề? | N | | |
| 7.9 *(bổ sung)* | Truy ngược được đầu ra đã sinh về cấu hình và phiên bản nào đã tạo ra nó không? | N | | |
| 7.10 *(bổ sung)* | Mục tiêu nghiệp vụ và URD tham chiếu đã nêu chưa? *(v2.1: phần "mục tiêu nghiệp vụ" đánh giá ở M0.1, ghi "xem M0.1" để không tính hai điểm; ở đây chỉ đánh giá URD tham chiếu.)* | N | | |
| 7.11 *(bổ sung)* | Chức năng bổ trợ (Sao chép, Xuất file, Import): nếu SRS hoặc mockup cho thấy có, phạm vi (cột, số dòng, quy tắc) đã rõ chưa? *(Áp dụng nguyên tắc tính năng phụ ở 0.2: không mô tả và không có dấu hiệu tồn tại thì ➖ N/A.)* | N | | |

## Mục 8. Nhất quán nội bộ SRS

*Vì sao SA cần thông tin này:* để SA không thiết kế dựa trên chỗ SRS tự mâu thuẫn hoặc còn đánh dấu chưa chốt. Thiếu thì thiết kế phải làm lại khi BA chốt khác.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| 8.1 | Các điểm còn đánh dấu chưa chốt (`[Inference]`, `[Đề xuất]`, `[cần xác nhận]`...) trong SRS có được liệt kê ở một danh sách riêng để BA/SA cùng theo dõi không? | N | | |
| 8.2 *(bổ sung)* | Mọi mã kiểm tra/thông báo có trong danh mục mã chung của dự án chưa? | N | | |
| 8.3 *(bổ sung)* | Tên gọi của cùng một thực thể có dùng thống nhất xuyên suốt tài liệu không (không lẫn tên bảng với tên chức năng, không lẫn tên cũ/mới)? Các tài liệu nguồn được tham chiếu (Business Flow, mockup...) có cùng phiên bản giữa các phần không? | N | | |
| 8.4 *(bổ sung)* | Mỗi quy tắc nghiệp vụ và quy tắc kiểm tra có gắn với bước luồng tương ứng không? | N | | |
| 8.5 *(v2.1, cảnh báo)* | Mockup (nếu có) khớp với SRS về trường, quy tắc khoá/kiểm tra, thông báo, nút và luồng chuyển màn không? | — | | |

> **8.5 chỉ là cảnh báo, không tính điểm.** Kết quả ghi "Cảnh báo" hoặc "Không có cảnh báo" (không dùng ✅ ❌ ➖ ❓), không có cột Chặn, không đổi kết luận ở 0.4. Mỗi điểm lệch ghi vào mục "Cảnh báo cho BA" của kết quả, trích dẫn cả SRS và mockup, để BA rà lại mockup hoặc SRS. Chưa có mockup thì ghi "chưa kiểm". Không kết luận bên nào đúng.

---

# PHẦN B. PHỤ LỤC THEO LOẠI CHỨC NĂNG

Chỉ áp dụng thêm khi SRS thuộc đúng loại. Loại không áp dụng thì ghi một dòng ➖ N/A cho cả phụ lục kèm lý do.

## Phụ lục A. CRUD có giao diện (màn hình nhập liệu, danh sách, cấu hình)

**A1. Luồng nghiệp vụ và kịch bản góc**

*Vì sao SA cần thông tin này:* để thiết kế các bước xử lý, trạng thái bản ghi và hành vi khi người dùng thoát giữa chừng. Thiếu thì SA phải đoán luồng và trạng thái trung gian.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| A1.1 | Luồng chuẩn (Happy Path) đã viết tường minh từng bước, không nhảy cóc chưa? | Y | | |
| A1.2 | Nếu cho lưu nháp, đã quy định rõ trường bắt buộc tối thiểu để lưu nháp chưa? | N | | |
| A1.3 | Khi mở bản ghi nháp để lưu chính thức, các trường trước đó bỏ trống được xử lý thế nào (bắt lỗi hay tự điền mặc định)? | N | | |
| A1.4 | Khi người dùng bấm Hủy/Thoát giữa chừng (đang nhập form, thanh toán, upload), dữ liệu đã nhập hoặc dữ liệu cũ được giữ nguyên hay hoàn tác thế nào? | N | | |
| A1.5 | Tại các nút hành động quan trọng (Lưu, Gửi, Thanh toán), SRS có đề cập yêu cầu nghiệp vụ nào về việc chặn ghi trùng khi người dùng thao tác nhiều lần liên tiếp không? (SRS không nêu gì → áp theo chuẩn org, đánh "ĐẠT THEO CHUẨN ORG" kèm ghi chú đang áp chuẩn nào; chỉ khi đã đọc chuẩn, nếu không thì ❓.) | N | | |
| A1.6 | Có popup cảnh báo khi thoát màn hình còn dữ liệu chưa lưu không? Tiêu chí "dữ liệu có thay đổi" đã rõ chưa? | N | | |

**A2. Giao diện và trải nghiệm tương tác**

*Vì sao SA cần thông tin này:* để thiết kế dữ liệu trả về cho giao diện, điều kiện hiển thị/khoá và các mã thông báo. Thiếu thì giao diện và API dễ lệch nhau.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| A2.1 | Đã có sơ đồ/mockup thể hiện dịch chuyển màn hình khi click các phần tử chưa? | N | | |
| A2.2 | Quy tắc ẩn/hiện, khóa/mở (read-only/editable) theo điều kiện trường khác hoặc trạng thái bản ghi đã đặc tả chi tiết chưa? **Khi đổi thuộc tính định nghĩa hoặc chế độ của bản ghi mà đã có dữ liệu phụ thuộc (dòng con, bản ghi liên quan), hệ thống xử lý dữ liệu đó thế nào?** *(v2.1: phần in đậm là bổ sung)* | N | | |
| A2.3 | Nếu giao diện tự thay đổi theo cấu hình đặt ở màn hình khác (vd: cột, trường hiển thị), đã có kịch bản xử lý khi cấu hình đó bị đổi hoặc xóa chưa? | N | | |
| A2.4 | Màn hình danh sách: SRS có mô tả giao diện/thông báo khi bộ lọc trả về kết quả rỗng không? (SRS không nêu → áp theo chuẩn org, đánh "ĐẠT THEO CHUẨN ORG" kèm ghi chú; chỉ khi đã đọc chuẩn, nếu không thì ❓.) | N | | |
| A2.5 | Mọi thông báo hệ thống (thành công/thất bại/cảnh báo/xác nhận) đã có mã tin nhắn và chỉ định Toast hay Popup chưa? | N | | |

**A3. Điều khiển đồng thời và sinh số**

*Vì sao SA cần thông tin này:* để chọn cách chống ghi đè khi nhiều người cùng sửa và cách sinh số. Thiếu thì có thể mất dữ liệu hoặc trùng số.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| A3.1 | Nếu chứng từ có số tự sinh: quy tắc định dạng số, có reset theo năm/tháng không, đơn vị nào chịu trách nhiệm sinh số? | N | | |
| A3.2 | Khi 2 user cùng sửa 1 bản ghi, nghiệp vụ muốn xử lý thế nào (cho cùng sửa rồi báo người lưu sau, hay khóa bản ghi khi có người đang sửa) và thông báo gì khi xung đột? | N | | |

---

## Phụ lục B. Inbound API (nhận request đồng bộ từ hệ thống khác)

*Vì sao SA cần thông tin này:* để thiết kế hợp đồng API, xác thực, xử lý gọi lại và thời gian phản hồi. Thiếu thì SA phải đoán hợp đồng với hệ thống gọi vào và hành vi khi lỗi.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| B1 | Đã mô tả rõ mẫu thông tin hệ thống bên kia gửi sang và thông tin trả về (các trường, kiểu dữ liệu, bắt buộc/không) chưa? | Y | | |
| B2 | Nghiệp vụ yêu cầu gì để xác nhận bên gửi là hợp lệ (ai được phép gửi, xác nhận bằng cách nào)? | N | | |
| B3 | Hệ thống bên kia có thể gửi lại cùng một yêu cầu nhiều lần không (do họ không nhận được phản hồi kịp)? Nếu có, xử lý trùng thế nào? | N | | |
| B4 | Mã lỗi trả về cho từng trường hợp sai (sai định dạng, trùng dữ liệu, không tìm thấy, lỗi hệ thống nội bộ) đã liệt kê rõ chưa? | N | | |
| B5 | Thời gian phản hồi tối đa chấp nhận được là bao nhiêu (ảnh hưởng việc SA chọn xử lý xong mới trả lời, hay trả lời ngay rồi xử lý sau)? | N | | |
| B6 | Nếu yêu cầu hợp lệ nhưng một bước xử lý nội bộ sau đó lỗi, trong khi hệ thống đã báo thành công cho bên kia rồi thì xử lý thế nào (có cần báo ngược lại không)? | N | | |

---

## Phụ lục C. Inbound Message Queue (nhận message bất đồng bộ)

*Vì sao SA cần thông tin này:* để thiết kế bên nhận message: nhận biết trùng, thứ tự, xử lý message lỗi và thử lại. Thiếu thì có thể mất hoặc xử lý trùng message.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| C1 | Đã mô tả rõ cấu trúc bản tin bên kia gửi sang (các trường, kiểu dữ liệu) chưa? | Y | | |
| C2 | Bản tin có thể đến trùng lặp không (do bên gửi gửi lại)? Nếu có, dựa vào thông tin nào để nhận biết là bản tin trùng? | N | | |
| C3 | Thứ tự xử lý bản tin có quan trọng không (vd: bản tin sau phụ thuộc bản tin trước)? Nếu có, yêu cầu gì khi bản tin đến sai thứ tự? | N | | |
| C4 | Khi bản tin không xử lý được (dữ liệu sai, lỗi nghiệp vụ), xử lý thế nào: bỏ qua, đẩy vào hàng đợi lỗi (dead-letter) để xử lý thủ công, hay dừng toàn bộ? | N | | |
| C5 | Có giới hạn số lần thử xử lý lại khi xử lý bản tin thất bại không? | N | | |
| C6 | Nếu một bản tin lỗi cứ lặp đi lặp lại và không xử lý được, nghiệp vụ mong muốn hệ thống phản ứng thế nào (cảnh báo ai, có giữ các bản tin sau lại không)? | N | | |

---

## Phụ lục D. Batch job / tác vụ nền

*Vì sao SA cần thông tin này:* để thiết kế lịch chạy, khả năng chạy lại hoặc tiếp tục, và chống chạy chồng. Thiếu thì job có thể bỏ sót, chạy trùng hoặc để lại dữ liệu dở dang.

| Mã | Câu hỏi | Chặn? | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- |
| D1 | Lịch chạy của job đã rõ chưa (giờ chạy, tần suất: hàng ngày/hàng giờ/theo kỳ)? | N | | |
| D2 | Nếu job chạy lỡ (trễ giờ, hệ thống ngừng hoạt động lúc đến giờ chạy), nghiệp vụ mong muốn xử lý thế nào (bỏ qua, chạy bù ngay khi server lên)? | N | | |
| D3 | Nếu job đang chạy giữa chừng thì lỗi (sự cố hệ thống, mất kết nối cơ sở dữ liệu), nghiệp vụ muốn tiếp tục từ chỗ đã dừng hay chạy lại từ đầu? Dữ liệu đã xử lý một phần được giữ nguyên hay hoàn tác? | N | | |
| D4 | Hai lượt chạy job có thể chồng nhau không (lượt trước chưa xong, lượt sau đã đến giờ)? Nếu có, xử lý thế nào? | N | | |
| D5 | Kết quả job (thành công, thất bại, số bản ghi xử lý) có cần thông báo/báo cáo cho ai không? | N | | |

---

# PHẦN C. VIỆC SA TỰ XỬ KHI THIẾT KẾ (không hỏi BA)

Chỉ liệt kê trong kết quả review, không đưa vào câu hỏi cho BA: mô hình dữ liệu chi tiết và migration, kiểu dữ liệu vật lý (Oracle) dựa trên từ điển dữ liệu BA đã mô tả ở 2.1, hợp đồng API, bảo mật truy vấn động (whitelist, tham số hoá), chống ghi đồng thời khi tạo mới, chọn mẫu tích hợp liên dịch vụ (REST/MQ/SAGA/outbox), số truy vấn theo ngưỡng chuẩn org, chuẩn giao diện đã có trong org. Thêm: các mục ❓ cần SA đối chiếu (mockup, chuẩn org, danh mục mã).

---

# PHẦN D. HƯỚNG DẪN SỬ DỤNG

## Hướng dẫn sử dụng và nạp làm kiến thức cho Claude

1. **Xác định loại SRS trước khi review**: CRUD UI / Inbound API / Inbound MQ / Batch, hoặc kết hợp nhiều loại. Áp dụng Phần A (Core, Mục 1–8) + đúng (các) phụ lục tương ứng ở Phần B.
2. **Nạp tài liệu này** vào project knowledge (hoặc skill riêng) cùng với: danh mục mã lỗi/thông báo chung của dự án (khi có), mẫu SRS chuẩn, và quy ước đặt tên chức năng, để Claude đối chiếu chính xác thay vì suy đoán. Không `@`-import vào `CLAUDE.md` gốc (tránh nạp mọi phiên); đặt ở nơi Claude đọc theo nhu cầu (ví dụ `project-knowledge/review/`).
3. **Khi review một SRS cụ thể**, yêu cầu Claude: với mỗi câu hỏi, đánh giá ✅ ĐẠT / ✅ ĐẠT THEO CHUẨN ORG / ❌ CHƯA ĐẠT / ➖ N/A / ❓ CHƯA KIỂM dựa trên nội dung SRS (trích dẫn rõ căn cứ, không tự suy luận thay BA), rồi áp quy tắc phán định ở 0.4 để kết luận.
4. **Lệnh ví dụ**: *"Review SRS (không phải review code hay thiết kế) trong thư mục `<đường dẫn thư mục SRS>`, theo checklist `project-knowledge/review/SRS_Gateway_Review_Checklist_v2.1.md`. Đọc SRS và mọi tài liệu kèm theo (issues log, mockup nếu có). Ở đầu kết quả ghi rõ loại SRS đã chọn kèm lý do, và danh sách file đã đọc / chưa đọc. Ghi kết quả vào `<đường dẫn thư mục SRS>/<MÃ_CHỨC_NĂNG>_SRS_SA_Review.md`."*
5. **Việc đang để ngỏ, cần bổ sung sau khi có thêm thông tin dự án**:
   - Danh mục mã lỗi/thông báo chuẩn hóa toàn dự án (hiện chưa có; khi có, bổ sung câu hỏi đối chiếu đúng mã vào 8.2, A2.5, B4).
   - Pattern tích hợp chuẩn (SAGA, outbox...) nếu dự án thống nhất dùng chung, có thể bổ sung câu hỏi kỹ thuật tham chiếu vào Mục 4.
6. **Checklist này không thay việc SA đọc toàn bộ SRS**; nó là bộ lọc để SRS đủ chi tiết ở mức tối thiểu trước khi SA bắt đầu thiết kế, tránh phải quay lại hỏi BA giữa chừng.

---

# PHẦN E. MẪU KẾT QUẢ REVIEW

Claude xuất kết quả theo thứ tự sau (một file, kết quả ở đầu):

```
# Gateway Review SRS — <MÃ_CHỨC_NĂNG>
> Đối tượng rà: <SRS, phiên bản, trạng thái>; tài liệu kèm: <issues log, mockup (đã/chưa đọc)>
> Chưa đối chiếu được: <catalog mã, chuẩn org, spec phụ thuộc...>
> Loại SRS: <CRUD UI / Inbound API / Inbound MQ / Batch> kèm lý do

## Chú giải icon
<bảng chú giải ở mục 0A.7, giữ nguyên văn>

## Kết quả rà soát
> **<SA tiếp nhận | SA tiếp nhận để thiết kế, còn điểm cần làm rõ | SA không nhận SRS>**: <lý do một câu>
**Điểm chặn cần BA chốt** (nếu có): bảng Mã | SA đang thiếu | Câu hỏi số
**Tổng hợp theo mục**: bảng ✅ | ❌ (trong đó Chặn=Y) | ➖ | ❓

## Kết quả chi tiết theo mục
Mỗi mục lớn: dòng "Vì sao SA cần thông tin này", rồi bảng Mã | Câu hỏi | Chặn | Kết quả | Căn cứ trong SRS
Ngay dưới bảng: chi tiết các mục ❌ theo mẫu 0A.4

## Việc SA tự xử khi thiết kế

## Đề xuất điều chỉnh checklist (nếu có)
Cột Chặn hoặc câu hỏi không hợp với SRS này: ghi nhận xét ở đây; không tự đổi.

## Cảnh báo cho BA (không tính điểm)
Kết quả mục 8.5: mỗi điểm lệch giữa mockup và SRS gồm trích dẫn SRS, trích dẫn mockup (file:dòng), mô tả lệch. Không kết luận bên nào đúng. Không có thì ghi "Không có cảnh báo"; chưa có mockup thì ghi "chưa kiểm".

## Danh sách câu hỏi cho BA
Bảng # | Câu hỏi | Mục. Câu chặn đứng đầu, gắn nhãn; câu nhiều ý tách thành câu con.
```

Ghi chú: lưu kết quả của từng SRS thành file riêng (ví dụ cạnh SRS), không ghi đè file checklist này.

