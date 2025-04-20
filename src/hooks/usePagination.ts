export const dynamic = 'force-static';

import { useState, useEffect, useCallback } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import type { PostMeta, PaginationData } from '@/types/post';

interface UsePaginationParams {
  type?: 'category' | 'tag';
  slug?: string;
  lang: string;
}

const initialPagination: PaginationData = {
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
};

export const usePagination = ({ type, slug, lang }: UsePaginationParams) => {
  const { showError } = useAlert();

  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [pagination, setPagination] =
    useState<PaginationData>(initialPagination);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchPosts = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (type && slug) queryParams.append(type, slug);
    queryParams.append('page', currentPage.toString());

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${queryParams}&lang=${lang}`
    )
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
        setPagination(data.pagination);
      })
      .catch((err) => {
        setError(err as Error);
        showError(err instanceof Error ? err.message : err);
      })
      .finally(() => setIsLoading(false));
  }, [lang, type, slug, currentPage, showError]);

  useEffect(() => {
    fetchPosts();
  }, [lang, type, slug, currentPage, fetchPosts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [lang, type, slug]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [currentPage]
  );

  return {
    posts,
    pagination,
    isLoading,
    error,
    retry: fetchPosts,
    handlePageChange,
  };
};
