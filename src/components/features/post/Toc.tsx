import { useState } from 'react';
import { AlignJustify, X } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/style';

interface TOCProps {
  headings: { id: string; text: string; level: number }[];
}

const TOC: React.FC<TOCProps> = ({ headings }) => {
  const [showTOC, setShowTOC] = useState(false);

  return (
    <>
      {/* 手機版 TOC Toggle Btn */}
      <button
        onClick={() => setShowTOC(!showTOC)}
        className='chat chat-end fixed right-4 bottom-4 z-50 block lg:hidden'
        aria-label='Toggle Table of Contents'
        aria-expanded={showTOC}
      >
        <div className='chat-bubble flex h-14 w-16 items-center justify-center rounded-full bg-pink-600 text-white'>
          {showTOC ? (
            <X className='h-8 w-8' />
          ) : (
            <AlignJustify className='h-8 w-8' />
          )}
        </div>
      </button>
      {/* 手機版 TOC */}
      {showTOC && (
        <div className='fixed right-4 bottom-24 z-50 block lg:hidden'>
          <TOCContent
            headings={headings}
            onLinkClick={() => setShowTOC(false)}
          />
        </div>
      )}
      {/* 電腦版 TOC */}
      <div className='fixed right-4 bottom-6 z-50 hidden lg:block'>
        <TOCContent headings={headings} />
      </div>
    </>
  );
};

const TOCContent = ({
  headings,
  onLinkClick,
}: TOCProps & { onLinkClick?: () => void }) => (
  <div
    className='dark:bg-text-secondary max-w-68 min-w-60 rounded-xl border bg-white p-5 shadow-md transition-all duration-300 xl:max-w-72 2xl:max-w-88 dark:border-white'
    role='navigation'
    aria-label='Table of contents'
  >
    <ul className='max-h-88 space-y-2.5 overflow-y-auto pr-4 2xl:pr-8'>
      {headings.map((h) => (
        <li
          key={h.id}
          className={cn('text-base', {
            'font-semibold': h.level === 2,
            'text-sm font-medium': h.level === 3,
            'text-sm font-normal': h.level >= 4,
          })}
          style={{ marginLeft: `${(h.level - 2) * 12}px` }}
        >
          <Link
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById(h.id);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                onLinkClick?.();
              }
            }}
            className='hover:text-pink-700 hover:dark:text-pink-300'
          >
            {h.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default TOC;
