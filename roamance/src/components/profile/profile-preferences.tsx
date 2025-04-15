'use client';

import { LoadingButton } from '@/components/common/loading-button';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { User, UserInfo } from '@/types';
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
  Snowflake,
  Sun,
  Tent,
  Umbrella,
  Utensils,
  Settings,
  Calendar,
  Mail,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/service/user-service';

interface ProfilePreferencesProps {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
}

// Types for user preferences
interface PreferencesData {
  travelStyle: string;
  accommodationTypes: string[];
  activities: string[];
  cuisines: string[];
  climatePreference: string;
  budgetLevel: number;
  notificationPreferences: {
    deals: boolean;
    tripReminders: boolean;
    newsletters: boolean;
    newDestinations: boolean;
  };
}

export function ProfilePreferences({ user, userInfo, loading }: ProfilePreferencesProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Default preferences or loaded from user info
  const [preferences, setPreferences] = useState<PreferencesData>({
    travelStyle: userInfo?.preferences?.travelStyle || 'balanced',
    accommodationTypes: userInfo?.preferences?.accommodationTypes || [
      'hotel',
      'apartment',
    ],
    activities: userInfo?.preferences?.activities || [
      'sightseeing',
      'nature',
      'food',
    ],
    cuisines: userInfo?.preferences?.cuisines || ['local', 'international'],
    climatePreference: userInfo?.preferences?.climatePreference || 'warm',
    budgetLevel: userInfo?.preferences?.budgetLevel || 2,
    notificationPreferences: userInfo?.preferences?.notificationPreferences || {
      deals: true,
      tripReminders: true,
      newsletters: false,
      newDestinations: true,
    },
  });

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      // Update user preferences using our service
      await userService.updateUserInfo({
        user_id: user.id,
        preferences,
      });

      toast.success('Your travel preferences have been updated');
    } catch (error) {
      console.error('Failed to update preferences', error);
      toast.error('Failed to update your preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const travelStyles = [
    {
      id: 'relaxed',
      label: 'Relaxed & Easy',
      icon: Umbrella,
      description: 'Take it slow and enjoy the moment',
    },
    {
      id: 'balanced',
      label: 'Balanced Mix',
      icon: Map,
      description: 'Balance between activities and relaxation',
    },
    {
      id: 'adventurous',
      label: 'Adventurous',
      icon: Mountain,
      description: 'Seek thrills and unique experiences',
    },
  ];

  const accommodationTypes = [
    { id: 'hotel', label: 'Hotels', icon: Building2 },
    { id: 'resort', label: 'Resorts', icon: Umbrella },
    { id: 'apartment', label: 'Apartments', icon: Building2 },
    { id: 'hostel', label: 'Hostels', icon: Building2 },
    { id: 'camping', label: 'Camping', icon: Tent },
  ];

  const activityTypes = [
    { id: 'sightseeing', label: 'Sightseeing', icon: Camera },
    { id: 'nature', label: 'Nature & Outdoors', icon: Mountain },
    { id: 'culture', label: 'Cultural Experiences', icon: Landmark },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
  ];

  const cuisineTypes = [
    { id: 'local', label: 'Local Cuisine', icon: ChefHat },
    { id: 'international', label: 'International', icon: Globe },
    { id: 'fine-dining', label: 'Fine Dining', icon: Utensils },
    { id: 'street-food', label: 'Street Food', icon: Coffee },
    { id: 'vegetarian', label: 'Vegetarian/Vegan', icon: Utensils },
  ];

  const climatePreferences = [
    { id: 'warm', label: 'Warm & Sunny', icon: Sun },
    { id: 'cold', label: 'Cold & Snowy', icon: Snowflake },
    { id: 'moderate', label: 'Moderate', icon: CloudRain },
    { id: 'any', label: 'Any Climate', icon: Globe },
  ];

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

  if (loading) {
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
              value={preferences.travelStyle}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, travelStyle: value }))
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
                      preferences.travelStyle === style.id &&
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
                        preferences.travelStyle === style.id
                          ? 'bg-sunset/20'
                          : 'bg-muted/20'
                      )}
                    >
                      <style.icon
                        className={cn(
                          'h-6 w-6',
                          preferences.travelStyle === style.id
                            ? 'text-sunset'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'font-medium text-base',
                        preferences.travelStyle === style.id && 'text-sunset'
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
                      preferences.accommodationTypes.includes(type.id) &&
                        'bg-ocean/5 border-ocean/20'
                    )}
                  >
                    <Checkbox
                      id={`accommodation-${type.id}`}
                      checked={preferences.accommodationTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          accommodationTypes: checked
                            ? [...prev.accommodationTypes, type.id]
                            : prev.accommodationTypes.filter(
                                (item) => item !== type.id
                              ),
                        }));
                      }}
                      className={cn(
                        preferences.accommodationTypes.includes(type.id) &&
                          'border-ocean text-ocean'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.accommodationTypes.includes(type.id)
                            ? 'bg-ocean/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.accommodationTypes.includes(type.id)
                              ? 'text-ocean'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`accommodation-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.accommodationTypes.includes(type.id) &&
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
                      preferences.activities.includes(type.id) &&
                        'bg-forest/5 border-forest/20'
                    )}
                  >
                    <Checkbox
                      id={`activity-${type.id}`}
                      checked={preferences.activities.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          activities: checked
                            ? [...prev.activities, type.id]
                            : prev.activities.filter(
                                (item) => item !== type.id
                              ),
                        }));
                      }}
                      className={cn(
                        preferences.activities.includes(type.id) &&
                          'border-forest text-forest'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.activities.includes(type.id)
                            ? 'bg-forest/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.activities.includes(type.id)
                              ? 'text-forest'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`activity-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.activities.includes(type.id) &&
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
                      preferences.cuisines.includes(type.id) &&
                        'bg-sand/5 border-sand/20'
                    )}
                  >
                    <Checkbox
                      id={`cuisine-${type.id}`}
                      checked={preferences.cuisines.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          cuisines: checked
                            ? [...prev.cuisines, type.id]
                            : prev.cuisines.filter((item) => item !== type.id),
                        }));
                      }}
                      className={cn(
                        preferences.cuisines.includes(type.id) &&
                          'border-sand text-sand'
                      )}
                    />
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-md',
                          preferences.cuisines.includes(type.id)
                            ? 'bg-sand/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <type.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.cuisines.includes(type.id)
                              ? 'text-sand'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`cuisine-${type.id}`}
                        className={cn(
                          'text-sm font-medium leading-none cursor-pointer',
                          preferences.cuisines.includes(type.id) && 'text-sand'
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
                value={preferences.climatePreference}
                onValueChange={(value) =>
                  setPreferences((prev) => ({
                    ...prev,
                    climatePreference: value,
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
                      preferences.climatePreference === climate.id &&
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
                          preferences.climatePreference === climate.id
                            ? 'bg-mountain/10'
                            : 'bg-muted/20'
                        )}
                      >
                        <climate.icon
                          className={cn(
                            'h-4 w-4',
                            preferences.climatePreference === climate.id
                              ? 'text-mountain'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <Label
                        htmlFor={`climate-${climate.id}`}
                        className={cn(
                          'text-sm font-medium cursor-pointer',
                          preferences.climatePreference === climate.id &&
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
                      Budget Level: {preferences.budgetLevel + 1}/5
                    </Badge>
                  </div>
                </div>
                <Slider
                  value={[preferences.budgetLevel]}
                  min={0}
                  max={4}
                  step={1}
                  onValueChange={([value]) =>
                    setPreferences((prev) => ({ ...prev, budgetLevel: value }))
                  }
                  className="py-4"
                />
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <motion.div
                  className={cn(
                    'text-sm p-3 rounded-lg border-2 border-transparent transition-all',
                    preferences.budgetLevel === 0 &&
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
                    preferences.budgetLevel === 1 &&
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
                    preferences.budgetLevel === 2 &&
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
                    preferences.budgetLevel === 3 &&
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
                    preferences.budgetLevel === 4 &&
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

      <motion.div variants={itemVariants}>
        <Card className="border-sunset/30 overflow-hidden bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md pt-0">
          <CardHeader className="relative pt-8 pb-3">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sunset to-sunset-dark opacity-80" />
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sunset/10">
                <Globe className="h-5 w-5 text-sunset" />
              </div>
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Manage what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-5">
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 rounded-lg border border-muted/30 bg-muted/5"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor="deals"
                    className="flex items-center gap-2 text-base"
                  >
                    <span
                      className={cn(
                        'p-1.5 rounded-md',
                        preferences.notificationPreferences.deals
                          ? 'bg-sunset/10'
                          : 'bg-muted/20'
                      )}
                    >
                      <Plane
                        className={cn(
                          'h-4 w-4',
                          preferences.notificationPreferences.deals
                            ? 'text-sunset'
                            : 'text-muted-foreground'
                        )}
                      />
                    </span>
                    Travel Deals & Discounts
                  </Label>
                  <p className="text-muted-foreground text-xs ml-8">
                    Get notified about special offers and promotions
                  </p>
                </div>
                <Switch
                  id="deals"
                  checked={preferences.notificationPreferences.deals}
                  onCheckedChange={(checked) => {
                    setPreferences((prev) => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        deals: checked,
                      },
                    }));
                  }}
                />
              </motion.div>

              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 rounded-lg border border-muted/30 bg-muted/5"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor="trip-reminders"
                    className="flex items-center gap-2 text-base"
                  >
                    <span
                      className={cn(
                        'p-1.5 rounded-md',
                        preferences.notificationPreferences.tripReminders
                          ? 'bg-forest/10'
                          : 'bg-muted/20'
                      )}
                    >
                      <Calendar
                        className={cn(
                          'h-4 w-4',
                          preferences.notificationPreferences.tripReminders
                            ? 'text-forest'
                            : 'text-muted-foreground'
                        )}
                      />
                    </span>
                    Trip Reminders
                  </Label>
                  <p className="text-muted-foreground text-xs ml-8">
                    Get reminders about your upcoming trips
                  </p>
                </div>
                <Switch
                  id="trip-reminders"
                  checked={preferences.notificationPreferences.tripReminders}
                  onCheckedChange={(checked) => {
                    setPreferences((prev) => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        tripReminders: checked,
                      },
                    }));
                  }}
                />
              </motion.div>

              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 rounded-lg border border-muted/30 bg-muted/5"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor="newsletter"
                    className="flex items-center gap-2 text-base"
                  >
                    <span
                      className={cn(
                        'p-1.5 rounded-md',
                        preferences.notificationPreferences.newsletters
                          ? 'bg-ocean/10'
                          : 'bg-muted/20'
                      )}
                    >
                      <Mail
                        className={cn(
                          'h-4 w-4',
                          preferences.notificationPreferences.newsletters
                            ? 'text-ocean'
                            : 'text-muted-foreground'
                        )}
                      />
                    </span>
                    Newsletters
                  </Label>
                  <p className="text-muted-foreground text-xs ml-8">
                    Receive our monthly travel newsletter
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={preferences.notificationPreferences.newsletters}
                  onCheckedChange={(checked) => {
                    setPreferences((prev) => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        newsletters: checked,
                      },
                    }));
                  }}
                />
              </motion.div>

              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 rounded-lg border border-muted/30 bg-muted/5"
              >
                <div className="space-y-1">
                  <Label
                    htmlFor="new-destinations"
                    className="flex items-center gap-2 text-base"
                  >
                    <span
                      className={cn(
                        'p-1.5 rounded-md',
                        preferences.notificationPreferences.newDestinations
                          ? 'bg-mountain/10'
                          : 'bg-muted/20'
                      )}
                    >
                      <Globe
                        className={cn(
                          'h-4 w-4',
                          preferences.notificationPreferences.newDestinations
                            ? 'text-mountain'
                            : 'text-muted-foreground'
                        )}
                      />
                    </span>
                    New Destinations
                  </Label>
                  <p className="text-muted-foreground text-xs ml-8">
                    Get notified when we add new destinations
                  </p>
                </div>
                <Switch
                  id="new-destinations"
                  checked={preferences.notificationPreferences.newDestinations}
                  onCheckedChange={(checked) => {
                    setPreferences((prev) => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        newDestinations: checked,
                      },
                    }));
                  }}
                />
              </motion.div>
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
