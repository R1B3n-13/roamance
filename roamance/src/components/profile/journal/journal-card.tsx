import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { JournalBrief } from '@/types/journal';
import { formatRelativeTime } from '@/utils';
import { motion } from 'framer-motion';
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Calendar,
  Clock,
  Lock,
  MapPin,
  Share2,
  Star,
} from 'lucide-react';
import React from 'react';
import { getJournalColorScheme } from './colorscheme';

interface JournalCardProps {
  journal: JournalBrief;
  onEdit: (journal: JournalBrief) => void;
  onDelete: (journal: JournalBrief) => void;
  onView: (journal: JournalBrief) => void;
  onToggleFavorite: (journal: JournalBrief) => void;
  onToggleArchive: (journal: JournalBrief) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  // onEdit,
  onView,
  onToggleFavorite,
  onToggleArchive,
}) => {
  // Get consistent color scheme based on journal title
  const colorScheme = getJournalColorScheme(journal.title);

  // Get gradient based on colorScheme
  const getGradient = () => {
    if (journal.is_favorite) return 'from-sunset/80 to-sunset-dark/80';

    switch (colorScheme.type) {
      case 'ocean':
        return 'from-ocean/80 to-ocean-dark/80';
      case 'sunset':
        return 'from-sunset/80 to-sand/80';
      case 'forest':
        return 'from-forest/80 to-forest-dark/80';
      case 'violet':
        return 'from-violet/80 to-violet-dark/80';
      case 'lavender':
        return 'from-lavender/80 to-lavender-dark/80';
      default:
        return 'from-ocean/80 to-ocean-dark/80';
    }
  };

  // Get badge style based on colorScheme
  const getBadgeStyle = () => {
    if (journal.is_favorite)
      return 'bg-sunset text-white border border-sunset/20 shadow-sm';

    switch (colorScheme.type) {
      case 'ocean':
        return 'bg-ocean text-white border border-ocean/20 shadow-sm';
      case 'sunset':
        return 'bg-sunset text-white border border-sunset/20 shadow-sm';
      case 'forest':
        return 'bg-forest text-white border border-forest/20 shadow-sm';
      case 'violet':
        return 'bg-violet text-white border border-violet/20 shadow-sm';
      case 'lavender':
        return 'bg-lavender text-white border border-lavender/20 shadow-sm';
      default:
        return 'bg-ocean text-white border border-ocean/20 shadow-sm';
    }
  };

  // Format created date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card className="overflow-hidden group border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-xl py-0">
        {/* Journal Header Image */}
        <div className="h-48 relative overflow-hidden">
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gradient-to-tr',
              getGradient()
            )}
          >
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 bg-[url('/images/roamance-logo-no-text.png')] bg-repeat-space bg-contain opacity-10 mix-blend-overlay" />

            <div className="relative z-10 text-center px-4">
              <p className="text-white text-xl font-bold drop-shadow-md">
                {journal.title}
              </p>
            </div>
          </div>

          {/* Badges section */}
          <div className="absolute top-3 left-3">
            <Badge
              className={cn(
                'capitalize rounded-full shadow-md px-2.5',
                getBadgeStyle()
              )}
            >
              {journal.total_subsections}{' '}
              {journal.total_subsections === 1 ? 'section' : 'sections'}
            </Badge>
          </div>

          {/* Shared badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={cn(
                'flex items-center gap-1 font-medium rounded-full shadow-md',
                journal.is_shared
                  ? 'bg-ocean text-white border border-ocean-light/30'
                  : 'bg-mountain text-white border border-mountain-light/30'
              )}
            >
              {journal.is_shared ? (
                <Share2 className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              {journal.is_shared ? 'Shared' : 'Private'}
            </Badge>
          </div>

          {/* Created date badge */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className="bg-black/50 text-white border-white/30 flex items-center gap-1.5 rounded-full backdrop-blur-sm shadow-sm"
            >
              <Calendar className="h-3 w-3" />
              <span className="text-xs font-medium">
                Created {formatDate(journal.audit.created_at)}
              </span>
            </Badge>
          </div>

          {/* Favorite/Bookmark button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(journal);
            }}
            className={cn(
              'absolute bottom-3 right-3 h-9 w-9 rounded-full backdrop-blur-md border transition-all duration-300 shadow-sm hover:shadow-md',
              journal.is_favorite
                ? 'bg-sunset/85 hover:bg-sunset text-white border-sunset-light/30'
                : 'bg-white/15 hover:bg-white/30 text-white border-white/20'
            )}
          >
            <Star
              className={cn('h-4 w-4', journal.is_favorite ? 'fill-white' : '')}
            />
          </Button>
        </div>

        {/* Journal Content */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={cn(
                  'font-semibold mb-1.5 transition-colors',
                  journal.is_favorite
                    ? 'group-hover:text-sunset'
                    : 'group-hover:text-ocean'
                )}
              >
                {journal.title}
              </h3>
              {journal.destination && (
                <div className="flex items-center text-muted-foreground text-sm gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {journal.destination
                      ? `${journal.destination.latitude.toFixed(2)}, ${journal.destination.longitude.toFixed(2)}`
                      : 'No location'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-muted-foreground text-sm mt-3 line-clamp-2 leading-relaxed">
            {journal.description}
          </p>

          {/* Time indicator */}
          <div className="flex items-center text-xs text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {formatRelativeTime(new Date(journal.audit.created_at))}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-4 border-t border-muted/20 flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onView(journal);
              }}
              className="text-xs text-muted-foreground hover:text-forest hover:bg-forest/5 transition-colors duration-300 flex items-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>View Details</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggleArchive(journal);
              }}
              className={cn(
                'text-xs text-muted-foreground transition-colors duration-300 flex items-center gap-1.5',
                journal.is_archived
                  ? 'hover:text-violet hover:bg-violet/5'
                  : 'hover:text-lavender hover:bg-lavender/5'
              )}
            >
              {journal.is_archived ? (
                <ArchiveRestore className="h-3.5 w-3.5" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              <span>{journal.is_archived ? 'Unarchive' : 'Archive'}</span>
            </Button>

            {/* <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(journal);
              }}
              className="text-xs text-muted-foreground hover:text-sunset hover:bg-sunset/5 transition-colors duration-300 flex items-center gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button> */}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
