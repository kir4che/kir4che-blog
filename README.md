# kir4che's Blog

個人技術與生活部落格，記錄學習、前端開發、工作與旅遊的所見所想。以 Astro 6 + React 19 + Tailwind CSS 4 建構，支援繁體中文與英文雙語，部署於 Vercel。

## 功能特色

- **雙語支援**：繁體中文（`tw`）與英文（`en`），依據 `Accept-Language` 自動導向
- **MDX 文章**：支援自訂元件，包含程式碼區塊（Expressive Code / one-dark-pro 主題）、響應式圖片、影片嵌入、折疊面板、評分等
- **密碼保護**：可針對單篇文章設定密碼，解鎖狀態存於 Cookie
- **管理後台**：瀏覽器內建立、編輯、刪除文章，封面圖片上傳至 Cloudflare R2
- **動態 OG 圖片**：每篇文章自動產生 Open Graph 預覽圖（`@vercel/og`）
- **全文搜尋**：靜態 `search.json` 端點供前端搜尋使用
- **Sitemap**：自動產生，搭配結構化資料
- **混合渲染**：公開頁面靜態預渲染，管理頁面與 API 走 SSR

## 本地開發

複製 `.env.example`（或參照下方環境變數列表）建立 `.env`，再啟動開發伺服器：

```sh
pnpm install
pnpm dev
```

開發伺服器預設跑在 `http://localhost:4321`。

### 常用指令

```sh
pnpm dev           # 啟動開發伺服器
pnpm build         # 建置正式版本至 ./dist/
pnpm preview       # 預覽正式建置結果
pnpm format        # 以 Prettier 格式化所有檔案
pnpm format:check  # 僅檢查格式，不寫入
```

### 環境變數

```sh
PUBLIC_SITE_URL=             # 網站完整網址，例如 https://kir4che.com
GOOGLE_SITE_VERIFICATION=
GOOGLE_ANALYTICS_ID=
SESSION_SECRET=              # HMAC-SHA256 管理員 session 密鑰
ADMIN_USERNAME=
ADMIN_PASSWORD=
DEFAULT_POST_PASSWORD=       # 受保護文章的預設密碼
POST_PASSWORDS=              # JSON 格式：{"tw/slug": "password"}
GITHUB_TOKEN=                # 用於推送文章的 Personal Access Token
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=               # 預設：main
```

## 撰寫文章

文章放在 `src/content/blog/{lang}/{slug}.mdx`，`lang` 為 `tw` 或 `en`。

### Frontmatter 欄位

```yaml
title: string # 必填
description: string
date: Date # 必填
categories: string[]
tags: string[]
featured: boolean # 預設 false
draft: boolean # 預設 false
protected: boolean # 預設 false，啟用後需輸入密碼
coverImage: string
updatedAt: string
showUpdatedAt: boolean # 預設 false
```

### 新增分類或標籤

你可以透過管理後台的 **分類與標籤管理 (Taxonomy Manager)** 進行視覺化操作，支援以下功能：

- **新增/編輯/刪除**：設定中英雙語名稱 (`tw`/`en`) 與 Slug。
- **子分類支援**：支援無限層級的主分類與子分類架構。
- **外觀設定**：可直接透過顏色選擇器設定 Light / Dark Mode 色碼。

編輯完成後，在「匯出設定」區塊點擊「複製到剪貼簿」，將生成的內容直接貼上並覆蓋 `src/config/taxonomy.ts` 檔案，再 push 即可生效。

## 專案結構重點

```
src/
├── content/blog/{tw,en}/   # MDX 文章
├── config/                 # 網站設定、分類與標籤對應表
├── lib/                    # 核心邏輯（文章讀取、auth、admin CRUD、i18n、OG 圖）
├── pages/
│   ├── [lang]/             # 公開頁面（靜態）
│   ├── admin/              # 管理後台（SSR，需登入）
│   │   ├── login.astro     # 登入頁
│   │   ├── index.astro     # 文章列表 + 分類標籤管理
│   │   ├── editor.astro    # 新增/編輯文章
│   │   └── preview.astro   # 即時 MDX 預覽（與編輯器透過 postMessage 溝通）
│   └── api/                # API 路由（SSR）
│       ├── admin/posts/    # 管理後台文章 CRUD + 預覽渲染
│       └── posts/[id]/     # 公開文章 API（密碼驗證）
├── components/
│   ├── features/admin/     # 管理後台元件（Editor、TaxonomyManager 等）
│   ├── mdx/                # MDX 自訂元件
│   └── ui/                 # 通用 UI 元件（含語言感知的 Link）
└── i18n/{tw,en}.json       # 翻譯字串
```

## 相關技術

- [Astro](https://astro.build)
- [Expressive Code](https://expressive-code.com)
- [DaisyUI](https://daisyui.com)
- [Vercel OG](https://vercel.com/docs/functions/og-image-generation)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
