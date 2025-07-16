interface LoadingSpinProps {
  text?: string;
  className?: string;
}

const LoadingSpin: React.FC<LoadingSpinProps> = ({ text, className }) => (
  <div className={`text-center ${className}`}>
    <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-pink-800 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]' />
    {text && <p className='text-muted-foreground mt-2 text-sm'>{text}</p>}
  </div>
);

export default LoadingSpin;
