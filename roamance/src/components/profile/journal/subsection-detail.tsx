import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Location } from '@/types';
import {
  SubsectionDetailResponseDto,
  SubsectionType,
} from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  MapPin,
  Route,
  Star,
} from 'lucide-react';
import React from 'react';

interface SubsectionDetailProps {
  subsection: SubsectionDetailResponseDto;
  isActive: boolean;
  toggleSubsection: () => void;
  colors: {
    bg: string;
    icon: string;
    border: string;
    badge: string;
  };
  index: number;
}

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
  index,
}) => {
  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-5 h-5" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-5 h-5" />;
      case SubsectionType.ROUTE:
        return <Route className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return 'from-indigo-500 to-purple-600 text-white';
      case SubsectionType.ACTIVITY:
        return 'from-amber-500 to-yellow-600 text-white';
      case SubsectionType.ROUTE:
        return 'from-emerald-500 to-teal-600 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.1 }}
      className={cn(
        'rounded-xl overflow-hidden border shadow-sm transition-all duration-300',
        isActive
          ? cn('border-muted/70 shadow-md', colors.border)
          : 'border-muted/30 hover:border-muted/50'
      )}
    >
      <button
        onClick={toggleSubsection}
        className={cn(
          'flex items-center justify-between w-full p-4 text-left bg-background hover:bg-muted/20 transition-colors duration-200',
          isActive && cn('bg-muted/10', colors.bg)
        )}
      >
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(
              subsection.type
            )} shadow-sm`}
          >
            {getSubsectionIcon(subsection.type)}
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-foreground">{subsection.title}</h4>
            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
              <Badge variant="secondary" className={colors.badge}>
                {subsection.type}
              </Badge>

              {subsection.notes?.length > 0 && (
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {subsection.notes?.length} notes
                </span>
              )}

              {subsection.checklists?.length > 0 && (
                <span className="flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {subsection.checklists?.length} checklist items
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300',
            colors.bg,
            isActive && 'rotate-180'
          )}
        >
          <ChevronDown className={cn('w-5 h-5', colors.icon)} />
        </div>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-muted/30"
          >
            <div className={cn('p-5', colors.bg)}>
              {/* Type-specific content */}
              {subsection.type === SubsectionType.SIGHTSEEING && (
                <div className="mb-5">
                  <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                    <MapPin className={cn('w-5 h-5 mr-3', colors.icon)} />
                    <span>
                      Location:{' '}
                      {subsection.location
                        ? `${subsection.location.latitude.toFixed(
                            4
                          )}, ${subsection.location.longitude.toFixed(4)}`
                        : 'No location data available'}
                    </span>
                  </div>
                </div>
              )}

              {subsection.type === SubsectionType.ACTIVITY && (
                <div className="mb-5 space-y-3">
                  <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                    <Activity className={cn('w-5 h-5 mr-3', colors.icon)} />
                    <span>
                      Activity: {subsection.activity_type || 'Unnamed activity'}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                    <MapPin className={cn('w-5 h-5 mr-3', colors.icon)} />
                    <span>
                      Location:{' '}
                      {subsection.location
                        ? `${subsection.location.latitude.toFixed(
                            4
                          )}, ${subsection.location.longitude.toFixed(4)}`
                        : 'No location data available'}
                    </span>
                  </div>
                </div>
              )}

              {subsection.type === SubsectionType.ROUTE && (
                <div className="mb-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                      <Route className={cn('w-5 h-5 mr-3', colors.icon)} />
                      <span>Distance: {subsection.total_distance || 0} km</span>
                    </div>

                    <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                      <Clock className={cn('w-5 h-5 mr-3', colors.icon)} />
                      <span>Time: {subsection.total_time || 0} min</span>
                    </div>
                  </div>

                  {subsection.waypoints && subsection.waypoints.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-3 flex items-center">
                        <Route className={cn('w-4 h-4 mr-2', colors.icon)} />
                        Route Stops
                      </h5>

                      <div
                        className={cn(
                          'space-y-2 pl-4 border-l-2',
                          colors.border
                        )}
                      >
                        {subsection.waypoints.map(
                          (location: Location, i: number) => (
                            <div
                              key={i}
                              className="flex items-center text-sm relative pl-6"
                            >
                              <div
                                className={cn(
                                  'absolute -left-[17px] w-8 h-8 rounded-full flex items-center justify-center text-white z-10',
                                  i === 0
                                    ? 'bg-green-500'
                                    : i === subsection.waypoints.length - 1
                                      ? 'bg-red-500'
                                      : colors.icon.replace('text-', 'bg-')
                                )}
                              >
                                {i + 1}
                              </div>
                              <div className="bg-background/80 backdrop-blur-sm rounded-lg py-2 px-3 border border-muted/30 w-full">
                                Stop {i + 1}: {location.latitude.toFixed(4)},{' '}
                                {location.longitude.toFixed(4)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notes section */}
                {subsection.notes && subsection.notes?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-3 flex items-center">
                      <Star className={cn('w-4 h-4 mr-2', colors.icon)} />
                      Notes
                      <Badge className={cn('ml-2 text-xs', colors.badge)}>
                        {subsection.notes?.length}
                      </Badge>
                    </h5>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {subsection.notes.map((note: string, i: number) => (
                        <div key={i} className="group relative">
                          <div className="absolute -left-2 top-3 w-4 h-4 rounded-full bg-background border-2 border-muted z-10 group-hover:border-indigo-400 transition-colors duration-300"></div>
                          <div className="pl-6 py-2 pr-3 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30 group-hover:border-muted transition-colors duration-300">
                            <p className="text-sm text-foreground/90">{note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklists section */}
                {subsection.checklists && subsection.checklists?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-3 flex items-center">
                      <CheckCircle2
                        className={cn('w-4 h-4 mr-2', colors.icon)}
                      />
                      Checklist
                      <Badge className={cn('ml-2 text-xs', colors.badge)}>
                        {subsection.checklists?.length}
                      </Badge>
                    </h5>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {subsection.checklists.map((item: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30 text-sm text-foreground"
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0',
                              colors.bg
                            )}
                          >
                            <CheckCircle2
                              className={cn('w-4 h-4', colors.icon)}
                            />
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
