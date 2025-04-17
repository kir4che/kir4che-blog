'use client';

import React, { useCallback } from 'react';
import type { JSX } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Github, Rss, Linkedin } from 'lucide-react';

import { SITE_NAME } from '@/config/constants';
import { Link } from '@/i18n/navigation';

import ExternalLink from '@/components/ui/ExternalLink';
import LangMenu from '@/components/common/LangMenu';

interface SocialLink {
  label: string;
  href: string;
  icon: () => JSX.Element;
}

const socialLinks: SocialLink[] = [
  {
    label: 'github',
    href: 'https://github.com/kir4che/',
    icon: () => (
      <Github className='h-5 w-5 text-pink-600 transition-transform duration-200 hover:-translate-y-1 lg:h-6 lg:w-6 dark:text-pink-400' />
    ),
  },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/mollysu/',
    icon: () => (
      <Linkedin className='h-5 w-5 text-pink-600 transition-transform duration-200 hover:-translate-y-1 lg:h-6 lg:w-6 dark:text-pink-400' />
    ),
  },
  {
    label: 'blog',
    href: 'https://kir4che.com/',
    icon: () => (
      <Rss className='h-5 w-5 text-pink-600 transition-transform duration-200 hover:-translate-y-1 lg:h-6 lg:w-6 dark:text-pink-400' />
    ),
  },
];

const Header: React.FC = () => {
  const t = useTranslations('PortfolioPage.nav');

  const navItems = [
    { id: 'about', label: t('about') },
    { id: 'experience', label: t('experience') },
    { id: 'skill', label: t('skill') },
    { id: 'projects', label: t('projects') },
    { id: 'contact', label: t('contact') },
  ] as const;

  const handleScrollTo = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <header className='sticky top-0 z-20 bg-white px-4 py-2.5 shadow shadow-pink-100 lg:px-6'>
      <div className='flex w-full items-center gap-x-3 lg:justify-between lg:gap-x-0'>
        <div className='flex items-center justify-start lg:w-1/3'>
          <Link href='/portfolio' className='flex items-center'>
            <Image
              src='/images/portfolio/logo.webp'
              alt={`${SITE_NAME} logo`}
              width={32}
              height={32}
              className='h-8 w-auto'
              priority
            />
            <span className='hidden text-xl font-semibold text-nowrap lg:flex'>
              {SITE_NAME}
            </span>
          </Link>
        </div>
        <nav className='hidden justify-center sm:flex lg:w-1/3'>
          <ul className='flex items-center justify-center gap-x-4 lg:gap-x-8'>
            {navItems.map((item) => (
              <li
                key={item.id}
                className='cursor-pointer text-sm font-medium text-nowrap hover:text-pink-600 lg:text-base'
                onClick={() => handleScrollTo(item.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleScrollTo(item.id)}
                role='button'
                tabIndex={0}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className='ml-auto flex items-center justify-end space-x-2 lg:w-1/3 lg:space-x-3'>
          <div className='flex items-center justify-center space-x-3 lg:space-x-4'>
            {socialLinks.map(({ label, href, icon }) => (
              <ExternalLink href={href} key={label}>
                {icon()}
                <span className='sr-only'>{label}</span>
              </ExternalLink>
            ))}
          </div>
          <LangMenu showIcon={false} />
        </div>
      </div>
    </header>
  );
};

export default Header;
