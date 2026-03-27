import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/utils/cn';

interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TocProps {
  headings: TOCHeading[];
  title: string;
  expandLabel: string;
  collapseLabel: string;
}

const HEADER_OFFSET = 96;

const Toc = ({ headings, title, expandLabel, collapseLabel }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);

  // 監聽 scroll 位置，自動高亮當前所在的目錄標題。
  useEffect(() => {
    if (headingIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: `-${HEADER_OFFSET}px 0% -80% 0%` }
    );
    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headingIds]);

  // 點擊外部時關閉目錄列表
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-toc-root]')) setIsOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const targetY = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setIsOpen(false);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div data-toc-root>
      <div
        className={cn(
          'bg-surface-secondary fixed top-32 right-0 z-60 flex max-h-[70vh] w-72 transform flex-col rounded-bl-md shadow-md transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          type="button"
          className="group absolute top-0 -left-8 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((o) => !o);
          }}
          aria-label={isOpen ? collapseLabel : expandLabel}
          aria-expanded={isOpen}
        >
          <div
            className={cn(
              'flex-center bg-surface-secondary w-8 rounded-l-xl py-3 text-pink-600 shadow-[-10px_0_16px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 dark:text-pink-400',
              isOpen ? 'h-24' : 'h-32'
            )}
          >
            {isOpen ? (
              <ChevronRight size={24} />
            ) : (
              <span className="text-sm font-bold tracking-widest [writing-mode:vertical-rl]">
                {title}
              </span>
            )}
          </div>
        </button>
        <div className="shrink-0 px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-pink-700 dark:text-pink-300">{title}</h2>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col" role="navigation">
          <ul className="scrollable w-full">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li
                  key={h.id}
                  className={cn(
                    'mb-3 text-gray-700 dark:text-gray-300',
                    h.level === 2 && 'font-semibold',
                    h.level === 3 && 'text-[13px]/5 font-medium',
                    h.level >= 4 && 'text-xs'
                  )}
                  style={{ paddingLeft: `${Math.max(0, (h.level - 2) * 16)}px` }}
                >
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      scrollToHeading(h.id);
                    }}
                    className={cn(
                      'block break-all transition-colors hover:text-pink-600 hover:dark:text-pink-400',
                      isActive && 'font-semibold text-pink-600 dark:text-pink-400'
                    )}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Toc;
