import { Heart } from 'lucide-react';

interface AnnouncementProps {
  text: string;
}

const Announcement: React.FC<AnnouncementProps> = ({ text }) => (
  <div
    role='alert'
    className='alert gap-x-2 border border-pink-200 bg-gradient-to-r from-pink-50 to-rose-100 text-pink-800 shadow-none dark:border-pink-800 dark:from-pink-50/25 dark:to-rose-100/25 dark:text-pink-50'
    style={
      {
        '--alert-color': 'var(--color-pink-800)',
      } as React.CSSProperties
    }
  >
    <Heart
      fill='currentColor'
      className='h-5 w-5 text-pink-600 dark:text-pink-100'
    />
    <p className='text-sm leading-relaxed'>{text}</p>
  </div>
);

export default Announcement;
