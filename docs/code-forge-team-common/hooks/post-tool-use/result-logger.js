#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const { resolveProjectRoot } = require('../lib/project-root.js');

// Gốc project suy từ vị trí file này: <root>/code-forge-team-common/hooks/post-tool-use
// Chỉ là FALLBACK — ưu tiên thật là CLAUDE_PROJECT_DIR rồi input.cwd (xem lib/project-root.js).
const SELF_ROOT = path.resolve(__dirname, '..', '..', '..');
const MAX_LEN   = 200;

function truncate(str) {
  const s = String(str || '');
  return s.length > MAX_LEN ? s.slice(0, MAX_LEN) + '…' : s;
}

// Strip common secret patterns from log text before writing
function sanitize(str) {
  return str
    .replace(/sk-[a-zA-Z0-9\-_]{20,}/g, '[REDACTED]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED]')
    .replace(/ghp_[a-zA-Z0-9]{36}/g, '[REDACTED]');
}

// Build a concise, readable summary per tool type
function inputSummary(tool_name, tool_input) {
  const t = tool_input || {};
  switch (tool_name) {
    case 'Bash':   return t.command || '';
    case 'Write':
    case 'Edit':
    case 'Read':   return t.file_path || '';
    case 'Glob':   return t.pattern || '';
    case 'Grep':   return `${t.pattern || ''} in ${t.path || '.'}`;
    default:       return JSON.stringify(t).slice(0, MAX_LEN);
  }
}

function outputSummary(tool_response) {
  const r = tool_response || {};
  return r.output || r.content || r.result || '';
}

// ---- main -------------------------------------------------------------------

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const { session_id, tool_name, tool_input, tool_response } = input;

    // Đường dẫn log phải tính SAU khi có payload: process.cwd() không đáng tin làm
    // gốc project (hook có thể chạy với cwd là thư mục con sau một lệnh Bash `cd`).
    const logDir  = path.join(resolveProjectRoot(input, SELF_ROOT), '.claude', 'logs');
    const logFile = path.join(logDir, 'tool-results.jsonl');

    const entry = {
      ts:      new Date().toISOString(),
      tool:    tool_name,
      session: (session_id || '').slice(0, 16),
      input:   sanitize(truncate(inputSummary(tool_name, tool_input))),
      output:  sanitize(truncate(outputSummary(tool_response))),
    };

    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // Logger errors must NEVER block tool use — swallow silently
  }
  process.exit(0);
});

process.stdin.on('error', () => process.exit(0));
