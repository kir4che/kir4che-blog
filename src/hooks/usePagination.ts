export const dynamic = 'force-static';

import { useState, useEffect, useCallback, useRef } from 'react';

import type { PostMeta, PaginationData } from '@/types';
import { useAlert } from '@/contexts/AlertContext';

interface UsePaginationParams {
  type?: 'category' | 'tag';
  slug?: string;
  lang: string;
  initialPosts?: PostMeta[];
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

  const [posts, setPosts] = useState<PostMeta[]>(initialPosts ?? []);
  const [pagination, setPagination] = useState<PaginationData>(
    initialPaginationProp ?? initialPagination
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialPosts);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const skipInitialFetch = useRef<boolean>(Boolean(initialPosts));

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
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    fetchPosts();
  }, [lang, type, slug, currentPage, fetchPosts]);

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
