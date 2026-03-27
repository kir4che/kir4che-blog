const colorConfig = {
  red: 'bg-red-100/60 text-red-700 dark:bg-red-100 dark:text-red-800',
  yellow: 'bg-yellow-100/60 text-yellow-700 dark:bg-yellow-100 dark:text-yellow-800',
  orange: 'bg-orange-100/60 text-orange-700 dark:bg-orange-100 dark:text-orange-800',
  green: 'bg-green-100/60 text-green-700 dark:bg-green-100 dark:text-green-800',
  blue: 'bg-blue-100/60 text-blue-700 dark:bg-blue-100 dark:text-blue-800',
  purple: 'bg-purple-100/60 text-purple-700 dark:bg-purple-100 dark:text-purple-800',
  pink: 'bg-pink-100/60 text-pink-700 dark:bg-pink-100 dark:text-pink-800',
} as const;

type BadgeColor = keyof typeof colorConfig;

interface BadgeProps {
  text: string;
  color?: BadgeColor;
}

export const Badge = ({ text, color = 'blue' }: BadgeProps) => (
  <span className={`badge rounded-full px-3 text-xs font-medium ${colorConfig[color]}`}>
    {text}
  </span>
);
