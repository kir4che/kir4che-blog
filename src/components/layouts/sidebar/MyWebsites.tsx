'use client';

import { useTranslations } from 'next-intl';
import { Link as LinkIcon } from 'lucide-react';

import ExternalLink from '@/components/ui/ExternalLink';

interface WebsiteInfo {
  name: string;
  url: string;
}

const MyWebsites: React.FC = () => {
  const t = useTranslations('sidebar');
  const tw = useTranslations('websites');

  const websites: WebsiteInfo[] = [
    {
      name: tw('frontendLab'),
      url: 'https://frontend-lab.kir4che.com/',
    },
    {
      name: tw('kaomojiLab'),
      url: 'https://kaomojilab.com/',
    },
    {
      name: tw('picQuads'),
      url: 'https://picquads.zeabur.app/',
    },
    {
      name: tw('decisionwheel'),
      url: 'http://decisionwheel.kir4che.com/',
    },
    {
      name: tw('lumical'),
      url: 'https://lumical.kir4che.com/',
    },
  ];

  return (
    <section>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <LinkIcon
          className='size-4 text-pink-700 dark:text-pink-300'
          aria-hidden='true'
        />
        <span className='text-gradient'>{t('usefulSites')}</span>
      </h3>
      <ul className='list-disc space-y-1 pl-4'>
        {websites.map((website) => (
          <li key={website.name}>
            <ExternalLink
              href={website.url}
              title={website.name}
              className='text-text-primary dark:text-text-primary text-sm hover:text-pink-700 dark:hover:text-pink-600'
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MyWebsites;
