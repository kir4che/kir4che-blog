<div align="center">

# kir4che-blog

**個人部落格 — 從零建置 · MDX 原生 · Keystatic 管理**

[kir4che.com](https://kir4che.com)

<img src="./src/assets/images/screenshot.webp" alt="kir4che-blog screenshot" width="100%">

</div>

以 **Astro 7 + React 19** 建構，支援**繁體中文（預設）與英文**雙語，部署於 Vercel。後台使用 **Keystatic** 開源 CMS，提供結構化 MDX 編輯與 GitHub OAuth 認證。

## 專案特色

| 面向         | 內容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| **寫作系統** | 以 Astro Content Collections 管理雙語 MDX 文章，搭配自訂元件、分類、標籤與草稿狀態。    |
| **內容管理** | Keystatic 提供結構化 MDX 編輯；本機直接寫檔，production 透過 GitHub storage 寫入 repo。 |
| **閱讀體驗** | 支援目錄、圖片燈箱、相關文章、Utterances 留言、文章搜尋、旅遊地圖與動態 OG 圖片。       |
| **部署方式** | 多數頁面靜態預渲染，密碼驗證與 OG 圖片由 server routes 處理，部署於 Vercel。            |

## 快速開始

```sh
pnpm install
pnpm dev               # http://localhost:4321
```

Keystatic 後台位於 `/keystatic`，本機開發時使用 local storage，直接讀寫 `src/content/blog/`。

```sh
pnpm build             # 正式建置
pnpm preview           # 預覽建置結果
pnpm format:check      # 檢查格式
pnpm new-post          # 快速建立新文章
```

## 技術棧

| 層   | 技術                                             |
| ---- | ------------------------------------------------ |
| 框架 | Astro 7 + React 19 (Islands)                     |
| 樣式 | Tailwind CSS 4 + DaisyUI 5                       |
| 內容 | MDX + Content Collections (Zod schema)           |
| CMS  | Keystatic (GitHub-backed, structured MDX editor) |
| 安全 | env-only 密碼 + timing-safe 比較 + rate limiting |
| 部署 | Vercel (預渲染頁面 + server routes 混合)         |
