'use client';

import { PostCardSkeleton } from '../ui/shared-components';

export const FeedSkeleton = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
};
