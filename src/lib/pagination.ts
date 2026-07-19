import { DEFAULT_POSTS_PER_PAGE } from '@/config';
import type { PaginationData } from '@/types/post';

export const paginate = <T>(
  items: T[],
  currPage: number,
  perPage: number = DEFAULT_POSTS_PER_PAGE
): PaginationData<T> => {
  const totalItems = items.length;

  // 防止 perPage 為 0 或負數
  const safePerPage = perPage > 0 ? perPage : DEFAULT_POSTS_PER_PAGE;

  // 沒資料也至少維持 1 頁（方便 UI 處理）
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / safePerPage);

  // 確保目前頁碼在合法範圍
  const safePage = Math.min(Math.max(currPage, 1), totalPages);

  const startIndex = (safePage - 1) * safePerPage;
  const endIndex = startIndex + safePerPage;

  return {
    items: items.slice(startIndex, endIndex),
    currPage: safePage,
    totalPages,
    totalItems,
  };
};
