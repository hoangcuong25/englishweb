# hooks/ — Safety Hooks (org-wide, source of truth)

> **Vai trò**: `code-forge-team-common` là nguồn sự thật duy nhất cho safety hooks toàn tổ chức.
> Project **không copy** hooks vào `.claude/` — mà **trỏ thẳng** vào bản trong submodule
> (giống playbook hook `tdd-guard.js`). Bump submodule = cập nhật hook cho cả đội.

## Nội dung

| Hook | Loại | Hành vi |
|---|---|---|
| `session-start/ensure-hooks.js` | SessionStart (`startup\|resume\|clear`) | Đầu mỗi phiên: kiểm `git config core.hooksPath`; nếu chưa/sai thì đặt lại `code-forge-team-common/hooks/git` để `pre-commit` hoạt động cả phiên; luôn exit 0 |
| `pre-tool-use/dangerous-op-blocker.js` | PreToolUse (`Bash\|Write\|Edit`) | Chặn cứng (**exit 2 + stderr**): secret hardcode, `rm -rf` path tuyệt đối, `DROP/TRUNCATE TABLE`, force push main/master |
| `post-tool-use/result-logger.js` | PostToolUse (`.*`) | Ghi log mỗi tool call vào `<project>/.claude/logs/tool-results.jsonl`; luôn exit 0 |
| `git/pre-commit` | Git hook | Scan staged files tìm secret trước khi commit |
| `lib/secret-scan.js` | Module dùng chung | Luật phát hiện secret — **nguồn sự thật duy nhất** cho cả 2 hook trên |

> Đường dẫn runtime (log, git config) lấy gốc project qua `lib/project-root.js` — **không** dùng
> `process.cwd()` làm nguồn chính. Claude Code không bảo đảm cwd của hook là gốc project: sau một
> lệnh Bash đã `cd` sang thư mục con, hook kế tiếp nhận cwd là thư mục con đó.

## Cách project sử dụng (do `init-code-forge.sh` cấu hình sẵn)

`.claude/settings.json` của project trỏ thẳng vào submodule:

```jsonc
"PreToolUse":  "node \"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/pre-tool-use/dangerous-op-blocker.js\""
"PostToolUse": "node \"${CLAUDE_PROJECT_DIR:-.}/code-forge-team-common/hooks/post-tool-use/result-logger.js\""
```

Git hook được cài bằng:

```bash
git config core.hooksPath code-forge-team-common/hooks/git
```

> **Vì sao cần `session-start/ensure-hooks.js`**: `core.hooksPath` nằm trong `.git/config` —
> repo-local, **không** được version-control. Nên nếu chỉ cài lúc `init-code-forge.sh`,
> `pre-commit` sẽ **im lặng không chạy** trên các bản clone khác / máy khác. Hook SessionStart
> đặt lại `core.hooksPath` ở đầu mỗi phiên để `pre-commit` luôn active (kể cả commit gõ tay
> trong terminal cùng bản làm việc, vì config đã được ghi vào `.git/config` từ đầu phiên).
>
> **Giới hạn (cố ý)**: `ensure-hooks.js` nằm *bên trong* submodule này. Với `git clone` thuần
> (không `--recurse-submodules`) submodule rỗng → file vắng mặt → hook không chạy (không thể tự
> init cái submodule chứa chính nó). Phạm vi phủ = "submodule đã có nhưng `core.hooksPath` bị mất".
> Dev clone mới nên dùng `git clone --recurse-submodules` hoặc `git submodule update --init`.

## Luật quét secret (`lib/secret-scan.js`)

Trước đây `dangerous-op-blocker.js` (regex JS) và `git/pre-commit` (regex bash) giữ **hai bản luật
song song** → dễ lệch nhau và cùng chặn nhầm. Nay cả hai dùng chung `lib/secret-scan.js`:
hook JS `require` trực tiếp, `pre-commit` gọi qua CLI (`node lib/secret-scan.js --file <path>`).

> **MUST**: sửa luật secret **chỉ ở `lib/secret-scan.js`**. KHÔNG thêm regex secret vào 2 hook kia.

**Ba tầng luật:**

1. **Token nhà cung cấp** — `sk-…`, `AKIA…`, `ghp_…`, `AIza…`, PEM private key, credentials trong
   connection URL → chặn ở **mọi loại file**. Các prefix có ràng buộc ranh giới từ `(?<![A-Za-z0-9])`;
   thiếu nó thì `task-management-controller` / `risk-…` / `disk-…` khớp `sk-` và bị chặn oan.

2. **Cặp `key nhạy cảm = value`** — phán quyết theo **loại file** × **hình dạng value**:

   | Loại file | Đuôi | Soi gì |
   |---|---|---|
   | code | `.java .kt .ts .tsx .js .vue .py .go .cs .php .rb .sql`… | **chỉ string literal có nháy** (`" ' \``) |
   | doc | `.md .txt .adoc .rst` | chỉ literal `"` `'` (backtick = code-span markdown, không tính) |
   | config | `.env .yml .json .properties .xml Dockerfile`, không đuôi, không rõ | **cả bare lẫn quoted** |

   Lý do: trong file code, bare token sau `=`/`:` gần như luôn là biến/kiểu/biểu thức
   (`token: string`, `const token = response.data.token`) — soi bare ở đó chỉ tạo chặn nhầm.
   Trong config thì ngược lại: value vốn không nháy nên phải soi bare.

   Value được coi là **an toàn**: `${VAR}` thuần · `${VAR:-default}` (shell fallback) · `$VAR` · `$(cmd)` ·
   `<PLACEHOLDER>` · `{{template}}` · `#{spring-el}` · `%s` · boolean/`null`/`changeme`/`example`/`bearer` ·
   **tên kiểu dữ liệu** (`string`, `number`, `uuid`…) · độ dài < 4.
   Vẫn **chặn**: `${VAR:default}` kiểu Spring — vì `default` là giá trị hardcode.
   Tên biến bên trong `${…}` không bị coi là key riêng (nếu không `${DB_PASSWORD:-x}` sẽ bị chặn oan).

3. **Escape hatch** — dòng có `# forge:allow-secret` (hoặc `pragma: allowlist secret`) được bỏ qua.
   Dùng cho ca bắt nhầm còn sót; reviewer thấy được trong MR.

**Gap đã biết (chấp nhận có chủ ý):** không bắt JWT literal (`eyJ…`); không bắt secret gán từ
biến trong file code (`password = passwordVariable`). Giá trị bị chặn được **che bớt** khi in
(`hunt***(7 ký tự)`) để output hook không tự làm rò secret vào log CI.

**Yêu cầu môi trường:** `pre-commit` cần `node` trên PATH. Không có node hoặc thiếu submodule →
in cảnh báo và **cho commit đi tiếp** (không chặn dev vì lý do môi trường); PreToolUse hook vẫn
che phần Claude ghi ra.

## Hook Node là CommonJS (bắt buộc)

Mọi hook `.js` viết theo **CommonJS** (`require` / `module.exports`). Project host hiện đại
thường có `"type": "module"` trong `package.json` gốc → Node sẽ coi mọi `.js` là ES module và
hook dùng `require` sẽ **crash `require is not defined`**.

Để miễn nhiễm, submodule này có `code-forge-team-common/package.json` với `{ "type": "commonjs" }`.
Node phân giải kiểu module theo `package.json` gần nhất → mọi `.js` dưới submodule luôn là CommonJS,
**độc lập** với `type` của project host (module resolution tách theo từng cây thư mục — file `src/`
của project vẫn theo `package.json` gốc của project). File `package.json` này cố ý **không có `name`/
dependencies/scripts** để không bị các công cụ monorepo/workspace nhặt làm package con.

> **MUST**: hook mới thêm vào repo này phải viết CommonJS (`require`/`module.exports`), KHÔNG dùng
> `import`/`export`. (Skeleton `knowledge/playbooks/_template/hooks/guard.js` đã theo mẫu này.)

## Cập nhật hook

Sửa file ở đây → mở MR vào `code-forge-team-common` → các project chạy
`git submodule update --remote code-forge-team-common` là nhận hook mới (không cần `resource-sync`).
Chạy `resource-sync.sh` cũng được — Bước 0 của nó tự làm bước update này cho mọi project.

> **Migration lỗi ESM/CommonJS**: project đã sinh trước bản vá này chỉ cần
> `git submodule update --remote code-forge-team-common` để nhận `package.json` (type commonjs) —
> **không** phải sửa `settings.json` (tên file hook giữ nguyên `.js`).

## Khi hook không chạy — 3 điều kiện đã kiểm chứng

Hook thất bại **âm thầm** hoặc chỉ hiện một dòng `PostToolUse:Bash hook error` mờ nhạt.
Ba nguyên nhân dưới đây gây ra đúng triệu chứng đó — kiểm theo thứ tự:

| # | Điều kiện | Triệu chứng | Cách xử lý |
|---|---|---|---|
| 1 | **`claude` phải mở TẠI GỐC project** | Mở ở thư mục con (vd `application/`) thì Claude Code **không** load `.claude/settings.json` ở gốc → **không hook nào chạy**, không báo lỗi gì | `cd` về gốc project rồi mới gọi `claude` |
| 2 | **`node` có trên PATH** | `node: command not found` hoặc hook error | Cài Node.js; `pre-commit` thì cảnh báo rồi cho commit đi tiếp |
| 3 | **Submodule đã init** | `Cannot find module '.../code-forge-team-common/hooks/...'` tại `cjs/loader` | `git submodule update --init code-forge-team-common` |

> **Vì sao command dùng `"${CLAUDE_PROJECT_DIR:-.}/..."` chứ không phải `./...`**:
> `./` được Node phân giải theo **cwd lúc hook chạy**, mà Claude Code không bảo đảm cwd đó là gốc
> project — sau một lệnh Bash đã `cd` sang thư mục con, hook kế tiếp nhận cwd là thư mục con và
> `MODULE_NOT_FOUND`, tức **mất `dangerous-op-blocker`** mà chỉ thấy một dòng lỗi mờ.
> `CLAUDE_PROJECT_DIR` luôn trỏ thư mục chứa `.claude/` (đã đo trên Windows và shell POSIX);
> hậu tố `:-.` để bản Claude Code cũ không set biến này thì **thoái hoá mềm** về hành vi cũ
> thay vì hỏng cứng.

## Giao ước exit code (MUST — sai là hook mất tác dụng âm thầm)

Claude Code xử lý exit code của hook như sau:

| Exit code | Hành vi harness |
|---|---|
| `0` | Cho qua. stdout/stderr **không** hiện cho model |
| `2` | **CHẶN** tool call; **stderr** được feed lại cho Claude để tự sửa |
| khác `0` (vd `1`) | *Non-blocking error*: chỉ hiện stderr cho **user**, rồi **VẪN CHẠY** tool |

> **MUST**: hook muốn chặn phải ghi lý do ra **`stderr`** và `process.exit(2)`.
> **NEVER** dùng `exit 1` + `stdout` để chặn.

Đây là bug đã xảy ra thật: `dangerous-op-blocker.js` từng dùng `stdout` + `exit 1`, nên
dòng `🚫 BLOCKED` vẫn in ra nhưng lệnh nguy hiểm **vẫn thực thi** — đã đo: `rm -rf <đường dẫn
tuyệt đối>` xoá thật trên project. Chạy tay bằng `node hook.js` thấy `exit=1` + thông điệp
trông như "logic đúng", nhưng giao ước với harness thì sai; **phải verify qua phiên Claude
thật**, không chỉ chạy tay.

Ngoại lệ: `hooks/git/pre-commit` là **git hook**, không phải hook Claude Code — ở đó
`exit != 0` là chặn theo đúng quy ước của git, và nó gọi `lib/secret-scan.js` trực tiếp
(không đi qua `block()`), nên không liên quan giao ước trên.
