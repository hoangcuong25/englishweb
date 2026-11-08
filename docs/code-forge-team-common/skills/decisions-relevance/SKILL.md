---
description: >
  Rà soát kho ADR (Architecture Decision Records) của project để bắt quyết định lỗi thời,
  mồ côi hoặc mâu thuẫn. Kích hoạt khi "rà ADR", "soi quyết định kiến trúc", "kiểm tra
  decisions", "ADR nào còn hiệu lực"; hoặc do agent architect-reviewer gọi khi review thiết kế;
  hoặc khi sửa architecture.md (kiểm quyết định cũ có bị việc mới supersede không). CHỈ phát
  hiện + gợi ý, KHÔNG tự sửa ADR.
---

# Decisions Relevance Skill — Rà soát ADR

## MUST trigger (tự động)

**MUST** thực thi skill này khi:
- User yêu cầu rà/soi ADR: "rà ADR", "soi quyết định kiến trúc", "kiểm tra decisions", "ADR nào còn hiệu lực".
- Agent `architect-reviewer` gọi trong lúc review thiết kế (soi ADR liên quan chức năng đang review).
- Trước/sau khi **sửa `architecture.md`** — kiểm quyết định cũ có bị thay đổi này làm lỗi thời/supersede không.

> Phân biệt: skill này **rà ADR đã có** (chất lượng kho quyết định). Việc **sinh** ADR mới là của
> agent `solution-architect` (khi có quyết định kiến trúc lớn trong thiết kế).

## Mục đích

ADR tích lũy dần sẽ trôi dạt: quyết định bị thay thế nhưng vẫn được tham chiếu như còn hiệu lực,
link supersede gãy, hoặc 2 ADR mâu thuẫn cùng chủ đề. Skill soi các vấn đề đó và **gợi ý** xử lý —
giữ kho quyết định đáng tin làm đầu vào cho `solution-architect` / `developer-*`.

## Phạm vi rà

- **Chính:** `project-knowledge/decisions/` của project (nơi ADR project-level sống).
- **Phụ (nếu có):** ADR org-wide trong `code-forge-team-common/knowledge/decisions/` (submodule) — chỉ rà khi user yêu cầu rõ.
- **Bỏ qua:** `_template.md`, `README.md`, mọi file `_`-prefix, `.gitkeep`.

## Quy trình

### Bước 1 — Thu thập
- Liệt kê ADR: `project-knowledge/decisions/NNNN-*.md` (bỏ qua các file ở "Phạm vi rà").
- Với mỗi ADR, đọc bảng metadata: **Trạng thái**, **Ngày**, **Người quyết định**, **Liên quan**; và tiêu đề (`# ADR-NNNN: ...`).
- Quét tham chiếu tới ADR ở `architecture.md §5` và ở phần "Liên quan"/"Superseded by" của các ADR khác.

### Bước 2 — Soi (checklist)
1. **Lỗi thời còn được tin dùng** — ADR `Deprecated`/`Superseded by ...` nhưng vẫn bị `architecture.md` hoặc một ADR `Accepted` khác trỏ tới như căn cứ hiện hành.
2. **Mồ côi / link gãy** — "Superseded by ADR-NNNN" hoặc "Liên quan → ADR-NNNN" trỏ tới file **không tồn tại**; hoặc ADR bị supersede nhưng ADR thay thế không trỏ ngược lại.
3. **Mâu thuẫn** — ≥2 ADR `Accepted` cùng chủ đề nhưng quyết định trái nhau (không cái nào `Superseded`).
4. **Trạng thái treo** — ADR còn `Proposed` (chưa `Accepted`) → nhắc chốt qua MR trước khi code bám theo.
5. **Sai quy ước đánh số** — trùng `NNNN` giữa 2 file (gap thì KHÔNG lỗi — `README.md` cho phép không tái dùng số).
6. **Sửa nội dung ADR đã `Accepted`** — nếu phát hiện ADR `Accepted` bị chỉnh nội dung (thay vì tạo ADR mới + `Superseded`) → cảnh báo vi phạm vòng đời (`decisions/README.md`).

### Bước 3 — Báo cáo (KHÔNG tự sửa)
```
## Kết quả rà ADR — <project>

### 🔴 Cần xử lý (lỗi thời còn tin dùng / mâu thuẫn / link gãy)
- [ADR-NNNN + vị trí] Mô tả + gợi ý (vd: cập nhật `architecture.md §5` trỏ ADR-MMMM; đánh dấu Superseded)

### 🟡 Cần theo dõi (Proposed treo / thiếu link ngược)
- [ADR-NNNN] Mô tả + gợi ý

### ✅ Nhất quán
- Tóm tắt ADR còn hiệu lực (Accepted) hiện tại
```

## Ràng buộc

- **KHÔNG tự sửa ADR / `architecture.md`** — chỉ phát hiện + gợi ý. Sửa ADR đi qua `solution-architect` + MR (theo vòng đời `decisions/README.md`).
- **KHÔNG tạo ADR mới** — đó là việc của `solution-architect`.
- Không có ADR nào (kho rỗng) → báo "chưa có ADR để rà", kết thúc; KHÔNG bịa vấn đề.
- Mọi phát hiện phải trỏ **cụ thể** file ADR + mục.

## Liên kết

- Sinh ADR mới → agent `solution-architect` (khi có quyết định kiến trúc lớn trong thiết kế)
- Duyệt Proposed→Accepted + gọi skill này → agent `architect-reviewer`
- Quy ước đánh số & vòng đời ADR → `project-knowledge/decisions/README.md`
- Quyết định nhẹ trong phiên (KHÁC ADR) → `.claude/state/<dev-id>/decisions-log.md`
