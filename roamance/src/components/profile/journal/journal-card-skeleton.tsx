import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const JournalCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md py-0">
      {/* Header Skeleton */}
      <div className="h-48 relative bg-gradient-to-tr from-violet-light/20 to-lavender-light/20 dark:from-violet-dark/20 dark:to-lavender-dark/20 animate-pulse">
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-24 rounded-full bg-violet-light/40 dark:bg-violet-light/30" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-20 rounded-full bg-violet-light/40 dark:bg-violet-light/30" />
        </div>
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-5 w-32 rounded-full bg-violet-light/40 dark:bg-violet-light/30" />
        </div>
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-9 w-9 rounded-full bg-violet-light/50 dark:bg-violet-light/40" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-violet-light/40 dark:bg-violet-light/30" />
            <Skeleton className="h-4 w-32 bg-violet-light/30 dark:bg-violet-light/20" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full bg-violet-light/30 dark:bg-violet-light/20" />
          <Skeleton className="h-4 w-11/12 bg-violet-light/30 dark:bg-violet-light/20" />
        </div>

        {/* Time indicator skeleton */}
        <div className="mt-4">
          <Skeleton className="h-3 w-24 bg-violet-light/30 dark:bg-violet-light/20" />
        </div>

        {/* Action buttons skeleton */}
        <div className="mt-4 pt-4 border-t border-violet-light/10 dark:border-violet-light/5 flex justify-between">
          <Skeleton className="h-8 w-24 bg-violet-light/30 dark:bg-violet-light/20" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 bg-gradient-to-r from-violet-light/40 to-lavender-light/40 dark:from-violet-light/30 dark:to-lavender-light/30" />
            <Skeleton className="h-8 w-16 bg-violet-light/40 dark:bg-violet-light/30" />
          </div>
        </div>
      </div>
    </Card>
  );
};
