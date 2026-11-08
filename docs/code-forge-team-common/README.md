# code-forge-team-common

> **Repo trung tâm (DÙNG CHUNG)** của tổ chức — nguồn sự thật duy nhất cho Kiến thức Tổ chức (Org), SKILL và AGENT dùng chung.
> Mỗi project nhúng repo này vào bằng **git submodule**.

## Repo này chứa gì

```
code-forge-team-common/
├── CLAUDE-COMMON.md          # ⭐ Orchestration ORG-OWNED → sync đổi tên thành CLAUDE.md (gốc project), GHI ĐÈ
├── AGENTS-COMMON.md          # ⭐ Routing ORG-OWNED → sync đổi tên thành .claude/AGENTS.md, GHI ĐÈ
├── knowledge/
│   ├── org/                  # Kiến thức tổ chức — tách theo stack (✅ VDBAS: BE Java/Spring + FE React)
│   │   ├── backend/              # Java 21 / Spring Boot 4 / Maven / Oracle
│   │   │   ├── tech-stack.md         # Stack BE + Clean Arch api→application→domain→common + thư viện duyệt
│   │   │   ├── coding-convention.md  # Convention Java (naming/format/comment/khai báo/programming/persistence-JPA-first)
│   │   │   ├── api-convention.md     # Quy ước REST API (path/đặt tên, kiểu&định dạng, envelope/mã lỗi/phân trang)
│   │   │   └── security.md           # DynamicAuthorizationManager (no @PreAuthorize), Audit Hash Chain
│   │   ├── frontend/             # React 19 / Vite / TS / Module Federation
│   │   │   ├── tech-stack.md         # Stack FE + MF singleton + thư viện duyệt (TanStack Query + Context API)
│   │   │   ├── coding-convention.md  # Cấu trúc app/core/modules/shared, naming, SRP, comment AI-readable
│   │   │   └── security.md           # Token qua Axios interceptor, PermissionGuard
│   │   └── shared/              # Dùng chung mọi stack
│   │       ├── git-workflow.md       # GitLab git.fis.vn, branch model, MR, promotion pipeline
│   │       ├── security-policy.md    # Secrets, OWASP, thao tác bị chặn (→ Phase 1C hook)
│   │       ├── design-standards.md   # (✅ Lát 2E) Chuẩn viết 3 tài liệu thiết kế kỹ thuật
│   │       ├── notification-message-validation.md  # Chuẩn Toast/Notification/Dialog, message, validate FE+BE, bộ mã lỗi VDBAS-<MOD>-<CODE>
│   │       ├── ui-event-button-spec.md  # Event ID <MOD>.<SCREEN>.<ACTION>, 6 loại nút Ant Design, phím tắt, phân trang, đặc tả nút/màn hình, ma trận trạng thái
│   │       ├── non-functional-standards.md  # Quy ước phi chức năng (Living Doc) — Hiệu năng & Truy vấn: phân trang, ngưỡng số truy vấn/API, index
│   │       └── gotchas.md            # Rỗng — tự đầy qua knowledge-capture (Phase 4)
│   ├── playbooks/            # Playbook Pattern — mỗi quy trình = 1 thư mục 4 lớp
│   │   ├── _template/            # Template chuẩn để tạo playbook mới (✅ Phase 0)
│   │   └── tdd/                  # Playbook TDD mẫu — 4 lớp đầy đủ (✅ Phase 2A)
│   │       ├── knowledge/tdd-guide.md           # Red→Green→Refactor, quy ước test file
│   │       ├── skills/tdd-workflow.md           # Auto-trigger "implement/tạo/build"
│   │       ├── hooks/tdd-guard.js               # PostToolUse: nhắc/chặn src thiếu test
│   │       └── verification/tdd-compliance-check.md  # Tiêu chí CI + metrics
│   └── decisions/            # ADR org-wide (hiếm) — thêm khi cần; ADR project-level ở project-knowledge/decisions/ của mỗi project
├── skills/                   # SKILL dùng chung (✅ Phase 1B; tách FE/BE — generic, chi tiết ở knowledge)
│   ├── technical-design/
│   │   └── SKILL.md              # (✅ Lát 2E) Trigger "thiết kế/design từ spec" → sinh tài liệu design (scope theo project)
│   ├── decisions-relevance/
│   │   └── SKILL.md              # (✅ ADR rollout) Trigger "rà ADR/soi quyết định" → soi kho ADR project (lỗi thời/mồ côi/mâu thuẫn)
│   ├── code-review-backend/
│   │   └── SKILL.md              # Review 5 chiều tầng server: Security/Performance/Correctness/Style/Reuse
│   ├── code-review-frontend/
│   │   └── SKILL.md              # Review 5 chiều tầng giao diện
│   ├── debug-backend/
│   │   └── SKILL.md              # 4 bước (server): Reproduce → Isolate → Diagnose → Fix
│   ├── debug-frontend/
│   │   └── SKILL.md              # 4 bước (giao diện): Reproduce → Isolate → Diagnose → Fix
│   ├── reuse-scan/
│   │   └── SKILL.md              # (stack-agnostic) Trigger trước khi tạo util/helper/mapper mới → quét cái đã có, sinh Reuse Report
│   ├── task-state-init/
│   │   └── SKILL.md              # (stack-agnostic) Trigger "implement/build/tạo" → tạo state/<dev-id>/current-task.md
│   └── progress-tracker/
│       └── SKILL.md              # (stack-agnostic) Trigger "đến đâu rồi/tiến độ" → cập nhật state/<dev-id>/progress.md
├── agents/                   # AGENT dùng chung (✅ Phase 1B; tách FE/BE — generic, chi tiết ở knowledge)
│   ├── solution-architect.md     # (✅ Lát 2E) Thiết kế xuyên tầng từ spec → tài liệu design (scope BE/FE/cả hai theo project; chưa code)
│   ├── architect-reviewer.md     # (✅ Lát 2E) Review TÀI LIỆU THIẾT KẾ trước khi code (CRITICAL/MAJOR/MINOR)
│   ├── developer-backend.md      # Viết code production tầng server; chuẩn/stack đọc từ knowledge
│   ├── developer-frontend.md     # Viết code production tầng giao diện; chuẩn/stack đọc từ knowledge
│   ├── code-reviewer-backend.md  # Review CRITICAL/MAJOR/MINOR thay đổi BE trước khi tạo MR
│   └── code-reviewer-frontend.md # Review CRITICAL/MAJOR/MINOR thay đổi FE trước khi tạo MR
├── commands/                 # Slash command bàn giao phiên (✅ Phase 3C, user-only)
│   ├── cf-handoff.md             # /cf-handoff — lưu phiên → state/<dev-id>/session-handoff.md
│   └── cf-resume.md              # /cf-resume — đọc handoff, tóm tắt, hỏi trước khi code tiếp
├── hooks/                    # Safety hooks org-wide (✅ Phase 1C → chuyển về team-common)
│   ├── pre-tool-use/dangerous-op-blocker.js   # Chặn cứng secret / rm -rf / DROP TABLE / force push
│   ├── post-tool-use/result-logger.js         # Ghi log tool call → .claude/logs/
│   ├── git/pre-commit                         # Scan secret trước commit
│   └── README.md                              # Vai trò + cách project trỏ tới (không copy)
├── ci/
│   └── check-structure.sh    # Kiểm tra cấu trúc thư mục đúng spec
├── .gitlab-ci.yml            # Pipeline: lint markdown + kiểm cấu trúc
└── .markdownlint.json        # Cấu hình lint markdown
```

## Hướng dẫn cho Tech Lead

### 1. Tạo repo trên GitLab

- Tạo project `code-forge-team-common` trên GitLab.
- Bật **branch protection** cho `main`: require Merge Request, require approval, cấm force push.

### 2. Nhúng vào một project (submodule)

Từ thư mục gốc của project:

```bash
git submodule add <URL_code-forge-team-common> code-forge-team-common
git commit -m "chore: add code-forge-team-common submodule"
```

> Dùng script `init-code-forge.sh` để tạo project mới tự động — script đã tích hợp sẵn bước này.

### 3. Cập nhật submodule + đồng bộ agents, skills, commands & orchestration (một lệnh)

Khi team-common có nội dung mới (skill/agent/command/hook/CLAUDE-COMMON/AGENTS-COMMON), chạy **một lệnh**
— script tự update submodule của từng project lên mới nhất default branch rồi sync về project:

```bash
# Từ thư mục gốc workspace:
./code-forge-project-templates/tools/resource-sync.sh [subpath...]
# Không tham số = tự nhận diện & xử lý toàn bộ projects/ (quét đệ quy, kể cả project lồng)
# Tham số = subpath dưới projects/, vd: THU/thu-service-be
# --no-update = chỉ sync theo version submodule đang pin, không update
```

Script **không commit** — sau đó review rồi commit con trỏ submodule + file đã sync trong từng project.
Chi tiết hành vi (bỏ qua project có thay đổi dở / update lỗi): `code-forge-project-templates/README.md` § resource-sync.

> **Lưu ý vai trò nguồn:**
> - `agents/` + `skills/` + `commands/` → project **copy** vào `.claude/` (slash command nạp từ `.claude/commands/`; **skill auto-discover từ `.claude/skills/`** — Claude Code đọc frontmatter khi khởi tạo, body nạp khi gọi; agent procedure coordinator đọc on-demand). Đây là việc của `resource-sync` (đọc từ **submodule của chính project**, ghi đè).
> - `CLAUDE-COMMON.md` + `AGENTS-COMMON.md` → `resource-sync` **đổi tên bỏ `-COMMON` và GHI ĐÈ** vào `CLAUDE.md` (gốc) + `.claude/AGENTS.md`. Là ORG-OWNED — sửa ở team-common (qua MR), KHÔNG sửa bản trong project (mất khi sync). Project tuỳ biến qua `project-knowledge/CLAUDE.md`.
> - `hooks/` → project **không copy**, `.claude/settings.json` trỏ thẳng `"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/..."`. Bump submodule là đủ (Bước 0 của `resource-sync` đã làm việc này).

## Nguyên tắc đóng góp

- **Mọi thay đổi trong `knowledge/` phải qua Merge Request** — không commit trực tiếp vào `main`.
- **Thêm SKILL/AGENT/COMMAND mới**: tạo `skills/<tên>/SKILL.md`, `agents/<tên>.md`, hoặc `commands/<tên>.md`, mở MR.
- **Sửa orchestration** (thứ tự load / routing / MUST-NEVER / thêm playbook): sửa `CLAUDE-COMMON.md` / `AGENTS-COMMON.md`, mở MR — propagate mọi project khi sync. Skill/agent **không `@import`** vào `CLAUDE-COMMON.md` (auto-discover) — thêm/đổi tên/xoá thì cập nhật **bảng trỏ** ở §4 (skill) / `AGENTS-COMMON.md` (routing) cho khớp; thêm playbook thì thêm **1 hàng bảng §5** + trỏ procedure `developer-*` đọc knowledge của nó khi bật.
- Thêm playbook mới: copy `knowledge/playbooks/_template/` và làm theo `README.md` trong đó.
- CI sẽ tự lint markdown và kiểm tra cấu trúc thư mục trên mỗi MR.

## Lộ trình populate

| Nội dung | Phase | Trạng thái |
|---|---|---|
| Cấu trúc thư mục + Playbook `_template/` 4 lớp | 0 | ✅ Xong |
| Nội dung knowledge org thật theo VDBAS — tách stack `backend/` `frontend/` `shared/` | 1A | ✅ Xong |
| Chuẩn SA dùng chung: `shared/notification-message-validation.md` + `shared/ui-event-button-spec.md` (từ tài liệu SA Notify/Message/Validate + Đặc tả sự kiện/nút) | 1A | ✅ Xong |
| `shared/non-functional-standards.md` — quy ước phi chức năng tập trung (khởi đầu: Hiệu năng & Truy vấn, gồm ngưỡng số truy vấn mỗi API) + wiring: CLAUDE §1/§8, `developer-backend`, `solution-architect`, `code-review{,er}-backend`, CI | R | ✅ Xong |
| `developer` + `code-reviewer` AGENT | 1B | ✅ Xong |
| `code-review` + `debug` SKILL (Cấp 1) | 1B | ✅ Xong |
| Tách AGENT/SKILL theo stack: `*-backend` / `*-frontend` (developer, code-reviewer, code-review, debug) | refactor | ✅ Xong |
| `task-state-init` + `progress-tracker` SKILL (state) | 1B | ✅ Xong |
| Safety hooks `dangerous-op-blocker` + `result-logger` + `pre-commit` (trong `hooks/`, project trỏ thẳng submodule) | 1C | ✅ Xong |
| Playbook TDD mẫu (4 lớp đầy đủ) | 2A | ✅ Xong |
| Tầng Thiết kế: `solution-architect` + `architect-reviewer` AGENT, `technical-design` SKILL, `shared/design-standards.md` (MVP no-MCP) | 2E | ✅ Xong |
| Lệnh bàn giao phiên `commands/cf-handoff` + `cf-resume` (state namespace theo dev-id) | 3C | ✅ Xong |
| `CLAUDE-COMMON.md` + `AGENTS-COMMON.md` org-owned (sync đổi tên + ghi đè → hết drift manifest) | refactor | ✅ Xong |
| SKILL mở rộng deferred (system-design, incident-response...) | 2E | ⬜ Chưa |
| Cơ chế ADR: skill `decisions-relevance` + tích hợp `solution-architect`/`architect-reviewer` (template & README project-level ở `default-template`) | R (Backlog N5) | ✅ Xong |
