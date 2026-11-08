#!/usr/bin/env node
'use strict';

// ensure-hooks.js — SessionStart hook.
//
// Purpose: git's core.hooksPath lives in .git/config, which is repo-local and
// NOT version-controlled. So the pre-commit secret-scan only runs on the machine
// that ran init-code-forge.sh; fresh clones / other teammates silently lose it.
// This hook runs once at the start of each Claude Code session and re-asserts
// core.hooksPath so the pre-commit hook is active for the whole session — including
// later commits made from a plain terminal in the same working copy.
//
// Wired in .claude/settings.json:
//   "SessionStart": [{ "matcher": "startup|resume|clear",
//     "hooks": [{ "type": "command",
//       "command": "node \"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/session-start/ensure-hooks.js\"" }] }]
//
// Accepted limitation: this file lives INSIDE the code-forge-team-common submodule.
// On a plain `git clone` without --recurse-submodules the submodule dir is empty,
// this file is absent, and the hook cannot run (it cannot bootstrap the submodule
// it lives in). Coverage is therefore: "submodule present but core.hooksPath lost".

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { resolveProjectRoot } = require('../lib/project-root.js');

// hooksPath value stored in git config. git resolves it relative to the repo root
// at hook time, so it must match the layout init-code-forge.sh configures.
const EXPECTED_HOOKS_PATH = 'code-forge-team-common/hooks/git';

// Gốc project KHÔNG suy từ process.cwd(): hook có thể chạy với cwd là thư mục con
// (sau một lệnh Bash `cd`) → git config sẽ nhắm sai repo. Xem lib/project-root.js.
const ROOT = resolveProjectRoot(null, path.resolve(__dirname, '..', '..', '..'));

// Drain stdin so Claude Code never blocks writing to us; we don't need its content.
try { process.stdin.resume(); process.stdin.on('data', () => {}); } catch { /* ignore */ }

function git(args) {
  // Returns trimmed stdout; throws on non-zero exit (caller decides how to handle).
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function main() {
  // 1) Bail out silently if this isn't a git work tree — nothing to configure.
  try {
    if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') return;
  } catch {
    return; // not a repo (or git unavailable) — leave the session untouched
  }

  // 2) Defensive: if the pre-commit file is missing the submodule isn't populated.
  //    We can't self-heal that from inside the submodule — just warn and move on.
  const preCommit = path.join(ROOT, EXPECTED_HOOKS_PATH, 'pre-commit');
  if (!fs.existsSync(preCommit)) {
    process.stdout.write(
      '⚠️  Code Forge: submodule code-forge-team-common chưa được init — ' +
      'git safety hook (pre-commit) sẽ không chạy.\n' +
      '    Chạy: git submodule update --init code-forge-team-common\n'
    );
    return;
  }

  // 3) Read the current core.hooksPath (unset -> git exits non-zero -> treat as "").
  let current = '';
  try { current = git(['config', 'core.hooksPath']); } catch { current = ''; }

  // 4) Already correct -> stay silent to avoid noise on every session.
  if (current === EXPECTED_HOOKS_PATH) return;

  // 5) Not set / wrong -> configure it, then confirm with a single line.
  git(['config', 'core.hooksPath', EXPECTED_HOOKS_PATH]);
  try { fs.chmodSync(preCommit, 0o755); } catch { /* best-effort; no-op on Windows */ }
  process.stdout.write(
    `✅ Code Forge: đã cấu hình git safety hook (core.hooksPath → ${EXPECTED_HOOKS_PATH}).\n`
  );
}

try { main(); } catch { /* never break session startup */ }
process.exit(0);
