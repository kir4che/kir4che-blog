'use client';

import { useEffect } from 'react';

const Advertisement: React.FC = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error:', err);
    }
  }, []);

  return (
    <div className='bg-bg-secondary relative min-h-64 overflow-hidden rounded-lg p-4'>
      <div className='flex-center pointer-events-none absolute inset-0 px-4 text-center'>
        <p className='text-xs/5 text-gray-400 dark:text-gray-500'>
          如果文章對你有幫助，可以<strong>關閉 Adblock</strong>{' '}
          支持我，幫助部落格持續運營，我也會更努力更新的 ꒰˶•̤̀༥•̤́˵꒱
        </p>
      </div>
      <div className='relative z-10 min-h-64 w-full'>
        <ins
          className='adsbygoogle block'
          data-ad-client='ca-pub-9209549258046593'
          data-ad-slot='9209549258046593'
          data-ad-format='auto'
          data-full-width-responsive='true'
        />
      </div>
    </div>
  );
};

export default Advertisement;
