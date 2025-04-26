import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const PostLoading = () => (
  <div className='p-6'>
    <Skeleton variant='title' className='mb-4' />
    <Skeleton variant='text' count={3} className='mb-2' />
    <Skeleton variant='image' className='mb-4' />
    <Skeleton variant='post' count={2} />
  </div>
);

export default PostLoading;
