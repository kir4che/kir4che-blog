# kir4che-blog

kir4che 的個人技術部落格，以 Astro 建置，支援繁體中文（預設）與英文雙語，部署於 Vercel。

## 技術堆疊

| 技術                  | 版本    |
| --------------------- | ------- |
| Astro                 | ^6.0.6  |
| React                 | ^19.2.4 |
| TypeScript            | ^5.9.3  |
| Tailwind CSS          | ^4.2.2  |
| DaisyUI               | ^5.5.19 |
| Vite                  | ^8.0.1  |
| pnpm                  | 10.29.1 |
| @astrojs/mdx          | ^5.0.2  |
| @astrojs/vercel       | ^10.0.2 |
| astro-expressive-code | ^0.41.7 |

## 常用指令

```bash
pnpm dev            # 啟動開發伺服器
pnpm build          # 建置正式版本
pnpm preview        # 預覽建置結果
pnpm format         # 以 Prettier 格式化所有檔案
pnpm format:check   # 檢查格式化是否符合規範
```

## 重要目錄結構

```
src/
├── components/
│   ├── blog/         # 文章相關元件
│   ├── features/     # 功能性元件（搜尋、燈箱等）
│   ├── layouts/      # 版面配置元件
│   ├── mdx/          # MDX 自訂元件
│   ├── seo/          # SEO / Open Graph 元件
│   └── ui/           # 通用 UI 元件
├── content/
│   └── blog/
│       ├── tw/       # 繁體中文文章（.md / .mdx）
│       └── en/       # 英文文章（.md / .mdx）
├── i18n/
│   ├── tw.json       # 繁體中文翻譯
│   └── en.json       # 英文翻譯
├── layouts/          # 頁面層級版面（BaseLayout、PostLayout 等）
├── pages/
│   ├── [lang]/       # 語系路由（tw / en）
│   ├── admin/        # 管理後台（受 middleware 保護）
│   ├── api/          # API 端點
│   └── og/           # OG 圖片生成
├── config/           # 網站全域設定
├── lib/              # 共用工具函式（含 auth）
├── hooks/            # React hooks
├── utils/            # 輔助工具
├── types/            # TypeScript 型別定義
├── styles/           # 全域樣式
├── content.config.ts # Content Collection schema 定義
└── middleware.ts      # 身份驗證中介層（保護 /admin、/api/admin）
```

## 文章 Frontmatter Schema

新增文章時必須包含以下欄位（定義於 `src/content.config.ts`）：

```yaml
---
title: string # 必填
description: string # 選填
date: Date # 必填，可接受日期字串
categories: string[] # 選填，預設 []
tags: string[] # 選填，預設 []
featured: boolean # 選填，預設 false
draft: boolean # 選填，預設 false（true 時不公開）
protected: boolean # 選填，預設 false（true 時需登入）
coverImage: string # 選填，封面圖片路徑
updatedAt: string # 選填，更新日期
showUpdatedAt: boolean # 選填，預設 false
---
```

## 行為原則

- **語系路由**：預設語系為 `tw`，採用 manual routing，所有語系路由均在 `src/pages/[lang]/` 下處理。
- **路徑別名**：`@/` 對應 `src/`，修改 import 時統一使用此別名。
- **內容集合**：文章以 Astro Content Collections 管理，修改 schema 請同步更新 `src/content.config.ts`。
- **樣式規範**：使用 Tailwind CSS v4 + DaisyUI，勿直接撰寫 inline style，優先使用 utility class。
- **元件語言**：Astro 元件（`.astro`）用於靜態/伺服器端，React 元件（`.tsx`）僅用於需要互動性的情境。
- **Admin 保護**：`/admin`（登入頁除外）與 `/api/admin` 路由均由 `src/middleware.ts` 驗證，請勿繞過。
- **圖片來源**：遠端圖片僅允許來自 `cdn.kir4che.com`（已設於 `astro.config.mjs`）。
- **提交前**：執行 `pnpm format:check` 確保格式符合規範再提交。
