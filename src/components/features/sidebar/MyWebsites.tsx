'use client';

import { useTranslations } from 'next-intl';
import { Link as LinkIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

interface WebsiteInfo {
  name: string;
  url: string;
}

const MyWebsites: React.FC = () => {
  const t = useTranslations('sidebar');
  const tw = useTranslations('websites');

  const websites: WebsiteInfo[] = [
    {
      name: tw('kaomojiLab'),
      url: 'https://kaomojilab.com/',
    },
    {
      name: tw('picQuads'),
      url: 'https://picquads.vercel.app/',
    },
  ];

  return (
    <section className=''>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <LinkIcon
          className='size-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('recommendedWebsites')}
      </h3>
      <ul className='list-disc space-y-1 pl-4'>
        {websites.map((website) => (
          <li key={website.name}>
            <Link
              href={website.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm hover:text-pink-700 hover:underline hover:underline-offset-2'
            >
              {website.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MyWebsites;
