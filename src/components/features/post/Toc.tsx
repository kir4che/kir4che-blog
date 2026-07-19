import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // 找出當前 scroll 位置對應的 heading
  const getActiveId = (ids: string[]) => {
    const scrollY = window.scrollY + HEADER_OFFSET + 1;
    let currentId = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) currentId = id;
    }
    return currentId;
  };

  // 監聽 scroll 位置，自動高亮當前所在的目錄標題。
  useEffect(() => {
    const ids = headings.map((h) => h.id);
    if (ids.length === 0) return;

    const updateActive = () => {
      if (!isOpenRef.current) return;
      setActiveId(getActiveId(ids));
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    return () => window.removeEventListener('scroll', updateActive);
  }, [headings]);

  // 打開 TOC 時重新計算當前 heading
  useEffect(() => {
    if (!isOpen) return;
    const ids = headings.map((h) => h.id);
    if (ids.length === 0) return;
    setActiveId(getActiveId(ids));
  }, [isOpen, headings]);

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

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsOpen(false);
  };

  if (headings.length === 0) return null;

  return (
    <div data-toc-root>
      <div
        className={cn(
          'fixed top-32 right-0 z-999 flex max-h-[70vh] w-72 transform flex-col rounded-bl-lg bg-white shadow-lg ring-1 ring-gray-200/50 transition-transform duration-300 dark:bg-gray-800 dark:ring-white/5',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          type="button"
          className="group absolute top-0 -left-8 z-10"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? collapseLabel : expandLabel}
          aria-expanded={isOpen}
        >
          <div
            className={cn(
              'flex-center pointer-events-none w-8 rounded-l-xl bg-white py-3 text-pink-600 shadow-sm ring-1 ring-gray-200/50 transition-all duration-300 dark:bg-gray-800 dark:text-pink-400 dark:ring-white/5',
              isOpen ? 'h-24' : 'h-32'
            )}
          >
            {isOpen ? (
              <ChevronRight size={20} />
            ) : (
              <span className="text-xs font-bold tracking-[0.2em] [writing-mode:vertical-rl]">
                {title}
              </span>
            )}
          </div>
        </button>
        <div className="shrink-0 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-pink-700 dark:text-pink-300">{title}</h2>
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
                      scrollToHeading(h.id);
                    }}
                    className={cn(
                      'block border-l-2 border-transparent pl-3 break-all transition-all duration-150 hover:border-pink-300 hover:text-pink-600 dark:hover:border-pink-500/60 dark:hover:text-pink-400',
                      isActive &&
                        'border-pink-500 font-semibold text-pink-600 dark:border-pink-400 dark:text-pink-400'
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
