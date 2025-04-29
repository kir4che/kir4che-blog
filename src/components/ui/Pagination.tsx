import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/style';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const t = useTranslations('common.pagination');

  const renderBtn = (direction: 'prev' | 'next') => {
    const isPrev = direction === 'prev';
    const targetPage = isPrev ? currentPage - 1 : currentPage + 1;
    const isDisabled = isPrev ? currentPage === 1 : currentPage === totalPages;

    return (
      <button
        onClick={() => onPageChange(targetPage)}
        disabled={isDisabled}
        className={cn('text-pink-600 disabled:invisible')}
        aria-label={isPrev ? t('previous') : t('next')}
        tabIndex={0}
      >
        {isPrev ? (
          <ChevronLeft className='h-4.5 w-4.5' />
        ) : (
          <ChevronRight className='h-4.5 w-4.5' />
        )}
      </button>
    );
  };

  const renderPageBtn = useCallback(
    (pageNum: number, isActive = false) => (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={cn(
          'h-6 w-6 rounded-full',
          isActive
            ? 'text-text-secondary bg-pink-400 font-medium dark:bg-pink-300'
            : 'hover:bg-pink-600/20 dark:hover:bg-pink-500/20'
        )}
        aria-label={t('goToPage', { page: pageNum })}
        tabIndex={0}
      >
        {pageNum}
      </button>
    ),
    [onPageChange, t]
  );

  const renderEllipsis = (key: string) => (
    <span key={key} className='text-text-primary/80'>
      ...
    </span>
  );

  const renderPageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 調整起始頁碼，保證顯示足夠的頁碼數量。
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(1, endPage - maxVisiblePages + 1);

    const pages: React.ReactNode[] = [];

    // 顯示第一頁和省略號
    if (startPage > 1) {
      pages.push(renderPageBtn(1));
      if (startPage > 2) pages.push(renderEllipsis('ellipsis-start'));
    }

    // 中間的頁碼
    for (let i = startPage; i <= endPage; i++)
      pages.push(renderPageBtn(i, currentPage === i));

    // 顯示最後一頁和省略號
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(renderEllipsis('ellipsis-end'));
      pages.push(renderPageBtn(totalPages));
    }

    return pages;
  }, [currentPage, totalPages, renderPageBtn]);

  return (
    <nav
      className={cn(
        'mt-12 flex items-center justify-center gap-x-3 text-sm',
        className
      )}
      aria-label={t('title')}
    >
      {renderBtn('prev')}
      {renderPageNumbers}
      {renderBtn('next')}
    </nav>
  );
};

export default Pagination;
