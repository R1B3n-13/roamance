import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const JournalCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md py-0">
      {/* Header Skeleton */}
      <div className="h-48 relative bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 animate-pulse">
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>

        {/* Time indicator skeleton */}
        <div className="mt-4">
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Action buttons skeleton */}
        <div className="mt-4 pt-4 border-t border-muted/20 flex justify-between">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
};
