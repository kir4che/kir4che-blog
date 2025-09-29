import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export const usePagination = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) params.delete('page');
    else params.set('page', page.toString());

    const queryString = params.toString();
    router.push(pathname + (queryString ? `?${queryString}` : ''));
  };

  return { handlePageChange };
};
