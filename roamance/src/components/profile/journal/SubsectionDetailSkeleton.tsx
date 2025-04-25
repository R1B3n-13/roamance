import React from 'react';

export const SubsectionDetailSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm overflow-hidden">
      {/* Header skeleton */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse"></div>
          <div>
            <div className="h-5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-32 animate-pulse"></div>
            <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded-md w-20 mt-1.5 animate-pulse"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-slate-200/60 dark:bg-slate-700/60 rounded-full animate-pulse"></div>
      </div>

      <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-4 py-5 space-y-4">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-11/12 animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-4/5 animate-pulse"></div>
        </div>

        <div className="h-24 w-full rounded-lg bg-slate-100/80 dark:bg-slate-800/60 animate-pulse"></div>

        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-24 animate-pulse"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-28 animate-pulse"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end space-x-2 pt-2">
          <div className="h-8 w-20 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
          <div className="h-8 w-20 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
