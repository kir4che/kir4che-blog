import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlignJustify, X } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/style';

interface TOCProps {
  headings: { id: string; text: string; level: number }[];
}

const TOC: React.FC<TOCProps> = ({ headings }) => {
  const [showTOC, setShowTOC] = useState(false);
  const t = useTranslations('PostPage');
  const tocTitle = t('tocTitle');
  const toggleLabel = t('tocToggleLabel');

  return (
    <>
      {/* 手機版 TOC Toggle Btn */}
      <button
        onClick={() => setShowTOC(!showTOC)}
        className='fixed right-3 bottom-3 z-50 block lg:hidden'
        aria-label={toggleLabel}
        aria-expanded={showTOC}
      >
        <div className='chat-bubble flex-center h-13.5 w-15 rounded-full bg-pink-500 text-white'>
          {showTOC ? <X size={25} /> : <AlignJustify size={25} />}
        </div>
      </button>
      {/* 手機版 TOC */}
      {showTOC && (
        <div className='fixed right-4 bottom-20 z-50 block lg:hidden'>
          <TOCContent
            headings={headings}
            title={tocTitle}
            ariaLabel={tocTitle}
            onLinkClick={() => setShowTOC(false)}
          />
        </div>
      )}
      {/* 電腦版 TOC */}
      <div className='fixed right-4 bottom-6 z-50 hidden lg:block'>
        <TOCContent headings={headings} title={tocTitle} ariaLabel={tocTitle} />
      </div>
    </>
  );
};

const TOCContent = ({
  headings,
  title,
  ariaLabel,
  onLinkClick,
}: TOCProps & {
  title: string;
  ariaLabel: string;
  onLinkClick?: () => void;
}) => (
  <div
    className='relative flex max-h-88 max-w-72 min-w-64 flex-col overflow-hidden rounded-xl bg-white/75 pt-4 pb-4 pl-4 shadow-md backdrop-blur-xl transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:to-white/10 dark:bg-neutral-900/30 dark:before:from-white/10 dark:before:to-white/5'
    role='navigation'
    aria-label={ariaLabel}
  >
    <div className='mb-2 text-lg font-bold'>{title}</div>
    <ul className='custom-scrollbar flex-1 space-y-3 overflow-y-scroll pr-2 2xl:pr-4'>
      {headings.map((h) => (
        <li
          key={h.id}
          className={cn('text-base/5', {
            'font-semibold': h.level === 2,
            'text-sm font-medium': h.level === 3,
            'text-sm': h.level >= 4,
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
            className='hover:text-pink-800 hover:dark:text-pink-400'
          >
            {h.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default TOC;
