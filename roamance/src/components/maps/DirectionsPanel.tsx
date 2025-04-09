'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistance, formatTime } from '@/utils/format';
import { ChevronRight, Clock, Compass, MapPin, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import { RouteData } from '@/components/maps/MapController';

interface DirectionsPanelProps {
  routeData: RouteData | null;
  locationName: string;
  isDarkMode: boolean;
  showDirectionsPanel: boolean;
  activeStep: number | null;
  setActiveStep: (step: number | null) => void;
  onClose: () => void;
}

export function DirectionsPanel({
  routeData,
  locationName,
  isDarkMode,
  showDirectionsPanel,
  activeStep,
  setActiveStep,
  onClose,
}: DirectionsPanelProps) {
  if (!showDirectionsPanel) return null;

  const getTravelTimeEstimate = (): string => {
    if (!routeData) return "Calculating...";

    const minutes = Math.round(routeData.duration / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h${remainingMinutes > 0 ? ' ' + remainingMinutes + ' min' : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'absolute top-0 left-0 h-full w-64 md:w-80 lg:w-96 border-r overflow-y-auto z-[9999]',
        isDarkMode
          ? 'bg-background/80 backdrop-blur-xl border-muted/30'
          : 'bg-white/90 backdrop-blur-xl border-muted/20'
      )}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'p-2 rounded-full',
            isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
          )}>
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Directions</h2>
            {routeData && (
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Est. {getTravelTimeEstimate()}</span>
                <span>•</span>
                <span>{formatDistance(routeData.distance)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className={cn(
            'rounded-lg p-3',
            isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm font-medium">Starting Point</p>
            </div>
            <p className="text-xs text-muted-foreground pl-5">Your current location</p>
          </div>

          {/* Route steps visualization */}
          {routeData && routeData.legs.length > 0 && (
            <div className="pl-1 space-y-0">
              {routeData.legs.flatMap((leg, legIndex) =>
                leg.steps.map((step, stepIndex) => {
                  const isFirstStep = stepIndex === 0 && legIndex === 0;
                  const isLastStep = stepIndex === leg.steps.length - 1 && legIndex === routeData.legs.length - 1;
                  const globalStepIndex = routeData.legs.slice(0, legIndex).reduce(
                    (acc, currentLeg) => acc + currentLeg.steps.length, 0
                  ) + stepIndex;

                  if (isFirstStep || isLastStep || step.maneuver !== 'turn') return null;

                  return (
                    <div
                      key={`${legIndex}-${stepIndex}`}
                      className={cn(
                        "flex items-start gap-3 py-2 px-1.5 rounded-md cursor-pointer transition-colors",
                        activeStep === globalStepIndex
                          ? isDarkMode
                            ? "bg-primary/20"
                            : "bg-primary/10"
                          : "hover:bg-muted/30"
                      )}
                      onClick={() => setActiveStep(globalStepIndex)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-3 bg-muted-foreground/30"></div>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                          isDarkMode ? "bg-muted/50 text-foreground" : "bg-muted/30 text-foreground"
                        )}>
                          <Route className="h-3 w-3" />
                        </div>
                        <div className="w-0.5 h-3 bg-muted-foreground/30"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{step.instruction}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(step.distance)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="flex items-center gap-2 px-2.5">
            <div className="w-0.5 h-8 bg-muted-foreground/30"></div>
          </div>

          <div className={cn(
            'rounded-lg p-3',
            isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <p className="text-sm font-medium">Destination</p>
            </div>
            <p className="text-xs text-muted-foreground pl-5">{locationName}</p>
          </div>

          {/* Turn-by-turn directions */}
          {routeData && (
            <div className={cn(
              'rounded-lg p-3 mt-4',
              isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
            )}>
              <h3 className="text-sm font-medium mb-2">Turn-by-turn Directions</h3>
              <div className="space-y-3 text-xs mt-3">
                {routeData.legs.flatMap((leg, legIndex) =>
                  leg.steps.map((step, stepIndex) => {
                    const globalStepIndex = routeData.legs.slice(0, legIndex).reduce(
                      (acc, currentLeg) => acc + currentLeg.steps.length, 0
                    ) + stepIndex;

                    return (
                      <div
                        key={`full-${legIndex}-${stepIndex}`}
                        className={cn(
                          "flex items-center gap-3 py-1.5 border-b border-muted/20 last:border-b-0",
                          activeStep === globalStepIndex && "font-medium"
                        )}
                        onClick={() => setActiveStep(globalStepIndex)}
                      >
                        {step.maneuver === 'start' ? (
                          <div className="bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3 w-3" />
                          </div>
                        ) : step.maneuver === 'arrive' ? (
                          <div className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="text-muted-foreground h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {stepIndex + 1}.
                          </div>
                        )}
                        <div className="flex-1">
                          <p>{step.instruction}</p>
                          {step.distance > 0 && (
                            <p className="text-muted-foreground text-2xs">
                              {formatDistance(step.distance)}
                              {step.duration > 0 && ` (${formatTime(step.duration)})`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {!routeData && (
            <div className="text-sm text-muted-foreground mt-5 italic">
              Calculating route... Please wait.
            </div>
          )}

          <Button
            variant="outline"
            className={cn(
              "w-full mt-3 border-primary/20",
              isDarkMode ? "hover:bg-primary/10" : "hover:bg-primary/5"
            )}
            onClick={onClose}
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
            Hide Directions
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
