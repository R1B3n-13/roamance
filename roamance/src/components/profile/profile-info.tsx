'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/common/loading-button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Mail, Phone, Globe, MapPin, Calendar } from 'lucide-react';
import { api } from '@/api/roamance-api';
import { USER_ENDPOINTS } from '@/constants/api';
import { cn } from '@/lib/utils';

interface ProfileInfoProps {
  user: User | null;
  loading: boolean;
}

export function ProfileInfo({ user, loading }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    birthday: user?.birthday || '',
  });

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        birthday: user.birthday || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      await api.put(USER_ENDPOINTS.UPDATE, formData);

      toast.success('Your profile has been updated');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update your profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </div>

            {!isEditing && !loading && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="bg-background border-ocean hover:bg-ocean/10"
              >
                Edit Information
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={`${formData.phone}`}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={`${formData.location}`}
                    onChange={handleChange}
                    placeholder="New York, USA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={`${formData.website}`}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={`${formData.birthday}`}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={`${formData.bio}`}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your travel interests..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isSaving}
                  loadingText="Saving..."
                >
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={user?.email}
                  color="ocean"
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={`${user?.phone}`}
                  color="sunset"
                  fallback="Not provided"
                />

                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={`${user?.location}`}
                  color="forest"
                  fallback="Not specified"
                />

                <InfoItem
                  icon={Globe}
                  label="Website"
                  value={`${user?.website}`}
                  color="sand"
                  isLink
                  fallback="Not provided"
                />

                <InfoItem
                  icon={Calendar}
                  label="Birthday"
                  value={`${user?.birthday}`}
                  color="ocean"
                  fallback="Not provided"
                />
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">
                  {`${user?.bio}` || 'No bio provided. Tell us about yourself!'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Color utility functions to fix Tailwind class name issues
const getBackgroundColorClass = (
  color: 'ocean' | 'sunset' | 'forest' | 'sand' | 'mountain'
) => {
  const classMap = {
    ocean: 'bg-ocean/10',
    sunset: 'bg-sunset/10',
    forest: 'bg-forest/10',
    sand: 'bg-sand/10',
    mountain: 'bg-mountain/10',
  };
  return classMap[color];
};

const getTextColorClass = (
  color: 'ocean' | 'sunset' | 'forest' | 'sand' | 'mountain'
) => {
  const classMap = {
    ocean: 'text-ocean',
    sunset: 'text-sunset',
    forest: 'text-forest',
    sand: 'text-sand',
    mountain: 'text-mountain',
  };
  return classMap[color];
};

const getHoverColorClass = (
  color: 'ocean' | 'sunset' | 'forest' | 'sand' | 'mountain'
) => {
  const classMap = {
    ocean: 'hover:text-ocean-dark',
    sunset: 'hover:text-sunset-dark',
    forest: 'hover:text-forest-dark',
    sand: 'hover:text-sand-dark',
    mountain: 'hover:text-mountain-dark',
  };
  return classMap[color];
};

interface InfoItemProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  value?: string;
  color: 'ocean' | 'sunset' | 'forest' | 'sand' | 'mountain';
  isLink?: boolean;
  fallback?: string;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  color,
  isLink,
  fallback = 'Not available',
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'p-2 rounded-full mt-0.5',
          getBackgroundColorClass(color)
        )}
      >
        <Icon className={cn('h-4 w-4', getTextColorClass(color))} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>

        {isLink && value ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-sm font-medium underline',
              getTextColorClass(color),
              getHoverColorClass(color)
            )}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value || fallback}</p>
        )}
      </div>
    </div>
  );
}
