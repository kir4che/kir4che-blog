import Image from 'next/image';

import { cn } from '@/lib/style';

interface DecorativeImageProps {
  src: string;
  desktopOnly?: boolean;
  className?: string;
}

const DecorativeImage: React.FC<DecorativeImageProps> = ({
  src,
  desktopOnly = true,
  className,
}) => (
  <Image
    src={src}
    alt='Decorative image'
    layout='responsive'
    width={200}
    height={200}
    className={cn('-z-10', desktopOnly && 'hidden xl:block', className)}
    loading='lazy'
  />
);

export default DecorativeImage;
