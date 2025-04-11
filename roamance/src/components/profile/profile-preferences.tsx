'use client';

import { api } from '@/api/roamance-api';
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
import { USER_ENDPOINTS } from '@/constants/api';
import { cn } from '@/lib/utils';
import { User } from '@/types/auth';
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
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfilePreferencesProps {
  user: User | null;
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

export function ProfilePreferences({ user, loading }: ProfilePreferencesProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Default preferences or loaded from user
  const [preferences, setPreferences] = useState<PreferencesData>({
    travelStyle: user?.preferences?.travelStyle || 'balanced',
    accommodationTypes: user?.preferences?.accommodationTypes || [
      'hotel',
      'apartment',
    ],
    activities: user?.preferences?.activities || [
      'sightseeing',
      'nature',
      'food',
    ],
    cuisines: user?.preferences?.cuisines || ['local', 'international'],
    climatePreference: user?.preferences?.climatePreference || 'warm',
    budgetLevel: user?.preferences?.budgetLevel || 2,
    notificationPreferences: user?.preferences?.notificationPreferences || {
      deals: true,
      tripReminders: true,
      newsletters: false,
      newDestinations: true,
    },
  });

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await api.put(USER_ENDPOINTS.UPDATE, {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Map className="h-5 w-5 text-sunset" />
            Travel Style
          </CardTitle>
          <CardDescription>Choose how you like to travel</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.travelStyle}
            onValueChange={(value) =>
              setPreferences((prev) => ({ ...prev, travelStyle: value }))
            }
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {travelStyles.map((style) => (
              <Label
                key={style.id}
                htmlFor={style.id}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 cursor-pointer hover:bg-accent/5 transition-all',
                  preferences.travelStyle === style.id &&
                    'border-sunset bg-sunset/10'
                )}
              >
                <RadioGroupItem
                  value={style.id}
                  id={style.id}
                  className="sr-only"
                />
                <style.icon
                  className={cn(
                    'h-8 w-8 mb-2',
                    preferences.travelStyle === style.id
                      ? 'text-sunset'
                      : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    preferences.travelStyle === style.id && 'text-sunset'
                  )}
                >
                  {style.label}
                </span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {style.description}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-ocean" />
              Accommodation
            </CardTitle>
            <CardDescription>
              Select your preferred places to stay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accommodationTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
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
                  />
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4 text-ocean" />
                    <Label
                      htmlFor={`accommodation-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mountain className="h-5 w-5 text-forest" />
              Activities
            </CardTitle>
            <CardDescription>
              Choose activities you enjoy while traveling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`activity-${type.id}`}
                    checked={preferences.activities.includes(type.id)}
                    onCheckedChange={(checked) => {
                      setPreferences((prev) => ({
                        ...prev,
                        activities: checked
                          ? [...prev.activities, type.id]
                          : prev.activities.filter((item) => item !== type.id),
                      }));
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4 text-forest" />
                    <Label
                      htmlFor={`activity-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Utensils className="h-5 w-5 text-sand" />
              Cuisine Preferences
            </CardTitle>
            <CardDescription>
              Select the types of food you prefer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cuisineTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
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
                  />
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4 text-sand" />
                    <Label
                      htmlFor={`cuisine-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sun className="h-5 w-5 text-sunset" />
              Climate Preference
            </CardTitle>
            <CardDescription>
              What type of weather do you prefer?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={preferences.climatePreference}
              onValueChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  climatePreference: value,
                }))
              }
              className="space-y-3"
            >
              {climatePreferences.map((climate) => (
                <div key={climate.id} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={climate.id}
                    id={`climate-${climate.id}`}
                  />
                  <div className="flex items-center gap-2">
                    <climate.icon className="h-4 w-4 text-sunset" />
                    <Label htmlFor={`climate-${climate.id}`}>
                      {climate.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Plane className="h-5 w-5 text-ocean" />
            Travel Budget
          </CardTitle>
          <CardDescription>
            Select your typical budget level for trips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
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
              <div className="text-sm">
                <div className="font-medium">Budget</div>
                <div className="text-muted-foreground text-xs">
                  Hostels & street food
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Economic</div>
                <div className="text-muted-foreground text-xs">
                  3-star hotels
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Moderate</div>
                <div className="text-muted-foreground text-xs">
                  4-star hotels
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Premium</div>
                <div className="text-muted-foreground text-xs">
                  5-star hotels
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Luxury</div>
                <div className="text-muted-foreground text-xs">
                  High-end experiences
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notification Preferences</CardTitle>
          <CardDescription>
            Manage what notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deals">Travel Deals & Discounts</Label>
                <p className="text-muted-foreground text-xs">
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
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trip-reminders">Trip Reminders</Label>
                <p className="text-muted-foreground text-xs">
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
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletters</Label>
                <p className="text-muted-foreground text-xs">
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
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-destinations">New Destinations</Label>
                <p className="text-muted-foreground text-xs">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <LoadingButton
          variant="default"
          onClick={handleSavePreferences}
          isLoading={isSaving}
          loadingText="Saving..."
          className="bg-gradient-to-r from-ocean to-ocean-dark hover:from-ocean-dark hover:to-ocean transition-all duration-300"
        >
          Save All Preferences
        </LoadingButton>
      </div>
    </motion.div>
  );
}
