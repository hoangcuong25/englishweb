#!/usr/bin/env node
'use strict';

// =============================================================================
// Playbook TDD — Lớp 3 (Hook) — tdd-guard.js
//
// PostToolUse hook (Claude Code). Sau khi Claude Write/Edit một file source trong
// `src/`, kiểm tra xem đã có file test tương ứng chưa. Nếu CHƯA → nhắc/chặn theo
// `enforcement` đọc từ .claude/settings.json (monitor-only | warn | block).
//
// I/O theo chuẩn Claude Code hook:
//   - Nhận JSON trên stdin: { tool_name, tool_input, ... }
//   - exit 0  → không chặn (cho qua)
//   - exit 2  → block: stderr được feed lại cho Claude để tự sửa (dùng cho enforcement=block)
//
// Triết lý: KHÔNG được làm vỡ luồng tool. Mọi lỗi nội bộ → exit 0 (fail-open).
// =============================================================================

const fs = require('fs');
const path = require('path');
const { resolveProjectRoot } = require('../../../../hooks/lib/project-root.js');

// Phần mở rộng được coi là "code implementation" (bỏ qua .md, .json, .yaml, asset...)
const CODE_EXT = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
  'py', 'java', 'go', 'rb', 'php', 'cs', 'kt', 'scala', 'rs',
  'c', 'cc', 'cpp', 'h', 'hpp', 'swift', 'm',
]);

// Dấu hiệu một path LÀ test file (để không tự cảnh báo khi đang sửa chính test).
const TEST_MARKERS = [
  /\.test\./i, /\.spec\./i, /_test\./i, /(^|\/)test_/i,
  /(^|\/)tests?\//i, /__tests__\//i, /[A-Za-z0-9]Test\.[a-z]+$/, // Java FooTest.java
];

function norm(p) {
  return String(p || '').replace(/\\/g, '/');
}

function isTestFile(p) {
  const s = norm(p);
  return TEST_MARKERS.some((re) => re.test(s));
}

// File implementation cần được phủ test: nằm trong src/ và là code, không phải test.
function isImplSource(p) {
  const s = norm(p);
  if (isTestFile(s)) return false;
  if (!/(^|\/)src\//.test(s)) return false;
  const ext = s.split('.').pop().toLowerCase();
  return CODE_EXT.has(ext);
}

// Sinh danh sách candidate đường dẫn test tương ứng cho 1 src path.
// Bao phủ quy ước JS/TS, Python, Java, Go (xem knowledge/tdd-guide.md §Quy ước test file).
function testCandidates(srcPath) {
  const s = norm(srcPath);
  const dir = path.posix.dirname(s);
  const file = path.posix.basename(s);
  const ext = file.split('.').pop();
  const base = file.slice(0, -(ext.length + 1)); // tên không đuôi

  const names = [
    `${base}.test.${ext}`, `${base}.spec.${ext}`, // JS/TS
    `${base}_test.${ext}`,                          // Go / Python
    `test_${base}.${ext}`,                          // Python
    `${base}Test.${ext}`,                           // Java
  ];

  // Thư mục test "mirror": đổi src/ → test(s)/, và Java src/main/ → src/test/.
  const mirrorDirs = [
    dir,                                            // cùng thư mục
    `${dir}/__tests__`,                             // JS sibling
    `${dir}/tests`, `${dir}/test`,                  // sibling tests/
    'tests', 'test', '__tests__',                   // gốc repo (Python flat layout)
    dir.replace(/(^|\/)src\//, '$1test/'),
    dir.replace(/(^|\/)src\//, '$1tests/'),
    dir.replace(/(^|\/)src\/main\//, '$1src/test/'), // Java Maven layout
  ];

  const out = new Set();
  for (const d of mirrorDirs) {
    for (const n of names) out.add(path.posix.normalize(`${d}/${n}`));
  }
  return [...out];
}

function hasCorrespondingTest(srcPath, cwd) {
  for (const cand of testCandidates(srcPath)) {
    const abs = path.isAbsolute(cand) ? cand : path.join(cwd, cand);
    try {
      if (fs.existsSync(abs)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

function readTddConfig(cwd) {
  try {
    const raw = fs.readFileSync(path.join(cwd, '.claude', 'settings.json'), 'utf8');
    const cfg = JSON.parse(raw);
    const tdd = (cfg.playbooks && cfg.playbooks.tdd) || {};
    return { enabled: tdd.enabled === true, enforcement: tdd.enforcement || 'warn' };
  } catch {
    return { enabled: false, enforcement: 'warn' }; // không có config → coi như tắt
  }
}

// Ghi log compliance (phục vụ verification + dashboard Phase 3). Không bao giờ throw.
function logViolation(cwd, record) {
  try {
    const dir = path.join(cwd, '.claude', 'logs');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'playbook-tdd.jsonl'), JSON.stringify(record) + '\n');
  } catch {
    /* swallow — logging không được làm vỡ luồng */
  }
}

function buildMessage(filePath, enforcement) {
  return (
    `⚠️ TDD [${enforcement}]: Đang sửa "${filePath}" mà chưa có test tương ứng.\n` +
    `   Hãy viết test TRƯỚC theo quy trình Red→Green→Refactor.\n` +
    `   Quy ước đặt test: code-forge-team-common/.../tdd/knowledge/tdd-guide.md §Quy ước test file.`
  );
}

// ---- main -------------------------------------------------------------------

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    process.exit(0); // input hỏng → fail-open
  }

  try {
    const toolName = input.tool_name;
    if (toolName !== 'Write' && toolName !== 'Edit' && toolName !== 'MultiEdit') {
      process.exit(0);
    }

    // Gốc project: ưu tiên CLAUDE_PROJECT_DIR, rồi input.cwd (xem hooks/lib/project-root.js).
    const cwd = resolveProjectRoot(input, path.resolve(__dirname, '..', '..', '..', '..', '..'));
    const filePath = (input.tool_input && input.tool_input.file_path) || '';
    if (!filePath || !isImplSource(filePath)) process.exit(0);

    const { enabled, enforcement } = readTddConfig(cwd);
    if (!enabled) process.exit(0); // playbook tắt → không can thiệp

    if (hasCorrespondingTest(filePath, cwd)) process.exit(0); // đã tuân thủ

    // --- Vi phạm: src được sửa nhưng không có test tương ứng ---
    const record = {
      ts: new Date().toISOString(),
      playbook: 'tdd',
      enforcement,
      tool: toolName,
      file: norm(filePath),
      compliant: false,
    };

    if (enforcement === 'monitor-only') {
      logViolation(cwd, record); // chỉ đo, không nhắc
      process.exit(0);
    }

    if (enforcement === 'block') {
      logViolation(cwd, record);
      process.stderr.write(buildMessage(filePath, enforcement) + '\n');
      process.exit(2); // block → feed stderr cho Claude tự sửa
    }

    // mặc định: warn → nhắc nhưng không chặn
    logViolation(cwd, record);
    process.stdout.write(buildMessage(filePath, 'warn') + '\n');
    process.exit(0);
  } catch {
    process.exit(0); // bất kỳ lỗi nào → fail-open
  }
});

process.stdin.on('error', () => process.exit(0));
