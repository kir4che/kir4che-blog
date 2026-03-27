import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

interface Post {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
}

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const base = basePath.replace(/\/$/, '');

  const fetchPosts = () => {
    if (abortControllerRef.current) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`${base}/search.json`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then(setPosts)
      .catch(() => setPosts([]));
  };

  // 語系變更或元件卸載時，中斷 fetch 並清空狀態。
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setPosts([]);
    };
  }, [base]);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
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

  // 展開狀態改變時 focus input
  useEffect(() => {
    if (isExpanded && collapsible) inputRef.current?.focus();
  }, [isExpanded, collapsible]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return posts.filter((p) => {
      const searchableString = [
        p.title,
        p.description,
        p.slug,
        ...(p.tags || []),
        ...(p.categories || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableString.includes(q);
    });
  }, [query, posts]);

  return (
    <div
      ref={rootRef}
      className={cn(
        collapsible
          ? 'max-sm:contents sm:relative sm:flex sm:items-center'
          : 'xs:w-[50vw] relative sm:w-full',
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
            'shrink-0 transition-colors duration-200 hover:text-pink-500',
            isExpanded && 'sm:hidden'
          )}
        >
          <Search size={18} aria-hidden="true" />
        </button>
      )}
      <div
        className={cn(
          'transition-[width,max-height,opacity] duration-300 ease-in-out',
          collapsible
            ? cn(
                'max-sm:order-last max-sm:w-full',
                isExpanded
                  ? 'relative opacity-100 max-sm:max-h-12 sm:w-52'
                  : 'opacity-0 max-sm:max-h-0 max-sm:overflow-hidden sm:w-0 sm:overflow-hidden'
              )
            : 'relative w-full'
        )}
      >
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
            className="min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:opacity-80 [&::-webkit-search-cancel-button]:brightness-0 dark:[&::-webkit-search-cancel-button]:invert"
          />
        </div>
        {isOpen && query.trim() !== '' && (
          <ul className="bg-surface-secondary scrollbar-none absolute top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-md p-1 text-[13px] shadow-xl">
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
    </div>
  );
};

export default SearchBar;
