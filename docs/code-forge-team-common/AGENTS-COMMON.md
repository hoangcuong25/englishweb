# AGENTS.md — Agent Routing & Execution Guide

> ⚠️ **File này là ORG-OWNED.** Nguồn sự thật = `code-forge-team-common/AGENTS-COMMON.md`; mỗi lần
> `resource-sync` nó được **đổi tên → `.claude/AGENTS.md` và GHI ĐÈ** (cùng version submodule với các
> agent trong `.claude/agents/`). **KHÔNG sửa trực tiếp `.claude/AGENTS.md` trong project** — thay đổi
> routing đi qua MR vào team-common.
>
> Claude session mặc định = **coordinator** (điều phối và thực thi).
> Khi nhận request phù hợp, coordinator **tự đọc procedure của agent và thực thi inline** —
> không yêu cầu user switch thủ công.
>
> Agent file = bộ quy trình bắt buộc coordinator nhúng vào và thực hiện.
> Không phải UI session riêng cần switch tay.

---

## §1 — Decision Tree

> **Bước 0 — Stack detection theo tầng:** xác định tầng của thay đổi trước khi chọn procedure.
> Phía **server** (API, service, dữ liệu, business logic) → **Backend**; **giao diện / client** (màn hình,
> component, view, luồng tương tác) → **Frontend**. Loại file mỗi tầng tuỳ stack dự án (xem `tech-stack.md`).
> Không rõ tầng → hỏi user 1 câu, KHÔNG tự đoán.

```
Nhận request
│
├── Thiết kế từ spec (API / luồng / component & class — CHƯA viết code)
│   └── (scope theo phạm vi project) → MUST thực thi procedure `solution-architect` (.claude/agents/solution-architect.md)
│
├── Review TÀI LIỆU THIẾT KẾ (trước khi code)
│   └── (scope theo phạm vi project) → MUST thực thi procedure `architect-reviewer` (.claude/agents/architect-reviewer.md)
│
├── Viết / implement / tạo / build / thêm code
│   ├── Backend (server)    → MUST thực thi procedure `developer-backend`  (.claude/agents/developer-backend.md)
│   └── Frontend (UI/client) → MUST thực thi procedure `developer-frontend` (.claude/agents/developer-frontend.md)
│
├── Review code / check trước merge / chuẩn bị MR
│   ├── Backend  → MUST thực thi procedure `code-reviewer-backend`  (.claude/agents/code-reviewer-backend.md)
│   └── Frontend → MUST thực thi procedure `code-reviewer-frontend` (.claude/agents/code-reviewer-frontend.md)
│
└── Hỏi đáp / explain / tìm kiếm / đọc hiểu code
    └── OK → xử lý trực tiếp (không cần procedure đặc biệt)
```

> **Tầng Thiết kế là tùy chọn, đứng TRƯỚC tầng code:** chuỗi đầy đủ cho chức năng mới =
> `solution-architect` (sinh tài liệu thiết kế, scope theo project) → `architect-reviewer` (soi) → `developer-*` (code bám thiết kế).
> Request "thiết kế/đặc tả/design từ spec" ≠ "implement" — chọn `solution-architect`, KHÔNG nhảy thẳng vào code.

---

## §2 — Mô tả procedure từng agent

> Mỗi agent tách 2 biến thể theo stack. Chọn đúng biến thể theo Bước 0 (stack detection).
> `task-state-init` + `progress-tracker` dùng chung mọi stack (không tách).
> `solution-architect` + `architect-reviewer` **không tách thành 2 biến thể BE/FE** — là 1 agent xuyên tầng,
> nhưng **scope output theo phạm vi tầng của project** (BE-only / FE-only / full-stack; không rõ → hỏi user).

### `solution-architect` (xuyên tầng, scope theo project — tầng Thiết kế)

- **Trigger:** "thiết kế [X]", "design API/luồng/class", "làm đặc tả / solution design từ spec",
  "đặc tả API cho [X]" — **chưa phải** lệnh viết code.
- **Procedure file:** `.claude/agents/solution-architect.md` — 4 bước.
- **MUST trong procedure:**
  - Đọc spec BA + `architecture.md` + `api-convention.md` + `design-standards.md`.
  - **Xác định phạm vi tầng project** (BE-only / FE-only / full-stack; không rõ → hỏi user) → chỉ thiết kế tầng đó.
  - Sinh tài liệu (`API_Spec`, `Component_Class_Design`, `Processing_Flow`) vào
    `project-knowledge/design/<MÃ_CHỨC_NĂNG>/` (copy từ `_template/`), **chỉ phần thuộc phạm vi**, nhất quán lẫn nhau.
  - Đánh dấu `[cần xác nhận]` cho điểm chưa map — KHÔNG đoán.
  - **Ghi ADR (`Proposed`)** cho quyết định kiến trúc lớn (đánh đổi/lâu dài/xuyên chức năng) vào
    `project-knowledge/decisions/` + trỏ ở `architecture.md §5`; quyết định nhẹ → `decisions-log.md` (KHÔNG lạm ADR).
  - KHÔNG viết code production; gợi ý chạy `architect-reviewer` sau khi xong.

### `architect-reviewer` (xuyên tầng — review thiết kế)

- **Trigger:** "review thiết kế", "soi design", "kiểm tra bản thiết kế / đặc tả API".
- **Procedure file:** `.claude/agents/architect-reviewer.md` — 4 nhóm tiêu chí + súc tích + **ADR**.
- **ADR:** bắt quyết định lớn thiếu ADR; **gọi skill `decisions-relevance`** soi kho ADR (lỗi thời/mồ côi/mâu thuẫn); khuyến nghị `Proposed→Accepted`.
- **Output:** CRITICAL / MAJOR / MINOR + danh sách `[cần xác nhận]` chặn việc code. KHÔNG tự sửa tài liệu **hay ADR**.

### `developer-backend` / `developer-frontend`

- **Trigger:** "implement [X]", "viết [X]", "tạo [X]", "build [X]", "thêm tính năng [X]",
  "code cho tôi", "triển khai [X]" — chọn biến thể theo tầng (thay đổi phía server → backend; giao diện/client → frontend)
- **Procedure file:** `.claude/agents/developer-backend.md` / `.claude/agents/developer-frontend.md` — 4 bước bắt buộc (+ Bước 2a: quét tái sử dụng)
- **MUST trong procedure:**
  - Chạy `task-state-init` nếu chưa có `current-task.md` với `status: in_progress`
  - **Bước 2a — chạy skill `reuse-scan`** trước khi liệt kê file sẽ tạo: quét thư viện dùng chung /
    module dùng chung project đang dùng (căn cứ source hiện tại; cách tra do skill tự chọn theo công cụ
    thực tế đang có); ghi **Reuse Report**
    vào mục "Tái sử dụng" của `current-task.md`; kế hoạch trình user phải kèm bảng này
  - **Tuân thủ MỌI playbook đang bật** trong `.claude/settings.json` (vd TDD → test-first Red→Green→Refactor).
    Nhiều playbook → tuân thủ tất cả; mâu thuẫn không thể đồng thời → dừng, hỏi user.
  - **Chạy lại test sau khi viết/sửa implementation, xác nhận TẤT CẢ PASS** (dán output) trước khi
    tick DoD / đổi `status: done` — mọi mode, kể cả khi không bật playbook nào
    (framework test theo `tech-stack.md` của tầng tương ứng)
  - Gọi `progress-tracker` sau MỖI bước hoàn thành (không chờ user hỏi)
  - Không cài thư viện ngoài danh sách được duyệt trong `tech-stack.md` của tầng tương ứng

### `code-reviewer-backend` / `code-reviewer-frontend`

- **Trigger:** "review code", "check code", "tạo MR", "chuẩn bị merge",
  "kiểm tra code", "review cho tôi" — chọn biến thể theo stack của thay đổi
- **Procedure file:** `.claude/agents/code-reviewer-backend.md` / `.claude/agents/code-reviewer-frontend.md` — 5 chiều review (gồm Reuse & Duplication)
- **Output:** CRITICAL / MAJOR / MINOR với gợi ý sửa cụ thể

---

## §3 — Khi nào xử lý trực tiếp (không cần procedure đặc biệt)

| Loại request | Xử lý trực tiếp? |
|---|---|
| Giải thích code / "code này làm gì" | ✅ OK |
| Tìm kiếm / tra cứu / câu hỏi kỹ thuật | ✅ OK |
| Phân tích log / đọc error message | ✅ OK — nhưng debug flow phải theo skill `debug-*` (đúng stack) |
| Tổng hợp / tóm tắt / so sánh | ✅ OK |
| Thiết kế từ spec (API/luồng/class — chưa code) | ✗ MUST theo procedure `solution-architect` |
| Review tài liệu thiết kế trước khi code | ✗ MUST theo procedure `architect-reviewer` |
| Viết / sửa code production | ✗ MUST theo procedure `developer-*` (đúng stack); nếu có thiết kế → đọc & bám (Bước 1) |
| Review trước khi merge | ✗ MUST theo procedure `code-reviewer-*` (đúng stack) |

---

## §4 — Cách coordinator thực thi procedure

Khi decision tree dẫn đến một procedure:

1. **Thông báo ngắn** cho user biết đang bắt đầu procedure nào (kèm stack đã nhận diện):
   > "Bắt đầu quy trình `developer-backend` (tầng: server) — Bước 1: Đọc context..."
2. **Đọc file procedure** tương ứng trong `.claude/agents/<tên>.md` (đọc on-demand khi decision tree chọn — KHÔNG nạp eager).
3. **Thực thi tuần tự từng bước** — không bỏ bước, không nhảy cóc.
4. **Cập nhật trạng thái** sau mỗi bước xong (skill `progress-tracker`).

### NEVER

- **NEVER** yêu cầu user switch sang agent trong UI để xử lý request.
- **NEVER** hỏi "anh muốn switch sang developer không?" — tự thực thi ngay.
- **NEVER** bỏ qua bước nào trong procedure với lý do "nhanh hơn".
