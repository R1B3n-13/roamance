import React from 'react';

export const SubsectionDetailSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="p-4 flex items-start justify-between relative">
        {/* Left content */}
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 animate-pulse flex-shrink-0"></div>
          <div className="space-y-2 flex-1 min-w-0 pt-0.5">
            <div className="h-5 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-20 bg-indigo-100/80 dark:bg-indigo-900/60 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-100/80 dark:bg-slate-800/80 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="w-6 h-6 rounded-full bg-slate-100/80 dark:bg-slate-800/80 animate-pulse"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -inset-x-full top-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"
            style={{ transform: 'translateX(-10%) skewX(-20deg)' }}
          ></div>
        </div>
      </div>

      {/* Expanded content placeholder */}
      <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-4 py-5 space-y-4">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-11/12 animate-pulse"></div>
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/80 rounded-md w-4/5 animate-pulse"></div>
        </div>

        <div className="h-24 w-full rounded-lg bg-slate-100/80 dark:bg-slate-800/60 animate-pulse"></div>

        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 mr-2"></div>
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-slate-700/80 rounded-md"></div>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 mr-2"></div>
            <div className="h-4 w-24 bg-slate-200/80 dark:bg-slate-700/80 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
