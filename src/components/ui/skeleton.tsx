interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'text') {
    return <div className={`${baseClasses} rounded h-4 ${className}`} />;
  }

  return <div className={`${baseClasses} rounded ${className}`} />;
}

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 mb-1" />
          <Skeleton variant="text" className="w-24" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-3/4" />
    </div>
  );
}

export function GigSkeleton() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <Skeleton variant="text" className="w-48 h-5 mb-2" />
      <Skeleton variant="text" className="w-32 mb-1" />
      <Skeleton variant="text" className="w-24 mb-3" />
      <div className="flex gap-2 mb-3">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton variant="text" className="w-20" />
    </div>
  );
}
