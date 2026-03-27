interface CardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
}

export const Card = ({ title, subtitle, description, children }: CardProps) => (
  <div className="card rounded-lg bg-gray-100 shadow dark:bg-gray-700/50">
    <div className="card-body">
      {title && <h3 className="card-title text-xs font-semibold opacity-75">{title}</h3>}
      {subtitle && <p className="text-base font-medium">{subtitle}</p>}
      {description && <p className="text-sm">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  </div>
);
