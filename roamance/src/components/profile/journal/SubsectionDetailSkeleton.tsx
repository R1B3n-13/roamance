import { getImagePath } from '@/components';
import { Skeleton } from '@/components/ui/skeleton';

export const SubsectionDetailSkeleton = () => {
  return (
    <div className="rounded-xl border border-violet-light/30 dark:border-violet-dark/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md group">
      {/* Header skeleton */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <Skeleton className="h-11 w-11 rounded-full bg-violet-light/30 dark:bg-violet-dark/40" />
            <Skeleton className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-lavender-light/40 dark:bg-lavender-dark/40 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <Skeleton className="h-5 w-36 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md" />
            <Skeleton className="h-4 w-24 mt-2 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-9 rounded-full bg-violet-light/30 dark:bg-violet-dark/40" />
      </div>

      <div className="border-t border-violet-light/20 dark:border-violet-dark/30 px-5 py-6 space-y-5">
        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4.5 w-full bg-violet-light/40 dark:bg-violet-dark/50 rounded-md" />
          <Skeleton className="h-4.5 w-11/12 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md" />
          <Skeleton className="h-4.5 w-4/5 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md" />
        </div>

        {/* Main content area skeleton */}
        <div className="relative overflow-hidden">
          <Skeleton className="h-32 w-full rounded-lg bg-gradient-to-r from-violet-light/30 to-lavender-light/20 dark:from-violet-dark/40 dark:to-lavender-dark/30" />
          <div
            className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-5"
            style={{
              backgroundImage: `url('${getImagePath('roamance-logo-no-text.png')}')`,
            }}
          ></div>
        </div>

        {/* Checklist items skeleton */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center">
            <Skeleton className="h-4.5 w-4.5 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md mr-3" />
            <Skeleton className="h-4 w-28 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4.5 w-4.5 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md mr-3" />
            <Skeleton className="h-4 w-32 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4.5 w-4.5 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md mr-3" />
            <Skeleton className="h-4 w-24 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
        </div>

        {/* Meta data skeleton */}
        <div className="flex items-center space-x-4 pt-1">
          <div className="flex items-center space-x-1.5">
            <Skeleton className="h-4 w-4 bg-violet-light/40 dark:bg-violet-dark/50 rounded-full" />
            <Skeleton className="h-3.5 w-16 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
          <div className="flex items-center space-x-1.5">
            <Skeleton className="h-4 w-4 bg-violet-light/40 dark:bg-violet-dark/50 rounded-full" />
            <Skeleton className="h-3.5 w-20 bg-violet-light/30 dark:bg-violet-dark/40 rounded-md" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end space-x-3 pt-3 mt-2 border-t border-violet-light/20 dark:border-violet-dark/30">
          <Skeleton className="h-9 w-24 bg-violet-light/40 dark:bg-violet-dark/50 rounded-md" />
          <Skeleton className="h-9 w-28 bg-gradient-to-r from-violet-light/50 to-lavender-light/40 dark:from-violet-dark/60 dark:to-lavender-dark/50 rounded-md" />
        </div>
      </div>
    </div>
  );
};
