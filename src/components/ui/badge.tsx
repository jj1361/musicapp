interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const variants = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light',
  secondary: 'bg-secondary/10 text-secondary-dark dark:bg-secondary/20 dark:text-secondary-light',
  accent: 'bg-accent/10 text-accent-dark dark:bg-accent/20 dark:text-accent-light',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
  onClick,
  removable,
  onRemove,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:text-danger"
        >
          &times;
        </button>
      )}
    </span>
  );
}
