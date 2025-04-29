'use client';

import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { debounce } from '@/utils/debounce';

import type { Language, PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useAlert } from '@/contexts/AlertContext';

type Post = Pick<PostMeta, 'slug' | 'title'>;

const SearchBar: React.FC = () => {
  const lang = useLocale() as Language;
  const t = useTranslations('common.search');
  const { showError } = useAlert();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  // 延遲搜尋
  const debouncedSearch = useMemo(() => {
    const fn = debounce((query: string) => {
      fetch(`/api/posts?keyword=${encodeURIComponent(query)}&lang=${lang}`)
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed.');
          return res.json();
        })
        .then((data) => setSearchResults(data.posts || []))
        .catch((err) => showError(err instanceof Error ? err.message : err));
    }, 300);

    return fn;
  }, [lang, showError]);

  // 確保取消 debounce（和你原本做的一樣）
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  return (
    <div className='relative'>
      <Search
        className='absolute top-2.5 left-2.5 h-4 w-4'
        aria-hidden='true'
      />
      <input
        value={searchQuery}
        placeholder={t('placeholder')}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
        className='bg-bg-secondary border-text-gray transition-color h-9 w-full rounded-md border px-3 py-1 pl-8 text-sm duration-300 focus:outline-none'
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className='absolute top-2.5 right-2.5'
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      )}
      {searchQuery && (
        <ul className='bg-bg-secondary absolute top-9 z-10 max-h-60 w-full overflow-auto rounded-md text-sm shadow-md'>
          {searchResults.length > 0 ? (
            searchResults.map(({ slug, title }) => (
              <li key={slug} className='p-2'>
                <Link
                  href={`/posts/${slug}`}
                  className='line-clamp-1 block rounded-md px-2 py-1 transition-colors hover:bg-pink-50 hover:text-pink-800 dark:hover:bg-pink-600/15 dark:hover:text-white'
                  onClick={() => setSearchQuery('')}
                >
                  {title}
                </Link>
              </li>
            ))
          ) : (
            <li className='p-2'>{t('noResults')}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
