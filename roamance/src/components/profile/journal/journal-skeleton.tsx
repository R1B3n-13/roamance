import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FC } from 'react';
import { JourneyPathAnimation } from './journey-path-animation';

interface JournalSkeletonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JournalSkeleton: FC<JournalSkeletonProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-muted/30 p-0">
        <DialogTitle className="sr-only">Loading Journal Details</DialogTitle>

        {/* Header with JourneyPathAnimation */}
        <div className="relative bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-violet-600/90 p-12 flex flex-col items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-x-full top-0 bottom-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"
              style={{ transform: 'translateX(-10%) skewX(-15deg)' }}
            />
          </div>

          <JourneyPathAnimation size="lg" className="mb-4" />

          <div className="text-center z-10">
            <div className="w-40 h-6 bg-white/20 rounded-full mb-3 mx-auto animate-pulse"></div>
            <div className="w-64 h-8 bg-white/20 rounded-lg mb-4 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Body content skeleton */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Description skeleton */}
          <div className="p-5 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30 space-y-2">
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded-full w-11/12 animate-pulse"></div>
            <div className="h-4 bg-slate-200/70 dark:bg-slate-700/50 rounded-full w-4/5 animate-pulse"></div>
          </div>

          {/* Metadata grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/20">
              <div className="w-10 h-10 rounded-full bg-indigo-100/70 dark:bg-indigo-800/30 mr-3 flex-shrink-0"></div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-indigo-200/70 dark:bg-indigo-700/40 rounded-full"></div>
                <div className="h-4 w-28 bg-indigo-200/50 dark:bg-indigo-700/30 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/20">
              <div className="w-10 h-10 rounded-full bg-purple-100/70 dark:bg-purple-800/30 mr-3 flex-shrink-0"></div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-purple-200/70 dark:bg-purple-700/40 rounded-full"></div>
                <div className="h-4 w-28 bg-purple-200/50 dark:bg-purple-700/30 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Sections header skeleton */}
          <div className="flex items-center mb-4">
            <div className="relative mr-3">
              <div className="absolute left-0 top-1/2 w-1 h-6 bg-purple-500/50 rounded-r-full transform -translate-y-1/2"></div>
              <div className="h-6 w-32 bg-slate-200/70 dark:bg-slate-700/50 rounded-full ml-3"></div>
            </div>
            <div className="w-12 h-5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/30"></div>
          </div>

          {/* Sections skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20 overflow-hidden"
              >
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-700/40 flex-shrink-0 mt-0.5"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-slate-200/70 dark:bg-slate-700/50 rounded-full"></div>
                      <div className="h-4 w-24 bg-slate-200/50 dark:bg-slate-700/30 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-700/30"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="p-4 px-6 md:px-8 border-t border-muted/30 bg-muted/5 backdrop-blur-sm flex justify-between items-center">
          <div className="w-28 h-9 rounded-md bg-slate-200/50 dark:bg-slate-700/30 animate-pulse"></div>
          <div className="w-32 h-9 rounded-md bg-indigo-200/50 dark:bg-indigo-700/30 animate-pulse"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
