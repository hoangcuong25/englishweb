#!/usr/bin/env bash
# check-structure.sh — Kiểm tra cấu trúc thư mục bắt buộc của code-forge-team-common.
# Dùng trong .gitlab-ci.yml. Exit != 0 nếu thiếu thư mục/file lõi.
# Cập nhật: Phase 2A — thêm guards cho playbook TDD (4 lớp). (Phase 1B: template stubs + core agents/skills.)
set -euo pipefail

# Chạy từ gốc repo code-forge-team-common
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

require_dir() {
  if [ ! -d "$1" ]; then echo "❌ Thiếu thư mục: $1"; fail=1; else echo "✅ $1"; fi
}
require_file() {
  if [ ! -f "$1" ]; then echo "❌ Thiếu file: $1"; fail=1; else echo "✅ $1"; fi
}

echo "== Kiểm tra cấu trúc code-forge-team-common =="

# ── Thư mục lõi ──────────────────────────────────────────────────────────────
echo ""
echo "--- Thư mục ---"
require_dir "knowledge/org"
require_dir "knowledge/playbooks/_template"
require_dir "knowledge/playbooks/_template/knowledge"
require_dir "knowledge/playbooks/_template/skills"
require_dir "knowledge/playbooks/_template/hooks"
require_dir "knowledge/playbooks/_template/verification"
require_dir "knowledge/decisions"
require_dir "skills"
require_dir "agents"
require_dir "hooks"

# ── Knowledge org (tách theo stack: backend / frontend / shared) ──────────────
echo ""
echo "--- Knowledge org ---"
require_dir "knowledge/org/backend"
require_dir "knowledge/org/frontend"
require_dir "knowledge/org/shared"
require_file "knowledge/org/backend/tech-stack.md"
require_file "knowledge/org/backend/coding-convention.md"
require_file "knowledge/org/backend/api-convention.md"
require_file "knowledge/org/backend/security.md"
require_file "knowledge/org/frontend/tech-stack.md"
require_file "knowledge/org/frontend/coding-convention.md"
require_file "knowledge/org/frontend/security.md"
require_file "knowledge/org/shared/git-workflow.md"
require_file "knowledge/org/shared/security-policy.md"
require_file "knowledge/org/shared/design-standards.md"
require_file "knowledge/org/shared/non-functional-standards.md"
require_file "knowledge/org/shared/gotchas.md"

# ── Playbook _template stubs (4 lớp) ─────────────────────────────────────────
# Đảm bảo template đủ 4 lớp để dev copy tạo playbook mới.
echo ""
echo "--- Playbook _template stubs ---"
require_file "knowledge/playbooks/_template/README.md"
require_file "knowledge/playbooks/_template/knowledge/guide.md"
require_file "knowledge/playbooks/_template/skills/workflow.md"
require_file "knowledge/playbooks/_template/hooks/guard.js"
require_file "knowledge/playbooks/_template/verification/compliance.md"

# ── Playbook TDD (Phase 2A — 4 lớp đầy đủ) ───────────────────────────────────
echo ""
echo "--- Playbook TDD ---"
require_file "knowledge/playbooks/tdd/README.md"
require_file "knowledge/playbooks/tdd/knowledge/tdd-guide.md"
require_file "knowledge/playbooks/tdd/skills/tdd-workflow.md"
require_file "knowledge/playbooks/tdd/hooks/tdd-guard.js"
require_file "knowledge/playbooks/tdd/verification/tdd-compliance-check.md"

# ── Design layer (Lát 2E — xuyên tầng, scope theo project) ────────────────────
echo ""
echo "--- Design layer (2E) ---"
require_file "agents/solution-architect.md"
require_file "agents/architect-reviewer.md"
require_file "skills/technical-design/SKILL.md"

# ── Core agents (Phase 1B; tách FE/BE) ────────────────────────────────────────
echo ""
echo "--- Core agents ---"
require_file "agents/developer-backend.md"
require_file "agents/developer-frontend.md"
require_file "agents/code-reviewer-backend.md"
require_file "agents/code-reviewer-frontend.md"

# ── Core skills (Phase 1B; tách FE/BE) ────────────────────────────────────────
echo ""
echo "--- Core skills ---"
require_file "skills/code-review-backend/SKILL.md"
require_file "skills/code-review-frontend/SKILL.md"
require_file "skills/debug-backend/SKILL.md"
require_file "skills/debug-frontend/SKILL.md"
require_file "skills/task-state-init/SKILL.md"
require_file "skills/progress-tracker/SKILL.md"

# ── Session commands (Phase 3C — bàn giao phiên) ──────────────────────────────
echo ""
echo "--- Session commands ---"
require_file "commands/cf-handoff.md"
require_file "commands/cf-resume.md"

# ── Safety hooks (Phase 1C → chuyển vào team-common: source-of-truth org) ─────
echo ""
echo "--- Safety hooks ---"
require_file "hooks/pre-tool-use/dangerous-op-blocker.js"
require_file "hooks/post-tool-use/result-logger.js"
require_file "hooks/git/pre-commit"
# Luật quét secret dùng chung — thiếu file này thì cả 2 hook trên mất khả năng bắt secret.
require_file "hooks/lib/secret-scan.js"

# ── Orchestration org-owned (đồng bộ → project: CLAUDE.md + .claude/AGENTS.md) ─
# resource-sync overwrite 2 file này (đổi tên bỏ -COMMON) vào project. Thiếu = vỡ sync.
echo ""
echo "--- Orchestration (org-owned) ---"
require_file "CLAUDE-COMMON.md"
require_file "AGENTS-COMMON.md"

# ── File cấu hình & tài liệu ─────────────────────────────────────────────────
echo ""
echo "--- Config & docs ---"
require_file ".gitlab-ci.yml"
require_file "README.md"

# ── Kết quả ──────────────────────────────────────────────────────────────────
echo ""
if [ "$fail" -ne 0 ]; then
  echo "💥 Cấu trúc code-forge-team-common bị phá — vui lòng khôi phục các mục thiếu ở trên."
  exit 1
fi

echo "🎉 Cấu trúc code-forge-team-common hợp lệ."
