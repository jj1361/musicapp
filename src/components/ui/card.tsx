import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
        padding ? 'p-4' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
