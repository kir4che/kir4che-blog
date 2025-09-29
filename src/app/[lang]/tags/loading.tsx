import Skeleton from '@/components/ui/Skeleton';

const TagsLoading = () => (
  <div className='space-y-6'>
    <div className='mb-4'>
      <Skeleton className='h-8 w-32' />
    </div>
    <div className='flex flex-wrap items-center gap-x-4 gap-y-5'>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-40 rounded-full' />
      ))}
    </div>
  </div>
);

export default TagsLoading;
