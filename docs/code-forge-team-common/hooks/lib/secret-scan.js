#!/usr/bin/env node
'use strict';

// secret-scan — bộ quét secret DÙNG CHUNG cho cả hai hook:
//   • hooks/pre-tool-use/dangerous-op-blocker.js  (Claude ghi file / chạy bash)
//   • hooks/git/pre-commit                        (commit gõ tay trong terminal)
// Trước đây mỗi bên tự giữ một bản regex → dễ lệch nhau. Từ nay chỉ sửa ở file này.
//
// CommonJS bắt buộc (xem hooks/README.md).
//
// Nguyên tắc quét (giảm chặn nhầm mà không mất che chắn):
//   1. Token nhà cung cấp (sk-…, AKIA…, ghp_…, AIza…, PEM, creds trong URL) → chặn ở MỌI file.
//   2. Cặp "key nhạy cảm = value": phán quyết theo LOẠI FILE và HÌNH DẠNG value —
//      file code/tài liệu chỉ soi string literal có nháy (bare token luôn là biến/kiểu dữ liệu);
//      file config soi cả bare lẫn quoted (value trong config vốn không nháy).
//   3. Dòng có `# forge:allow-secret` → bỏ qua (escape hatch cho ca bắt nhầm còn sót).

// ── 1) Token định dạng nhà cung cấp ──────────────────────────────────────────
// `(?<![A-Za-z0-9])` là BẮT BUỘC: thiếu nó thì "task-management-controller",
// "risk-assessment-…", "disk-usage-…" đều khớp "sk-[…]{20,}" và bị chặn oan.
const B = '(?<![A-Za-z0-9])';

const TOKEN_PATTERNS = [
  { name: 'Anthropic/OpenAI API key', re: new RegExp(`${B}sk-[a-zA-Z0-9\\-_]{20,}`) },
  { name: 'AWS Access Key ID', re: new RegExp(`${B}AKIA[0-9A-Z]{16}`) },
  { name: 'GitHub Personal Access Token', re: new RegExp(`${B}ghp_[a-zA-Z0-9]{36}`) },
  { name: 'Google API key', re: new RegExp(`${B}AIza[0-9A-Za-z\\-_]{35}`) },
  { name: 'PEM private key block', re: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/ },
  { name: 'Credentials in connection URL', re: /:\/\/[^\s:@/]*:[^\s:@/]+@/ },
];

// ── 2) Escape hatch theo dòng ────────────────────────────────────────────────
const ALLOW_PRAGMA = /forge:\s*allow-secret|pragma:\s*allowlist\s+secret/i;

// ── 3) Phân loại file ────────────────────────────────────────────────────────
// code   : chỉ soi string literal (" ' `) — bare token trong code luôn là biến/kiểu.
// doc    : như code nhưng backtick là code-span markdown, KHÔNG tính là string literal.
// config : soi cả bare lẫn quoted — value trong config vốn không nháy.
const CODE_EXT = new Set([
  'java', 'kt', 'kts', 'groovy', 'scala', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  'vue', 'svelte', 'py', 'go', 'cs', 'php', 'rb', 'rs', 'swift', 'dart',
  'c', 'cc', 'cpp', 'h', 'hpp', 'sql',
]);
const DOC_EXT = new Set(['md', 'mdx', 'txt', 'adoc', 'rst']);

function fileKind(filePath) {
  const m = /\.([A-Za-z0-9]+)$/.exec(String(filePath || ''));
  const ext = m ? m[1].toLowerCase() : '';
  if (CODE_EXT.has(ext)) return 'code';
  if (DOC_EXT.has(ext)) return 'doc';
  // .env/.yml/.json/.properties/Dockerfile/không đuôi/không rõ → soi chặt hơn.
  return 'config';
}

// ── 4) Cặp key = value ───────────────────────────────────────────────────────
const KEY_WORDS =
  'password|passwd|pwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|' +
  'private[_-]?key|client[_-]?secret|secret[_-]?key|token|credentials?';
// Key phải đứng ở ranh giới từ (`DB_PASSWORD`, `spring.datasource.password` vẫn khớp)
// và phải NGAY SAU đó là `:` hoặc `=` (nên `tokenType:`, `token-validity:` không khớp).
const KEY_RE_SRC = `(?:^|[^A-Za-z0-9])(${KEY_WORDS})\\s*[:=]\\s*`;

// Value "vô hại" dù key nghe nhạy cảm: placeholder, boolean, và TÊN KIỂU DỮ LIỆU
// (`token: string` trong TS, `"token": "string"` trong swagger).
const TRIVIAL_VALUE_RE = new RegExp(
  '^(?:true|false|null|nil|none|~|changeme|change[-_]me|example|sample|placeholder|' +
    'bearer|jwt|basic|todo|tbd|dummy|value|secret|password|' +
    'string|str|number|int|integer|long|float|double|boolean|bool|uuid|guid|' +
    'varchar|text|object|array|any|date|datetime|timestamp|' +
    'x{3,}|\\*+|\\.{3,}|-+|_+)$',
  'i'
);

// Tách value ngay sau dấu `:`/`=`. Trả về {kind:'quoted'|'bare', value}.
function extractValue(rest, backtickIsQuote) {
  const quotes = backtickIsQuote ? '"\'`' : '"\'';
  const first = rest.charAt(0);
  if (quotes.indexOf(first) !== -1 && first !== '') {
    const end = rest.indexOf(first, 1);
    if (end > 0) return { kind: 'quoted', value: rest.slice(1, end) };
    return null; // nháy mở không đóng → không kết luận
  }
  const bare = /^[^\s#]+/.exec(rest);
  if (!bare) return null;
  let v = bare[0].replace(/[,;)\]]+$/, '');
  // Chỉ cắt `}` thừa (vd `{password: abc}`), KHÔNG cắt `}` đóng của `${...}` —
  // cắt nhầm sẽ làm `${DB_PASSWORD}` hết là env ref hợp lệ.
  while (v.endsWith('}') && (v.match(/\}/g) || []).length > (v.match(/\{/g) || []).length) {
    v = v.slice(0, -1);
  }
  return { kind: 'bare', value: v };
}

// Value có phải secret hardcode thật không?
function isHardcodedSecret(raw) {
  const v = String(raw).trim();
  if (v.length < 4) return false;
  if (TRIVIAL_VALUE_RE.test(v)) return false;
  if (/^\$\{[^:}]*\}$/.test(v)) return false; // ${DB_PASSWORD} — env ref thuần
  if (/^\$\{[^}]*:[-=?+]/.test(v)) return false; // ${VAR:-default} — shell fallback
  // $VAR, $(cmd) — cố ý KHÔNG bắt `${`: `${VAR:default}` là default hardcode → phải chặn.
  if (/^\$[A-Za-z_(]/.test(v)) return false;
  if (/^<[^>]*>$/.test(v)) return false; // <YOUR_API_KEY_HERE>
  if (/^\{\{.*\}\}$/.test(v)) return false; // {{ template }}
  if (/^#\{.*\}$/.test(v)) return false; // #{spring-el}
  if (/^%[a-z]$/i.test(v)) return false; // %s
  if (/^\[.*\]$/.test(v)) return false; // [redacted]
  return true;
}

// Bare value trong config: loại biểu thức code (phòng file script không đuôi).
function looksLikeExpression(v) {
  return /[()]|=>|->/.test(v);
}

// Vùng nội suy `${...}` / `#{...}`: TÊN BIẾN bên trong không phải cặp key=value.
// Thiếu bước này thì `password: ${DB_PASSWORD:-changeme}` bị bắt ở "…_PASSWORD:"
// với value "-changeme" → chặn oan, dù cả dòng chỉ là env ref có fallback.
function interpolationSpans(line) {
  const spans = [];
  const re = /[$#]\{[^}]*\}/g;
  let m;
  while ((m = re.exec(line)) !== null) spans.push([m.index, m.index + m[0].length]);
  return spans;
}

/**
 * Quét MỘT dòng. Trả về {rule, value} nếu là secret, ngược lại null.
 * @param {string} line
 * @param {'code'|'doc'|'config'} kind
 */
function scanLine(line, kind) {
  if (ALLOW_PRAGMA.test(line)) return null;

  for (const { name, re } of TOKEN_PATTERNS) {
    const m = re.exec(line);
    if (m) return { rule: name, value: m[0] };
  }

  // Quét MỌI vị trí key trong dòng (không chỉ vị trí đầu tiên) — để
  // `token: string; password = "hunter2"` vẫn bắt được vế sau.
  const keyRe = new RegExp(KEY_RE_SRC, 'gi');
  const spans = interpolationSpans(line);
  let m;
  while ((m = keyRe.exec(line)) !== null) {
    if (spans.some(([s, e]) => m.index >= s && m.index < e)) continue; // tên biến trong ${...}
    const rest = line.slice(m.index + m[0].length);
    const parsed = extractValue(rest, kind === 'code');
    if (!parsed) continue;
    if (parsed.kind === 'bare') {
      if (kind !== 'config') continue; // code/doc: bare = biến, kiểu, biểu thức → bỏ qua
      if (looksLikeExpression(parsed.value)) continue;
    }
    if (!isHardcodedSecret(parsed.value)) continue;
    return { rule: `hardcoded value for key "${m[1]}"`, value: parsed.value };
  }
  return null;
}

// Che bớt giá trị trước khi in ra (output hook có thể lọt vào log CI).
function mask(v) {
  const s = String(v);
  return (s.length <= 6 ? s.slice(0, 2) : s.slice(0, 4)) + `***(${s.length} ký tự)`;
}

/**
 * Quét cả khối text. Trả về finding đầu tiên hoặc null.
 * @param {string} text
 * @param {{filePath?: string|null}} [opts]
 * @returns {{rule:string, value:string, lineNo:number, line:string, masked:string}|null}
 */
function scanText(text, opts) {
  const kind = fileKind((opts || {}).filePath);
  const lines = String(text == null ? '' : text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const hit = scanLine(lines[i], kind);
    if (!hit) continue;
    const masked = lines[i].split(hit.value).join(mask(hit.value)).trim().slice(0, 160);
    return { rule: hit.rule, value: hit.value, lineNo: i + 1, line: lines[i], masked };
  }
  return null;
}

module.exports = { scanText, scanLine, fileKind, mask };

// ── CLI: dùng bởi hooks/git/pre-commit ───────────────────────────────────────
//   printf '%s\n' "$ADDED" | node secret-scan.js --file <path>
//   exit 0 = sạch · exit 1 = có secret (in "Reason"/"Line") · exit 2 = lỗi nội bộ
if (require.main === module) {
  const argv = process.argv.slice(2);
  const fi = argv.indexOf('--file');
  const filePath = fi >= 0 ? argv[fi + 1] : null;

  const chunks = [];
  process.stdin.on('data', (c) => chunks.push(c));
  process.stdin.on('end', () => {
    try {
      const hit = scanText(Buffer.concat(chunks).toString('utf8'), { filePath });
      if (!hit) process.exit(0);
      process.stdout.write(`Reason : ${hit.rule}\n`);
      process.stdout.write(`Line   : ${hit.masked}\n`);
      process.exit(1);
    } catch (e) {
      process.stderr.write(`secret-scan error: ${e && e.message}\n`);
      process.exit(2);
    }
  });
  process.stdin.on('error', () => process.exit(2));
}
