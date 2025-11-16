'use client';

import { useTranslations } from 'next-intl';

import NavigationLink from '@/components/ui/NavigationLink';

const Navbar: React.FC = () => {
  const t = useTranslations('nav');

  const navItems = [
    { href: '/about', label: t('about') },
    { href: '/posts', label: t('archives') },
    { href: 'https://frontend-lab.kir4che.com', label: t('lab') },
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
