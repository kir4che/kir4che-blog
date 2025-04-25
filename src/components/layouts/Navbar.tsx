'use client';

import { useTranslations } from 'next-intl';

import NavigationLink from '@/components/ui/NavigationLink';

const Navbar: React.FC = () => {
  const t = useTranslations('nav');

  const navItems = [
    { href: '/about', label: t('about') },
    { href: '/posts', label: t('archives') },
    { href: '/notes', label: t('notes') },
  ] as const;

  return (
    <nav className='flex items-center gap-x-4'>
      <NavigationLink href='/'>{t('home')}</NavigationLink>
      {navItems.map(({ href, label }) => (
        <NavigationLink key={href} href={href}>
          {label}
        </NavigationLink>
      ))}
    </nav>
  );
};

export default Navbar;
