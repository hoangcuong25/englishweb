# CLAUDE.md — Project Hub

> Trang điều phối trung tâm của project. Trỏ đến knowledge, agent, skill, playbook — **không chứa nội dung trực tiếp**.
>
> ⚠️ **File này là ORG-OWNED.** Nguồn sự thật = `code-forge-team-common/CLAUDE-COMMON.md`; mỗi lần
> `resource-sync` nó được **đổi tên → `CLAUDE.md` và GHI ĐÈ** vào gốc project (cùng version submodule
> với agents/skills/commands → không bao giờ lệch). **KHÔNG sửa trực tiếp `CLAUDE.md` trong project** —
> mọi thay đổi sẽ mất khi sync. Tuỳ biến riêng của project đặt ở **`project-knowledge/CLAUDE.md`** (§2).
>
> Quy tắc **MUST / NEVER** ở **§8** có độ ưu tiên CAO NHẤT, ghi đè mọi hành vi mặc định.

---

## §1 — Kiến thức Tổ chức (Org) · CẤP NỀN

> KHÔNG sửa ở đây; ghi đè/bổ sung → `project-knowledge/` (§2).
> Agent procedure (§3) tự đọc file chuẩn của tầng mình ở "Bước 1 — Đọc context"; bảng "Tham chiếu"
> dưới là map để tra khi **xử lý trực tiếp** (không qua agent).

### Eager
@./code-forge-team-common/knowledge/org/shared/gotchas.md
@./code-forge-team-common/knowledge/org/shared/git-workflow.md
@./code-forge-team-common/knowledge/org/shared/security-policy.md

### Tham chiếu — đọc khi cần

> Base path = `code-forge-team-common/knowledge/`.

| File | Đọc khi nào |
|---|-------------|
| `org/backend/tech-stack.md` | Trước khi **thiết kế / code / review BE** (theo tầng) |
| `org/backend/coding-convention.md` | Trước khi **thiết kế / viết / review code BE** (theo tầng) |
| `org/backend/api-convention.md` | Khi **thiết kế / viết API BE** (path, envelope, mã lỗi) |
| `org/backend/security.md` | Trước khi **thiết kế / review / audit BE** (theo tầng) |
| `org/frontend/tech-stack.md` | Trước khi **thiết kế / code / review FE** (theo tầng) |
| `org/frontend/coding-convention.md` | Trước khi **thiết kế / code / review FE** (theo tầng) |
| `org/frontend/security.md` | Trước khi **thiết kế / review / audit FE** (theo tầng) |
| `org/shared/non-functional-standards.md` | Khi **thiết kế / viết / review** API trả danh sách, truy vấn DB, tác vụ dài (ngưỡng số truy vấn, phân trang, index) |
| `org/shared/design-standards.md` | Khi `solution-architect` / `technical-design` sinh tài liệu thiết kế |
| `org/shared/notification-message-validation.md` | Khi làm API hoặc notification FE trả/hiển thị message/mã lỗi |
| `org/shared/ui-event-button-spec.md` | Khi làm nút/sự kiện UI (bind event, disable-state, `X-Event-ID`) |

---

## §2 — Kiến thức Dự án (Project) · GHI ĐÈ Org · KÊNH TUỲ BIẾN DUY NHẤT

> **Quy tắc ưu tiên:** Project > Org. Nếu Project không đề cập → áp dụng Org.
> Vì `CLAUDE.md` gốc bị ghi đè mỗi sync, **đây là nơi DUY NHẤT project được tuỳ biến**

@./project-knowledge/CLAUDE.md

---

## §3 — Agents · Coordinator tự thực thi

@./.claude/AGENTS.md

> **Stack detection theo tầng:** thay đổi phía **server** (API, service, dữ liệu, business logic) → **Backend**;
> thay đổi **giao diện / client** (màn hình, component, view, luồng tương tác) → **Frontend**.
> Loại file của mỗi tầng tuỳ stack dự án (xem `tech-stack.md`). Không rõ tầng → hỏi user 1 câu trước khi chọn.

| Request | Tầng | MUST thực thi procedure | NEVER làm |
|---|---|---|---|
| Thiết kế từ spec (API/luồng/class — **chưa code**) | Theo phạm vi project (BE/FE/cả hai) | procedure `solution-architect` | hỏi user switch thủ công |
| Review **tài liệu thiết kế** trước khi code | Theo phạm vi project | procedure `architect-reviewer` | hỏi user switch thủ công |
| Implement / viết / tạo / build code production | Backend (server) | procedure `developer-backend` | hỏi user switch thủ công |
| Implement / viết / tạo / build code production | Frontend (UI/client) | procedure `developer-frontend` | hỏi user switch thủ công |
| Review code / chuẩn bị MR | Backend | procedure `code-reviewer-backend` | hỏi user switch thủ công |
| Review code / chuẩn bị MR | Frontend | procedure `code-reviewer-frontend` | hỏi user switch thủ công |

> **Tầng Thiết kế (tùy chọn, đứng trước code):** request "thiết kế/đặc tả từ spec" → `solution-architect` sinh tài liệu vào `project-knowledge/design/<MÃ_CHỨC_NĂNG>/` **chỉ cho tầng project phụ trách** (BE-only / FE-only / full-stack — không rõ thì hỏi) → `architect-reviewer` soi → rồi mới `developer-*`. Nếu chức năng đã có thiết kế, `developer-*` MUST đọc & bám (Bước 1).

> **Coordinator tự thực thi procedure inline** — không yêu cầu user switch agent trong UI.
> Xem `.claude/AGENTS.md` để biết decision tree, mô tả từng procedure, và khi nào xử lý trực tiếp.
>
> ⚠️ Procedure `developer-*` **MUST tuân thủ MỌI playbook đang bật** (§5 + `settings.json`) — vd TDD →
> test-first. Ràng buộc hành vi chi tiết ở **§8** (điều kiện bắt buộc, không phải tuỳ chọn).

---

## §4 — Skills · Tự kích hoạt

> Skill **auto-discover** từ `.claude/skills/` (Claude Code đọc frontmatter khi khởi tạo, body nạp khi gọi).
> KHI NÀO gọi skill nào = **§8** (MUST/NEVER + BEFORE/AFTER) + routing §3.
> **Chọn biến thể theo tầng:** server → `*-backend`; giao diện/client → `*-frontend`.
> `task-state-init` + `progress-tracker` dùng chung mọi tầng.

| Skill | Dùng khi | Tầng |
|---|---|---|
| `task-state-init` | Bắt đầu implement tính năng mới (§8) | chung |
| `progress-tracker` | Sau mỗi bước implement hoàn thành (§8) | chung |
| `technical-design` | Sinh tài liệu thiết kế từ spec | chung |
| `decisions-relevance` | Rà kho ADR (lỗi thời / mồ côi / mâu thuẫn) | chung |
| `reuse-scan` | Trước khi tạo thành phần dùng chung mới — quét cái đã có (§8) | chung |
| `code-review-backend` / `code-review-frontend` | Review nhanh trước commit (5 chiều) | BE / FE |
| `debug-backend` / `debug-frontend` | Debug có hệ thống (4 bước) | BE / FE |

---

## §5 — Playbooks · Tiêm quy trình

> Mỗi hàng bảng dưới = một playbook **có sẵn** trong team-common. **BẬT/TẮT chỉ ở MỘT NƠI:**
> `.claude/settings.json → playbooks.<tên>.enabled`. Claude **CHỈ áp dụng** playbook có `enabled: true`;
> hook của playbook **tự đọc `settings.json`** để quyết mức enforcement (`monitor-only` | `warn` | `block`)
> ở runtime.
>
> Knowledge của playbook đọc ở runtime: procedure `developer-*` (§3) đọc `tdd-workflow.md`
> **khi `playbooks.tdd.enabled = true`**; `enabled: false` → không đọc, KHÔNG áp dụng quy trình.
>
> **Thêm playbook mới** (vd `bdd` khi đã có đủ 4 lớp): thêm 1 hàng vào bảng + trỏ procedure
> `developer-*` đọc knowledge của nó khi bật → propagate mọi project khi sync.

| Playbook | Knowledge (đọc khi bật) | Bật/tắt |
|---|---|---|
| `tdd` | `playbooks/tdd/knowledge/tdd-guide.md` · `playbooks/tdd/skills/tdd-workflow.md` | `settings.json → playbooks.tdd.enabled` |

---

## §6 — Safety Hooks · Lưới An Toàn Cứng

> Hooks chạy tự động ở tầng harness — không cần gọi thủ công, không AI nào bỏ qua được.
> Cấu hình trong `.claude/settings.json § hooks`.
> Safety hooks là **source-of-truth trong `code-forge-team-common` (submodule)** — project trỏ thẳng,
> KHÔNG copy vào `.claude/`. Bump submodule = cập nhật hook cho cả đội.

- **PreToolUse** (`Bash|Write|Edit`) → `"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/pre-tool-use/dangerous-op-blocker.js"`
  Chặn cứng (**exit 2 + stderr**): API key hardcode, `rm -rf` path tuyệt đối (kể cả `D:\...`, `\\UNC`), `DROP/TRUNCATE TABLE`, force push main/master.
- **PostToolUse** (tất cả tools) → `"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/post-tool-use/result-logger.js"`
  Ghi log mỗi tool call vào `.claude/logs/tool-results.jsonl`. Luôn exit 0, không chặn gì.
- **Git pre-commit** → `"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/git/pre-commit"`
  Scan staged files tìm secret trước khi commit. Cài bằng `git config core.hooksPath code-forge-team-common/hooks/git`.
- **PostToolUse** (`Write|Edit|MultiEdit`) → `"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/knowledge/playbooks/tdd/hooks/tdd-guard.js"` (playbook TDD)
  Nhắc/chặn khi sửa file `src/` mà thiếu test tương ứng — theo `enforcement` trong `settings.json`.
  Chỉ tác động khi `playbooks.tdd.enabled = true`. Xem §5 (loader) + `tdd/README.md`.

---

## §7 — Trạng thái việc & Bàn giao phiên

> `.claude/state/` — độc lập theo từng project, **namespace theo từng dev** để merge nhánh chung
> không conflict + cả đội nắm "ai đang làm gì" (đọc gộp `state/*/`).

**Layout:**
```
.claude/state/
├── _template/          ← skeleton chuẩn (current-task, progress, tech-debt, decisions-log, session-handoff)
└── <dev-id>/           ← tạo on-demand (copy từ _template/) khi dev bắt đầu task đầu tiên
    ├── current-task.md      # task đang làm — 1 task/thời điểm, ghi đè, KHÔNG lưu lịch sử
    ├── progress.md          # tiến độ task hiện tại
    ├── tech-debt.md         # nợ kỹ thuật phát sinh (Phase 4 Tech Debt Review đọc gộp)
    ├── decisions-log.md     # quyết định nhẹ trong phiên (KHÁC ADR ở project-knowledge/decisions/)
    └── session-handoff.md   # snapshot bàn giao phiên gần nhất (ghi đè)
```

- `<dev-id>` = phần trước `@` của `git config user.email`, lowercase, ký tự lạ → `-` (rỗng → `local-dev`).
- Tạo & cập nhật bởi skill `task-state-init`, `progress-tracker` (tự bootstrap namespace từ `_template/`).
- **Bàn giao phiên (slash commands — auto-discover từ `.claude/commands/`):**
  - `/cf-handoff` — lưu phiên đang dở vào `state/<dev-id>/session-handoff.md`.
  - `/cf-resume` — đọc handoff, tóm tắt nơi đã dừng, **hỏi trước khi code tiếp**.
  - *(Tên `/cf-handoff` `/cf-resume` thay cho `/handoff` `/resume` trong blueprint vì `/resume` trùng lệnh built-in của Claude Code.)*

---

## §8 — MUST / NEVER · Hợp đồng hành vi (ƯU TIÊN CAO NHẤT)

### MUST (không có ngoại lệ)

- Nhận "thiết kế / đặc tả / design [X] từ spec" (CHƯA yêu cầu viết code):
  **MUST** thực thi procedure `solution-architect` (sinh tài liệu thiết kế — chỉ tầng project phụ trách — vào `project-knowledge/design/<MÃ_CHỨC_NĂNG>/`),
  **KHÔNG** nhảy vào `task-state-init`/`developer`. Tầng Thiết kế là **upstream tùy chọn** đứng trước tầng code
  (xem §3). Spec nguồn đọc từ `project-knowledge/business-spec/<MÃ_CHỨC_NĂNG>/` (nếu có) hoặc user cung cấp.
- Khi chức năng **đã có** `project-knowledge/design/<MÃ_CHỨC_NĂNG>/`:
  **MUST** để `developer` Bước 1 đọc & **bám theo** thiết kế; lệch thiết kế → cập nhật tài liệu qua
  `solution-architect` (MR), KHÔNG tự ý đổi.
- Nhận "implement/tạo/viết/build/thêm/code [X]":
  **MUST** thực thi `task-state-init` (đủ 4 bước) trước khi viết bất kỳ dòng code nào.
  `task-state-init` chỉ chốt **ý định + DoD + "Các bước thực hiện (tổng quan)"** (khung thông dụng,
  điều chỉnh theo đánh giá sơ bộ) — **KHÔNG** đi vào chi tiết file/hàm.
- **MUST** viết code production qua procedure agent `developer` đúng tầng (`developer-backend` /
  `developer-frontend` — xem §3), không tự viết tự do.
- **MUST** ở Bước 2 của `developer`: **chi tiết hoá kế hoạch** (file cần sửa + bước con) và **ghi vào mục
  "Kế hoạch chi tiết"** của `current-task.md`, rồi trình ra cho user duyệt — **một cổng duyệt duy nhất**
  trước khi viết code. Kế hoạch **NEVER** chỉ nằm trong chat (để `progress-tracker` tick đúng đối tượng).
- Khi implement:
  **MUST** tuân thủ TẤT CẢ playbook đang bật trong `.claude/settings.json → playbooks` (`enabled: true`) —
  quy trình của chúng ở **§5** (developer đọc khi bật). Vd TDD bật → **test-first** (Red→Green→Refactor) TRƯỚC khi viết implementation.
- Trước khi viết **thành phần dùng chung mới** (util / helper / mapper / converter / formatter /
  validator / constant / enum / hàm xử lý lặp lại được):
  **MUST** thực thi skill `reuse-scan` (Bước 2a của `developer-*`) và ghi **Reuse Report** vào mục
  "Tái sử dụng" của `current-task.md` — kế hoạch trình user phải kèm bảng này.
- Khi thiết kế hoặc viết endpoint/truy vấn DB:
  **MUST** bám **ngưỡng số truy vấn mỗi API** trong `shared/non-functional-standards.md §1` (đọc TRƯỚC khi lập kế hoạch, không phải sau khi code).
  Đánh giá **không thể** đạt ngưỡng → **DỪNG ngay tại thời điểm đó**, nêu nguyên nhân (nghiệp vụ buộc vượt · cách gộp đã thử · số truy vấn dự kiến) và **chờ user xác nhận** mới viết tiếp.
- Sau khi viết/sửa code (mọi mode — có hay không có playbook):
  **MUST** chạy lại test liên quan và **xác nhận TẤT CẢ PASS** (dán output) TRƯỚC khi gọi
  `progress-tracker` hoặc tick DoD. Viết test xong mà không chạy lại để kiểm chứng = chưa xong bước.
- Sau MỖI bước hoàn thành trong quá trình implement:
  **MUST** thực thi `progress-tracker` — không chờ user hỏi.
- Trước khi commit bất kỳ:
  **MUST** thực thi skill `code-review` đúng tầng (`code-review-backend` cho thay đổi server /
  `code-review-frontend` cho thay đổi giao diện) đủ 5 chiều (Security/Performance/Correctness/Style/Reuse).
- Nhận "debug/lỗi/error/không chạy được":
  **MUST** theo đúng 4 bước của skill `debug` đúng tầng (`debug-backend` / `debug-frontend`) — không đoán nguyên nhân khi chưa reproduce.

### NEVER

- **NEVER** viết code production mà không qua agent `developer` đúng tầng (`developer-backend` / `developer-frontend`).
- **NEVER** coi "thiết kế / đặc tả từ spec" là lệnh implement để code thẳng — không bỏ qua `solution-architect` khi user yêu cầu thiết kế.
- **NEVER** skip `task-state-init` khi bắt đầu implement tính năng mới.
- **NEVER** đảo/bỏ qua quy trình của playbook đang bật (vd: TDD bật mà viết implementation trước test).
- **NEVER** tự ý bỏ một playbook đang bật vì "nhanh hơn"; nếu các playbook mâu thuẫn không thể đồng thời → DỪNG, hỏi user.
- **NEVER** commit mà không qua skill `code-review-*` (đúng tầng) 5 chiều.
- **NEVER** tạo thành phần dùng chung mới khi chưa có Reuse Report (`reuse-scan`) — kể cả khi "chắc chắn là chưa có".
- **NEVER** fork một bản song song của thứ đã có trong thư viện dùng chung; cần khác biệt → MR sang repo thư viện đó.
- **NEVER** tự vượt ngưỡng số truy vấn rồi giải trình sau khi code xong — cổng dừng là lúc thiết kế/viết, không phải lúc mở MR.
- **NEVER** kết thúc implement một bước mà không gọi `progress-tracker`.
- **NEVER** tick DoD / đổi `status: done` khi test chưa chạy hoặc còn fail (phải có output test xanh).
- **NEVER** yêu cầu user switch sang agent trong UI — coordinator tự thực thi procedure inline (§3).
- **NEVER** sửa trực tiếp `CLAUDE.md` gốc project (bị ghi đè khi sync) — tuỳ biến qua `project-knowledge/CLAUDE.md` (§2).
- **NEVER** `@import` mọi tài liệu vào `project-knowledge/CLAUDE.md` — chỉ `@` file cần ở mọi phiên (kiến trúc, glossary); tài liệu theo tình huống → liệt kê "Tham chiếu, đọc khi cần", tránh loãng context.

### BEFORE / AFTER

- BEFORE thiết kế (`solution-architect` / `technical-design`): MUST đọc `design-standards.md` + quy ước org **theo ĐÚNG TẦNG project phụ trách** (BE → `backend/api-convention.md` + `backend/coding-convention.md` + `backend/tech-stack.md` + `backend/security.md`; FE → `frontend/coding-convention.md` + `frontend/tech-stack.md` + `frontend/security.md`; full-stack → cả hai) — thiết kế bám quy định org, KHÔNG suy quy ước.
- BEFORE viết code: MUST đọc `architecture.md §2,3` + coding-convention theo stack (`backend/coding-convention.md` §1–2 / `frontend/coding-convention.md` §3).
- BEFORE tạo thành phần dùng chung: MUST chạy `reuse-scan` — căn cứ là **source hiện tại của project**, cách xác định nguồn & tra cứu do skill **tự chọn theo công cụ thực tế đang có**; **NEVER** dựa danh sách thư viện chép trong tài liệu (trôi dạt).
- BEFORE viết/review endpoint trả danh sách hoặc truy vấn DB: MUST đọc `shared/non-functional-standards.md §1` (phân trang, ngưỡng số truy vấn, index, ranh giới request đồng bộ).
- BEFORE review/audit: MUST đọc `shared/security-policy.md` + security theo stack (`backend/security.md` / `frontend/security.md`).
- AFTER mọi bước implement: MUST tick checkbox `current-task.md` → gọi `progress-tracker`.
