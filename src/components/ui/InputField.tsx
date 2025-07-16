type InputFieldChangeHandler =
  | ((value: string) => void)
  | ((e: React.ChangeEvent<HTMLInputElement>) => void);

interface InputFieldProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'file';
  id?: string;
  value?: string;
  accept?: string;
  onChange: InputFieldChangeHandler;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
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
      className={`text-text-primary bg-bg-secondary w-full rounded-md border-[0.75px] p-2.5 outline-pink-600 placeholder:text-sm dark:outline-pink-700/80 ${className} ${
        error
          ? 'border-red-500 dark:border-red-500'
          : 'border-text-gray-lighter dark:border-text-gray'
      }`}
      placeholder={placeholder}
    />
  );
};

export default InputField;
