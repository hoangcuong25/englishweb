# Tech Stack — Frontend (Org)

> [!NOTE]
> Stack chuẩn **frontend** tổ chức (dự án VDBAS): **React 19 + Vite + TypeScript + Micro-frontend (Module Federation)**.
> Nguồn: tài liệu FE tech-stack & `ARCHITECTURE.md`, README `vdbas_host`.
> Mọi thay đổi qua MR (xem [../shared/git-workflow.md](../shared/git-workflow.md)). Chi tiết đặc thù → `project-knowledge/`.

## 1. Framework & Thư viện cốt lõi

| Phân nhóm | Công nghệ | Phiên bản | Vai trò |
|---|---|---|---|
| Core Framework | **ReactJS** | **19.x** | UI component-driven (Server Actions, Suspense cải tiến) |
| Language | **TypeScript** | **6.x** (strict mode) | Type-safety, giảm lỗi runtime |
| Build & Bundler | **Vite** | **8.x** | Dev server HMR nhanh; build production qua Rollup |
| Micro Frontend | **module-federation** | **1.15.x** | Chia Host & Remotes độc lập, chia sẻ runtime |
| Server State | **TanStack Query** (React Query) | **5.x** | Fetch/cache/sync/mutation dữ liệu server |
| Client UI State | **React Context API** | Native | State UI global gọn nhẹ (theme, ngôn ngữ, sidebar) |
| UI Components | **Ant Design (antd)** | **6.x** | UI Kit chuẩn enterprise |
| Form Handling | **Ant Design Form** | Native | **KHÔNG** dùng thư viện ngoài (Hook Form/Formik) — giữ codebase tinh gọn |
| HTTP Client | **Axios** | **1.16.x** | Interceptor tập trung: token/refresh/format lỗi |
| Routing | **React Router** | **v7.x** | Routing client-side, lazy loading theo module |
| Styling | **Tailwind CSS** | **4.x** | Utility-first CSS |

## 1b. State management — đã chốt

> [!IMPORTANT]
> **Quyết định org:** **TanStack Query v5** cho **server state** (fetch/cache/sync/mutation) + **React Context API** cho **global UI state**.
> Tài liệu `coding_convention_front-end_react.md` có nhắc Redux Toolkit/Zustand (`store.ts`, slice, selector) như ví dụ generic — **KHÔNG áp dụng**; ưu tiên bản tech-stack/ARCHITECTURE mới nhất.
> Hệ quả: file type `.slice`/`.selector` (xem [coding-convention.md §3.1](coding-convention.md)) chỉ dùng nếu sau này adopt store kiểu Redux — hiện **không** dùng.

## 2. Kiến trúc — Micro-frontend (Module Federation)

- Host trung tâm (`vdbas_host`) tích hợp **remote apps** động (Dynamic Remote Loading).
- Pattern nghiệp vụ: **Maker–Checker–Approver** UI flow.
- **Shared dependencies:** Host khai báo `eager: true` cho `react`, `react-dom`, `react-router-dom`; remote khai báo `singleton` (không `eager`) → đảm bảo **1 instance React** toàn hệ thống.
- Thêm remote app mới: khớp `name` với key trong registry; backend thêm entry vào Permission API + Module Registry API → Shell tự render nav/route **không cần rebuild**.

## 3. Thư viện được duyệt (Approved Libraries)

> [!IMPORTANT]
> Ràng buộc agent `developer-frontend`: **KHÔNG tự thêm dependency mới khi chưa được approve** trong bảng này. Đề xuất mới qua MR.

| Thư viện | Mục đích | Trạng thái |
|---|---|---|
| `react`, `react-dom` (19.x) | Core UI | ✅ Duyệt |
| `typescript` (6.x, strict) | Ngôn ngữ | ✅ Duyệt |
| `vite` (8.x) | Build/bundler | ✅ Duyệt |
| `@module-federation/*` (1.15.x) | Micro-frontend | ✅ Duyệt |
| `@tanstack/react-query` (5.x) | Server state | ✅ Duyệt |
| `antd` (6.x) + Ant Design Form | UI Kit + Form | ✅ Duyệt |
| `tailwindcss` (4.x) | Styling | ✅ Duyệt |
| `axios` (1.16.x) | HTTP client | ✅ Duyệt |
| `react-router` (v7.x) | Routing | ✅ Duyệt |
| React Context API (Native) | Client/global UI state | ✅ Duyệt (§1b) |
| **`@dnd-kit/core` (6.3.1) + `@dnd-kit/sortable` (10.0.0) + `@dnd-kit/utilities` (3.2.2)** | **Kéo-thả** cho màn hình **dựng bố cục**: kéo phần tử từ bảng chọn vào khung, sắp xếp lại, thả vào vùng lồng nhau. Chỉ dùng cho phân hệ có màn hình để người dùng **tự bố trí giao diện** — KHÔNG dùng để sắp xếp danh sách thông thường (antd `Table` đã đủ) | ✅ Duyệt |
| `vitest` + `@testing-library/react` | Unit/component test (Vite-native) | ✅ Duyệt (test scope) |

> KHÔNG dùng: thư viện form ngoài (Hook Form/Formik) — đã có Ant Design Form.

## 4. Biến môi trường & Hạ tầng

- Env: `REACT_APP_API_BASE=https://api.company.com` (vd).
- **Git platform:** GitLab self-hosted (`git.fis.vn`) — xem [../shared/git-workflow.md](../shared/git-workflow.md).
- Bundle analysis: `vite-bundle-analyzer` (hoặc tương đương).
