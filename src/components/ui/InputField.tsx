import { cn } from '@/lib/style';

type InputFieldChangeHandler =
  | ((value: string) => void)
  | ((e: React.ChangeEvent<HTMLInputElement>) => void);

interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  type?: 'text' | 'number' | 'email' | 'password' | 'file';
  onChange: InputFieldChangeHandler;
  error?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  id,
  value,
  accept,
  onChange,
  placeholder,
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'file')
      (onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(e);
    else (onChange as (value: string) => void)(e.target.value);
  };

  return (
    <input
      type={type}
      id={id}
      {...(type !== 'file' ? { value } : {})}
      {...(type === 'file' ? { accept } : {})}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'text-text-primary bg-bg-secondary w-full rounded-md border-[0.75px] p-2',
        'outline-none focus:outline-none',
        'focus:ring-2 focus:ring-pink-600 dark:focus:ring-pink-700/80',
        'placeholder:text-sm',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-text-gray-lighter dark:border-text-gray',
        className
      )}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default InputField;
