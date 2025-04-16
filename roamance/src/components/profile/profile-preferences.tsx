'use client';

import { LoadingButton } from '@/components/common/loading-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { userService } from '@/service/user-service';
import {
  AccommodationType,
  ActivityType,
  BudgetLevel,
  ClimatePreference,
  CuisineType,
  TravelStyle,
  User,
  UserInfo,
  UserPreferences
} from '@/types';
import { motion } from 'framer-motion';
import {
  Building2,
  Camera,
  ChefHat,
  CloudRain,
  Coffee,
  Film,
  Globe,
  Landmark,
  Map,
  Mountain,
  Plane,
  Settings,
  Snowflake,
  Sun,
  Tent,
  Umbrella,
  Utensils,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProfilePreferencesProps {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
}

export function ProfilePreferences({ user, loading }: ProfilePreferencesProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // Default preferences or loaded from user info
  const [preferences, setPreferences] = useState<UserPreferences>({
    travel_style: TravelStyle.BALANCED,
    accommodation_types: [
      AccommodationType.HOTELS,
      AccommodationType.APARTMENTS,
    ],
    activity_types: [
      ActivityType.SIGHTSEEING,
      ActivityType.NATURE_AND_OUTDOORS,
      ActivityType.FOOD_AND_DINING,
    ],
    cuisine_types: [CuisineType.LOCAL_CUISINE, CuisineType.INTERNATIONAL],
    climate_preference: ClimatePreference.WARM_AND_SUNNY,
    budget_level: BudgetLevel.MODERATE,
  });

  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        setIsLoadingPreferences(true);
        const userPreferences = await userService.getUserPreferences();

        // Map API preferences to our UI model
        setPreferences({
          travel_style: userPreferences.travel_style || TravelStyle.BALANCED,
          accommodation_types: Array.isArray(userPreferences.accommodation_types)
            ? userPreferences.accommodation_types
            : [AccommodationType.HOTELS, AccommodationType.APARTMENTS],
          activity_types: Array.isArray(userPreferences.activity_types)
            ? userPreferences.activity_types
            : [
                ActivityType.SIGHTSEEING,
                ActivityType.NATURE_AND_OUTDOORS,
                ActivityType.FOOD_AND_DINING,
              ],
          cuisine_types: Array.isArray(userPreferences.cuisine_types)
            ? userPreferences.cuisine_types
            : [CuisineType.LOCAL_CUISINE, CuisineType.INTERNATIONAL],
          climate_preference:
            userPreferences.climate_preference ||
            ClimatePreference.WARM_AND_SUNNY,
          budget_level: userPreferences.budget_level || BudgetLevel.MODERATE,
        });

        toast.success('Your preferences have been loaded');
      } catch (error) {
        console.error('Failed to fetch user preferences', error);
        toast.error('Failed to load your preferences');
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      // Update user preferences using our service
      // The service will handle conversion from camelCase to snake_case for us
      await userService.updateUserPreferences({
        travel_style: preferences.travel_style,
        accommodation_types: preferences.accommodation_types,
        activity_types: preferences.activity_types,
        cuisine_types: preferences.cuisine_types,
        climate_preference: preferences.climate_preference,
        budget_level: preferences.budget_level,
      });

      toast.success('Your travel preferences have been updated');
    } catch (error) {
      console.error('Failed to update preferences', error);
      toast.error('Failed to update your preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Map our enum values to UI-friendly values for the components
  const travelStyles = [
    {
      id: TravelStyle.RELAXED,
      label: 'Relaxed & Easy',
      icon: Umbrella,
      description: 'Take it slow and enjoy the moment',
    },
    {
      id: TravelStyle.BALANCED,
      label: 'Balanced Mix',
      icon: Map,
      description: 'Balance between activities and relaxation',
    },
    {
      id: TravelStyle.ADVENTUROUS,
      label: 'Adventurous',
      icon: Mountain,
      description: 'Seek thrills and unique experiences',
    },
  ];

  const accommodationTypes = [
    { id: AccommodationType.HOTELS, label: 'Hotels', icon: Building2 },
    { id: AccommodationType.RESORTS, label: 'Resorts', icon: Umbrella },
    { id: AccommodationType.APARTMENTS, label: 'Apartments', icon: Building2 },
    { id: AccommodationType.HOSTELS, label: 'Hostels', icon: Building2 },
    { id: AccommodationType.CAMPING, label: 'Camping', icon: Tent },
  ];

  const activityTypes = [
    { id: ActivityType.SIGHTSEEING, label: 'Sightseeing', icon: Camera },
    {
      id: ActivityType.NATURE_AND_OUTDOORS,
      label: 'Nature & Outdoors',
      icon: Mountain,
    },
    {
      id: ActivityType.CULTURAL_EXPERIENCE,
      label: 'Cultural Experiences',
      icon: Landmark,
    },
    {
      id: ActivityType.FOOD_AND_DINING,
      label: 'Food & Dining',
      icon: Utensils,
    },
    { id: ActivityType.ENTERTAINMENT, label: 'Entertainment', icon: Film },
  ];

  const cuisineTypes = [
    { id: CuisineType.LOCAL_CUISINE, label: 'Local Cuisine', icon: ChefHat },
    { id: CuisineType.INTERNATIONAL, label: 'International', icon: Globe },
    { id: CuisineType.FINE_DINING, label: 'Fine Dining', icon: Utensils },
    { id: CuisineType.STREET_FOOD, label: 'Street Food', icon: Coffee },
    { id: CuisineType.VEGAN, label: 'Vegetarian/Vegan', icon: Utensils },
  ];

  const climatePreferences = [
    { id: ClimatePreference.WARM_AND_SUNNY, label: 'Warm & Sunny', icon: Sun },
    {
      id: ClimatePreference.COLD_AND_SNOWY,
      label: 'Cold & Snowy',
      icon: Snowflake,
    },
    { id: ClimatePreference.MODERATE, label: 'Moderate', icon: CloudRain },
    { id: ClimatePreference.ANY_CLIMATE, label: 'Any Climate', icon: Globe },
  ];

  // Map budget level to UI values
  const getBudgetIndex = (level: BudgetLevel): number => {
    const budgetMap: Record<BudgetLevel, number> = {
      [BudgetLevel.BUDGET]: 0,
      [BudgetLevel.ECONOMIC]: 1,
      [BudgetLevel.MODERATE]: 2,
      [BudgetLevel.PREMIUM]: 3,
      [BudgetLevel.LUXURY]: 4,
    };
    return budgetMap[level];
  };

  const getBudgetLevelFromIndex = (index: number): BudgetLevel => {
    const indexMap: Record<number, BudgetLevel> = {
      0: BudgetLevel.BUDGET,
      1: BudgetLevel.ECONOMIC,
      2: BudgetLevel.MODERATE,
      3: BudgetLevel.PREMIUM,
      4: BudgetLevel.LUXURY,
    };
    return indexMap[index];
  };

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  if (loading || isLoadingPreferences) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {[1, 2, 3].map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Skeleton className="h-64 w-full rounded-xl" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-radial from-sunset/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />

      <motion.div variants={itemVariants}>
        <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
          <CardHeader className="relative pt-4">
            {/* Decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sunset via-ocean to-forest opacity-80" />

            <div className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sunset/10 text-sunset">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Travel Preferences</CardTitle>
                <CardDescription>
                  Personalize your travel experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4 bg-muted/10 p-4 rounded-lg border border-muted/30 italic">
              Customize your preferences to get personalized travel
              recommendations and a better experience with Roamance.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-sunset/30 overflow-hidden bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md pt-0">
          <CardHeader className="relative pt-8 pb-3">
            {/* Decorative accent pattern */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-sunset opacity-80" />

            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sunset/10">
                <Map className="h-5 w-5 text-sunset" />
              </div>
              <span>Travel Style</span>
            </CardTitle>
            <CardDescription>Choose how you like to travel</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <RadioGroup
              value={preferences.travel_style}
              onValueChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  travel_style: value as TravelStyle,
                }))
              }
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {travelStyles.map((style) => (
                <motion.div
                  key={style.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Label
                    htmlFor={style.id}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border-2 border-muted/50 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300',
                      preferences.travel_style === style.id &&
                        'border-sunset/70 bg-sunset/5 shadow-lg ring-1 ring-sunset/30'
                    )}
                  >
                    <RadioGroupItem
                      value={style.id}
                      id={style.id}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                        preferences.travel_style === style.id
                          ? 'bg-sunset/20'
                          : 'bg-muted/20'
                      )}
                    >
                      <style.icon
                        className={cn(
                          'h-6 w-6',
                          preferences.travel_style === style.id
                            ? 'text-sunset'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'font-medium text-base',
                        preferences.travel_style === style.id && 'text-sunset'
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs text-muted-foreground text-center mt-2">
                      {style.description}
                    </span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-ocean/30 h-full bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
            <CardHeader className="relative pt-8 pb-3">
              <div className="absolute top-0 left-0 right-0 h-1 bg-ocean opacity-80" />
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-ocean/10">
                  <Building2 className="h-4 w-4 text-ocean" />
                </div>
                <span>Accommodation</span>
              </CardTitle>
              <CardDescription>
                Select your preferred places to stay
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {accommodationTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-center space-x-3 p-2.5 rounded-lg border border-transparent',
                      preferences.accommodation_types.includes(type.id) &&
                        'bg-ocean/5 border-ocean/20'
                    )}
                  >
                    <Checkbox
                      id={`accommodation-${type.id}`}
                      checked={preferences.accommodation_types.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          accommodation_types: checked
                            ? [...prev.accommodation_types, type.id]
                            : prev.accommodation_types.filter(
                                (item) => item !== type.id
                              ),
                        }));
                      }}
                      className={cn(
                        preferences.accommodation_types.includes(type.id) &&
                          'border-ocean text-ocean'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.accommodation_types.includes(type.id)
                            ? 'bg-ocean/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.accommodation_types.includes(type.id)
                              ? 'text-ocean'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`accommodation-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.accommodation_types.includes(type.id) &&
                            'text-ocean'
                        )}
                      >
                        {type.label}
                      </Label>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-forest/30 h-full bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
            <CardHeader className="relative pt-8 pb-3">
              <div className="absolute top-0 left-0 right-0 h-1 bg-forest opacity-80" />
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-forest/10">
                  <Mountain className="h-4 w-4 text-forest" />
                </div>
                <span>Activities</span>
              </CardTitle>
              <CardDescription>
                Choose activities you enjoy while traveling
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {activityTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-center space-x-3 p-2.5 rounded-lg border border-transparent',
                      preferences.activity_types.includes(type.id) &&
                        'bg-forest/5 border-forest/20'
                    )}
                  >
                    <Checkbox
                      id={`activity-${type.id}`}
                      checked={preferences.activity_types.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          activity_types: checked
                            ? [...prev.activity_types, type.id]
                            : prev.activity_types.filter(
                                (item) => item !== type.id
                              ),
                        }));
                      }}
                      className={cn(
                        preferences.activity_types.includes(type.id) &&
                          'border-forest text-forest'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.activity_types.includes(type.id)
                            ? 'bg-forest/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.activity_types.includes(type.id)
                              ? 'text-forest'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`activity-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.activity_types.includes(type.id) &&
                            'text-forest'
                        )}
                      >
                        {type.label}
                      </Label>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-sand/30 h-full bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
            <CardHeader className="relative pt-8 pb-3">
              <div className="absolute top-0 left-0 right-0 h-1 bg-sand opacity-80" />
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sand/10">
                  <Utensils className="h-4 w-4 text-sand" />
                </div>
                <span>Cuisine Preferences</span>
              </CardTitle>
              <CardDescription>
                Select the types of food you prefer
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {cuisineTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-center space-x-3 p-2.5 rounded-lg border border-transparent',
                      preferences.cuisine_types.includes(type.id) &&
                        'bg-sand/5 border-sand/20'
                    )}
                  >
                    <Checkbox
                      id={`cuisine-${type.id}`}
                      checked={preferences.cuisine_types.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          cuisine_types: checked
                            ? [...prev.cuisine_types, type.id]
                            : prev.cuisine_types.filter(
                                (item) => item !== type.id
                              ),
                        }));
                      }}
                      className={cn(
                        preferences.cuisine_types.includes(type.id) &&
                          'border-sand text-sand'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.cuisine_types.includes(type.id)
                            ? 'bg-sand/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.cuisine_types.includes(type.id)
                              ? 'text-sand'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`cuisine-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.cuisine_types.includes(type.id) &&
                            'text-sand'
                        )}
                      >
                        {type.label}
                      </Label>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-mountain/30 h-full bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
            <CardHeader className="relative pt-8 pb-3">
              <div className="absolute top-0 left-0 right-0 h-1 bg-mountain opacity-80" />
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-mountain/10">
                  <Sun className="h-4 w-4 text-mountain" />
                </div>
                <span>Climate Preference</span>
              </CardTitle>
              <CardDescription>
                What type of weather do you prefer?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <RadioGroup
                value={preferences.climate_preference}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    climate_preference: value as ClimatePreference,
                  }))
                }
                className="grid grid-cols-2 gap-3"
              >
                {climatePreferences.map((climate) => (
                  <motion.div
                    key={climate.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'relative flex items-center p-3 rounded-lg border-2 border-muted/50 cursor-pointer',
                      preferences.climate_preference === climate.id &&
                        'border-mountain/50 bg-mountain/5'
                    )}
                  >
                    <RadioGroupItem
                      value={climate.id}
                      id={`climate-${climate.id}`}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <div className="ml-6 flex items-center gap-2">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.climate_preference === climate.id
                            ? 'bg-mountain/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <climate.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.climate_preference === climate.id
                              ? 'text-mountain'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`climate-${climate.id}`}
                        className={cn(
                          'text-sm font-medium cursor-pointer',
                          preferences.climate_preference === climate.id &&
                            'text-mountain'
                        )}
                      >
                        {climate.label}
                      </Label>
                    </div>
                  </motion.div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-ocean/30 overflow-hidden bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md pt-0">
          <CardHeader className="relative pt-8 pb-3">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ocean to-ocean-dark opacity-80" />
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-ocean/10">
                <Plane className="h-5 w-5 text-ocean" />
              </div>
              <span>Travel Budget</span>
            </CardTitle>
            <CardDescription>
              Select your typical budget level for trips
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="border-ocean/30 bg-ocean/5 text-ocean"
                    >
                      Budget Level:{' '}
                      {getBudgetIndex(preferences.budget_level) + 1}/5
                    </Badge>
                  </div>
                </div>
                <Slider
                  value={[getBudgetIndex(preferences.budget_level)]}
                  min={0}
                  max={4}
                  step={1}
                  onValueChange={([value]) =>
                    setPreferences((prev) => ({
                      ...prev,
                      budget_level: getBudgetLevelFromIndex(value),
                    }))
                  }
                  className="py-4"
                />
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budget_level === BudgetLevel.BUDGET &&
                      'border-ocean/30 bg-ocean/5'
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="font-medium">Budget</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    Hostels & street food
                  </div>
                </motion.div>
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budget_level === BudgetLevel.ECONOMIC &&
                      'border-ocean/30 bg-ocean/5'
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="font-medium">Economic</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    3-star hotels
                  </div>
                </motion.div>
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budget_level === BudgetLevel.MODERATE &&
                      'border-ocean/30 bg-ocean/5'
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="font-medium">Moderate</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    4-star hotels
                  </div>
                </motion.div>
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budget_level === BudgetLevel.PREMIUM &&
                      'border-ocean/30 bg-ocean/5'
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="font-medium">Premium</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    5-star hotels
                  </div>
                </motion.div>
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budget_level === BudgetLevel.LUXURY &&
                      'border-ocean/30 bg-ocean/5'
                  )}
                  whileHover={{ y: -3 }}
                >
                  <div className="font-medium">Luxury</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    High-end experiences
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-end pt-4">
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <LoadingButton
            variant="default"
            onClick={handleSavePreferences}
            isLoading={isSaving}
            loadingText="Saving..."
            className="bg-gradient-to-r from-ocean to-ocean-dark hover:opacity-90 transition-all duration-300 text-white shadow-md px-6"
          >
            Save All Preferences
          </LoadingButton>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
