import React from 'react';

export const SubsectionDetailSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md group">
      {/* Header skeleton */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="h-11 w-11 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border-2 border-white dark:border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <div className="h-5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-36 animate-pulse"></div>
            <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded-md w-24 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="h-9 w-9 bg-slate-200/60 dark:bg-slate-700/60 rounded-full animate-pulse"></div>
      </div>

      <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-5 py-6 space-y-5">
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-full animate-pulse"></div>
          <div className="h-4.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-11/12 animate-pulse"></div>
          <div className="h-4.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-4/5 animate-pulse"></div>
        </div>

        {/* Main content area skeleton */}
        <div className="relative overflow-hidden">
          <div className="h-32 w-full rounded-lg bg-gradient-to-r from-slate-100/90 to-slate-100/70 dark:from-slate-800/90 dark:to-slate-800/70 animate-pulse"></div>
          <div className="absolute inset-0 bg-[url('/images/roamance-logo-no-text.png')] bg-no-repeat bg-center bg-contain opacity-5"></div>
        </div>

        {/* Checklist items skeleton */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center">
            <div className="h-4.5 w-4.5 bg-slate-200/90 dark:bg-slate-700/90 rounded-md animate-pulse mr-3"></div>
            <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-28 animate-pulse"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4.5 w-4.5 bg-slate-200/90 dark:bg-slate-700/90 rounded-md animate-pulse mr-3"></div>
            <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4.5 w-4.5 bg-slate-200/90 dark:bg-slate-700/90 rounded-md animate-pulse mr-3"></div>
            <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Meta data skeleton */}
        <div className="flex items-center space-x-4 pt-1">
          <div className="flex items-center space-x-1.5">
            <div className="h-4 w-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse"></div>
            <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-md w-16 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-4 w-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-full animate-pulse"></div>
            <div className="h-3.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-md w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end space-x-3 pt-3 mt-2 border-t border-slate-200/40 dark:border-slate-700/40">
          <div className="h-9 w-24 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
          <div className="h-9 w-28 bg-gradient-to-r from-slate-200/90 to-slate-200/70 dark:from-slate-700/90 dark:to-slate-700/70 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
