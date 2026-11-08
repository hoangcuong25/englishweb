# TDD Compliance Check — Verification

> Lớp 4 (Verification) của playbook TDD. Đo **mức độ thực sự áp dụng** TDD (không chỉ "có hook").
> Chạy trên CI pipeline (GitLab) + đọc log runtime do `tdd-guard.js` ghi ra.

## Tiêu chí (CI gate)

- [ ] Mỗi MR có **test coverage delta ≥ 0** (không làm tụt coverage).
- [ ] Không có file `src/` **mới** mà thiếu file test tương ứng (theo quy ước ở `knowledge/tdd-guide.md`).
- [ ] Commit history thể hiện test đi kèm code trong cùng cycle (test-first ratio đo được).

## Nguồn dữ liệu

| Nguồn | Dùng để |
|---|---|
| `.claude/logs/playbook-tdd.jsonl` | Đếm số lần `tdd-guard` ghi vi phạm (compliant=false) theo phiên/người |
| Git diff của MR | Phát hiện file `src/` mới thiếu test |
| Coverage report (CI) | Tính coverage delta |

### Format bản ghi log (`playbook-tdd.jsonl`)

Mỗi dòng là 1 JSON do `tdd-guard.js` append khi phát hiện vi phạm:

```json
{"ts":"2026-06-17T09:00:00.000Z","playbook":"tdd","enforcement":"warn","tool":"Write","file":"src/foo/bar.ts","compliant":false}
```

## Metrics theo dõi (hiển thị trên dashboard — Phase 3)

- **TDD compliance rate** = `% MR tuân thủ / tổng MR` (không có file src mới thiếu test).
- **Test-first ratio** = `% cycle có test trước implementation`.
- **Guard violation count** = số bản ghi `compliant:false` trong `playbook-tdd.jsonl` / tuần / người.

> Các metric này được **tiêu thụ** ở Phase 3 (Lát 3B — "playbook compliance metrics trên dashboard",
> feature R5). Lớp verification này chỉ định nghĩa nguồn + công thức; không tự render dashboard.

## Cách chạy thủ công (local, trước khi có CI job)

```bash
# Đếm vi phạm TDD trong phiên hiện tại
grep -c '"compliant":false' .claude/logs/playbook-tdd.jsonl 2>/dev/null || echo 0
```
