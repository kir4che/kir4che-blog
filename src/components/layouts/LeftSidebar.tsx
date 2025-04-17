'use client';

import React from 'react';
import type { JSX } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Github, Instagram, Youtube } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/style';

import ThemeToggle from '@/components/common/ThemeToggle';
import LangMenu from '@/components/common/LangMenu';
import ExternalLink from '@/components/ui/ExternalLink';

interface SocialLink {
  label: string;
  href: string;
  icon: () => JSX.Element;
}

const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/kir4che',
    icon: () => (
      <Github className='h-4.5 w-4.5 text-pink-600 dark:text-pink-400' />
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/kir4che',
    icon: () => (
      <Instagram className='h-4.5 w-4.5 text-pink-600 dark:text-pink-400' />
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@kir4che',
    icon: () => (
      <Youtube className='h-4.5 w-4.5 text-pink-600 dark:text-pink-400' />
    ),
  },
];

const SocialLinks: React.FC<{ className?: string }> = ({ className }) => (
  <ul className={cn('flex items-center space-x-2.5', className)}>
    {socialLinks.map(({ label, href, icon }) => (
      <li key={label}>
        <ExternalLink href={href} title={label}>
          {icon()}
          <span className='sr-only'>{label}</span>
        </ExternalLink>
      </li>
    ))}
  </ul>
);

const LeftSidebar: React.FC = () => {
  const t = useTranslations('profile');

  return (
    <aside className='flex flex-col justify-between pt-4 pb-0 md:sticky md:top-0 md:h-screen md:w-48 md:py-8'>
      <div className='flex items-center gap-x-3 gap-y-2 md:mb-2.5 md:flex-col md:items-start'>
        <div className='relative block h-16 w-16 md:h-26 md:w-26'>
          <Link href='/'>
            <Image
              src='/images/avatar.webp'
              alt='Avatar'
              width={100}
              height={100}
              className='relative block h-16 min-h-16 w-16 min-w-16 rounded-full shadow md:h-26 md:w-26'
              sizes="(max-width: 600px) 100px, (max-width: 1000px) 200px, 300px"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </Link>
          <span className='bg-bg-secondary absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full text-sm shadow md:h-8 md:w-8 md:text-xl'>
            🦫
          </span>
        </div>
        <div className='w-full space-y-1'>
          <div className='flex items-center justify-between'>
            <h1 className='text-lg/6'>{t('name')}</h1>
            <SocialLinks className='md:hidden' />
          </div>
          <p className='text-text-gray dark:text-text-gray-light text-sm'>
            {t('subtitle')}
          </p>
        </div>
      </div>
      <SocialLinks className='hidden md:flex' />
      <div className='mt-auto hidden space-y-4 text-sm md:block'>
        <ThemeToggle />
        <LangMenu className='dropdown-top dropdown-start' />
      </div>
    </aside>
  );
};

export default LeftSidebar;
