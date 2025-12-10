import Skeleton from '@/components/ui/Skeleton';

const TagLoading = () => (
  <div className='space-y-6'>
    <div className='mb-4 flex items-baseline justify-between'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-6 w-20' />
    </div>
    <div className='space-y-4'>
      <section className='card space-y-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='bg-bg-secondary relative flex h-full flex-col gap-2 rounded-lg p-4 shadow-[2px_2px_3px_rgba(0,0,0,0.05)]'
          >
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-10 w-full' />
            <div className='mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        ))}
      </section>
      <div className='flex-center'>
        <Skeleton className='h-10 w-64' />
      </div>
    </div>
  </div>
);

export default TagLoading;
