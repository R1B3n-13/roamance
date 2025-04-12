'use client';

import { api } from '@/api/roamance-api';
import { LoadingButton } from '@/components/common/loading-button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { USER_ENDPOINTS } from '@/constants/api';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';
import { motion } from 'framer-motion';
import {
  Calendar,
  Edit2,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProfileInfoProps {
  user: UserType | null;
  loading: boolean;
}

export function ProfileInfo({ user, loading }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    birthday: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        birthday: '',
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-radial from-sunset/5 to-transparent rounded-full blur-2xl -z-10" />

      <Card className="border-muted/40 bg-gradient-to-b from-background to-background/90 backdrop-blur-sm shadow-md overflow-hidden pt-0">
        <CardHeader className="relative px-6 pt-4 pb-0">
          {/* Decorative accent line on top of the card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ocean via-sunset to-forest opacity-80" />

          <div className="flex items-center justify-between pt-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="bg-ocean/10 p-1.5 rounded-md">
                  <User className="h-5 w-5 text-ocean" />
                </span>
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription className="mt-1.5">
                Update your personal details and contact information
              </CardDescription>
            </div>

            {!isEditing && !loading && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="bg-background/80 border-ocean/30 text-ocean hover:bg-ocean/10 hover:text-ocean-dark transition-all duration-300 flex gap-1.5 items-center"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Info</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-6">
          {loading ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="flex flex-col space-y-2"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </motion.div>
                ))}
            </motion.div>
          ) : isEditing ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="border-muted/50 focus:border-ocean focus:ring-1 focus:ring-ocean/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="border-muted/50 focus:border-ocean focus:ring-1 focus:ring-ocean/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="border-muted/50 focus:border-sunset focus:ring-1 focus:ring-sunset/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="New York, USA"
                    className="border-muted/50 focus:border-forest focus:ring-1 focus:ring-forest/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="website"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="border-muted/50 focus:border-sand focus:ring-1 focus:ring-sand/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2.5">
                  <Label
                    htmlFor="birthday"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Birthday
                  </Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="border-muted/50 focus:border-mountain focus:ring-1 focus:ring-mountain/30 bg-background/80 backdrop-blur-sm transition-colors"
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-2.5">
                <Label
                  htmlFor="bio"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your travel interests..."
                  rows={4}
                  className="border-muted/50 focus:border-ocean focus:ring-1 focus:ring-ocean/30 bg-background/80 backdrop-blur-sm transition-colors resize-none"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex justify-end gap-3 border-t border-muted/30 mt-6 pt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-muted/50 hover:bg-muted/20"
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  variant="default"
                  isLoading={isSaving}
                  loadingText="Saving..."
                  className="bg-gradient-to-r from-ocean to-ocean-dark hover:opacity-90 text-white shadow-md"
                >
                  Save Changes
                </LoadingButton>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={user?.email || ''}
                  color="ocean"
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={''}
                  color="sunset"
                  fallback="Not provided"
                />

                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={''}
                  color="forest"
                  fallback="Not specified"
                />

                <InfoItem
                  icon={Globe}
                  label="Website"
                  value={''}
                  color="sand"
                  isLink
                  fallback="Not provided"
                />

                <InfoItem
                  icon={Calendar}
                  label="Birthday"
                  value={''}
                  color="mountain"
                  fallback="Not provided"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-muted/30"
              >
                <h3 className="text-sm font-medium text-ocean mb-3 flex items-center gap-2">
                  <span className="bg-ocean/10 p-1 rounded-md">
                    <User className="h-4 w-4 text-ocean" />
                  </span>
                  Biography
                </h3>
                <p className="text-muted-foreground leading-relaxed bg-muted/5 p-4 rounded-lg border border-muted/20 italic">
                  {
                    'No bio provided. Tell us about yourself and your travel interests!'
                  }
                </p>
              </motion.div>
            </motion.div>
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

const getBorderColorClass = (
  color: 'ocean' | 'sunset' | 'forest' | 'sand' | 'mountain'
) => {
  const classMap = {
    ocean: 'border-ocean/30',
    sunset: 'border-sunset/30',
    forest: 'border-forest/30',
    sand: 'border-sand/30',
    mountain: 'border-mountain/30',
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
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        getBorderColorClass(color),
        'bg-gradient-to-b from-background to-background/50 backdrop-blur-sm'
      )}
    >
      <div className={cn('p-2 rounded-full', getBackgroundColorClass(color))}>
        <Icon className={cn('h-4 w-4', getTextColorClass(color))} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1 font-medium">
          {label}
        </p>

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
    </motion.div>
  );
}
