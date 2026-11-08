# Coding Convention — Frontend React/TypeScript (Org)

> [!NOTE]
> Quy ước coding **ReactJS (TypeScript)** cho dự án VDBAS. Nguồn: `VDBAS_coding_convention_front-end_react.md` (tổng hợp đầy đủ).
> Mô hình **module-based → micro-frontend**. Bổ trợ: [tech-stack.md](tech-stack.md), [security.md](security.md).
> *coding rules đặc thù từng project* triển khai riêng ở mức project.

---

## 1. Cấu trúc source code (nguyên tắc)

- **Không** tạo thư mục tùy tiện ngoài cấu trúc đã định nghĩa; tính năng mới phải nằm trong **module** tương ứng.
- `src/app` = root hệ thống, **KHÔNG chứa business logic**.
- **Module** là đơn vị độc lập, có thể tách thành micro-frontend; **module KHÔNG phụ thuộc trực tiếp nhau**.
- `shared/` dùng để tái sử dụng (UI, utils) — **KHÔNG chứa logic domain, không phụ thuộc module**; `core/` chứa service hệ thống.
- **AI-friendly:** cấu trúc giúp AI đọc từng module riêng, hiểu flow mà không cần scan toàn project; không để logic rải rác.
- Tính năng mới: domain đã có → thêm vào module; domain mới → tạo module mới trong `modules/`.
  - **NEVER** tạo `src/user/`, `src/task/` song song — tất cả nằm trong `src/modules/`.

## 2. Cấu trúc thư mục chuẩn

| Thư mục | Vai trò |
|---|---|
| `src/app/` | Application root: bootstrap, global config, global state, đăng ký provider. **Không business logic.** (`App.tsx`, `providers.tsx`, `store.ts`, `config.ts`) |
| `src/core/` | Service dùng chung toàn hệ thống, load 1 lần (**singleton**): `auth/`, `guards/` (AuthGuard, PermissionGuard, RoleGuard), `interceptors/` (Auth/Error/Timeout/Logging), `notifications/`, `services/` (ApiService, StorageService, EventBus, ConfigService), `session/`. **Không import ngược vào module.** |
| `src/modules/` | **Toàn bộ logic nghiệp vụ**, tổ chức theo domain. Mỗi module: `pages/ components/ hooks/ api/ store/ types/ README.md` |
| `src/shared/` | UI component / hook / util / constant dùng chung. **Không business, không phụ thuộc module.** |
| `src/layouts/` | Layout tổng thể: MainLayout, AuthLayout, Header, Sidebar, Footer |
| `src/i18n/` | File JSON đa ngôn ngữ, config i18n, helper translate |
| `src/viewer/` | (optional) Màn hình public, không cần login, không dùng layout chính |

> Global state **cross-module** (`auth`, `config`, `ui`, `router`, `notification`) quản lý qua **Context API** ([tech-stack.md §1b](tech-stack.md)); server state qua **TanStack Query**. State nghiệp vụ riêng (user, task…) **phải nằm trong module**, KHÔNG đưa vào global.

## 3. Quy định source code

### 3.1 Đặt tên

- **MUST** đặt tên mọi định danh (component, hook, biến, hàm, type, file/thư mục) **bằng tiếng Anh** — mô tả đúng vai trò. **NEVER** đặt tên bằng tiếng Việt (có dấu hoặc không dấu) hay phiên âm (vd `danhSachNguoiDung`, `nguoi-dung.page.tsx`); dùng `userList`, `user-list.page.tsx`.
- **File/thư mục** phải thể hiện rõ chức năng & domain; **NEVER** tên chung chung (`utils1`, `common2`, `dataHandler`).
- File theo pattern **`[feature].[type].tsx/.ts`**, phân tách từ bằng **kebab-case**:

| Type | Ý nghĩa | Ví dụ |
|---|---|---|
| `.page` | màn hình | `user-list.page.tsx` |
| `.component` | UI component | `user-item.component.tsx` |
| `.hook` | custom hook | `use-user.hook.ts` |
| `.api` | gọi API | `user.api.ts` |
| `.service` | logic xử lý | `user.service.ts` |
| `.slice` | redux slice | `user.slice.ts` |
| `.selector` | selector | `user.selector.ts` |
| `.type` | định nghĩa type | `user.type.ts` |

- **Component:** `PascalCase` (`UserListPage`, `UserItem`). **Hook:** `useXxx` (`useUser`). **Biến/hàm:** `camelCase` (`fetchUserList`, `totalAmount`).
- **NEVER:** tên hàm mơ hồ (`handleData`, `process`, `doIt`); tiền tố `m_`/`s_`; Hungarian notation; viết tắt khó hiểu.

### 3.2 Code style

- File **≤ 300 dòng**; function **≤ 75 dòng** (nguyên tắc small function).
- Thụt lề **2 spaces**, KHÔNG tab.
- Biến: **`const`** mặc định, `let` khi cần đổi; **NEVER `var`**.
- Dùng **arrow function** cho callback/hook/function nội bộ.
- **Import order** (mỗi nhóm cách 1 dòng trống): React & core libs → third-party libs → internal modules (`@/modules/...`).
- **Một component / một file.**
- **Cấu trúc component** theo thứ tự: `// 1. hooks → // 2. state → // 3. handlers → // 4. render`.
- **NEVER** viết logic phức tạp trong JSX — tách ra biến/hàm (vd `const activeUsers = getActiveUsers(users)` thay vì `.filter().map()` lồng trong JSX).

### 3.3 Lập trình với React

- **Dependency** (thay DI): dùng custom hooks / context (khi cần) / service layer.
- **Tái sử dụng logic:** không lặp code — đưa vào hook/service.
- **Performance:** `React.memo`, `useMemo`, `useCallback`; code splitting + lazy load module; phân tích bundle (`vite-bundle-analyzer`).
- **Communication:** props rõ ràng; tránh **prop drilling** → dùng context khi cần.
- **NEVER thao tác DOM trực tiếp** (`document.getElementById`) — dùng `useRef()`.
- **Side effects:** dùng `useEffect` đúng cách + **cleanup** tránh memory leak.
- **NEVER gọi API trong component** — phải qua hook / api layer.
- **NEVER `console.log` ở production** — remove trước khi commit.
- **State:** unidirectional data flow — **server state → TanStack Query**, **global UI state → Context API** (xem [tech-stack.md §1b](tech-stack.md)).
- Import theo module, không import global bừa bãi; module không gom quá nhiều component, dễ tách micro-frontend.

---

## 4. Quy định comment (AI-READABLE — bắt buộc)

- Code xử lý logic phức tạp **bắt buộc** comment rõ: **Purpose / Input / Output / Business Rule / Side Effect**.
- Comment 1 dòng `//`; nhiều dòng `/** */`; trong JSX `{/* */}` (chỉ cho block UI khó hiểu / disable tạm).
- **NEVER** giữ code comment-out lâu dài → xóa khỏi source control.
- **Bắt buộc có comment:** Hook · Service · API · Business logic · Use case. **Không cần:** code hiển nhiên, getter/setter, JSX đơn giản.

### 4.1 Format chuẩn cho function / hook

```ts
/**
 * <Tên chức năng>
 *
 * Purpose:      - Mục đích của function
 * Input:        - param: mô tả
 * Output:       - trả về gì
 * Business Rule:- rule xử lý (nếu có)
 * Side Effect:  - gọi API / update state / navigation...
 */
export const useUser = () => { ... }
```

### 4.2 Quy tắc comment cho AI

- **Không mơ hồ:** `// lọc danh sách user trạng thái ACTIVE để hiển thị` thay vì `// xử lý dữ liệu`.
- **Luôn mô tả Business Rule** (quan trọng nhất với AI): `// BUSINESS RULE: không cho xoá user nếu đang ACTIVE`.
- **Không viết tắt:** `// tính toán giá trị của user` thay vì `// calc usr val`.
- **Comment phải đúng code:** logic đổi → cập nhật comment.
- **Module README bắt buộc:** Purpose / Use cases / Business Rules.
- Khuyến nghị tag chuẩn hóa cho AI parse nhanh: `@module`, `@usecase`, `@rule`.

---

## 5. Single Responsibility

> Mỗi file một trách nhiệm chính. Không trộn UI + API + xử lý dữ liệu + validate + navigation trong một file.

| Thành phần | Trách nhiệm |
|---|---|
| Component | **Chỉ UI** — nhận props, gọi hook, render |
| Hook | **Logic** — xử lý + gọi API + state cục bộ |
| API layer | **Chỉ call backend** (`apiClient.get('/users')`) — không business logic |
| Service | Business logic phức tạp, không liên quan UI |
| Store | Chỉ quản lý state, không logic phức tạp |

**Ví dụ đúng:**
```tsx
export const UserPage = () => {
  const { users } = useUser()      // logic ở hook
  return <UserList users={users} /> // component chỉ render
}
```

**Dấu hiệu cần refactor:** file > 300 dòng · function > 75 dòng · nhiều `useEffect` phức tạp · logic trong JSX · một file làm quá nhiều việc.

---

## 6. Small Functions

- Mỗi hàm **một trách nhiệm**, tên mô tả đúng hành vi; tránh hàm "làm tất cả".
- Hàm **≤ 75 dòng**; vượt → tách hàm con / chuyển logic sang service/helper.
- Ưu tiên **pure function**: không phụ thuộc global state, không side-effect, cùng input → cùng output (dễ test/debug/tái dùng).
- Tách **side-effect** (call API, update state, ghi log) khỏi hàm logic thuần.
- Logic dùng chung → `utils`/`helpers`/`shared services`; không lặp code giữa component/service.

---

## 7. Tài liệu tham chiếu

- React Router: <https://reactrouter.com/home>
- TanStack Query: <https://tanstack.com/query/latest> · React Context: <https://react.dev/reference/react/createContext>
