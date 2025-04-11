'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { getDateParts, getMonthName } from '@/utils/format';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Edit3, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileHeaderProps {
  user: User | null;
  loading: boolean;
}

export function ProfileHeader({ user, loading }: ProfileHeaderProps) {
  const router = useRouter();

  // Calculate initials for avatar fallback
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-64 rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-r from-ocean via-sunset to-forest" />
      <div className="absolute bottom-0 left-0 w-1/4 h-48 rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-r from-forest to-sunset" />

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border',
          'bg-gradient-to-r from-background via-background to-background/90',
          'backdrop-blur-sm shadow-xl'
        )}
      >
        {/* Profile header top color bar with navigation buttons */}
        <div className="h-24 bg-gradient-to-r from-ocean via-sunset to-forest opacity-90 relative">
          {/* Navigation buttons positioned elegantly in the top-right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 transition-all duration-200"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go back</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 transition-all duration-200"
                  onClick={() => router.push(routes.home.href)}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to homepage</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col md:flex-row px-6 pb-6 -mt-12 md:items-end gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {loading ? (
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background" />
            ) : (
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                <AvatarImage
                  src={user?.profileImage || undefined}
                  alt={user?.name || 'User'}
                />
                <AvatarFallback className="bg-gradient-to-br from-ocean to-ocean-dark text-xl md:text-2xl text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Profile info */}
          <div className="flex-grow space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {user?.name || 'Traveler'}
                  </h1>
                  <Button size="sm" variant="outline" className="flex gap-2">
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </Button>
                </div>

                {/* <p className="text-muted-foreground">
                  {user?.bio ||
                    'Adventure seeker and world explorer. Ready for the next journey!'}
                </p> */}

                <div className="flex flex-wrap gap-3 mt-2">
                  {/* <Badge
                    variant="secondary"
                    className="flex gap-1.5 px-2 py-1 bg-secondary/15"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{user?.location || 'Earth'}</span>
                  </Badge> */}
                  <Badge
                    variant="outline"
                    className="flex gap-1.5 px-2 py-1 bg-ocean/10"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Joined{' '}
                      {`${getMonthName(getDateParts(`${user?.created_at}`).month)} ${getDateParts(`${user?.created_at}`).year}` ||
                        'April 20XX'}
                    </span>
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
