'use client';

import { useTranslations } from 'next-intl';

import NavigationLink from '@/components/ui/NavigationLink';

const Navbar: React.FC = () => {
  const t = useTranslations('nav');

  const navItems = [
    { href: '/about', label: t('about') },
    { href: '/categories', label: t('categories') },
    { href: '/tags', label: t('tags') },
    { href: '/archives', label: t('archives') },
  ] as const;

  return (
    <nav className='ml-auto flex items-center gap-x-4'>
      <NavigationLink href='/'>{t('home')}</NavigationLink>
      {navItems
        .filter((item) => item.label)
        .map(({ href, label }) => (
          <NavigationLink key={href} href={href}>
            {label}
          </NavigationLink>
        ))}
    </nav>
  );
};

export default Navbar;
