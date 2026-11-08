#!/usr/bin/env node
'use strict';

// Secret detection lives in hooks/lib/secret-scan.js — the SAME module the git
// pre-commit hook shells out to, so a secret is judged identically whether it is
// written by Claude or committed from a plain terminal.
const { scanText } = require('../lib/secret-scan.js');

// Patterns for dangerous Bash commands
const BASH_DANGEROUS = [
  {
    name: 'Force push to main/master',
    re: /git\s+push\b.*(--force|-f)\b.*(main|master)/,
    tip: 'Create a MR/PR instead. If truly necessary, perform manually after team lead approval.',
  },
  {
    name: 'Force push to main/master (flags after branch)',
    re: /git\s+push\b.*(main|master).*(--force|-f)\b/,
    tip: 'Create a MR/PR instead. If truly necessary, perform manually after team lead approval.',
  },
  {
    name: 'Force push to main/master (+ refspec)',
    re: /git\s+push\b[^\n|;&]*\s\+(?:refs\/heads\/)?(main|master)\b/,
    tip: 'Create a MR/PR instead. If truly necessary, perform manually after team lead approval.',
  },
  // NOTE: recursive/force `rm` targeting a dangerous path is handled by findRmDanger()
  // below (covers split/long flags, ~, $HOME, ., *) — richer than a single regex allows.
  {
    name: 'find -delete mass deletion',
    re: /\bfind\s+\S+.*\s-delete(\s|$)/,
    tip: 'Mass file deletion via find detected. Specify exact files, or perform this manually outside Claude.',
  },
  {
    name: 'DROP TABLE without IF EXISTS guard',
    re: /DROP\s+TABLE\s+(?!IF\s+EXISTS)\w+/i,
    tip: 'Use DROP TABLE IF EXISTS, or execute manually after taking a backup.',
  },
  {
    name: 'DROP DATABASE/SCHEMA',
    re: /DROP\s+(?:DATABASE|SCHEMA)\b(?!\s+IF\s+EXISTS)/i,
    tip: 'Dropping a database/schema is destructive. Execute manually after taking a backup.',
  },
  {
    name: 'TRUNCATE TABLE',
    re: /TRUNCATE\s+TABLE\b/i,
    tip: 'Confirm the target table and execute manually after taking a backup.',
  },
];

// ---- helpers ----------------------------------------------------------------

// filePath drives how strict the scan is (code/doc → quoted literals only,
// config → bare values too). Pass null for bash commands: treated as config.
function findSecret(text, context, filePath) {
  const hit = scanText(text, { filePath });
  if (!hit) return null;
  return (
    `Potential secret detected in ${context} (line ${hit.lineNo}).\n` +
    `  Matched: ${hit.rule}\n` +
    `  Line: ${hit.masked}\n` +
    `  Action: Store secrets in environment variables or .env files (gitignored). ` +
    `Use an env reference like \${DB_PASSWORD} without a hardcoded default.\n` +
    `  False positive? Append "# forge:allow-secret" to that line.`
  );
}

function findBashDanger(command) {
  for (const { name, re, tip } of BASH_DANGEROUS) {
    if (re.test(command)) {
      return `${name}.\n  Action: ${tip}`;
    }
  }
  return findRmDanger(command);
}

// Recursive/force `rm` targeting a dangerous path. Handles split flags (-r -f),
// long flags (--recursive --force), and targets /, ~, $HOME, bare . and *.
// Deliberately allows relative named targets (rm -rf node_modules, ./build).
function findRmDanger(command) {
  for (const seg of String(command).split(/[\n|;&]+/)) {
    const m = /\brm\b(.*)/.exec(seg);
    if (!m) continue;
    const rest = m[1];
    const rfFlag =
      /(?:^|\s)-[a-zA-Z]*[rRfF][a-zA-Z]*(?=\s|$)/.test(rest) ||
      /(?:^|\s)--(?:recursive|force)\b/.test(rest);
    if (!rfFlag) continue;
    const dangerousTarget =
      /(?:^|\s)\/(?:\s|$)/.test(rest) ||        // " / "  (root)
      /(?:^|\s)\/[^\s]/.test(rest) ||           // " /etc" (absolute path)
      // Đường dẫn tuyệt đối kiểu Windows. Luật POSIX phía trên chỉ bắt target mở đầu bằng "/",
      // nên "rm -rf D:/WORKSPACE/..." hay "rm -rf C:\Users\..." lọt qua — đúng dạng đội dùng
      // hằng ngày trên Windows (đã đo: xoá thật).
      /(?:^|\s)[A-Za-z]:[\\/]/.test(rest) ||    // " D:/x" hoặc " D:\x" (ổ đĩa)
      /(?:^|\s)\\[^\s]/.test(rest) ||         // " \server\share" (UNC)
      /(?:^|\s)~(?:$|\/|\s)/.test(rest) ||      // " ~" or " ~/"
      /(?:^|\s)\$(?:HOME\b|\{HOME\})/.test(rest) || // " $HOME" / " ${HOME}" (braced needs no \b)
      /(?:^|\s)\.\/?(?:\s|$)/.test(rest) ||     // " ." or " ./"
      /(?:^|\s)\.\/\*/.test(rest) ||            // " ./*"
      /(?:^|\s)\*(?:\s|$)/.test(rest);          // bare " *"
    if (dangerousTarget) {
      return (
        'Recursive/force rm targeting a dangerous path (/, D:\\, \\\\UNC, ~, $HOME, ., or *).\n' +
        '  Action: Specify exact files, or perform this deletion manually outside Claude.'
      );
    }
  }
  return null;
}

// Giao ước hook PreToolUse của Claude Code (giống tdd-guard.js §14):
//   exit 0  → cho qua
//   exit 2  → CHẶN; harness đọc lý do từ STDERR rồi feed lại cho Claude
//   khác 0  → "non-blocking error": in thông điệp ra rồi VẪN CHẠY tool
// Trước đây hàm này dùng stdout + exit 1 nên harness xếp vào non-blocking error:
// dòng 🚫 vẫn hiện trong log nhưng lệnh nguy hiểm VẪN THỰC THI (đã đo: rm -rf
// <đường dẫn tuyệt đối> xoá thật). Chặn được BẮT BUỘC là stderr + exit 2.
function block(reason) {
  process.stderr.write(`🚫 BLOCKED by dangerous-op-blocker:\n  ${reason}\n`);
  process.exit(2);
}

// ---- main -------------------------------------------------------------------

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    process.exit(0); // malformed input — allow through, don't break Claude
  }

  const { tool_name, tool_input = {} } = input;

  if (tool_name === 'Bash') {
    const cmd = tool_input.command || '';
    const danger = findBashDanger(cmd);
    if (danger) block(danger);
    // Also catch secrets exported/echoed in shell (e.g. export API_KEY=sk-...)
    const secret = findSecret(cmd, 'bash command', null);
    if (secret) block(secret);
  }

  if (tool_name === 'Write') {
    const content = tool_input.content || '';
    const filePath = tool_input.file_path || '';
    const secret = findSecret(content, `file "${filePath || 'unknown'}"`, filePath);
    if (secret) block(secret);
  }

  if (tool_name === 'Edit') {
    const newStr = tool_input.new_string || '';
    const filePath = tool_input.file_path || '';
    const secret = findSecret(newStr, `edit in "${filePath || 'unknown'}"`, filePath);
    if (secret) block(secret);
  }

  process.exit(0);
});

process.stdin.on('error', () => process.exit(0));
