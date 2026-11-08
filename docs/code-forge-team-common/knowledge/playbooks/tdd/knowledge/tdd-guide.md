# TDD Workflow — Knowledge

> Lớp 1 (Knowledge) của playbook TDD. Giải thích **tại sao** và **làm thế nào** để Claude + dev
> áp dụng đúng. Lớp này luôn được nạp qua `CLAUDE.md §5`; **chỉ áp dụng** quy trình khi `playbooks.tdd.enabled = true`.

## Tại sao TDD

- **Test là spec sống**: viết test trước buộc làm rõ behavior mong muốn TRƯỚC khi code.
- **Thiết kế tốt hơn**: code dễ test ⇒ ít phụ thuộc cứng, tách bạch trách nhiệm.
- **An toàn refactor**: có lưới test ⇒ đổi cấu trúc mà không sợ phá behavior.
- **Phản hồi nhanh**: lỗi lộ ra ngay ở bước nhỏ, không dồn tới cuối.

## Quy tắc bắt buộc

- **LUÔN** viết test TRƯỚC khi viết code implementation.
- Chu trình **Red → Green → Refactor**, lặp cho từng behavior nhỏ.
- Mỗi commit phải có test đi kèm — **không có ngoại lệ** cho logic nghiệp vụ.
- **KHÔNG** viết nhiều test cùng lúc — từng test một, từng behavior một.

## Chu trình Red → Green → Refactor

### 🔴 Red — viết test thất bại trước

- Viết **1** test case cho behavior cần implement.
- Chạy test → **phải FAIL**. Nếu pass ngay ⇒ test sai hoặc behavior đã tồn tại → viết lại.
- Test phải fail vì *thiếu implementation*, không phải vì lỗi cú pháp/import.

### 🟢 Green — viết code tối thiểu để pass

- Viết code **tối thiểu** đủ làm test pass. Được phép "hard-code" tạm nếu đó là cách nhỏ nhất.
- **KHÔNG** viết thêm code "phòng xa" cho behavior chưa có test (No Over-Engineering).
- Chạy test → **phải PASS**.

### 🔵 Refactor — cải thiện không đổi behavior

- Khử trùng lặp, đặt tên rõ, tách hàm — **KHÔNG thêm behavior mới**.
- Chạy lại toàn bộ test → **phải vẫn PASS**.
- Sau cycle hoàn chỉnh: **commit** (test + code cùng nhau).

## Quy ước test file (để hook & CI nhận diện)

Hook `tdd-guard.js` coi là "có test" nếu tồn tại file test tương ứng theo một trong các quy ước:

| Ngôn ngữ | Source | Test tương ứng |
|---|---|---|
| JS/TS | `src/foo/bar.ts` | `bar.test.ts` / `bar.spec.ts` (cùng thư mục) hoặc `__tests__/bar.test.ts` |
| Python | `src/foo/bar.py` | `test_bar.py` hoặc `tests/test_bar.py` |
| Java | `src/main/java/.../Bar.java` | `src/test/java/.../BarTest.java` |
| Go | `src/foo/bar.go` | `bar_test.go` (cùng thư mục) |

> Nếu dự án dùng quy ước khác, cập nhật danh sách candidate trong `hooks/tdd-guard.js` (mục `testCandidates`).

## Khi nào TDD KHÔNG bắt buộc

- Thay đổi thuần cấu hình / tài liệu / asset tĩnh.
- Spike/prototype dùng-rồi-bỏ (đánh dấu rõ, không merge vào main).
- Code generate tự động đã có test ở tầng generator.
