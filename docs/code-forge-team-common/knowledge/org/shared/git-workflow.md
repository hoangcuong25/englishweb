# Git Workflow (Org · Shared)

> [!NOTE]
> Quy trình Git chuẩn dùng chung **mọi stack** (backend & frontend) — dự án VDBAS.
> Nguồn: **`VDBAS_Git flow v1.0`** (pptx — lệnh & convention) + **`git-flow.png`** (mô hình nhánh & promotion) + README repo VDBAS (platform).

## 1. Platform — GitLab (self-hosted)

- **GitLab self-hosted:** `git.fis.vn` (FIS), repo dưới group `fis-gs/gs-hn/vdbas/...`.
- **GitLab CI/CD Pipelines** (build, test) + **SAST** (quét lỗ hổng). CI phải xanh mới được merge.

## 2. Mô hình nhánh

### Nhánh dài hạn (được bảo vệ)
| Nhánh | Vai trò |
|---|---|
| `main` | Production. Mỗi release gắn **tag** (`v1.0.0`, `v1.0.1`...) |
| `uat` | User Acceptance Testing |
| `staging` | Môi trường staging |
| `develop` | Nhánh **tích hợp** — base cho mọi nhánh làm việc |

### Nhánh ngắn hạn
| Tiền tố | Tách từ | Mục đích | Merge về |
|---|---|---|---|
| `feature/<...>` | `develop` | Tính năng mới | `develop` |
| `update/<...>` | `develop` | Cập nhật/cải tiến tính năng có sẵn | `develop` |
| `bugfix/<...>` | `develop` | Sửa lỗi (chưa lên production) | `develop` |
| `hotfix/<...>` | **`main`** | Vá khẩn cấp trên production | **`main`** (tag patch) |

### Quy ước đặt tên nhánh
```
feature/<Ticket ID>_Meaningful_branch_name
```
Ví dụ: `feature/ITD-184_Update_logic_code_for_safety_handle`
*(Áp dụng tương tự cho `update/`, `bugfix/`, `hotfix/`. Tên trong `git-flow.png` như `feature/create_new_feature_1` chỉ là minh hoạ.)*

## 3. Luồng promote (release pipeline)

```
feature/ | update/ | bugfix/  ──MR──►  develop
                                          │
                                          ├─ MR develop → staging
                                          │       └─ MR staging → uat
                                          │               └─ MR uat → main  ──►  tag vX.Y.0
hotfix/ (từ main) ───────────────── MR hotfix → main  ──────────────────────►  tag vX.Y.1
```

- Tính năng/bugfix gom về `develop`, rồi promote dần `develop → staging → uat → main`.
- `hotfix/` đi tắt: tách từ `main`, MR thẳng về `main`, gắn tag patch.

## 4. Tạo nhánh feature (từ `develop`)

```bash
git checkout develop                 # B1: đứng trên nhánh base
git pull origin develop              # B2: cập nhật base với remote
git checkout -b feature/ITD-184_Update_logic_code_for_safety_handle   # B3: tạo nhánh
```

## 5. Commit

**Format bắt buộc:** `<Ticket ID> <Meaningful commit message>`

- Kiểm tra kỹ thay đổi **từng file** trước khi `git add`.
- **NEVER** commit công việc chưa hoàn thiện.
- **NEVER** commit file **không liên quan** đến feature đang làm.

## 6. Push nhánh feature (rebase với destination)

```bash
git fetch                            # B1: nắm thông tin mới nhất
```
- Nếu `develop` **không** có thay đổi mới → push thẳng:
```bash
git push -u origin feature/ITD-184_...
```
- Nếu `develop` **có** thay đổi mới → cập nhật & rebase trước:
```bash
git checkout develop && git pull     # cập nhật destination
git checkout feature/ITD-184_...      # quay lại nhánh feature
git rebase develop                    # rebase với destination
git push -u origin feature/ITD-184_...
```

## 7. Merge Request (MR)

**Format tiêu đề:** `<Ticket ID>: <Meaningful merge request title>`

Luồng: Engineer tạo nhánh từ `develop` → làm việc & commit → push nhánh + **tạo MR khi hoàn thành** → **Tech Lead review & merge**.

- Kiểm tra kỹ thay đổi từng file & các commit **trước khi** tạo MR.
- **NEVER** tạo MR cho công việc chưa hoàn thiện.
- **NEVER** gộp **nhiều feature** trong một MR — và **squash toàn bộ commit** trước khi tạo MR.
- Bật **MR approvals** (≥1 approval); CI/SAST phải pass mới merge.

## 8. Knowledge qua MR (quy ước harness)

> Mọi thay đổi trong `code-forge-team-common/knowledge/` **bắt buộc** qua MR review, **không** commit trực tiếp — kiểm soát chất lượng kiến thức dùng chung.

## 9. Submodule sync (code-forge-team-common)

- `code-forge-team-common` nhúng vào từng project bằng **git submodule**.
- Cập nhật knowledge dùng chung: merge vào `code-forge-team-common` → tech lead chạy
  `code-forge-project-templates/tools/resource-sync.sh` (tự update submodule mọi project lên default branch
  + sync) rồi commit con trỏ submodule mới trong từng project (qua MR project đó).
