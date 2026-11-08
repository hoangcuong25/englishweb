# Playbook: TDD (Test-Driven Development)

> Quy trình phát triển **viết test trước, code sau** theo chu trình **Red → Green → Refactor**.
> Đây là playbook **mẫu hoàn chỉnh** (4 lớp) — dùng làm tham chiếu khi tạo playbook mới từ `_template/`.

## Khi nào áp dụng

- Khi implement **tính năng mới** hoặc **sửa logic nghiệp vụ** có behavior kiểm chứng được.
- Khi fix bug: viết test tái hiện bug (Red) trước, rồi sửa cho pass (Green).
- **Không bắt buộc** cho: thay đổi thuần config, tài liệu, hoặc spike/prototype throwaway.

## Cấu trúc 4 lớp

| Lớp | File | Vai trò |
|---|---|---|
| **1. Knowledge** | [`knowledge/tdd-guide.md`](knowledge/tdd-guide.md) | Claude + dev hiểu *tại sao* và *làm thế nào* (Red→Green→Refactor) |
| **2. Skill** | [`skills/tdd-workflow.md`](skills/tdd-workflow.md) | Tự kích hoạt khi "implement/tạo/build" → Claude hành động đúng quy trình |
| **3. Hook** | [`hooks/tdd-guard.js`](hooks/tdd-guard.js) | PostToolUse — nhắc/chặn khi sửa code `src/` mà không có test tương ứng |
| **4. Verification** | [`verification/tdd-compliance-check.md`](verification/tdd-compliance-check.md) | Đo compliance trên CI + metrics cho dashboard |

## Bật / tắt

Điều khiển qua `.claude/settings.json`:

```json
"playbooks": {
  "tdd": { "enabled": true, "enforcement": "warn" }
}
```

- `enabled`: `true`/`false` — bật/tắt nguyên khối cả playbook.
- `enforcement` (3 mức tiệm tiến): `monitor-only` → `warn` → `block`.

> **Loader:** `@import` knowledge/skill của playbook ở `CLAUDE.md §5` luôn được nạp (import-all, không
> comment). **BẬT/TẮT chỉ ở MỘT NƠI** = `settings.json → playbooks.tdd.enabled`: Claude **chỉ áp dụng**
> quy trình khi `enabled: true`; `enabled: false` thì knowledge chỉ là tham chiếu. Hook `tdd-guard.js`
> **tự đọc** `settings.json` nên enforcement là điều kiện THẬT ở tầng runtime.

## Lộ trình nâng enforcement

```text
monitor-only  →  warn  →  block
(chỉ đo 2 sprint)  (nhắc)   (chặn cứng)
```

Bắt đầu `monitor-only` để lấy baseline compliance, quen rồi `warn`, ổn định mới `block`.
