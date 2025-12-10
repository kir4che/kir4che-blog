'use client';

import { useCallback } from 'react';

import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';

interface HomePaginationProps {
  currentPage: number;
  totalPages: number;
}

const HomePagination = ({ currentPage, totalPages }: HomePaginationProps) => {
  const { handlePageChange } = usePagination();

  const handleChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      handlePageChange(page);
    },
    [currentPage, handlePageChange]
  );

  if (totalPages <= 1) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handleChange}
    />
  );
};

export default HomePagination;
