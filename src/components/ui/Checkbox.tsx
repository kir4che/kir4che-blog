interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  className = '',
}) => (
  <input
    type='checkbox'
    id={id}
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className={`mb-0.5 h-3.5 w-3.5 ${className}`}
  />
);

export default Checkbox;
