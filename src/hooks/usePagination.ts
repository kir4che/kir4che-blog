import { useState, useEffect, useCallback, useRef } from 'react';

import type { PostInfo, PaginationData } from '@/types';
import { useAlert } from '@/contexts/AlertContext';

interface UsePaginationParams {
  type?: 'category' | 'tag';
  slug?: string;
  lang: string;
  initialPosts?: PostInfo[];
  initialPagination?: PaginationData;
  initialPage?: number;
}

const initialPagination: PaginationData = {
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  postsPerPage: 0,
  nextPage: null,
  prevPage: null,
};

export const usePagination = ({
  type,
  slug,
  lang,
  initialPosts,
  initialPagination: initialPaginationProp,
  initialPage = 1,
}: UsePaginationParams) => {
  const { showError } = useAlert();

  const [posts, setPosts] = useState<PostInfo[]>(initialPosts ?? []);
  const [pagination, setPagination] = useState<PaginationData>(
    initialPaginationProp ?? initialPagination
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialPosts);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const skipInitialFetch = useRef<boolean>(Boolean(initialPosts));

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async () => {
    // 取消上一次的請求
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (type && slug) queryParams.append(type, slug);
      queryParams.append('page', currentPage.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${queryParams}&lang=${lang}`,
        {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (!data || typeof data !== 'object')
        throw new Error('Invalid response format.');

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setPagination(data.pagination || initialPagination);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;

      const errorMsg =
        err instanceof Error ? err : new Error('Failed to fetch posts');
      setError(errorMsg);
      showError(errorMsg.message);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [lang, type, slug, currentPage, showError]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    fetchPosts();

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchPosts]);

  useEffect(() => {
    setCurrentPage(initialPage);
    if (initialPosts) {
      setPosts(initialPosts);
      setPagination(initialPaginationProp ?? initialPagination);
      setIsLoading(false);
      skipInitialFetch.current = true;
    }
  }, [lang, type, slug, initialPage, initialPosts, initialPaginationProp]);

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
