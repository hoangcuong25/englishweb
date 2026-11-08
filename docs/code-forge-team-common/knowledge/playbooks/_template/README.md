# Playbook Template

> Template chuẩn để tạo một **Playbook** mới (quy trình phát triển: TDD, BDD, Trunk-Based Dev...).
> Mỗi Playbook = 1 thư mục = **4 lớp** phối hợp, bật/tắt nguyên khối qua `settings.json`.

## Cấu trúc 4 lớp

| Lớp | Thư mục | Vai trò | Thiếu lớp này thì sao? |
|---|---|---|---|
| **Knowledge** | `knowledge/` | Claude hiểu "tại sao" và "làm thế nào" | Claude biết phải làm nhưng làm sai cách |
| **Skill** | `skills/` | Claude tự hành động đúng quy trình | Dev phải nhớ gọi đúng lệnh, dễ quên |
| **Hook** | `hooks/` | Chặn khi không tuân thủ | Claude và dev có thể "lười" bỏ qua |
| **Verification** | `verification/` | Đo lường mức độ áp dụng | Không biết đội có thực sự làm hay không |

## Cách tạo Playbook mới

| Bước | Hành động | Ai làm |
|---|---|---|
| 1 | Copy `_template/` → đặt tên playbook (vd: `bdd/`, `trunk-based/`) | Người đề xuất |
| 2 | Điền 4 lớp: knowledge + skill + hook + verification | Người đề xuất + tech lead |
| 3 | Tạo MR vào `code-forge-team-common`, đội review | Tech lead approve |
| 4 | Bật trong `settings.json` với `enforcement: "monitor-only"` | Tech lead |
| 5 | Sau 2 sprint, xem compliance metrics → nâng lên `warn` → `block` | Cả đội |

## Mức enforcement (tiệm tiến)

```
monitor-only  →  warn  →  block
(chỉ đo)         (nhắc)    (chặn)
```

> **Lưu ý**: Đây là *khung* template (Phase 0). Playbook **TDD** (`../tdd/`) là bản mẫu hoàn chỉnh
> 4 lớp (Phase 2A) — tham chiếu nó khi tạo playbook mới.
