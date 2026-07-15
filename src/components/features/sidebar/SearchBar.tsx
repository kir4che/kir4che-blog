import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/utils/cn';

interface Post {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
}

interface SearchPost extends Post {
  searchableText: string;
}

const postsCache = new Map<string, SearchPost[]>();

interface SearchBarProps {
  basePath: string;
  noResultsText: string;
  placeholder: string;
  collapsible?: boolean;
  className?: string;
}

const SearchBar = ({
  basePath,
  noResultsText,
  placeholder,
  collapsible = false,
  className,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [isMobile, setIsMobile] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const base = basePath.replace(/\/$/, '');

  const normalizePosts = (items: Post[]): SearchPost[] =>
    items.map((post) => ({
      ...post,
      searchableText: [
        post.title,
        post.description,
        post.slug,
        ...(post.tags || []),
        ...(post.categories || []),
      ]
        .join(' ')
        .toLowerCase(),
    }));

  const fetchPosts = () => {
    if (posts.length > 0) return;

    const cached = postsCache.get(base);
    if (cached) {
      setPosts(cached);
      return;
    }

    if (abortControllerRef.current) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`${base}/search.json`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((items: Post[]) => {
        const normalized = normalizePosts(items);
        postsCache.set(base, normalized);
        setPosts(normalized);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setPosts([]);
      })
      .finally(() => {
        abortControllerRef.current = null;
      });
  };

  // 語系變更或元件卸載時，中斷 fetch 並清空狀態。
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [base]);

  // 偵測是否為 sm 以下的裝置寬度
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 尋找 mobile portal 目標節點
  useEffect(() => {
    setPortalTarget(document.getElementById('mobile-search-portal'));
  }, []);

  // 點擊外部關閉（同時檢查 portal ref）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const inRoot = rootRef.current?.contains(e.target as Node);
      const inPortal = portalRef.current?.contains(e.target as Node);
      if (!inRoot && !inPortal) {
        setIsOpen(false);
        if (collapsible) {
          setIsExpanded(false);
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [collapsible]);

  // 展開狀態或模式改變時 focus input
  useEffect(() => {
    if (isExpanded && collapsible) inputRef.current?.focus();
  }, [isExpanded, collapsible, isMobile]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return posts.filter((p) => p.searchableText.includes(q));
  }, [query, posts]);

  const useMobilePortal = collapsible && isMobile && !!portalTarget;

  const inputEl = (
    <div className="bg-surface-secondary flex w-full items-center gap-2 rounded-full px-3 py-1.5 shadow focus-within:ring-2 focus-within:ring-pink-500">
      <Search size={16} className="shrink-0 opacity-70" />
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onFocus={() => {
          fetchPosts();
          setIsOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(e.target.value.trim().length > 0);
        }}
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none lg:text-sm [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:opacity-80 [&::-webkit-search-cancel-button]:brightness-0 dark:[&::-webkit-search-cancel-button]:invert"
      />
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        collapsible ? 'relative flex min-h-9 min-w-7 items-center' : 'xs:w-[50vw] relative w-full',
        className
      )}
    >
      {collapsible && (
        <button
          onClick={() => {
            setIsExpanded(true);
            fetchPosts();
          }}
          aria-label={placeholder}
          className={cn(
            'flex-center absolute left-0 z-0 transition-all duration-300 hover:text-pink-500',
            isExpanded
              ? 'pointer-events-none scale-75 opacity-0'
              : 'scale-100 opacity-100 delay-100'
          )}
        >
          <Search size={18} aria-hidden="true" />
        </button>
      )}
      {!useMobilePortal && (
        <div
          className={cn(
            'relative z-10 transition-[width,opacity] duration-300 ease-in-out',
            collapsible
              ? isExpanded
                ? 'w-full opacity-100 sm:w-52'
                : 'w-0 overflow-hidden opacity-0'
              : 'w-full'
          )}
        >
          {inputEl}
          {isOpen && query.trim() !== '' && (
            <ul
              className={cn(
                'bg-surface-secondary scrollbar-none absolute z-50 max-h-60 w-full min-w-52 overflow-y-auto rounded-md p-1 text-[13px] shadow-xl',
                'top-full left-0 mt-1'
              )}
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((p) => (
                  <li key={p.slug}>
                    <a
                      href={`${base}/${p.slug}`}
                      className="block w-full rounded-md px-3 py-2 font-medium transition-colors hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-950/30"
                    >
                      {p.title || p.slug}
                    </a>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-sm opacity-50">{noResultsText}</li>
              )}
            </ul>
          )}
        </div>
      )}
      {useMobilePortal &&
        portalTarget &&
        createPortal(
          <div ref={portalRef} className="mt-2">
            <div
              className={cn(
                'transition-[max-height,opacity] duration-300 ease-in-out',
                isExpanded ? 'max-h-14 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
              )}
            >
              <div className="pb-1.5">{inputEl}</div>
            </div>
            {isExpanded && isOpen && query.trim() !== '' && (
              <ul className="bg-surface-secondary scrollbar-none mt-1 max-h-60 w-full overflow-y-auto rounded-md p-1 text-[13px] shadow-xl">
                {filteredResults.length > 0 ? (
                  filteredResults.map((p) => (
                    <li key={p.slug}>
                      <a
                        href={`${base}/${p.slug}`}
                        className="block w-full rounded-md px-3 py-2 font-medium transition-colors hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-950/30"
                      >
                        {p.title || p.slug}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-sm opacity-50">{noResultsText}</li>
                )}
              </ul>
            )}
          </div>,
          portalTarget
        )}
    </div>
  );
};

export default SearchBar;
