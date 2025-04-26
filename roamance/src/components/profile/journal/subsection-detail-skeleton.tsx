import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Calendar, Clock, ImageIcon, ListChecks, MapPin, Route, StickyNote } from 'lucide-react';

interface SubsectionDetailSkeletonProps {
  className?: string;
}

export const SubsectionDetailSkeleton: React.FC<SubsectionDetailSkeletonProps> = ({ className }) => {
  // Create a shimmer effect animation for reuse
  const ShimmerEffect = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 dark:via-slate-700/30 to-transparent"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );

  return (
    <div className={cn(
      "relative w-full animate-in fade-in-50 duration-300 space-y-6",
      className
    )}>
      {/* Subsection cards with accordion-like layout */}
      <div className="space-y-4">
        {/* First subsection card (expanded) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400 opacity-70" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2 mt-1.5">
                  <Skeleton className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3 opacity-50" />
                    <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Expanded content */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-5 space-y-6">
            {/* Title section */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <StickyNote className="w-3.5 h-3.5" />
                  <Skeleton className="h-3.5 w-10 bg-slate-200 dark:bg-slate-800" />
                </div>
                <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Notes section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <StickyNote className="h-3.5 w-3.5" />
                  <Skeleton className="h-3.5 w-12 bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200/70 dark:border-slate-700/50 relative overflow-hidden">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800" />
                </div>
                <ShimmerEffect delay={0.2} />
              </div>
            </div>

            {/* Location map */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <MapPin className="h-3.5 w-3.5" />
                <Skeleton className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden relative">
                <div className="h-[200px] bg-slate-200 dark:bg-slate-800 relative">
                  <ShimmerEffect delay={0.5} />

                  {/* Map overlay elements */}
                  <div className="absolute inset-0">
                    {/* Map grid lines */}
                    <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`v-${i}`} className="absolute left-0 right-0 h-px bg-slate-300/20 dark:bg-slate-700/20" style={{ top: `${i * 25}%` }} />
                      ))}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={`h-${i}`} className="absolute top-0 bottom-0 w-px bg-slate-300/20 dark:bg-slate-700/20" style={{ left: `${i * 25}%` }} />
                      ))}
                    </div>

                    {/* Map marker */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <div className="h-6 w-6 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                      </div>
                      <div className="h-3 w-3 bg-indigo-500/40 dark:bg-indigo-400/40 rotate-45 transform -translate-x-1.5 -translate-y-1.5 absolute left-1/2 bottom-0" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-2 p-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="space-x-3">
                    <Skeleton className="h-3 w-28 inline-block bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-28 inline-block bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <ListChecks className="h-3.5 w-3.5" />
                  <Skeleton className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-5 w-12 ml-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/70 dark:border-slate-700/50 relative overflow-hidden">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="mt-0.5 flex-shrink-0 h-4.5 w-4.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                    <Skeleton className="h-4 flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
                <ShimmerEffect delay={0.3} />
              </div>
            </div>

            {/* Metadata footer */}
            <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <Skeleton className="h-3 w-28 bg-slate-200 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Second subsection card (collapsed) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-rose-500 dark:text-rose-400 opacity-70" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2 mt-1.5">
                  <Skeleton className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3 opacity-50" />
                    <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Third subsection card (collapsed) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Route className="h-5 w-5 text-emerald-500 dark:text-emerald-400 opacity-70" />
              </div>
              <div>
                <Skeleton className="h-5 w-36 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2 mt-1.5">
                  <Skeleton className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3 opacity-50" />
                    <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Add section button skeleton */}
      <div className="pt-2 flex justify-center">
        <Skeleton className="h-10 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};
