# kir4che's Blog

一個使用 Astro 建構的現代化部落格，支援多語言（繁中/英文）、MDX 文章、密碼保護文章等功能。

🌐 **線上展示**: [kir4che.com](https://kir4che.com)

## ✨ 特色

- 🌍 **完整的國際化支援**：繁體中文與英文雙語系，自動語言偵測
- 📝 **MDX 支援**：豐富的自訂元件（Image、Video、Accordion、Rating 等）
- 🎨 **現代化 UI**：使用 Tailwind CSS 4.x + DaisyUI
- 🔐 **密碼保護文章**：支援加密文章功能
- 🚀 **極致效能**：Astro SSR + Vercel 部署
- 📊 **SEO 優化**：完整的 Open Graph、Twitter Card、Sitemap
- ♿ **可及性友善**：遵循 ARIA 標準
- 🎯 **程式碼高亮**：使用 Expressive Code 搭配行號顯示
- 💬 **留言系統**：整合文章評論功能
- 📑 **目錄導航**：可展開/收合的文章目錄

## 🛠️ 技術堆疊

- **框架**: Astro 5.x
- **UI**: React 19 + Tailwind CSS 4.x + DaisyUI
- **內容**: MDX + Content Collections
- **部署**: Vercel (SSR)
- **語言**: TypeScript (嚴格模式)
- **套件管理**: pnpm

## 📁 專案結構

```text
/
├── public/              # 靜態資源
│   ├── blog/           # 部落格圖片
│   ├── fonts/          # 字型檔案
│   └── images/         # 其他圖片
├── src/
│   ├── components/     # 元件
│   │   ├── features/   # 功能元件（文章、側邊欄等）
│   │   ├── layouts/    # 版面配置元件
│   │   ├── mdx/        # MDX 自訂元件
│   │   ├── seo/        # SEO 相關
│   │   └── ui/         # UI 通用元件
│   ├── content/        # 文章內容
│   │   └── blog/       # 部落格文章（依語言分類）
│   │       ├── tw/     # 繁體中文文章
│   │       └── en/     # 英文文章
│   ├── config/         # 配置檔案
│   ├── i18n/           # 國際化翻譯
│   ├── layouts/        # 頁面佈局
│   ├── lib/            # 核心函式庫
│   ├── pages/          # 路由頁面
│   ├── styles/         # 全域樣式
│   └── utils/          # 工具函式
└── scripts/            # 建構腳本
```

## 🚀 快速開始

### 安裝相依套件

```sh
pnpm install
```

### 開發模式

```sh
pnpm dev
```

在瀏覽器開啟 `http://localhost:4321`

### 建構生產版本

```sh
pnpm build
```

### 預覽生產版本

```sh
pnpm preview
```

## 📝 可用指令

| 指令                 | 說明                            |
| :------------------- | :------------------------------ |
| `pnpm install`       | 安裝相依套件                    |
| `pnpm dev`           | 啟動開發伺服器 (localhost:4321) |
| `pnpm build`         | 建構生產版本至 `./dist/`        |
| `pnpm preview`       | 預覽建構後的網站                |
| `pnpm format`        | 使用 Prettier 格式化程式碼      |
| `pnpm format:check`  | 檢查程式碼格式                  |
| `pnpm warmup:og`     | 預熱 OG 圖片                    |
| `pnpm hash:password` | 產生密碼保護文章的雜湊值        |

## 📚 撰寫文章

### 建立新文章

在 `src/content/blog/tw/` 或 `src/content/blog/en/` 目錄下建立 `.mdx` 檔案：

```mdx
---
title: '文章標題'
description: '文章描述'
date: 2024-03-06
categories: ['技術']
tags: ['Astro', '前端']
featured: false
draft: false
---

文章內容...
```

### Frontmatter 欄位

- `title`: 文章標題（必填）
- `description`: 文章描述
- `date`: 發布日期（必填）
- `postId`: 用於多語言對應的文章 ID
- `categories`: 分類陣列
- `tags`: 標籤陣列
- `featured`: 是否為精選文章
- `draft`: 是否為草稿
- `passwordHash`: 密碼保護（使用 `pnpm hash:password` 產生）
- `coverImage`: 封面圖片路徑
- `updatedAt`: 更新日期
- `showUpdatedAt`: 是否顯示更新日期

## 🌍 多語言支援

專案支援繁體中文 (`tw`) 和英文 (`en`)，預設語言為繁體中文。

- 語系配置：`src/config/site.ts`
- 翻譯檔案：`src/i18n/`
- 語系偵測：自動根據 `Accept-Language` header 偵測

## 📄 授權

本專案供個人使用。

## 🙏 致謝

使用 [Astro](https://astro.build) 建構，部署於 [Vercel](https://vercel.com)。
